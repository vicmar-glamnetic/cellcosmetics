/*
	OneQuickBuy 2.0.0 Usage (Webpack)
	YourName @onerockwell        
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import OneProductForm from '@/modules/module-oneProductForm';

import '../../styles/pages/product/product-quickbuy.scss';

// Define the Backbone View here (Optional)
let OneQuickBuyView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;
		console.log('Init quickbuy');
		self.$productGrid = self.$el.find('.collection-products');
		self.$products = self.$productGrid.find('.item');
		self.quickbuy();
		// self.addAll();
	},

	events: {

	},
	
	quickbuy: function () {
		var self = this;
		var $products = self.$products.filter(function(index){
			var $qbcontainer = $(this).find('.quick-buy-container');
			return $qbcontainer.length && !$(this).hasClass('qb-initialized');
		});
		var events = {
			'click .quick-buy-trigger' : function(e){
				var $curr = $(e.currentTarget);
				var $item = $curr.parents('.item');
				var temp = '';
				
				temp = $curr.text();
				$curr.text($curr.data('toggle'));
				$curr.data('toggle', temp);
				
				$item.toggleClass('qb-active');
				$item.find('.quick-buy-container').toggleClass('active');
			}
		};
		
		_.each($products, function(item){
			var $product = $(item);
			if ($product.find('.quick-buy-container').length) {
				var $form = $product.find('form'),
				pid = $product.data('id')

				var productSelector = 'productSelect-' + pid;

				// Check for duplicate products
				var matchingProducts = document.querySelectorAll('#' + productSelector);
				if (matchingProducts.length > 1) {
					var newId = productSelector + '-' + matchingProducts.length;
					$product.find('#' + productSelector).attr("id", newId);
				}

				OneProductForm.init({
					el: $product,
					preSelect: true,
					updateURL: false,
				});
				
				$product.addClass('qb-initialized');
			}
		});
		
		// Update and delegate adding events
		_.extend(self.events, events);
		self.delegateEvents();
	},
	
	addAll: function() {
		// AddAll feature is in beta
		// Add All requires Quickbuy
		var self = this;
		var addAllToBag = function(e){
			e.preventDefault();
			// Add CTA status change here..
			
			// Collecting data
			var productIds = [];
			_.each(self.$products, function(product){
				var $productSelected = $(product).find('select.product-single__variants');
				if ($productSelected.length) {
					productIds.push($productSelected.val());
				}
			});
			
			// Add Multiple Products
			var data = {
				id : productIds,
				quantity : 1
			}, callback = function(line_item){
				// Success callback, cart loaded, please add CTA status change here..
				console.log(line_item);
				$('header .block-minicart').trigger('click');
			}, errorCallback = function (XMLHttpRequest, textStatus) {
				// Error callback, please add extra error handling here
				var data = eval('(' + XMLHttpRequest.responseText + ')');
				console.log(data);
			};
			ShopifyAPI.addMultipleItems(data, callback, errorCallback);
		}
		
		var events = {
			'click .add-all-to-bag' : addAllToBag
		}
		
		// Update and delegate adding events
		_.extend(self.events, events);
		self.delegateEvents();
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneQuickBuy = {
	init: function (settings) {
		return new OneQuickBuyView(settings);
	}
}

// Output the module
export default OneQuickBuy;