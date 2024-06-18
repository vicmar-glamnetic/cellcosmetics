/*
	OneMarketing
	jwerner@onerockwell
	Description: This module manages custom event dataLayer sends to Google Tag Manager (GTM).  
	Data is formatted for Google Analytics 4 (GA4),
		and the events match basic / recommended GA4 eCommerce events (prefixed with "dl_"). 
		The list of events is available in this module's gaEvents() getter function.
	Event calls and snippet data to be included in other files where needed.  
		See: https://docs.google.com/document/d/1VYAs2LofhDzl8OfkL__iiYmee-Pm91RetlYxUX3AsMo/
	Tags and variables for these custom events need to be set up in GTM.  
*/
import $ from 'jquery';
import { PUB_SUB_EVENTS, subscribe } from '@/lib/pubsub';

export default class OneMarketing {
	constructor () {
		this.settings = ORW.marketingSettings || '';

		console.log('init marketing');
		/*
			settings = {
				// Used internally & externally (GTM needs access):
				promoParentClass: string, // Class name applied for view_promotion when sent via GTM
				dataAttributePromo: string, // Data attribute applied to ga4-promo-data items
				cartCurrency: string, // Currency code to send along with cart / item values
			}

			// Used internally:
			trackPromosViaDataLayer: boolean, // If true: send view_promotion event via dataLayer
			customSearchEvent: boolean, // If true: send search event in addition to default Enhanced Measurement
			dataAttributeItem: string, // Data attribute applied to ga4-item-data items
			productPageSelector: string, // CSS parent selector of PDP snippet
			cartPageSelector: string, // CSS parent selector of cart page snippet
			signUpFormID: string // ID of sign up / register account form
		*/

		this.trackPromosViaDataLayer = false;
		this.customSearchEvent = false;
		this.dataAttributeItem = '[data-ga-item-json]';
		this.productPageSelector = '.product-core';
		this.cartPageSelector = '.cart-item';
		this.signUpFormID = 'create_customer';

		this.promoParentClass = this.settings.promoParentClass || 'ga-promo-element';
        this.dataAttributePromo = this.settings.dataAttributePromo || '[data-ga-promo-json]';
		this.cartCurrency = this.settings.cartCurrency || '';
    }

	/* 
		--- GTM events / dataLayer functions ---
	*/

	get gaEvents() {
		// Custom GTM trigger event names
		return {
			add_to_cart: "dl_add_to_cart",
			remove_from_cart: "dl_remove_from_cart",
			view_cart: "dl_view_cart",
			begin_checkout: "dl_begin_checkout",
			add_shipping_info: "dl_add_shipping_info",
			add_payment_info: "dl_add_payment_info",
			view_item_list: "dl_view_item_list",
			view_item: "dl_view_item",
			view_promotion: "dl_view_promotion",
			select_promotion: "dl_select_promotion",
			add_to_wishlist: "dl_add_to_wishlist",
			search: "dl_search",
			sign_up: "dl_sign_up"
		}
	}

	dataLayerPush (eventString, ecommerceObject) {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({ ecommerce: null });
		window.dataLayer.push({
			event: eventString,
			ecommerce: ecommerceObject
		});
	}

	/* 
		--- Event watcher functions --- 
	*/

	/* --- Cart events: add & remove from cart --- */
	initCartWatchers() {
		// Click "X" to remove all quantities of item
		$('.cart-items').on('click', '.item-remove', (e) => {
			this.removeFromCart(e.currentTarget);
		});

		// Click plus / minus or edit quantity number directly
		let timer;
		$('.cart-items').on('change', '[data-cart-quantity]', (e) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				this.checkItemQtyChangeCart(e);
			}, 500);
		});
	}

	/* --- Update variant info when swatch changed --- */
	initVariantWatcher (productCore) {
		subscribe(PUB_SUB_EVENTS.variantChange, (variant) => {
			let newVariant = variant.id;
			let gaData = $(productCore).find(this.dataAttributeItem);
			
			gaData.data('ga-variant-id', newVariant);
		});
	}

	/* --- Wishlist event: add to wishlist --- */
	initWishlistWatcher () {
		// Item added to wishlist default event: update as needed to work with wishlist app
		$(document.body).on('click', '.add-to-wishlist', (e) => {
			this.addToWishlist(e.target);
		})
	}

	/* --- Featured promotion events (using ga4-promo-data snippet): view & select --- */
	initPromoWatchers () {
		const $promos = $(this.dataAttributePromo);

		$promos.each((index, promo) => {
			const ecommerceObject = this.__parseItemJSON(promo);

			if (ecommerceObject) {
				const $promoParent = $(promo).parent();
				const hasClick = $(promo).data('ga-promo-click');

				if (this.trackPromosViaDataLayer) {
					this.viewPromo(ecommerceObject);
				} else {
					// GTM element visibility selector
					$promoParent.addClass(this.promoParentClass);
				}

				if (hasClick) {
					let clickTarget = $promoParent;
					if (hasClick !== true) {
						clickTarget = $promoParent.find(hasClick);
					};
					this.selectPromo(clickTarget, ecommerceObject);
				}
			}
		})
	}

	/* 
		--- GTM Event functions --- 
	*/

	/* --- Promotion events --- */
	viewPromo (ecommerceObject) {
		/* 
			dataLayer object format:
			{
				promotion_id: string,
				promotion_name: string,
				items: array
			}
		*/
		const gaEvent = this.gaEvents.view_promotion;

		this.dataLayerPush(gaEvent, ecommerceObject);
	}

	selectPromo (promo, ecommerceObject) {
		/* 
			dataLayer object format:
			{
				promotion_id: string,
				promotion_name: string,
				items: array
			}
		*/
		const gaEvent = this.gaEvents.select_promotion;

		$(promo).one('click', (e) => {
			e.preventDefault();
			this.dataLayerPush(gaEvent, ecommerceObject);
			this.__triggerButtonOrLink(e.target);
		});
	}

	/* --- Product / PDP events --- */
	viewItem (productCore) {
		/* 
			dataLayer object format:
			{
				currency: string,
				value: number,
				items: array
			}
		*/
		const gaEvent = this.gaEvents.view_item;

		const itemData = this.__getItemDataFromJSON(productCore);

		if (itemData) {
			const ecommerceObject = this.__createEcommerceObjectFromItem(itemData);

			this.dataLayerPush(gaEvent, ecommerceObject);
		}
	}

	/* --- Default wishlist event; update to work with wishlist app --- */
	addToWishlist (eventTarget) {
		/* 
			dataLayer object format:
			{
				currency: string,
				value: number,
				items: array
			}
		*/
		const gaEvent = this.gaEvents.add_to_wishlist;

		const $productCore = $(eventTarget).parents(this.productPageSelector);
		const itemData = this.__getItemDataFromJSON($productCore);

		if (itemData) {
			const ecommerceObject = this.__createEcommerceObjectFromItem(itemData);

			this.dataLayerPush(gaEvent, ecommerceObject);
		}
	}

	/* --- PLP / Search events --- */
	viewItemList (collection, items) {
		/* 
			dataLayer object format:
			{
				item_list_id: string,
				item_list_name: string,
				items: array,
				(item additional info: index)
			}
		*/
		const gaEvent = this.gaEvents.view_item_list;

		const itemListID = collection.data('ga-id');
		const itemListName = collection.data('ga-name');
		let itemsArray = this.__createListItemsArray(items);

		const searchQuery = ORW.utilities.getUrlParam(window.location.href,'q');
		if (searchQuery && this.customSearchEvent) {
			this.search(searchQuery);
		}

		if (itemsArray.length > 0) {
			const ecommerceObject = {
				item_list_id: itemListID,
				item_list_name: itemListName,
				items: itemsArray,
			}

			this.dataLayerPush(gaEvent, ecommerceObject);
		}
	}

	search (query) {
		/* 
			dataLayer object format:
			{
				search_term: string
			}
		*/
		const gaEvent = this.gaEvents.search;
		const formattedQuery = query.replace('+', ' ');

		const ecommerceObject = {
			search_term: formattedQuery, 
		}

		this.dataLayerPush(gaEvent, ecommerceObject);
	}

	/* --- Account events --- */
	signUp () {
		/* 
			dataLayer object format:
			{
				method: string
			}
		*/
		const gaEvent = this.gaEvents.sign_up;
		
		const ecommerceObject = {
			method: 'Shopify', 
		}

		this.dataLayerPush(gaEvent, ecommerceObject);
	}

	accountForm (form) {
		if ($(form).attr('id') === this.signUpFormID) {
			this.signUp();
		}
	}

	/* --- Cart page non-Ajax events --- */
	removeFromCart (eventTarget) {
		/* 
			dataLayer object format:
			{
				currency: string,
				value: number,
				items: array
			}
		*/
		const gaEvent = this.gaEvents.remove_from_cart;

		const $clickedItem = $(eventTarget).parents(this.cartPageSelector);
		const itemData = this.__getItemDataFromJSON($clickedItem);

		if (itemData) {
			const ecommerceObject = this.__createEcommerceObjectFromItem(itemData);
			// Removing an item; value == negative
			ecommerceObject.value = ecommerceObject.value * -1;

			this.dataLayerPush(gaEvent, ecommerceObject);
		}
	}

	async viewCart () {
		/* 
			dataLayer object format:
			{
				currency: string,
				value: number,
				items: array
			}
		*/
		const gaEvent = this.gaEvents.view_cart;

		const cart = await this.__getCart();
		if (cart) {
			const ecommerceObject = this.__createEcommerceObjectFromCart(cart);

			this.dataLayerPush(gaEvent, ecommerceObject);
		}
	}

	checkItemQtyChangeCart (event) {
		/* 
			dataLayer object format:
			{
				currency: string,
				value: number,
				items: array
			}
		*/
		let input = event.currentTarget;
		let quantity = this.__preferNumber(input.value);
		let originalQuantity = this.__preferNumber(input.defaultValue);
		let diff = quantity - originalQuantity;

		let parent = $(input).parents(this.cartPageSelector);
		let itemData = this.__getItemDataFromJSON(parent);

		if (itemData) {
			itemData.quantity = Math.abs(diff);
			const ecommerceObject = this.__createEcommerceObjectFromItem(itemData);
			let gaEvent;

			if (diff > 0) { // Quantity increased
				gaEvent = this.gaEvents.add_to_cart;
			} else if (diff < 0) { // Quantity decreased
				gaEvent = this.gaEvents.remove_from_cart;
				ecommerceObject.value = ecommerceObject.value * -1;
			}

			if (gaEvent) {
				this.dataLayerPush(gaEvent, ecommerceObject);
			}
		}
	}

	checkItemQtyManualChangeCartPage () {
		/* 
			dataLayer object format:
			{
				currency: string,
				value: number,
				items: array
			}
		*/
		const quantityInputs = $('input.js-qty__num');
		let itemsAdded = [];
		let itemsRemoved = [];
		let totalValueAdded = 0;
		let totalValueRemoved = 0;

		for (let input of quantityInputs) {
			const item = $(input).parents(this.cartPageSelector);
			const itemData = this.__getItemDataFromJSON(item);
			const itemQuantity = this.__preferNumber($(input).val());

			if (itemData && itemData.quantity !== itemQuantity) {
				const qtyDiff = itemQuantity - itemData.quantity;
				itemData.quantity = Math.abs(qtyDiff);
				const valueChange = itemData.price * itemData.quantity;
				if (qtyDiff > 0) {
					// Items added
					totalValueAdded += valueChange;
					itemsAdded.push(itemData);
				} else {
					// Items removed
					totalValueRemoved -= valueChange;
					itemsRemoved.push(itemData);
				}
			}
		}

		if (itemsAdded.length > 0) {
			const gaEvent = this.gaEvents.add_to_cart;
			const ecommerceObject = {
				"currency": this.cartCurrency,
				"value": totalValueAdded,
				"items": itemsAdded,
			};

			this.dataLayerPush(gaEvent, ecommerceObject);
		}

		if (itemsRemoved.length > 0) {
			const gaEvent = this.gaEvents.remove_from_cart;
			const ecommerceObject = {
				"currency": this.cartCurrency,
				"value": totalValueRemoved,
				"items": itemsRemoved,
			};

			this.dataLayerPush(gaEvent, ecommerceObject);
		}
	}

	addToCart (form) {
		/* 
			dataLayer object format:
			{
				currency: string,
				value: number,
				items: array
			}
		*/
		const gaEvent = this.gaEvents.add_to_cart;

		let quantity = 1; // Default qty
		let $formQtyInput = $(form).find('input.qty-input');

		if ($formQtyInput.length > 0) {
			quantity = $formQtyInput.val();
		}

		let parent = $(form).parents(this.productPageSelector);
		let itemData = this.__getItemDataFromJSON(parent);

		if (itemData) {
			itemData.quantity = this.__preferNumber(quantity);
			const ecommerceObject = this.__createEcommerceObjectFromItem(itemData);

			this.dataLayerPush(gaEvent, ecommerceObject);
		}
	}

	/* --- Checkout events --- */
	async checkoutEvents () {
		/* 
			dataLayer object format:
			{
				currency: string,
				value: number,
				items: array
			}
		*/
		// Checkout page events & associated GTM trigger
		const checkoutTriggers = {
			'contact_information': this.gaEvents.begin_checkout,
			'shipping_method': this.gaEvents.add_shipping_info,
			'payment_method': this.gaEvents.add_payment_info,
		}

		if (window.Shopify && window.Shopify.Checkout) {
			const currentStep = window.Shopify.Checkout.step;
			if (currentStep) {
				const gaEvent = checkoutTriggers[currentStep];

				if (gaEvent) {
					const cart = await this.__getCart();

					if (cart) {
						const ecommerceObject = this.__createEcommerceObjectFromCart(cart);
						ecommerceObject.coupon = $('[data-ga-checkout-coupons]').html() || '';

						this.dataLayerPush(gaEvent, ecommerceObject);
					}
				}
			}
		}
	}
	/* --- Purchase event in ga4-checkout-script.liquid --- */

	/* 
		--- Helper & format functions --- 
	*/
	
	/* --- Cart fetch for cart & checkout events --- */
	async __getCart () {
        let cartResponse,
		cartContents;

        try {
            cartResponse = await fetch('/cart.js');
        } catch (e) {
            console.error(e);
        }

		if (cartResponse?.ok) {
			cartContents = await cartResponse.json();
		}

		return cartContents;
    }

	__getItemDataFromJSON (item) {
		// Translate parsed JSON into dataLayer-formatted item object
		const jsonData = this.__getItemJSON(item);
		const parsedData = this.__parseItemJSON(jsonData);
		let formattedData;

		if (parsedData) {
			const variantID = jsonData.data('ga-variant-id');
			if (variantID) {
				// Product data
				formattedData = this.__getProductInfo(parsedData, this.__preferNumber(variantID));
			} else {
				// Cart data
				formattedData = this.__getItemInfo(parsedData);
			}
		}

		return formattedData;
	}

	__parseItemJSON (json) {
		const jsonInner = $(json).html();
		let jsonParsed;

		try {
			jsonParsed = JSON.parse(jsonInner);
		} catch (e) {
			return false;
		}
		return jsonParsed;
	}
	
	__getItemJSON (item) {
		// Find the JSON data in the DOM
		const $itemJSON = $(item).find(this.dataAttributeItem);

		if ($itemJSON.length > 0) {
			return $itemJSON;
		} else {
			return item;
		}
	}
	
	/* --- Single item event, like add to cart, view item, etc. --- */
	__createEcommerceObjectFromItem (item) {
		const priceFormatted = item.price * item.quantity;

		const ecommerceObject = {
			"currency": this.cartCurrency,
			"value": this.__preferNumber(priceFormatted),
		};

		ecommerceObject.items = [item];

		return ecommerceObject;
	}

	/* --- Multi-item event specific to cart, like view cart, checkout, etc. --- */
	__createEcommerceObjectFromCart (cart) {
		const priceFormatted = this.__formatPrice(cart.total_price);

		const ecommerceObject = {
			"currency": cart.currency || this.cartCurrency,
			"value": this.__preferNumber(priceFormatted),
		};

		ecommerceObject.items = this.__createCartItemsArray(cart);

		return ecommerceObject;
	}

	/* --- Cart item-specific: get and format line item data that will be used within items: [] array --- */
	__getItemInfo (item) {
		const priceFormatted = this.__formatPrice(item.final_price);
		const discountFormatted = this.__formatPrice(item.line_level_total_discount);
		const coupons = this.__getItemCoupons(item);

		const gaFormattedItem = {
			'item_id': item.sku,
			'item_name': item.product_title,
			'item_brand': item.vendor,
			'item_category': item.product_type,
			'item_variant': item.variant_title,
			'price': this.__preferNumber(priceFormatted),
			'quantity': this.__preferNumber(item.quantity),
			'affiliation': item.selling_plan_allocation_selling_plan_name || '',
			'coupon': coupons,
			'discount': this.__preferNumber(discountFormatted)
		};

		return gaFormattedItem;
	}

	/* --- Product-specific: get and format variant data that will be used within items: [] array --- */
	__getProductInfo (product, variantID) {
		let variant = product;
		for (const prodVariant of product.variants) {
			if (prodVariant.id === variantID) {
				variant = prodVariant;
				break;
			}
		}
		const priceFormatted = this.__formatPrice(variant.price);
		
		const gaFormattedProduct = {
			'item_id': variant.sku,
			'item_name': product.title,
			'item_brand': product.vendor,
			'item_category': product.type,
			'item_variant': variant.title,
			'price': this.__preferNumber(priceFormatted),
			'quantity': 1,
			'affiliation': '',
			'coupon': '',
			'discount': 0
		};

		return gaFormattedProduct;
	}

	__createCartItemsArray (cart) {
		let itemsArray = [];

		for (let item of cart.items) {
			const newProduct = this.__getItemInfo(item);
			itemsArray.push(newProduct);
		};

		return itemsArray;
	}

	__createListItemsArray (items) {
		let itemsArray = [];

		for (let item of items) {
			if (item.classList.contains('promo')) {
				// Exclude promo banners
				continue;
			}

			const itemData = this.__getItemDataFromJSON(item);
			if (itemData) {
				const index = $(item).data('product-index');
				itemData.index = this.__zeroBasedIndex(index);

				itemsArray.push(itemData);
			}
		}

		return itemsArray;
	}

	__getItemCoupons (item) {
		let coupons = [];
		const discounts = item.line_level_discount_allocations;

		if (discounts) {
			for (let coupon of discounts) {
				const couponName = coupon.discount_application.title.trim();
				coupons.push(couponName);
			}
		}
		return coupons.join(", ");
	}

	__triggerButtonOrLink (eventTarget) {
		const targetLink = $(eventTarget).children().attr('href');

		if (targetLink) {
			location.href = targetLink;
		} else {
			eventTarget.click();
		}
	}

	__zeroBasedIndex (index) {
		const zeroedIndex = this.__preferNumber(index) - 1;
		return zeroedIndex;
	}

	__preferNumber (input) {
		// Standard JS, trailing zeroes will not be retained
		const converted = Number(input) || input;
		return converted;
	}

	__formatPrice (price) {
		// Convert Shopify's price result to decimal
		let priceFormatted = price ? price / 100 : '';

		if (priceFormatted === '') {
			priceFormatted = 0;
		}

		return priceFormatted;
	}
	// end helper / format functions
}