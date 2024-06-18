import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewCollection from '@/views/view-collection';
import ViewCollectionNav from '@/views/view-collectionNav';
import OneQuickShop from '@/modules/module-oneQuickShop';
import OneQuickBuy from '@/modules/module-oneQuickBuy';
import OneProductCompare from '@/modules/module-oneProductCompare';

import '../../styles/pages/collection.scss';
import '../../styles/pages/search.scss';

let collection, rebuilt, quickbuy = false;
let $productCollection = $('.product-collection');
let $productCollectionNav = $('.collection-nav');

// For lazy loading
ORW.pagerStack = [];
ORW.isLoading = false;
ORW.isFinished = false;
    
ORW.rebuildListing = function(){
    if (rebuilt) {
        console.log('rebuilt listing page');
    } else {
        console.log('init listing page');
    }    

    collection && collection.destroy();
    if ( $productCollection.length ) {
        collection = new ViewCollection({el: $productCollection, rebuilt: rebuilt });
    }
    
    quickbuy && quickbuy.destroy();
    if ( $productCollection.length && $productCollection.data('quickbuy') ) {
        quickbuy = OneQuickBuy.init({ el: $productCollection });
    }

    if (!rebuilt) rebuilt = true;
};

whenDomReady(() => {
    $productCollectionNav.length && new ViewCollectionNav({el: $productCollection });
    if ( $productCollection.length && $productCollection.data('quickshop') ) {
        OneQuickShop.init({});
    }
    OneProductCompare.init({});
    ORW.rebuildListing();
});
