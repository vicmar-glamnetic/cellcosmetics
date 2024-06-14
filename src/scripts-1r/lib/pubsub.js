let subscribers = {};

export const PUB_SUB_EVENTS = {
    cartUpdate: 'cart-update', //The cart has been updated
    variantOptionsChange: 'variant-options-change', //A product option was selected (but not necessarily a variant change)
    variantChange: 'variant-change', //The product form has a new variant selected
    cartError: 'cart-error', //There was an error updating the cart
};

export function subscribe(eventName, callback) {
    if (subscribers[eventName] === undefined) {
        subscribers[eventName] = [];
    }

    subscribers[eventName] = [...subscribers[eventName], callback];

    return function unsubscribe() {
        subscribers[eventName] = subscribers[eventName].filter((cb) => {
            return cb !== callback;
        });
    };
}

export function publish(eventName, data) {
    if (subscribers[eventName]) {
        subscribers[eventName].forEach((callback) => {
            callback(data);
        });
    }
}