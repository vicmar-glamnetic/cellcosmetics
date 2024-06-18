import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import OneMarketing from '@/modules/module-oneMarketing';

export default Backbone.View.extend({
    
    initialize: function (opts) {

        var self = this;
        self.$pager = self.$el.find('.collection-pagination');
        self.$productGrid = self.$el.find('.collection-products');
        self.$products = self.$productGrid.find('.item');
        self.$quickbuy = self.$productGrid.find('.quick-buy-container');
        self.$reviewsModule = self.$el.find('.reviews-slides');
        self.rebuilt = opts.rebuilt;

        if (ORW.enableGTM) {
            ORW.marketing = ORW.marketing || new OneMarketing;
            if (!self.rebuilt) {
                // Send initial set of products on page load
                ORW.marketing.viewItemList(self.$productGrid, self.$products);
            }
        }

        if(self.$quickbuy.length > 0){
            self.productQuantity();
        }
        // self.infinityScroll();
        self.collectionReviewsModule();
    },
    
    events: {
        
    },
    
    infinityScroll: function () {
        var self = this;
        var events = {
            'click .item a:not(.quick-shop-trigger)' : function(e){
                var $curr = $(e.currentTarget);
                var $item = $curr.parents('.item');
                var pageIndex = $item.data('page');
                e.preventDefault();
                if (pageIndex) {
                    var currentUrl = ORW.utilities.getUrlParam(window.location.href,'page', pageIndex);
                    window.history.pushState(null, null, currentUrl);
                }
                window.location.href = $curr.prop('href');
            }
        };
        var loadMore = function(prev){ // Passing param to determin whether loading next page or prev
            var addPage = function(d){
                var $content = $(d).find('.product-collection');
                var $pager = $content.find('.collection-pagination');
                var $newItems = $content.find('.collection-products .item');
                var loadingPageNum = ORW.utilities.getUrlParam(self.url,'page');
                var afterAppend = function (index, item) {
                    
                    $(item).data('page',loadingPageNum);
                    
                    if (index == $newItems.length-1) {
                        // Perform re-init of product grid if needed
                        ORW.rebuildListing();
                        
                        // Need to re-init ajax cart
                        $('.add-to-cart-form').off('submit');

                        ORW.isLoading = false;
                        
                        if (prev) {
                            loadMore(true); // Recursive!!
                            // $('html, body').animate({
                            //     scrollTop: self.$productGrid.prop("scrollHeight")
                            // }, 0);
                        } else {
                            return false;
                        }
                    }
                }
                
                ORW.pagerStack.push(self.url);

                if (!ORW.isFinished) {
                    self.$pager = $pager;
                    $newItems.prependTo(self.$productGrid).each(afterAppend);
                } else {
                    self.$pager.replaceWith($pager);
                    self.$pager = $pager;
                    $newItems.appendTo(self.$productGrid).each(afterAppend);
                    window.history.pushState(null, null, self.url);
                }

                self.$products = self.$productGrid.find('.item');
                // Send newly appended set of products
                if (ORW.enableGTM) {
                    ORW.marketing.viewItemList(self.$productGrid, $newItems);
                }
                window.ORW.lazyload?.update();
                
            }
            
            // Start of Load More
            if (!ORW.isLoading) {
                var status = prev ? 'prev' : 'next';
                if (ORW.isFinished) {
                    // Load next page
                    self.url = self.$pager.find('.next a').length ? self.$pager.find('.next a').attr('href') : '';
                } else {
                    // Load prev page
                    self.url = self.$pager.find('.prev a').length ? self.$pager.find('.prev a').attr('href') : '';
                }
                self.url = self.url.replace('&view=ajax','').replace('?view=ajax','');

                if ($.inArray(self.url, ORW.pagerStack) == -1 && self.url) {
                    console.log('load ' + status);

                    ORW.isLoading = true;

                    let ajaxUrl = '';
                    if (self.url.includes('?')) {
                        ajaxUrl = self.url + `&view=ajax`;
                    } else {
                        ajaxUrl = self.url + `?view=ajax`;
                    }

                    $.get(ajaxUrl).done(addPage);
                } else {
                    if (prev) {
                        ORW.isFinished = true;
                        console.log('load prev finished');
                    } else {
                        $('#loadmore').addClass('disabled');
                        return false;
                    }
                }
            }
        }
        
        // Load Prev Page Trigger
        loadMore(true);
        
        // Load Next Page Triggers
        if (self.isOnScreen($('footer.site-footer'))) {
            loadMore();
        }
        $(window).on('scroll.listview', function () {
            clearTimeout($.data(this, 'scrollTimer'));
            $.data(this, 'scrollTimer', setTimeout(function() {
                if (self.isOnScreen($('footer.site-footer'))) {
                    loadMore();
                }
            }, 150));
        });
        
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },

    collectionReviewsModule: function(){
        var self = this;

        console.log('reviews module');

        self.$reviewsModule.slick({
            dots: true,
            infinite: false,
            speed: 600,
            slidesToShow: 1,
            arrows: false,
            responsive: [
                {
                    breakpoint: ORW.responsiveSizes.large,
                    settings: {
                        
                    }
                }
            ]
        });
        
    },

    productQuantity: function(){
        var self = this;

        var events = {
            'click .product-qty-container .qty-btn' : function(e){
                e.preventDefault();
                var $curr = $(e.currentTarget);
                var $input = $curr.siblings('.qty-input[type=number]');
                var $inputValue = parseInt($input[0].value);
                if($curr.hasClass('plus')){
                    $inputValue = $inputValue + 1;
                } else {
                    $inputValue = $inputValue - 1;
                }
                $input.attr('value', $inputValue)
            }
        }

        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },

    isOnScreen: function (elem) {
        // if the element doesn't exist, abort
        if( elem.length == 0 ) {
            return;
        }
        var $window = jQuery(window)
        var viewport_top = $window.scrollTop()
        var viewport_height = $window.height()
        var viewport_bottom = viewport_top + viewport_height
        var $elem = jQuery(elem)
        var top = $elem.offset().top
        var height = $elem.height()
        var bottom = top + height
    
        return (top >= viewport_top && top < viewport_bottom) ||
        (bottom > viewport_top && bottom <= viewport_bottom) ||
        (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
    },
    
    isMobile: function () {
        if ( ORW.responsive == 'small') {
            return true;
        }
        return false;
    },
    
    destroy: function() {
        var self = this;
        self.undelegateEvents();
        // self.swatches.destroy();
        $(window).off('scroll.listview');
    }
});