import $ from 'jquery';

import whenDomReady from 'when-dom-ready';
import ViewGlobal from '@/views/view-global';

export default async () => {

    let $body = $('body');

    if ($body.hasClass('template-index')) {
        await import(/* webpackPrefetch: true, webpackChunkName: "index" */ '@/pages/page-home');
    }
    
    if ($body.hasClass('template-product')) {
        await import(/* webpackPrefetch: true, webpackChunkName: "product" */ '@/pages/page-product');
    }
    
    if ( ($body.hasClass('template-collection') || $body.hasClass('template-search')) && $body.data('tempsuffix') != 'lookbook' ) {
        await import(/* webpackPrefetch: true, webpackChunkName: "collection" */ '@/pages/page-collection');
    }
    
    if ($body.hasClass('template-giftcard')) {
        await import(/* webpackPrefetch: true, webpackChunkName: "giftcard" */ '@/pages/page-giftcard');
    }

    if ($body.hasClass('template-cart')) {
        await import(/* webpackPrefetch: true, webpackChunkName: "cart" */ '@/pages/page-cart');
    }
    
    if ($body.data('tempsuffix') == 'styles') {
        await import(/* webpackPrefetch: true, webpackChunkName: "page.styles" */ '@/pages/page-styleGuide');
    }
    
    if ($body.data('tempsuffix') == 'about') {
        await import(/* webpackPrefetch: true, webpackChunkName: "page.about" */ '@/pages/page-about');
    }
    
    if ($body.data('tempsuffix').includes('utility')) {
        require('@/pages/page-utility');
    }

    if ($body.hasClass('template-404')) {  
        await import(/* webpackPrefetch: true, webpackChunkName: "404" */ '@/pages/page-404');
    }
    
    if ($body.hasClass('template-blog')) {
        await import(/* webpackPrefetch: true, webpackChunkName: "blog" */ '@/pages/page-blog');
    }

    if ($body.hasClass('template-article')) {
        await import(/* webpackPrefetch: true, webpackChunkName: "article" */ '@/pages/page-article');
    }

    if ($body.data('tempsuffix').includes('multisection')) {
        require('@/pages/page-multisection');
        require('@/pages/page-home');
    }
    
    if ($body.hasClass('page-account') 
        || $body.hasClass('page-create-account') 
        || $body.hasClass('page-reset-account') 
        || $body.hasClass('page-addresses') 
    ) {
        await import(/* webpackPrefetch: true, webpackChunkName: "customers" */ '@/pages/page-account');
    }

    if ($body.hasClass('template-password')
        || $body.hasClass('template-page') && $body.hasClass('template-suffix-update-password')
    ) {
        await import(/* webpackPrefetch: true, webpackChunkName: "password" */ '@/pages/page-password');
    }

    if ($body.data('tempsuffix') == 'store-locator') {
        await import(/* webpackPrefetch: true, webpackChunkName: "page.store-locator" */ '@/pages/page-storeLocator');
    }

    whenDomReady(() => {
        if (!$body.hasClass('template-password')) {
            ORW.Global = new ViewGlobal({el: $body});
        }
    });

};