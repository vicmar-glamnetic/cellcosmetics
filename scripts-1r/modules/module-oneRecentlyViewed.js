/*
 * OneRecentlyViewed 1.0 (Webpack)
 * Tracks recently viewed products and appends them to a jQuery object
 * Nic Shak | nshak@onerockwell.com
 * 
 * Usage:
 * 
 * <div class="recently-viewed">
 *     <h2>Recently Viewed</h2>
 *     <div class="items"></div>
 * </div>
 * 
 * OneRecentlyViewed.init({
 *     el: $('.recently-viewed .items')
 * });
 */

import $ from 'jquery';
import _, { reject } from 'underscore';
import Backbone from 'backbone';

import '../../styles/modules/oneRecentlyViewed.scss';

let OneRecentlyViewedView = Backbone.View.extend({

    initialize: function(settings={}) {
        let self = this;
        
        self.$target = settings.el || undefined;
        self.maxProducts = 4;
        self.cookieKey = "recentlyviewed";
        self.cookieDays = 30;

        let cookie = self.readCookie();
        if(self.$target) {
            self.renderProducts(cookie.products);
        }
        self.recordCookie(cookie);
    },

    events: {},

    /*
     * Reads cookie from browser and returns it. Returns a default
     * template if it does not exist.
     * 
     * @return {Object} The object stored in the cookie
     */
    readCookie: function() {

        let self = this;

        let cookie = ORW.utilities.getCookie(self.cookieKey);

        // Parse cookie or initialize to default if doesn't exist
        let parsedCookie = cookie ? JSON.parse(cookie) : { products: [] };

        return parsedCookie;
    },

    /*
     * Adds product current to the queue (or brings it to the front
     * if present) and writes the data to the cookie
     * 
     * @param {Object} oldCookie The cookie to be mutated
     */
    recordCookie: function(oldCookie) {

        let self = this;

        // If on a PDP
        if(window.location.pathname.indexOf('/products/') !== -1) {
            let productHandle = window.location.pathname.match(/\/products\/([a-z0-9\-]+)/)[1];
            let position = oldCookie.products.indexOf(productHandle);

            if(position === -1) {
                oldCookie.products.unshift(productHandle);
                oldCookie.products = oldCookie.products.splice(0, self.maxProducts);
            }
            else {
                oldCookie.products.splice(position, 1);
                oldCookie.products.unshift(productHandle);
            }
        }

        ORW.utilities.setCookie(self.cookieKey, JSON.stringify(oldCookie), self.cookieDays);
    },

    /*
     * Ajax requests content using ?view=thumbnail and appends it to the
     * element specified in the config
     * 
     * @param {Array} productHandles Array of product handles to render
     */
    renderProducts: function(products) {

        let self = this;

        // Don't do anything if target already has content
        if(!self.$target.is(':empty')) {
            return;
        }

        let promises = products.map(productHandle => {

            let urlWithParam = ORW.utilities.updateUrlParam(`/products/${productHandle}`, "view", "thumbnail");

            return new Promise((resolve, reject) => {

                $.ajax({
                    async: true,
                    type: 'get',
                    url: urlWithParam
                })
                .done(data => resolve($(data)))
                .fail(err => reject(err));
            });
        });
        
        Promise.all(promises)
            .then(values => {
                self.$target.append(values);
                ORW.lazyload?.update();
            })
            .catch(err => console.log(err));
    }
});

let OneRecentlyViewed = {
    init: function(settings) {
        return new OneRecentlyViewedView(settings);
    }
}

export default OneRecentlyViewed;
