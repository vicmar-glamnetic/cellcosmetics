/*
	OneSwatches 2.2.0 Usage (Webpack)
	Yang @onerockwell
	Adding option availablity check

	OneSwatches 2.1.0 Usage
	Yang @onerockwell
	Adding option availablity check
	
	OneSwatches 2.0.0 Usage
	Yang @onerockwell
	
	OneSwatches 1.0.0 Usage
	Yang & Patrick @onerockwell
*/

// Import all dependencies here
import _ from 'underscore';
import Backbone from 'backbone';
import { publish, PUB_SUB_EVENTS } from '@/lib/pubsub';
import OneMarketing from '@/modules/module-oneMarketing';

import '../../styles/modules/oneSwatch.scss';

// Define the Backbone View here (Optional)
let OneProductFormView = Backbone.View.extend({
	
    /**
     * @param {Boolean} settings.preSelect Pre-select the first variant
     * @param {Boolean} settings.updateURL Update the "variant" URL parameter on variant change
     */
	initialize: function(settings) {

        this.settings = settings || {};

        // Master ID input is disabled by default to give <noscript> form priority
        this.el.querySelector('[name="id"]').disabled = false;

        this.setVariant();
        this.onVariantChange();
        
        this.el.addEventListener('submit', e => this.onFormSubmit(e));
	},

	events: {
		'change': 'onVariantChange',
	},

	onFormSubmit: function(e) {
        e.preventDefault();

        this.handleErrorMessage();

        const formData = new FormData(this.el);
        const config = {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/javascript'
            },
            body: formData
        };

        fetch(this.el.getAttribute('action'), config)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    publish(PUB_SUB_EVENTS.cartError, {
                        errors: response.errors || response.description,
                        message: response.message 
                    });
                    this.handleErrorMessage(response.description);
                } else {
                    publish(PUB_SUB_EVENTS.cartUpdate, response)
                    if (ORW.enableGTM) {
                        ORW.marketing = ORW.marketing || new OneMarketing;
                        ORW.marketing.addToCart(this.el);
                    }
                }
            });
    },

    handleErrorMessage: function(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessage =
            this.errorMessage || this.el.querySelector('.form-errors');
        if (!this.errorMessage) return;

        this.errorMessage.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
            this.errorMessage.textContent = errorMessage;
        }
    },

    onVariantChange: function() {
        this.updateOptions();
        this.updateMasterId();
        this.updateVariantStatuses();
        this.updateAddButton();

        if (this.currentVariant) {
            this.updateVariantInput();
            this.settings.updateURL && this.updateURL();
        }
    },

	/**
     *  Mark radios as checked if a variant is present in the URL params or if
     *  preSelect setting is true
     */
    setVariant: function() {
        const params = new URLSearchParams(window.location.search);
        const variantId = this.settings.preSelect ? 
            this.getVariantData()[0].id :
            params.get('variant');

        if (variantId) {
            this.currentVariant = this.getVariantData().find(variant => {
                return variant.id.toString() === variantId.toString();
            });
            if (this.currentVariant) {
                this.currentVariant.options.forEach(option => {
                    this.el.querySelector(`[value="${option}"]`).checked = true;
                });
            }
        }
    },

    updateAddButton: function() {
        this.numOptions = this.numOptions || this.el.querySelectorAll('fieldset').length;
        const addButton = this.el.querySelector('[name="add"]');
        const addButtonText = this.el.querySelector('[name="add"] > span');
        if (!addButton) return;
    
        if (this.currentVariant && this.currentVariant.available) {
            addButton.removeAttribute('disabled');
            addButtonText.textContent = 'Add to Cart';
        } else if (this.currentVariant && !this.currentVariant.available) {
            addButton.setAttribute('disabled', 'disabled');
            addButtonText.textContent = 'Sold Out';
        } else {
            addButton.setAttribute('disabled', 'disabled');
            addButtonText.textContent = this.options?.length < this.numOptions ?
                'Add to Cart' : 'Unavailable';
        }
    },

    updateOptions: function() {
        const fieldsets = Array.from(this.el.querySelectorAll('fieldset'));
        this.options = fieldsets.map(fieldset => {
            return Array.from(fieldset.querySelectorAll('input')).find(input => input.checked)?.value;
        }).filter(Boolean)
        publish(PUB_SUB_EVENTS.variantOptionsChange, this.options);
    },

    updateMasterId: function() {
        this.currentVariant = this.getVariantData().find(variant => {
            // Assumes that options appear in the same order as they do in the DOM
            return !variant.options
                .map((option, index) => {
                    return this.options[index] === option;
                })
                .includes(false);
        });
        if (this.currentVariant) publish(PUB_SUB_EVENTS.variantChange, this.currentVariant);
    },

    // Mark radios as disabled depending on currently selected values
    updateVariantStatuses: function() {
        if (!this.el.querySelector(':checked')) return;
        const selectedOptionOneVariants = this.getVariantData().filter(
            (variant) => this.el.querySelector(':checked').value === variant.option1
        );
        const inputWrappers = [...this.el.querySelectorAll('fieldset')];
        inputWrappers.forEach((option, index) => {
            if (index === 0) return;
            const optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
            const previousOptionSelected = inputWrappers[index - 1].querySelector('[checked],:checked');
            if (!previousOptionSelected) return;
            const availableOptionInputsValue = selectedOptionOneVariants
                .filter((variant) => variant.available && variant[`option${index}`] === previousOptionSelected.value)
                .map((variantOption) => variantOption[`option${index + 1}`]);
            this.setInputAvailability(optionInputs, availableOptionInputsValue);
        });
    },

    setInputAvailability: function(listOfOptions, listOfAvailableOptions) {
        listOfOptions.forEach((input) => {
            if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
                input.classList.remove('disabled');
            } else {
                input.classList.add('disabled');
            }
        });
    },

    getVariantData: function() {
        this.variantData = this.variantData || JSON.parse(this.el.querySelector('.variants-json').textContent);
        return this.variantData;
    },

    updateVariantInput: function() {
        const input = this.el.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
    },

    toggleAddButton: function(disable = true, text) {
        const productForm = this.el.querySelector('form.add-to-cart-form');
        if (!productForm) return;
        const addButton = productForm.querySelector('[name="add"]');
        const addButtonText = productForm.querySelector('[name="add"] > span');
        if (!addButton) return;
    
        if (disable) {
            addButton.setAttribute('disabled', 'disabled');
            if (text) addButtonText.textContent = text;
        } else {
            addButton.removeAttribute('disabled');
            addButtonText.textContent = 'Add to Cart';
        }
    },

    updateURL: function() {
        if (this.currentVariant) {
            window.history.replaceState({}, '', `${window.location.pathname}?variant=${this.currentVariant.id}`);
        }
    },
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneProductForm = {
	init: function (settings) {
		return new OneProductFormView(settings);
	}
}

// Output the module
export default OneProductForm;