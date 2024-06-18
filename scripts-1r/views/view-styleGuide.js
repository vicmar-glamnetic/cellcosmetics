import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

export default Backbone.View.extend({

	// Styleguide Init Function
	initialize: function (opts) {
		
		console.log('init styleguide view !');
		
		var self = this;
					
		self.initGrid();
		
		$(document).on('click', function(){
			self.$el.find('.grid-col').removeClass('show-frame');
		});
		
	},
	
	events: {
		'click .bleeding-ctl' : function(e){
			var self = this;
			e.preventDefault();
			e.stopPropagation();
			self.$el.toggleClass('full-bleed');
		},
		'click .frame-ctl' : function(e){
			var self = this;
			e.preventDefault();
			e.stopPropagation();
			self.$el.find('.grid-system').toggleClass('show-frame');
		},
		'click .grid-col' : function(e){
			var self = this,
			$curr = $(e.currentTarget);
			e.preventDefault();
			e.stopPropagation();
			self.$el.find('.grid-col').not(e.currentTarget).removeClass('show-frame');
			$curr.toggleClass('show-frame');
		}
	},
	
	initGrid: function () {
		var self = this,
		html = '';
		self.$grid = self.$el.find('.grid-system');
		if (self.$grid.length && gridConfig) {
			_.each(gridConfig, function(row, index){
				html += '<div class="grid-row" title="row: ' + (index+1) +'">';
				if (row.col && row.col.length > 0) {
					_.each(row.col, function(col){
						
						switch (col.style) {
							case 'padding':
								html += '<div class="grid-col grid-padding grid-col-' + col.value + '"></div>';
								break;
							case 'margin':
								html += '<div class="grid-col grid-col-with-margin-' + col.value + '"></div>';
								break;
							default:
								html += '<div class="grid-col grid-col-' + col.value + '"></div>';
						}
						
					});
				} else if (row.col) {
					var temp = '<div class="grid-col grid-col-with-margin-1"></div>';
					html += temp.repeat(12);
				}
				html += '</div>'
			})
			self.$grid.append(html);
		}
	},
	
	destroy: function () {
		this.undelegateEvents();
	}

});