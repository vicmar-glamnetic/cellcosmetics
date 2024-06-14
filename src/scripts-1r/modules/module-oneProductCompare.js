/*
	OneProductCompare 1.0.0 Usage (Webpack)
	Yang @onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import OneDrawer from '@/modules/module-oneDrawer';

import GridTemp from '@/templates/template-oneProductCompareGrid.html';
import CompareAllTemp from '@/templates/template-oneProductCompareAll.html';

import '../../styles/modules/oneProductCompare.scss';

const storageName = "comparing_products";
const maxCompareNum = 4;
const specs = [
	{
		spec: 'name',
		label: 'name'
	},
	{
		spec: 'price',
		label: 'price'
	},
	{
		spec: 'type',
		label: 'type'
	},
	{
		spec: 'vendor',
		label: 'vendor'
	},
	{
		spec: 'weight',
		label: 'weight'
	}
];

// Define the Backbone View here (Optional)
let OneProductCompareView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;
		
		// Status
		self.adding = false;
		self.compareAllEngage = false;
		self.canCompareAll = false;
		self.canRemoveAll = false;
		self.canAddItem = true;
		
		self.$compareModal = self.$el.find('#ProductCompareDrawer');
		self.$compareAddingOverlay = self.$el.find('#product-compare-adding-overlay');
		self.$compareModalTrigger = self.$el.find('.product-compare-trigger');
		
		if (self.$compareModal.length) {
			console.log('init product compare');
			self.$compareGrid = self.$compareModal.find('.compare-grid');
			self.$compareAllWrapper = self.$compareModal.find('.compare-all-wrapper');
			self.$controls = self.$compareModal.find('.controls');
			self.statusUpdate();
			self.initModal();
		} else {
			self.destroy();
		}
	},

	events: {
		'click .product-compare.add-ctl:not(.disabled)': 'addItem',
		'click #ProductCompareDrawer .remove-all:not(.disabled)': 'removeItem',
		'click #ProductCompareDrawer .remove': 'removeItem',
		'click #ProductCompareDrawer .compare-all:not(.disabled)': 'compareAll',
		'click #ProductCompareDrawer .compare-print:not(.disabled)': 'comparePrint'
	},
	
	initModal: function() {
		var self = this;
		
		self.renderModalGrid();
		
		self.compareModalDrawer = OneDrawer.init({
			dontCloseWhenClickOutside: true,
			dontShowOverlay: true,
			drawerElem: '#' + self.$compareModal.attr('id'),
			triggerEvent: 'click',
			triggerElem: '.product-compare-trigger',
			openCallback: function(e){
				self.$compareModalTrigger.addClass('disabled');
			},
			closeCallback: function(e){
				self.$compareModalTrigger.removeClass('disabled');
			}
		});
		
	},
	
	compareAll: function() {
		var self = this;
		if (!self.compareAllEngage) {
			// open
			self.renderCompareAllGrid();
			self.compareAllOpen();
		} else {
			// close
			self.compareAllClose();
		}
		self.statusUpdate();
	},
	
	compareAllOpen: function() {
		var self = this;
		self.compareAllEngage = true;
		self.$compareModal.addClass('compare-all-engage');
	},
	
	compareAllClose: function() {
		var self = this;
		self.compareAllEngage = false;
		self.$compareModal.removeClass('compare-all-engage');
	},
	
	addItem: function(e) {
		var self = this;
		
		if (self.adding) {
			return false;
		} else {
			self.adding = true;
			self.$compareAddingOverlay.addClass('adding');
		}
		
		var $curr = $(e.currentTarget);
		var $currItem = $curr.parents('.item');
		var url = $currItem.find('a').attr('href') + '?view=json-view';
		
		$.ajax({
			async: true,
			type: 'GET',
			url: url,
			cache: true,
			error: function(err) { 
				console.log(err);
			},
			success: function(data) {
				data = JSON.parse(data);
				self.updateCookie(data);
				self.renderModalGrid();
				
				self.adding = false;
				self.$compareAddingOverlay.removeClass('adding');
				
				if (!self.compareModalDrawer.drawerOpened) {
					self.open();
				}
			}
		});
	},
	
	removeItem: function(e) {
		var self = this;
		var $curr = $(e.currentTarget);
		
		if ($curr.hasClass('remove-all')) {
			// remove all
			self.updateCookie({},true);
			self.renderModalGrid();
		} else if ($curr.parents('.item').data('id')) {
			// remove single item
			var id = $curr.parents('.item').data('id');
			self.updateCookie({ id: id },true);
			self.renderModalGrid();
		}
	},
	
	comparePrint: function(e) {
		var self = this;
		var title = "Compare Product";
		var mywindow = window.open('', 'PRINT', 'height=400,width=600');
		
		var styleSheets = $('link[type="text/css"]');
		var styleSheetsHtml = '';
		_.each(styleSheets, function(link){
			styleSheetsHtml += `<link href="${link.href}" rel="stylesheet" type="text/css" media="all">`;
		})

	    mywindow.document.write('<html><head><title>' + title  + '</title>' + styleSheetsHtml);
	    mywindow.document.write('</head><body onload="window.print(); window.close();">');
	    mywindow.document.write('<h1>' + title  + '</h1>');
		mywindow.document.write('<div id="ProductCompareDrawer" class="print" style="height: 100%;">');
	    mywindow.document.write(document.getElementById("ProductCompareDrawer").innerHTML);
		mywindow.document.write('</div>');
	    mywindow.document.write('</body></html>');

	    mywindow.document.close(); // necessary for IE >= 10
	    mywindow.focus(); // necessary for IE >= 10*/

	    return true;
	},
	
	statusUpdate: function() {
		var self = this;
		
		// Get data update
		let data = self.updateCookie({});
		
		if (!data || data.length < 1) {
			console.log('Cannot compare, remove, can add') 
			self.canCompareAll = false;
			self.canRemoveAll = false;
			self.canAddItem = true;
			
			self.$controls.find('.compare-all span').text(self.$controls.find('.compare-all span').data('disable'));
			self.$controls.find('.compare-all,.remove-all').addClass('disabled');
		} else if (data.length == 1) {
			console.log('Cannot compare, can remove and add') 
			self.canCompareAll = false;
			self.canRemoveAll = true;
			self.canAddItem = true;
			
			self.$controls.find('.compare-all span').text(self.$controls.find('.compare-all span').data('disable'));
			self.$controls.find('.compare-all').addClass('disabled');
			self.$controls.find('.remove-all').removeClass('disabled');
		} else if (data.length < maxCompareNum) {
			console.log('Can compare, remove and add') 
			self.canCompareAll = true;
			self.canRemoveAll = true;
			self.canAddItem = true;
			
			if (self.compareAllEngage) {
				self.$controls.find('.compare-all span').text(self.$controls.find('.compare-all span').data('close'));
			} else {
				self.$controls.find('.compare-all span').text(self.$controls.find('.compare-all span').data('enable'));
			}
			self.$controls.find('.compare-all,.remove-all').removeClass('disabled');
		} else {
			console.log('Cannot add, can compare and remove') 
			self.canCompareAll = true;
			self.canRemoveAll = true;
			self.canAddItem = false;
			
			if (self.compareAllEngage) {
				self.$controls.find('.compare-all span').text(self.$controls.find('.compare-all span').data('close'));
			} else {
				self.$controls.find('.compare-all span').text(self.$controls.find('.compare-all span').data('enable'));
			}
			self.$controls.find('.compare-all,.remove-all').removeClass('disabled');
		}
	},
	
	renderModalGrid: function() {
		var self = this;
		
		// Get data update
		let data = self.updateCookie({});
		var content = self.buildTemplate({
			productdata: data,
			maxCompareNum: maxCompareNum
		}, 'grid');
		self.$compareGrid.html(content);
		if (self.compareAllEngage) {
			// also update compare all if engaged.
			self.renderCompareAllGrid();
		} else {
			self.statusUpdate();
		}
	},
	
	renderCompareAllGrid: function() {
		var self = this;
				
		// Get data update
		let data = self.updateCookie({});
		if (!data || data.length == 0) {
			self.compareAllClose();
		}
		var content = self.buildTemplate({
			specs: specs,
			productdata: data,
			maxCompareNum: maxCompareNum
		}, 'compare-all');
		self.$compareAllWrapper.html(content);
		
		self.statusUpdate();
	},
	
	updateCookie: function(data,remove) {
		var self = this;
		var storageData = localStorage.getItem(storageName) ? localStorage.getItem(storageName) : false;
		
		if (!data || $.isEmptyObject(data)) {
			// If no data given, read from cookie
			var response = [];
			if (storageData && JSON.parse(storageData)) {
				if (remove) {
					// Remove all
					localStorage.setItem(storageName, JSON.stringify([]));
				}
				return JSON.parse(storageData);
			} else {
				return response;
			}
		} else {
			// Read from cookie
			if (storageData && JSON.parse(storageData)) {
				var newData = JSON.parse(storageData); // expecting an array
			} else {
				var newData = []
			}
			
			// Update cookie
			if (storageData && storageData.indexOf(data.id) >= 0) {
				// already in your list
				if (remove) {
					// Remove one from the list
					var results = $.grep(newData, function( item, i ) {
						return item.id == data.id;
					}, true);
					newData = results;
					localStorage.setItem(storageName, JSON.stringify(newData));
				} else {
					alert(`Item ${data.name} already in your list!`);
				}
			} else if (newData.length < maxCompareNum && !remove) {
				// add new product to compare
				newData.push(data);
				localStorage.setItem(storageName, JSON.stringify(newData));
			} else if (!remove) {
				// max number reach
				alert(`You are reaching the max number to compare`);
			}
			
			return newData;
		}
	},
	
	open: function() {
		var self = this;
		self.compareModalDrawer.openDrawer();
	},
	
	close: function() {
		var self = this;
		self.compareModalDrawer.closeDrawer();
	},
	
	buildTemplate: function (content, type) {
		var self = this,
			typeTemplate;
		
		switch(type) {
			case '':
				break;
			case 'compare-all':
				typeTemplate = CompareAllTemp;
				break;
			case 'grid':
				typeTemplate = GridTemp;
				break;
		};
		
		return typeTemplate({
			_: _, 
			content: content
		});
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneProductCompare = {
	init: function (settings) {
		
		settings.el = $('body');

		return new OneProductCompareView(settings);
	}
}

// Output the module
export default OneProductCompare;