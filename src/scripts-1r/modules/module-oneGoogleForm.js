/*
	OneGoogleForm 2.0.0 Usage (Webpack)
	Patrick @onerockwell

	Form source must be copied directly from google form page (input names are most important, structure can change).
	Example in snippets/google-form.liquid uses source from https://docs.google.com/forms/d/e/1FAIpQLSfJae4_I0aNee61pCCai6S_ZfJXl6XHDn60-Uim0zw9YY8P7A/viewform
	We post form data directly to google but we cannot get error handling in response.
	You cannot submit a file upload field with this module, violates CORS.
	TODO: add support for multiple choice radios and checkboxes. Currently only supports input[type="text"] and textarea.
	
	OneGoogleForm.init({
		el: $('.google-form')
	});
	
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

// Define the Backbone View here (Optional)
let OneGoogleFormView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;
		self.$googleForm = self.$el;
		self.$submitButton = self.$googleForm.find('.submit-google-form');
		if (!self.$googleForm.length) {
			return false;
		}
		console.log("init oneGoogleForm");
	},

	events: {
		'click .submit-google-form': function(e) {
			e.preventDefault();
			var self = this;
			self.googleFormSubmit();
		}
	},

	googleFormSubmit: function(){
		var self = this;
		$.ajax({
			type: "POST",
			dataType: "xml",
			url: self.$googleForm.attr('action'),
			data: self.$googleForm.serialize(),
			statusCode: {
				0: function() {
					//Success message
					console.log("status code 0");
					self.$googleForm.addClass('submitted');
					self.$googleForm.next('.form-success-message').removeClass('hide');
				}
			}
		});
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneGoogleForm = {
	init: function (settings) {
		return new OneGoogleFormView(settings);
	}
}

// Output the module
export default OneGoogleForm;