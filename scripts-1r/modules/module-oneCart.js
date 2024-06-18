import Backbone from 'backbone';
import { renderSections, getSectionInnerHTML } from '@/lib/renderSections';
import { PUB_SUB_EVENTS, subscribe, publish } from '@/lib/pubsub';

const OneCartView = Backbone.View.extend({

    initialize: function (settings) {
        var self = this;
        /*if(window.location.pathname.endsWith('cellcosmet-regimen-finder')) {
            self.initFetchHandle(window, window.fetch);
        }*/
        
        this.unsubscribe = subscribe(
            PUB_SUB_EVENTS.cartUpdate,
            this.handleCartUpdate.bind(this)
        );
    },

    events: {
        'click .item-remove': 'handleRemoveItem',
        'change .item-quantity input': 'handleQuantityChange',
        'click .item-quantity button': 'handleQuantityButtonClick',
    },


    initFetchHandle: function(ns, fetch) {
        var self = this;
        ns.fetch = function() {
            const response = fetch.apply(this, arguments);
            response.then(res => {
                if (`${window.location.origin}/cart/add.js`.includes(res.url)) {
                    console.log('Add To Cart Hanle');
                    publish(PUB_SUB_EVENTS.cartUpdate, {});
                }
            });
            return response;
        }
    },

    /**
     * Request updated cart HTML from Shopify Section Rendering API and replace the
     * current cart HTML with the new HTML
     */
    handleCartUpdate: async function() {
        const res = await renderSections(['cart']);

        const cartItemsHTML = getSectionInnerHTML(res.cart, '.cart-items');
        this.el.querySelector('.cart-items').innerHTML = cartItemsHTML;

        const totalsHTML = getSectionInnerHTML(res.cart, '.cart-summary-wrapper');
        this.el.querySelector('.cart-summary-wrapper').innerHTML = totalsHTML;

        const subtotalHTML = getSectionInnerHTML(res.cart, '.total');
        this.el.querySelector('.total').innerHTML = subtotalHTML;

        if (this.error) {
            const { id, message } = this.error;
            this.showError(id, message);;
        }
    },

    /**
     * Handle click events on "remove item" buttons
     * @param {Event} e A click event
     */
    handleRemoveItem: async function(e) {
        e.preventDefault();
        const cartItemElem = e.currentTarget.closest('.cart-item');
        this.updateQuantity(cartItemElem.dataset.id, 0);
    },

    /**
     * Start timer to send update request and reset timer if another change event
     * occurs before the timer is up
     * @param {Event} e A change event
     */
    handleQuantityChange: function(e) {
        if (this.timeout) clearTimeout(this.timeout)
        const onTimeout = _ => {
            this.updateQuantity(e.currentTarget.dataset.id, e.currentTarget.value);
        };
        this.timeout = setTimeout(onTimeout.bind(this), 1000);
    },

    /**
     * Request to update cart item quantity and update relevant info
     * @param {String} id The cart item's variant ID
     * @param {Number} quantity The cart item's new quantity
     */
    updateQuantity: async function(id, quantity) {
        this.setLoading(id);
        const res = await fetch(ORW.routes.cartChangeURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: `application/json`
            },
            body: JSON.stringify({ id, quantity }),
        });
        publish(PUB_SUB_EVENTS.cartUpdate, {});
        const cart = await res.json();
        if (cart.errors) {
            this.error = {
                id,
                message: cart.errors.trim()
            };
        };
    },

    /**
     * Update the quantity input value based on the button clicked and dispatch a
     * change event
     * @param {Event} e A click event
     */
    handleQuantityButtonClick: function(e) {
        const input = e.currentTarget.closest('.item-quantity').querySelector('input');
        e.currentTarget.name === 'plus' ? input.stepUp() : input.stepDown();
        input.dispatchEvent(new Event('change', { bubbles: true }));
    },

    /**
     * Hide prices and show loading spinner for a cart item and the cart subtotal
     * @param {String} id The line item ID of the cart item
     */
    setLoading: function(id) {
        const subtotal = this.el.querySelector('.total-price');
        subtotal.querySelector('span').style.display = 'none';
        subtotal.querySelector('.spinner').style.display = 'block';

        const item = this.el.querySelector(`[data-id="${id}"]`);
        item.querySelector('.item-total span').style.display = 'none';
        item.querySelector('.item-total .spinner').style.display = 'block';
    },

    showError: function(id, message) {
        const item = this.el.querySelector(`[data-id="${id}"]`);
        const error = item.querySelector('.item-error');
        console.log(error, message)
        error.textContent = message;
    },

    destroy: function() {
        this.unsubscribe();
    }
});

export default OneCartView;