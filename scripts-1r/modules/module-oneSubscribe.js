/*
	OneSubscribe 2.0.0 Usage (Webpack)
	Yang @onerockwell
	
	OneSubscribe.init({
		el: $('.subscribe-modal'),
		delay: 2000,
		errorMsg: 'Oops, something wrong happened, please try again later',
		successMsg: 'Thank you and welcome to Safiyaa. You will receive an email to confirm your subscription shortly.',
		requiredMsg: 'Error: required field',
		errorEmail: 'Error: please ensure formatting is correct',
		cookieEnabled: false,
		cookieDays: 1
	});
*/


// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import OneDrawer from '@/modules/module-oneDrawer';
import OneContact from '@/modules/module-oneContact';

import '../../styles/modules/oneSubscribe.scss';

// Define the Backbone View here (Optional)
let OneSubscribeView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;
		if (!self.$el.length) {
			return false;
		}
		
		self.$modal = self.$el;
		self.enabled = self.$modal.data('enabled');
		self.integrationType = settings.integrationType || self.$modal.data('type');
		self.errorMsg = settings.errorMsg || self.$modal.data('errormsg');
		self.successMsg = settings.successMsg || self.$modal.data('successmsg');
		self.errorRequired = settings.requiredMsg || self.$modal.data('requiredmsg');
		self.errorEmail = settings.errorEmail || self.$modal.data('erroremail');
		self.delay = settings.delay || self.$modal.data('delay');
		self.days = settings.cookieDays || self.$modal.data('cookiedays');
		self.cookieEnabled = settings.cookieEnabled || self.$modal.data('cookieenabled');
		self.$form = self.$modal.find('form');
		
		if (!self.enabled) {
			console.log('init subscribe modal: Disabled');
			return false;
		} else {
			self.initModal();
			self.initForm();
			console.log('init subscribe modal: Enabled');
		}
		
	},

	events: {
		'click .close' : function(e){
			var self = this;
			self.close(true);
		},
		'click .global-message a' : function(e){
			e.preventDefault();
			var $curr = $(e.currentTarget);
			if ($curr.attr('href')) {
				window.open($curr.attr('href'));
			}
		},
		'click .global-message' : function(e){
			var self = this;
			self.$form.parent().removeClass('submitted error success');
		}
	},
	
	initModal: function() {
		var self = this;
		
		self.subscribeDrawer = OneDrawer.init({
			drawerElem: '#SubscribeModal',
			triggerEvent: 'click',
			triggerElem: '.subscribe-modal-trigger'
		});
		
		if (theme.configs.cookieBannerEnabled && ORW.utilities.getCookie('acceptcookieterm')) {
			// If cookie banner enabled and accepted
			setTimeout(function(){
				self.open();
			}, self.delay);
		} else if (!theme.configs.cookieBannerEnabled) {
			// If cookie banner disabled
			setTimeout(function(){
				self.open();
			}, self.delay);
		}
	},
	
	initForm: function() {
		var self = this;
		var submitType = self.integrationType == 'klaviyo' ? 'custom' : 'json';
		
		OneContact.init({
			el: self.$modal,
			submitType: submitType,
			errorMsg: self.errorMsg,
			successMsg: self.successMsg,
			requiredMsg: self.errorRequired,
			errorEmail: self.errorEmail,
			onSubmit: function(e) {
				console.log(e);
			},
			successCallback: function(data) {
				self.submitCallBack(true,data);
			},
			errorCallback: function(err) { 
				self.submitCallBack(false,err);
			}
		});
		
		if (self.integrationType == 'klaviyo') {
			var formId = '#' + self.$form.attr('id');
			KlaviyoSubscribe.attachToForms(formId, {
				hide_form_on_success: false,
				success: function($form){
					console.log('kv submit success!');
					var data = {
						success: true,
						msg: self.successMsg
					}
					self.submitCallBack(true,data);
				},
				custom_success_message: true,
				success_message: self.successMsg,
				extra_properties: {
					$source: 'Fly Out',
					$method_type: "Klaviyo Form",
					$method_id: 'embed'
				}
			});
			KlaviyoSubscribe.injectCSS(false);
			self.$form.removeClass('klaviyo_styling');
		}
	},
	
	open: function() {
		var self = this;
		if (!ORW.utilities.getCookie('hidesubscriptionmodal') || !self.cookieEnabled) {
			self.subscribeDrawer.openDrawer();
		}
	},
	
	close: function(setCookie) {
		var self = this;
		self.subscribeDrawer.closeDrawer();
		if (setCookie && self.cookieEnabled) {
			ORW.utilities.setCookie('hidesubscriptionmodal',true,self.days);
		}
	},
	
	submitCallBack: function(isSuccess,data){
		var self = this;
		
		var errorHandling = function( $form, msg, flag ){
			var $container = $form.parent();
			var $globalMsg = $container.find('.global-message');
			msg = '<span>' + msg + '</span>';
			
			if ($globalMsg.length) {
				$globalMsg.html(msg);
			} else {
				$container.append('<p class="global-message">' + msg + '</span>');
				$globalMsg = $container.find('.global-message');
			}
			
			$container.removeClass('submitted error success');
			
			if (flag == 'success') {
				// Clear up the form
				_.each($form.find('.group input'), function(input){
					var $input = $(input);
					if ($input.attr('type') != 'checkbox' && $input.attr('type') != 'radio') {
						$input.val('');
					} else if ($input.attr('type') == 'checkbox') {
						$input.removeAttr('checked');
					}
				});
				$container.addClass('submitted success');
			} else if (flag == 'error') {
				$container.addClass('submitted error');
			}
		};
		
		errorHandling(self.$form, '', '');
		
		if (isSuccess) {
			if (data.result == "success" || data.success) {
				// Successed!
				errorHandling(self.$form, self.successMsg, 'success');
				var delay = self.delay > 3000 ? self.delay : 3000;
				setTimeout(function(){
					self.close(true);
				}, delay);
			} else {
				errorHandling(self.$form, data.msg, 'error');
			}
		} else {
			errorHandling(self.$form, self.errorMsg, 'error');
		}
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneSubscribe = {
	init: function (settings) {
		return new OneSubscribeView(settings);
	}
}

// Output the module
export default OneSubscribe;