import whenDomReady from 'when-dom-ready';
import OneMarketing from '@/modules/module-oneMarketing';
import OneCart from '@/modules/module-oneCart';
import '../../styles/pages/cart.scss';

whenDomReady(() => {
    if (ORW.enableGTM) {
        ORW.marketing = ORW.marketing || new OneMarketing;
        ORW.marketing.viewCart();
    }

    const cartElem = document.querySelector('main form.cart');
    if (cartElem) {
        new OneCart({ el: cartElem });
    }
});
