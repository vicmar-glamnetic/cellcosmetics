import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewProduct from '@/views/view-product';
import OneQuickShop from '@/modules/module-oneQuickShop';

import '../../styles/pages/product.scss';
import '../../styles/apps/okendoReviews.scss';

whenDomReady(() => {
    $('.product-detail-container').length && new ViewProduct({el: $('.template-product')});
    $('.product-recommend').length && OneQuickShop.init({});
});