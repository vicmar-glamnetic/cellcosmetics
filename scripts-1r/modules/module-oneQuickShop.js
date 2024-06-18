/*
    OneQuickShop 2.0.0 Usage (Webpack)
    yang @onerockwell        
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import OneDrawer from '@/modules/module-oneDrawer';
import ViewProduct from '@/views/view-product';


import '../../styles/pages/product.scss';
import '../../styles/pages/product/product-quickshop.scss';

// Define the Backbone View here (Optional)
let OneQuickShopView = Backbone.View.extend({
	
    initialize: function (settings) {
        console.log('init quickshop');
        var self = this;
        self.quickshop();
    },

    events: {
        
    },
    
    quickshop: function(){
        var self = this;
        
        /*
            Possible trigger of this function are :
            1. Click on '.quick-shop-trigger' which has data-url or href attribute.
            2. Click on '.swatch-linked' in quickshop container, which has data-url or href attribute.
            3. Direct call with 'event' object and target url as param.
        */
        var quickshopCtl = function(e,url){
            e.stopPropagation();
            e.preventDefault();
            
            var $curr = $(e.currentTarget);
            
            if (url) {
                var url = ORW.utilities.updateUrlParam(url, 'view', 'quickshop');
            } else {
                var url = $curr.data('url') ? ORW.utilities.updateUrlParam($curr.data('url'), 'view', 'quickshop') : ORW.utilities.updateUrlParam($curr.attr('href'), 'view', 'quickshop');
            }

            console.log(url);
            
            if (url == '#?view=quickshop') {
                // Skip the empty URL 
                return false;
            }
            
            if (self.$currentQuickshop) {
                self.$currentQuickshop.destroy();
            }
            
            $.ajax({
                async: true,
                type: 'GET',
                url: url,
                cache: true,
                error: function(err) { 
                    console.log(err);
                },
                success: function(html) {
                    var $productDetail = $(html).find('.product-quickshop');
                    var quickshopHtml = $productDetail[0].outerHTML;
                    $productDetail.remove();
                    
                    if (self.$currentModal) {
                        // Replace content html
                        self.$currentModal.$drawer.find('.product-quickshop').remove();
                        self.$currentModal.$drawer.find('.drawer-content').append(quickshopHtml);
                        self.$currentQuickshop = new ViewProduct({el: $('.product-quickshop .product-detail-container')});
                    } else {
                        OneDrawer.init({
                            drawerContent: quickshopHtml,
                            drawerModalId: 'QuickShopDrawerModal',
                            triggerEvent: 'click',
                            triggerElem: '.quick-shop-hidden-trigger',
                            initCallback: function(){
                                self.$currentModal = this;
                                self.$currentModal.openDrawer();
                            },
                            openCallback: function(){                                
                                self.$currentQuickshop = new ViewProduct({el: $('.product-quickshop .product-detail-container')});
                            },
                            closeCallback: function(){
                                if (self.$currentModal) {
                                    self.$currentModal.destroy();
                                    self.$currentModal = false;
                                }
                            },
                            events: {
                                'ajax-reload-inner' : function(e,url){
                                    quickshopCtl(e,url);
                                }
                            }
                        });
                    }
                }
            });
        }
        var events = {
            'click .quick-shop-trigger' : quickshopCtl,
            'click .quick-shop-trigger-link' : quickshopCtl
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
let OneQuickShop = {
    init: function (settings) {
        if (!settings.el) {
            settings.el = $('body');
        }
        return new OneQuickShopView(settings);
    }
}

// Output the module
export default OneQuickShop;