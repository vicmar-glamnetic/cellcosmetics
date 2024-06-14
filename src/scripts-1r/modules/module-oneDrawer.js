/*
	OneDrawer 2.5.1 Usage (Webpack Update)
	Yang @onerockwell
	
	V2 Change log
	- Adding modal support
	- Adding closeOtherDrawers method when open up a new drawer
	- Adding global drawer stack for better accessibility
	- Adding dontCloseWhenClickOutside as an option
	- Adding dontShowOverlay as an option, default to false
	
	var drawerCtl = OneDrawer().init({
		drawerElem: '#drawer',          // Your drawer class or id. If left empty, will use default drawer modal
		drawerModalId: 'modal-class',// Your drawer modal special class, which allow you to style and/or targetting the particular modal
		drawerContent: [HTML],			// Assign html as drawer modal content.
		triggerEvent: 'click',          // Trigger event
		triggerElem: '.drawer-toggle',  // Your drawer trigger id 
		openCallback: function(){ alert('opened!'); }        // You can add drawer open 
		closeCallback: function(){ alert('closed!'); }        // You can add drawer close callback function here
		events: {                       // Accept events key pairs 
			'click form button' : function(e){
				e.preventDefault();
				var $form = $(e.currentTarget).parent('form');
				if ($form.find('input').val()) {
					// Note: 'this' represent the OneDrawer object not the current view, coloseDrawer() is an native member function of OneDrawer
					this.closeDrawer(); 
					$form.submit();
				}
			}
		}
	});
*/

import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import DefaultTemp from '@/templates/template-oneDrawerDefault.html';

import '../../styles/modules/oneDrawer.scss';

let OneDrawerView = Backbone.View.extend({
	
	initialize: function (settings) {
		
		console.log('init modal');
		
		var self = this;
		self.drawerOpened = false;
		self.drawerElem = settings.drawerElem;
		self.drawerContent = settings.drawerContent;
		self.drawerModalId = settings.drawerModalId;
		self.triggerEvent = 'click'; // settings.triggerEvent; // Force using click for drawers
		self.triggerElem = settings.triggerElem;
		self.initCallback = settings.initCallback ? settings.initCallback : function(){  };
		self.openCallback = settings.openCallback ? settings.openCallback : function(){  };
		self.closeCallback = settings.closeCallback ? settings.closeCallback : function(){  };
		self.eventsAdditional = settings.events ? settings.events : {};
		self.dontCloseWhenClickOutside = settings.dontCloseWhenClickOutside ? settings.dontCloseWhenClickOutside : false;
		self.dontShowOverlay = settings.dontShowOverlay ? settings.dontShowOverlay : false;
		self.isModal = self.drawerElem ? false : true;
		
		self.$body = self.$el;
		if (self.drawerElem) {
			self.$drawer = $(self.drawerElem);
		} else if (self.drawerContent) {
			// Use default modal template
			var content = self.buildTemplate({
				id: self.drawerModalId,
				body: self.drawerContent
			});
			self.$drawer = $(content).appendTo("body");
			self.drawerElem = '.' + self.$drawer.attr('class').replace(' ','.');
		}
		self.events = {};
		
		// Global events
		if (!self.dontCloseWhenClickOutside) {
			$(document).on(self.triggerEvent + ' keyup', function (e) {
				console.log('drawer: click on window');
				if ( e.type == self.triggerEvent || (e.type == 'keyup' && e.keyCode == 27) ) {
					self.closeDrawer(true);
				}
			});
		}
		
		// Trigger event
		var eventKey = self.triggerEvent + ' ' + self.triggerElem;
		self.events[eventKey] = function(e) {
			e.stopPropagation();
			e.preventDefault();
			self.drawerCtl();
		};
		
		// Drawer event
		var eventKey = self.triggerEvent + ' ' + self.drawerElem;
		self.events[eventKey] = function(e) {
			e.stopPropagation();
		};
		var eventKey = self.triggerEvent + ' ' + self.drawerElem + ' .drawer-close';
		self.events[eventKey] = function(e) {
			e.stopPropagation();
			e.preventDefault();
			self.closeDrawer();
		};
		
		_.extend(self.events, self.eventsAdditional);
		self.delegateEvents();
		// console.log(self.events);
		
		self.initCallback();
	},

	events: {
		// Using dynamic event trigger to make the module configurable
	},
	
	drawerCtl: function(forceClose){
		var self = this;
		if (!self.$drawer.hasClass('opened')) {
			self.openDrawer();
		} else {
			self.closeDrawer();
		}
	},
	
	openDrawer: function() {
		var self = this;
		
		self.closeOtherDrawers();
		
		if (!self.dontShowOverlay) {
			self.$body.trigger('drawer-opt');
		}
		
		if (self.isModal) {
			self.$drawer.css('z-index','1002');
		}
		self.$drawer.addClass('opened');
		self.openCallback();
		self.drawerOpened = true;
	},
	
	closeDrawer: function(force) {
		var self = this;
		if (force) {
			if (self.$drawer.hasClass('inner-action-engaged')) {
				self.$drawer.trigger('terminate-inner-action');
			}
			if (self.$drawer.hasClass('opened')) {
				console.log('Close drawer and force terminate inner action');
				self.$body.removeClass('show-overlay drawer-opt');
				if (self.isModal) {
					self.$drawer.on('transitionend', function(){
						self.$drawer.off('transitionend');
						self.$drawer.css('z-index','-1');
					})
				}
				self.$drawer.removeClass('opened');
				self.closeCallback();
			}
		} else {
			if (self.$drawer.hasClass('inner-action-engaged')) {
				self.$drawer.trigger('terminate-inner-action');
			} else if (self.$drawer.hasClass('opened')) {
				console.log('Close drawer');
				self.$body.removeClass('show-overlay drawer-opt');
				if (self.isModal) {
					self.$drawer.on('transitionend', function(){
						self.$drawer.off('transitionend');
						self.$drawer.css('z-index','-1');
					})
				}
				self.$drawer.removeClass('opened');
				self.closeCallback();
			}
		}
		self.drawerOpened = false;
	},
	
	closeOtherDrawers: function(){
		var self = this;
		_.each(ORW.drawerStack, function(drawer){
			if (drawer.drawerOpened) {
				drawer.closeDrawer(true);
			}
		});
	},
	
	destroy: function() {
		var self = this;
		if (self.$drawer && self.$drawer.hasClass('drawer-modal')) {
			self.$drawer.remove();
		}
		self.undelegateEvents();
	},
	
	buildTemplate: function (content, type) {
		var self = this,
			typeTemplate;
		
		switch(type) {
			case '':
				break;
			default:
				typeTemplate = DefaultTemp;
				break;
		};
		
		return typeTemplate({content: content});
	}

});

let OneDrawer = {
	init: function (settings) {
		if (!ORW.drawerStack) {
			ORW.drawerStack = [];
		}
		
		settings.el = $('body');
		var newDrawer = new OneDrawerView(settings);
		ORW.drawerStack.push(newDrawer);
		return newDrawer;
	}
}

export default OneDrawer