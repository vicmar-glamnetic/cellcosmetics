/*
	OneZoom 2.2.0 Usage (Webpack)
	
	2.0.0 adding webpack
	2.1.0 adding in frame zooming
	
	Yang@onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

// import 'jquery.panzoom';
import Panzoom from "@panzoom/panzoom";
import '@/lib/jquery.doubletap';

import '../../styles/modules/oneZoom.scss';

// Define the Backbone View here (Optional)
let OneZoomView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;
		self.zoomEngaging = false;
		self.zoomInFrame = true;
		self.zoomMobilePan = false;
		self.$productMedia = self.$el;
		self.$mainImage = settings.mainImage;
		self.$thumbImage = settings.thumbImage;
		
		self.buildDesktopZoom();
		self.buildMobileZoom();
	},

	events: {
		'click .image-slide:not(.media-video)' : 'desktopZoomHandle',
		'click #onezoom.opened' : 'desktopZoomClose',
		'doubletap .image-slide:not(.media-video)' : 'mobileZoomHandle',
		'doubletap #onezoom-mobile' : 'mobileZoomHandle',
		'click .onezoom-close': 'mobileZoomeOut'
	},
	
	buildDesktopZoom: function(){
		var self = this;
		self.$zoomContainer = $('<div id="onezoom"></div>');
		self.$zoomContainer.appendTo(self.$productMedia);
	},
	
	buildMobileZoom: function(){
		var self = this;
		self.zoomMobileEngaging = false;
		self.$zoomMobileContainer = $('<div id="onezoom-mobile"><div class="panzoom"></div></div>');
		self.$zoomMobileContainer.appendTo(self.$productMedia);
	},
	
	desktopZoomHandle: function(e){
		var self = this;
		e.preventDefault();
		if (!self.isMobile()) {
			var $curr = $(e.currentTarget);
			var imageUrl = $curr.attr('href');
			
			if (self.zoomInFrame) {
				// As inframe
				function setPosition(e){
					var offset = $zoomContainerInFrame.offset();
					var relativeX = (e.pageX - offset.left)*100 / $zoomContainerInFrame.width();
					var relativeY = (e.pageY - offset.top)*100 / $zoomContainerInFrame.height();
					var position = relativeX + '%' + ' ' + relativeY + '%';
					$zoomContainerInFrame.css('background-position', position);
				}
				
				if ($curr.find('.onezoom-frame').length) {
					// Close
					var $zoomContainerInFrame = $curr.find('.onezoom-frame');
					$zoomContainerInFrame.off('mousemove');
					$zoomContainerInFrame.remove();
				} else {
					// Open
					var $zoomContainerInFrame = $('<div class="onezoom-frame loading-image">').appendTo($curr);
					
					$('<img/>').attr('src', imageUrl).on('load', function() {
	                   $(this).remove();
					   setPosition(e);
	                   $zoomContainerInFrame.removeClass('loading-image');
	                   $zoomContainerInFrame.css('background-image', 'url(' + imageUrl + ')');
					   
					   $zoomContainerInFrame.on('mousemove', (e) => {
							setPosition(e);
					   });
	                });
				}
			} else {
				// As pop-up
				var $zoomImage = $('<img class="zoomed-image" src="' + imageUrl + '" />');
				self.$zoomContainer.html($zoomImage);
				
				$zoomImage.on('load', function() {
					self.$zoomContainer.removeClass('loading-image');
				});
				
				if (!self.zoomEngaging) {
					self.zoomStatus('engage');
					self.$zoomContainer.addClass('opened loading-image');
				}
			}
		}
	},
	
	desktopZoomClose: function(e){
		var self = this;
		self.$zoomContainer.on('transitionend', function(){
			self.$zoomContainer.off('transitionend');
			self.$zoomContainer.html('');
			self.zoomStatus('disengage');
		});
		self.$zoomContainer.removeClass('opened');
	},
	
	mobileZoomHandle: function(e){
		var self = this;
		if (self.isMobile()) {
			if (self.$zoomMobileEngaging) {
				self.mobileZoomeOut();
			} else {
				self.mobileZoomeIn(e);
			}
		}
	},
	
	mobileZoomeIn: function(e){
		let self = this;
		let eventOrg = e;
		let $curr = $(e.currentTarget);
		let $currImage = $curr.find('img');
		let $bigImage = $(`<img src="${$curr.attr('href')}" />`);

		self.$zoomMobileCloseIcon = $('<div class="onezoom-close"></div>');
		self.$zoomMobileContainer.addClass('opened loading-image').find(".panzoom").append($bigImage);
		self.$zoomMobileContainer.prepend(self.$zoomMobileCloseIcon);
		
		// get proper coordinates for touchend event
		if (e.changedTouches) {
			eventOrg = e.changedTouches[0];
		}
		
		$bigImage.on('load', function() {
			self.$zoomMobileContainer.removeClass('loading-image');

			const rate = $bigImage?.width() / $currImage?.width();
            const pan = {
                x: (self.$mainImage?.offset().left - eventOrg?.pageX) * rate + ($currImage?.width() / 2),
                y: (self.$mainImage?.offset().top - eventOrg?.pageY) * rate + ($currImage?.height() / 2),
            };
            const panElem = self.$zoomMobileContainer.find(".panzoom").get(0);

			self.zoomMobilePan = Panzoom(panElem, {
                contain: "outside",
                startScale: 1,
                startX: pan.x,
                startY: pan.y,
            });
		});
		
		// mark as zoomed
		this.$zoomMobileEngaging = true;
	},
	
	mobileZoomeOut: function(e){
		var self = this;
		if (!this.$zoomMobileContainer) {
			return false;
		}
		if (self.zoomMobilePan) {
			self.zoomMobilePan.destroy();
		}
		self.$zoomMobileContainer.on('transitionend', function(){
			self.$zoomMobileContainer.off('transitionend');
			self.$zoomMobileContainer.html(`<div class="panzoom"></div>`);
			self.$zoomMobileEngaging = false;
		});
		this.$zoomMobileContainer.removeClass('opened');
	},
	
	zoomStatus: function(opt){
		var self = this;
		if (opt == 'engage') {
			self.zoomEngaging = true;
			$('html').addClass('zooming');
		} else if (opt == 'disengage'){
			self.zoomEngaging = false;
			$('html').removeClass('zooming');
		}
	},

	isMobile: function () {
		if ( ORW.responsive == 'small') {
			return true;
		}
		return false;
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneZoom = {
	init: function (settings) {
		return new OneZoomView(settings);
	}
}

// Output the module
export default OneZoom;