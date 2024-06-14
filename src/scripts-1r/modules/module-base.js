/*
	YourModuleCallName 2.0.0 Usage (Webpack)
	YourName @onerockwell
	
	Please replace 'YourModuleCallName' with your module's call name, e.g. OneModal, MyModule, HelloWorld etc.
	
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import '../../styles/modules/yourModuleCallName.scss';

// Define the Backbone View here (Optional)
let YourModuleCallNameView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;
		
	},

	events: {
		
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let YourModuleCallName = {
	init: function (settings) {
		
		// If using Backbone View
		return new YourModuleCallNameView(settings);
		
		// If not using Backbone View
		// return this;
	}
}

// Output the module
export default YourModuleCallName;