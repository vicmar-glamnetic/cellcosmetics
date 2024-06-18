/*
    OneTabSystem 2.0.0 Usage (Webpack)
    Handles accordion and tab (response to accordion on small screen) together
    Yang @onerockwell

    Liquid/HTML:

    {% assign counter = 0 %}
    <div class="accordion-container tab-accordion-system">
        {%- for block in section.blocks -%} //Loop through liquid array if applicable
            <div class="system {% if counter == 0 %}active{% endif %}">
                <div class="system-title system-title-{{ counter }}" data-target="system-{{- counter -}}">
                    //Tab title goes here
                </div>
                <div class="system-content" data-target="system-{{- counter -}}">
                    //Tab content goes here
                </div>
            </div>
            {%- assign counter = counter | plus: 1 -%}
        {%- endfor -%}
    </div> 

    Initialization:

    OneTabSystem.init({
        el: //ancestor of .tab-accordion-system (jQuery object). Defaults to $('body').
    });
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

// Associated style was baked into the global components stylesheet

// Define the Backbone View here (Optional)
let OneTabSystemView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;
		self.accordionsAndTabs();
	},

	events: {
	},
	
	accordionsAndTabs: function(){
		var self = this;
		var systemUpdate = function(e){
			var $title = $(e.currentTarget);
			var $container = $title.parents('.tab-accordion-system');
			var $system = $title.parent('.system');
			var target = $title.data('target');
			var $targetTitle = $container.find('.system-title[data-target="' + target + '"]');
			var $targetContent = $container.find('.system-content[data-target="' + target + '"]');
			var $targetSystem = $targetTitle.parent('.system');
			
			var isTab = $container.hasClass('tab-container') ? true : false;
			
			$system.siblings().removeClass('active');
			$system.siblings().find('.system-content').removeClass('fadeIn animated');
			
			if (isTab) {
				$targetSystem.addClass('active');
				if (!self.isMobile()) {
					$targetContent.addClass('fadeIn animated');
				}
			} else {
				$targetSystem.toggleClass('active');
			}
		};
		var events = {
			'click .tab-accordion-system .system-title' : function(e){
				systemUpdate(e);
			}
		};
		// Update and delegate adding events
		_.extend(self.events, events);
		self.delegateEvents();
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
let OneTabSystem = {
	init: function (settings) {
		if (!settings.el) {
			settings.el = $('body'); // Works on global-wise
		}
		return new OneTabSystemView(settings);
	}
}

// Output the module
export default OneTabSystem;