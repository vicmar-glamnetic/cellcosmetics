/*
	OneContact 2.0.0 Usage (Webpack)
	Yang @onerockwell
	
	OneContact.init({
		el: $('.contact-form-container'),
		submitType: 'json' || 'default',
		errorMsg: 'Oops, something wrong happened, please try again later',
		successMsg: 'Thank you and welcome to Safiyaa. You will receive an email to confirm your subscription shortly.',
		requiredMsg: 'Error: required field',
		errorEmail: 'Error: please ensure formatting is correct',
		successCallback: function(d){},
		errorCallback: function(err){}
	});
	
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import '../../styles/modules/oneContact.scss';

// Define the Backbone View here (Optional)
let OneContactView = Backbone.View.extend({
	
	initialize: function (settings) {
		
		console.log('init contact form');
		
		var self = this;
		self.$form = self.$el.find('form');
		self.submitType = settings.submitType || 'default';
		self.errorMsg = settings.errorMsg || 'Oops, something wrong happened, please try again later';
		self.successMsg = settings.successMsg || 'Thank you for your interest! We will be in touch soon.';
		self.errorRequired = settings.requiredMsg || 'Error: required field';
		self.errorEmail = settings.errorEmail || 'Error: please ensure formatting is correct';
		self.onSubmit = settings.onSubmit ? settings.onSubmit : false;
		self.successCallback = settings.successCallback ? settings.successCallback : function(d){ alert(d) };
		self.errorCallback = settings.errorCallback ? settings.errorCallback : function(err){ alert(err) };
		
		self.submisionCtl();
	},

	events: {
		'blur input.required' : 'validation'
	},
	
	submisionCtl: function() {
		var self = this;
		var events = {};
		if (self.submitType == 'custom') {
			events = {
				'submit form' : function(e){
					if (self.validation(e)) {
						self.onSubmit(e);
					} else {
						return false;
					}
				}
			}
		} else {
			events = {
				'submit form' : function(e){
					e.preventDefault();
					if (self.validation(e)) {
						if (self.submitType == 'json') {
							self.formSubmitJSON(e);
						} else {
							self.formSubmit(e);
						}
					} else {
						return false;
					}
				}
			}
		}
		
		// Update and delegate adding events
		_.extend(self.events, events);
		self.delegateEvents();
	},
	
	validation: function(e) {
		var self = this;
		var passValidation = true;
		var $curr = $(e.currentTarget);
		var $requiredFields = $curr.find('input.required');
		var errorHandling = function($container,msg){
			if ($container.find('.error-msg').length) {
				$container.find('.error-msg').text(msg);
			} else {
				$container.append('<span class="error-msg">' + msg + '</span>');
			}
		}
		
		if ($curr.hasClass('required')) {
			$requiredFields = $curr;
		}
		
		_.each($requiredFields,function(input){
			var $input = $(input);
			var $parent = $input.parent();
			var value = $input.val();
			var isEmailField = $input.attr('type') == 'email' ? true : false;
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			
			if (value == '') {
				passValidation = false;
				$parent.addClass('input-error');
				errorHandling($parent,self.errorRequired);
			} else if (isEmailField) {
				var resutl = regex.test(value);
				if (!resutl) {
					passValidation = false;
					errorHandling($parent,self.errorEmail);
				} else {
					$parent.removeClass('input-error');
				}
			} else {
				$parent.removeClass('input-error');
			}
			
		});
		
		return passValidation;
	},
	
	formSubmit: function(e) {
		var self = this;
		var $form = self.$form;
		$.ajax({
			async: true,
			type: $form.attr('method'),
			url: $form.attr('action'),
			data: $form.serialize(),
			cache       : false,
			error       : function(err) { 
				self.errorCallback(err);
			},
			success     : function(data) {
				e.preventDefault();
				self.successCallback(data);
			}
		});
	},
	
	formSubmitJSON: function(e) {
		var self = this;
		var $form = self.$form;
		$.ajax({
			type: $form.attr('method'),
			url: $form.attr('action'),
			data: $form.serialize(),
			cache       : false,
			dataType    : 'json',
			contentType: "application/json; charset=utf-8",
			error       : function(err) { 
				self.errorCallback(err);
			},
			success     : function(data) {
				self.successCallback(data);
			}
		});
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneContact = {
	init: function (settings) {
		return new OneContactView(settings);
	}
}

// Output the module
export default OneContact;