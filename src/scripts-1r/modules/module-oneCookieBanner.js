/*
	OneCookieBanner 2.0.0 Usage (Webpack)
	yang @onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import OneDrawer from '@/modules/module-oneDrawer';

import '../../styles/modules/oneCookieBanner.scss';

// Define the Backbone View here (Optional)
let OneCookieBannerView = Backbone.View.extend({
	
	initialize: function (settings) {
		
		console.log('init cookie banner');
		
		var self = this;
		self.$cookieBanner = self.$el;
		self.days = settings.cookieDays || self.$cookieBanner.data('cookiedays');
		
		self.initModal();
	},
	
	events: {
		'click .accept': 'close'
	},
	
	initModal: function() {
		var self = this;
		
		self.cookieBannerDrawer = OneDrawer.init({
			dontCloseWhenClickOutside: true,
			drawerElem: '#' + self.$cookieBanner.attr('id'),
			triggerEvent: 'click',
			triggerElem: '.cookie-banner-trigger',
			closeCallback: function(e){
				if (ORW.subscribeModal) {
					ORW.subscribeModal.open();
				}
			}
		});
		
		if (!ORW.utilities.getCookie('acceptcookieterm')) {
			setTimeout(function(){
				self.open();
			}, 0);
		}
	},
	
	open: function() {
		var self = this;
		$('body').addClass('cookie-not-accepted');
		self.cookieBannerDrawer.openDrawer();
	},
	
	close: function() {
		var self = this;
		ORW.utilities.setCookie('acceptcookieterm',true,self.days);
		$('body').removeClass('cookie-not-accepted');
		self.cookieBannerDrawer.closeDrawer();
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneCookieBanner = {
	init: function (settings) {
		return new OneCookieBannerView(settings);
	}
}

// Output the module
export default OneCookieBanner;