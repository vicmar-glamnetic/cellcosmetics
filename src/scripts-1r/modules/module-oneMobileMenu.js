/*
	OneMobileMenu 2.0.0 Usage (Webpack)
	yang @onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import '../../styles/modules/oneMobileMenu.scss';

// Define the Backbone View here (Optional)
let OneMobileMenuView = Backbone.View.extend({
	
	initialize: function (settings) {
		
		console.log('init mobile menu');
		
		var self = this;
		self.$mobileNav = self.$el;
		self.$currentActive = false;
		self.openCallback = settings.openCallback ? settings.openCallback : function(){ console.log('open slide-in-menu callback') };
		self.closeCallback = settings.closeCallback ? settings.closeCallback : function(){ console.log('close slide-in-menu callback') };
	},

	events: {
		'terminate-inner-action' : function(e) {
			var self = this;
			if (self.$currentActive) {
				self.$currentActive.find('.back-to a').trigger('click');
			}
		},
		'click [data-trigger]' : function(e){
			// Contorls level2 slide in sub-menu
			e.preventDefault();
			var self = this;
			var $trigger = $(e.currentTarget);
			var target = $trigger.data('trigger');
			var $target = self.$mobileNav.find('[data-target="' + target + '"]');
			
			if ( $target.length ) {
				$trigger.addClass('active');
				$target.addClass('active');
				self.$mobileNav.addClass('slide-menu-opened');
				self.openCallback();
				
				if ($target.find('input').length) {
					setTimeout(function(){ $target.find('input').focus(); },100);
				}
				
				self.$currentActive = $target;
			}
		},
		'click .back-to a' : function(e){
			e.preventDefault();
			var self = this;
			var $backToBtn = $(e.currentTarget).parent();
			var $target = $backToBtn.parent();
			var trigger = $target.data('target');
			var $trigger = self.$mobileNav.find('[data-trigger="' + trigger + '"]');
			
			self.$mobileNav.removeClass('slide-menu-opened');
			self.closeCallback();
			$target.removeClass('active');
			$trigger.removeClass('active');
			
			self.$currentActive = false;
		},
		'click .expandable > *:not(.children)' : function(e){
			e.preventDefault();
			var self = this;
			var $trigger = $(e.currentTarget);
			var $parent = $trigger.parent();
			var $target = $trigger.siblings('.children');
			var $activeExp = $parent.siblings('.expandable.active');
			
			if ($activeExp.length) {
				$activeExp.find('> *:not(.children)').trigger('click');
			}
			
			$parent.toggleClass('active');
			$target.slideToggle();
		}
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneMobileMenu = {
	init: function (settings) {
		return new OneMobileMenuView(settings);
	}
}

// Output the module
export default OneMobileMenu;