import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import 'scrolltofixed';
import 'slick-carousel';

import OneProductForm from '@/modules/module-oneProductForm';
import OneZoom from '@/modules/module-oneZoom';
import OneDrawer from '@/modules/module-oneDrawer';
import OneTabSystem from '@/modules/module-oneTabSystem';
import OneVideo from '@/modules/module-oneVideo';
import OneRecentlyViewed from '@/modules/module-oneRecentlyViewed';
import OneMarketing from '@/modules/module-oneMarketing';

import '../../styles/modules/oneSizeChart.scss';
import { PUB_SUB_EVENTS, subscribe } from '@/lib/pubsub';

export default Backbone.View.extend({
    
    initialize: function(opts){
        
        console.log('init PDP');
        
        var self = this

        // $content is <body>
        self.$content = self.$el;
        self.$detailContainer = self.$content.find('.product-detail-container');
        
        self.$media = self.$content.find('.product-media');
        self.$mainImage = self.$media.find('#ProductMediaImages');
        self.$thumbImage = self.$media.find('#ProductMediaThumbs');
        self.$mediaSlider = self.$mainImage.find('.images-wrapper');
        self.$thumbSlider = self.$thumbImage.find('.images-wrapper');

        self.$productCore = self.$content.find('.product-core');
        self.$socialIcons = self.$productCore.find('.one-social');
        self.isGiftCard = self.$detailContainer.hasClass('gift-card');
        self.productQty = self.$content.find('.product-qty-container');

        self.$recentlyViewed = self.$content.find('.recently-viewed .items');
        self.$productExtra = self.$content.find('.product-extra');
        
        // Features
        self.enableMiniCore = false;
        self.isScrollingLayout = self.$content.data('layout') == 'scrolling' ? true : false;
        self.isScrollingGrid = self.$content.hasClass('scrolling-grid');
        self.isSliderLayout = self.$content.data('layout') == 'slider' ? true : false;
        self.isQuickshopLayout = self.$content.data('layout') == 'quickshop' ? true : false;
        
        if (ORW.enableGTM) {
            ORW.marketing = ORW.marketing || new OneMarketing;
            ORW.marketing.initVariantWatcher(self.$productCore);
        }

        self.productCore();
        self.productVariants();
        self.initPrice();
        //self.initStickyAddToCart();

        if (!self.isGiftCard) {
            self.productMedia();
        }
        
        if (!self.isQuickshopLayout) {
            self.social();
            if (ORW.enableGTM) {
                ORW.marketing.viewItem(self.$productCore);
            }
        } 
        
        if (!self.isGiftCard && !self.isQuickshopLayout) {
            self.zoom();
            self.video();
            // self.sizeChart();
            self.accordionsAndTabs();
            self.recentlyViewed();
            self.tabContent();
            // self.fullIngredients();
        }

        OneProductForm.init({
            el: self.el.querySelector('form.add-to-cart-form'),
            preSelect: true,
            updateURL: !self.isQuickshopLayout,
        });

        /*OneProductForm.init({
            el: self.el.querySelector('.product-form-sticky-container form.add-to-cart-form'),
            preSelect: true,
            updateURL: !self.isQuickshopLayout,
        });*/
    },

    events: {
        'click .read-more' (e) {
            e.preventDefault();
            var id = e.currentTarget.dataset.scroll;
            if(id != null) {
                var scrollDiv = document.getElementById(id).offsetTop;
                var scrollEl = document.getElementById(id);
                if(scrollEl.classList.contains('system-content')) {
                    var scrollDivMeta = document.getElementById('metafields-tabs').offsetTop;
                    var systems = document.querySelectorAll(".product-extra .system");
                    var systemsContent = document.querySelectorAll(".product-extra .system-content");
                    for (var i = 0; i < systems.length; ++i) {
                        systems[i].classList.remove('active');
                    }
                    for (var i = 0; i < systemsContent.length; ++i) {
                        systemsContent[i].classList.remove('active');
                    }
                    scrollEl.classList.add('active');
                    scrollEl.closest('.system').classList.add('active');
                    window.scrollTo({ top: scrollDivMeta, behavior: 'smooth'});
                } else {
                    window.scrollTo({ top: scrollDiv, behavior: 'smooth'});
                }
                
            }
        }
    },
    
    productMedia: function(){
        var self = this;

        subscribe(PUB_SUB_EVENTS.variantChange, (variant) => {
            const productDetailContainer = document.querySelector('.product-detail-container');
            self.updateVariantImage(variant, productDetailContainer)
        });

        var events = {
            'click .image-thumbnail' : function(e){
                e.preventDefault();
                // var $curr = $(e.currentTarget);
                // var index = $curr.data('index') - 1;
                // if (self.$media.hasClass('initialized')) {
                //     self.$mediaSlider.slick('slickGoTo',index);
                // }
            }
        }
        
        self.$mediaSlider.on('init', function(event, slick, direction){
            self.$media.addClass('initialized');
            $(window).resize();
        });
        self.$mediaSlider.slick({
            dots: false,
            infinite: false,
            speed: 600,
            slidesToShow: 1,
            arrows: false,
            fade: true,
            asNavFor: self.$thumbSlider,
            responsive: [
                {
                    breakpoint: ORW.responsiveSizes.large,
                    settings: {
                        dots: true
                    }
                }
            ]
        });
        if(ORW.responsive != 'small' || ORW.responsive != 'medium') {
            // Sidebar Thumbnail
            self.$thumbSlider.slick({
                infinite: false,
                speed: 600,
                dots: false,
                slidesToShow: 4,
                slidesToScroll: 1,
                touchThreshold: 150,
                swipeToSlide: true,
                verticalSwiping:true,
                arrows: true,
                vertical: true,
                asNavFor: self.$mediaSlider,
                focusOnSelect: true,
                rows: 0
            });
        }
        
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();

        // Mobile Slick slider
        // const imageSlider = this.$el.find('.product-media-images .images-wrapper');
        // // Desktop images
        // const imageThumbs = this.el.querySelector('.product-media-thumbnails .images-wrapper');

        // Check if image elements have more than one value. If not, don't initialize
        // const imageVariantValues = new Set(
        //     [...imageThumbs.querySelectorAll('[data-variant-option-value]')]
        //     .map(el => el.dataset.variantOptionValue)
        //     .filter(Boolean) // Remove empty values
        // );
        // if (imageVariantValues.size <= 1) return;

        // subscribe(PUB_SUB_EVENTS.variantOptionsChange, (options) => {

        //     const filterSelector = options.map(option => `[data-variant-option-value="${option.toLowerCase()}"]`).join(',');

        //     // Mobile Slick slider
        //     imageSlider.slick('slickUnfilter');
        //     imageSlider.slick('slickFilter', filterSelector);

        //     // Desktop images
        //     if (filterSelector) {
        //         const imagesToShow = imageThumbs.querySelectorAll(filterSelector);
        //         if (imagesToShow.length) {
        //             imageThumbs.querySelectorAll('.image-thumbnail').forEach(el => {
        //                 el.hidden = true;
        //             });
        //             imagesToShow.forEach(el => el.hidden = false);
        //         }
        //     }
        // });
    },

    updateVariantImage: function(variant, productDetailContainer) {
        const imageSize = '900x';
        const variantImage = variant.featured_image;

        const getImageSizedURL = function(imageUrl, size, is_2x = false){
            const lastPeriodIndex = imageUrl.lastIndexOf('.');
            if (lastPeriodIndex >= 0) {
                const beforeLastPeriod = imageUrl.substring(0, lastPeriodIndex);
                const afterLastPeriod = imageUrl.substring(lastPeriodIndex + 1);
                return is_2x ? beforeLastPeriod + `_${imageSize}@2x.` + afterLastPeriod : beforeLastPeriod + `_${imageSize}.` + afterLastPeriod;
            } else {
                return imageUrl;
            }
        }

        if (variantImage) {
            const image_src_size = getImageSizedURL(variantImage.src, imageSize)
            const image_src_size_2x = getImageSizedURL(variantImage.src, imageSize, true)

            const imageSlide = productDetailContainer.querySelector(`.product-media-images .image-slide`)
            const thumbnailSlide = productDetailContainer.querySelector(`.product-media-thumbnails .image-thumbnail`)
            if (imageSlide) {
                const img_elm = imageSlide.querySelector(`img`);
                const thumbnail_img = thumbnailSlide.querySelector(`img`);
                const srcset_to_set = `
                    ${image_src_size}, 
                    ${image_src_size_2x} 2x
                `
                imageSlide.setAttribute(`href`, srcset_to_set)
                thumbnailSlide.setAttribute(`href`, srcset_to_set)

                img_elm.setAttribute(`src`, image_src_size)
                thumbnail_img.setAttribute(`src`, image_src_size)
            }
        }
    },

    initPrice: function() {
        const priceElems = this.el.querySelectorAll('.price-box');
        subscribe(PUB_SUB_EVENTS.variantChange, (variant) => {
            let html = `<span class="h2 product-price" itemprop="price">${Shopify.formatMoney(variant.price, window.theme.moneyFormat)}</span>`;
            if (variant.compare_at_price) {
                html += `<span class="product-compare-price">${Shopify.formatMoney(variant.compare_at_price, window.theme.moneyFormat)}</span>`
            }
            priceElems.forEach(priceElem => {
                priceElem.innerHTML = html 
            });
        });
    },
    
    initStickyAddToCart: function() {
        const pdpCta = this.el.querySelector('.product-core-inner .add-to-cart-wrapper');
        const stickyAddToCArtContainer = this.el.querySelector('.product-form-sticky-container');
        const globalHeader = this.el.querySelector('header.site-header');

        window.addEventListener('scroll', () => {
            /*const buyButtonPos = pdpCta.getBoundingClientRect().bottom;
            var scrolPosition = $(window).scrollTop();
            var addToCartMainPosition = $('.product-core-inner .add-to-cart-wrapper').offset().top + $('.product-core-inner .add-to-cart-wrapper').outerHeight();

            var scrollPositionVanilla = window.scrollY;*/
            var addToCartMainPositionVanilla = pdpCta.getBoundingClientRect().bottom - globalHeader.offsetHeight;

            if (addToCartMainPositionVanilla <= 0) {
                stickyAddToCArtContainer.classList.remove('hidden');
                //console.log(scrolPosition + ' ' + scrollPositionVanilla + ' ' + addToCartMainPosition + ' ' + addToCartMainPositionVanilla + ' ' + 'yes');
            } else {
                stickyAddToCArtContainer.classList.add('hidden');
                //console.log(scrolPosition + ' ' + scrollPositionVanilla + ' ' + addToCartMainPosition + ' ' + addToCartMainPositionVanilla);
            }
        });
    },

    productCore: function(){
        var self = this;
        self.productQuantity();
        
        if (!self.isQuickshopLayout) {
            if (self.enableMiniCore) {
                self.productCoreMini();
            }
            
            if (self.isScrollingLayout && !self.isScrollingGrid) {
                self.productCoreScrollFixing()
            }
        }
    },

    productVariants: function(){
        var self = this;

        var events = {
            'click .product-attribute-container .oneswatch-size .swatch' : function(e){
                var $curr = $(e.currentTarget);
                var classSwatch = Array.from(e.currentTarget.classList).find(function (el) {
                    return el.startsWith('swatch-');
                });
                console.log($curr);
                $('.product-attribute-container').find('.oneswatch-size .swatch.active').removeClass('active');
                this.el.querySelectorAll('.' + classSwatch).forEach(elem => {
                    $(elem).addClass('active'); 
                });
                //$curr.addClass('active');
            },
            'click .product-attribute-container .oneswatch-shade .swatch' : function(e){
                var $curr = $(e.currentTarget);
                var classSwatch = Array.from(e.currentTarget.classList).find(function (el) {
                    return el.startsWith('swatch-');
                });
                console.log($curr);
                $('.product-attribute-container').find('.oneswatch-shade .swatch.active').removeClass('active');
                //$curr.addClass('active');
                $('.product-attribute-container').find('.oneswatch-size .swatch.active').removeClass('active');
                this.el.querySelectorAll('.' + classSwatch).forEach(elem => {
                    $(elem).addClass('active'); 
                });
            }
        }

        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },
    
    productQuantity: function(){
        var self = this;
        var $input = self.productQty.find('.qty-input[type=number]');
        var qty = $input.data('value');

        var events = {
            'click .product-qty-container .qty-btn' : function(e){
                e.preventDefault();
                var $curr = $(e.currentTarget);
                if($curr.hasClass('plus')){
                    $input[0].stepUp()
                } else {
                    $input[0].stepDown();
                }
                $input.attr('value', $input.val())
            }
        }

        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },

    productCoreScrollFixing: function(){
        var self = this;
        var init = function($elm){
            $elm.scrollToFixed({
                zIndex: 2,
                removeOffsets: true,
                dontSetWidth: true,
                marginTop: function(){
                    return $('header.site-header').outerHeight() + 50;
                },
                limit: function() {
                    var limit = $('.scrolling-fix-stopper').offset().top - $(this).height();
                    return limit;
                }
            });
        }
        self.$scrollFixingCore = self.$productCore.find('.product-core-inner');
        // Not available on Mobile.
        ORW.utilities.mediaCheck(function () {
            init(self.$scrollFixingCore);
        }, function () {
            self.$scrollFixingCore.trigger('detach.ScrollToFixed');
        });
    },
    
    productCoreMini: function(){
        var self = this;
        var init = function($elm){
            console.log('init minicore');
            $elm.scrollToFixed({
                zIndex: 2,
                removeOffsets: true,
                dontSetWidth: true,
                triggerAtBottom: true,
                marginTop: function(){
                    return $(this).height()*(-1);
                },
                fixed: function(){
                    $(this).addClass('fixed-core fadeInUp animated');
                },
                unfixed: function() {
                    $(this).removeClass('fixed-core fadeInUp animated');
                }
            });
        }
        self.$miniCore = self.$productCore.find('.block-core');
        // Under scrolling layout, miniCore will only available on Small screen.
        ORW.utilities.mediaCheck(function () {
            self.$miniCore.trigger('detach.ScrollToFixed');
            if (!self.isScrollingLayout || self.isScrollingGrid) {
                init(self.$miniCore);
            }
        }, function () {
            self.$miniCore.trigger('detach.ScrollToFixed');
            init(self.$miniCore);
        });
    },
    
    social: function(){
        var self = this;
        var events = {
            'click .share-title':function(e){
                self.$socialIcons.toggleClass('active');
            },
        };
        
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },
    
    zoom: function(){
        var self = this;
        OneZoom.init({
            el: self.$media,
            mainImage: self.$mainImage,
            thumbImage: self.$thumbImage
        });
    },
    
    video: function(){
        var self = this;
        var $videos = self.$media.find('.video-wrapper');
        OneVideo.init({
            el: $videos,
            isResponsive: false,
            bgVideo: false,
            autoplay: false
        });
    },

    tabContent: function(){
        var self = this;
        var $videos = self.$productExtra.find('.video-wrapper');
        
        $($videos).each(function() {
            OneVideo.init({
                el: this,
                isResponsive: false,
                bgVideo: true,
                autoplay: false
            });
        });
    },
    
    accordionsAndTabs: function(){
        var self = this;
        OneTabSystem.init({
            el: self.$content
        });
    },
    
    sizeChart: function() {
        var self = this;
        var sizeChartHtml = $('#SizeChartModal')[0].outerHTML;
        $('#SizeChartModal').remove();
        var drawerCtl = OneDrawer.init({
            drawerContent: sizeChartHtml,
            drawerModalId: 'SizeChartDrawerModal',
            triggerEvent: 'click',
            triggerElem: '.size-chart-trigger',
            initCallback: function(){
                OneTabSystem.init({
                    el: $('#SizeChartModal')
                });
            },
            openCallback: function(){},
            closeCallback: function(){},
            events: {}
        });
    },

    fullIngredients: function() {
        var self = this;
        var fullIngreidentstHtml = $('#FullIngredientsModal')[0].outerHTML;
        $('#FullIngredientsModal').remove();
        var drawerCtl = OneDrawer.init({
            drawerContent: fullIngreidentstHtml,
            drawerModalId: 'FullIngredientsDrawerModal',
            triggerEvent: 'click',
            triggerElem: '.full-ingredients-trigger',
            initCallback: function(){},
            openCallback: function(){},
            closeCallback: function(){},
            events: {}
        });
    },

    recentlyViewed: function() {

        let self = this;

        OneRecentlyViewed.init({
            el: self.$recentlyViewed
        });
    },
    
    destroy: function() {
        var self = this;
        self.undelegateEvents();
    },
    
    responsive: function () {
        var self = this;
        ORW.utilities.mediaCheck(function () {
            // Desktop actions
        }, function () {
            // Mobile actions
        })
    },
    
    isMobile: function () {
        if ( ORW.responsive == 'small') {
            return true;
        }
        return false;
    }
});