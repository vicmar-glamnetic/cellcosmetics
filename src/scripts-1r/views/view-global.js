import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import LazyLoad from 'vanilla-lazyload';

import 'jquery-hoverintent';
import 'scrolltofixed';
import 'slick-carousel';

import OneDrawer from '@/modules/module-oneDrawer';
import OneSubscribe from '@/modules/module-oneSubscribe';
import OneCookieBanner from '@/modules/module-oneCookieBanner';
import OneMobileMenu from '@/modules/module-oneMobileMenu';
import OneMarketing from '@/modules/module-oneMarketing';
import OnePredictiveSearch from '@/modules/module-onePredictiveSearch';
import OneCart from '@/modules/module-oneCart';
import { PUB_SUB_EVENTS, subscribe } from '@/lib/pubsub';

export default Backbone.View.extend({
    
    initialize: function (opts) {
        
        console.log('init global');
        
        // Testing $ object
        // console.log($.fn.jquery);
        
        var self = this;
        self.$body = self.$el;
        self.$header = $('header.site-header');
        self.$footer = $('footer.site-footer');
        self.$miniCart = $('#MiniCart');
        self.$mobileNav = $('#MobileNav');
        self.$searchBar = $('#SearchBar');
        self.$scrollSearchBar = $('.scroll-search-container');
        self.$promoBanner = self.$header.find('.promo-banner');
        self.$navi = self.$header.find('nav');
        self.$menuToggle = self.$header.find('.menu-toggle');
        self.$minicartMessaging = self.$miniCart.find('.messaging-wrapper.slick');
        
        self.searchInlineMode = false; // Set false to use search modal, set true to use inline search mode. 
        self.miniCartAsDropdown = false; // Set false to use drawer, set true to use dropdown on Desktop (drawer on Mobile).
        self.useSlideInMenuForLevel2 = false; // Set false to use accordion for all nav levels on Mobile, set true to use the slide-in-menu for level 2.

        self.initLazyImages();
        self.initPromoBanner();
        self.initCookieBanner();
        self.initFixedHeader();
        self.countryCheck();
        self.initNavi();
        self.initUtilities();
        self.initSearch();
        self.initPredictiveSearch();
        self.initMiniCart();
        self.initMobileMenu();
        self.initSubscirbe();
        self.initFooter();
        self.devTools();

        if (ORW.enableGTM) {
            ORW.marketing = ORW.marketing ||  new OneMarketing;
            ORW.marketing.initCartWatchers();
        }

    },

    events: {
        'drawer-opt' : 'bodyClassCtl',
        'menu-opt-in' : 'bodyClassCtl',
        'menu-opt-out' : 'bodyClassCtl'
    },
    
    bodyClassCtl : function(e){
        // Please prevent operation on more then one drawer at the same time
        var self = this;
        var type = e.type;
        if (type == 'drawer-opt') {
            self.$body.toggleClass('drawer-opt');
            self.$body.toggleClass('show-overlay');
        } else {
            if (type == 'menu-opt-in') {
                self.$body.addClass('show-overlay');
            } else if (type == 'menu-opt-out') {
                self.$body.removeClass('show-overlay');
            }
        }
    },

    initLazyImages: function() {
        window.ORW.lazyload = new LazyLoad({ threshold: 0 });

        const events = {
            'mouseenter .product-grid-item' (e) {
                $(e.currentTarget).find('.product-image.alt').removeClass('hide');
                $(e.currentTarget).find('.quick-buy-container').removeClass('hidden');
            },
            'mouseleave .product-grid-item' (e) {
                $(e.currentTarget).find('.quick-buy-container').addClass('hidden');
            },
        };

        _.extend(this.events, events);
        this.delegateEvents();
    },

    initPromoBanner: function(){
        var self = this;
        var cookieEnabled = self.$promoBanner.data('cookieenabled');
        var cookieDays = self.$promoBanner.data('days');

        if(self.$promoBanner.length > 0){
            if(!ORW.utilities.getCookie('promo_banner')){
                self.$body.addClass('promo-banner-active');
                self.$promoBanner.addClass('activate');
            }
        }
        let promoHeadline = $('.promo-banner-modal-headline').html();
        let promoText = $('.promo-banner-modal-text').html();
        let promoModal = `<p class='promo-banner-modal-headline'>${promoHeadline}</p><p class='promo-banner-modal-text'>${promoText}</p>`;

        OneDrawer.init({
            drawerContent: promoModal,
            drawerModalId: 'promo-modal',
            triggerEvent: 'click',
            triggerElem: '.promo-banner'
        });
    },
    
    initCookieBanner: function(){
        var self = this;
        if ($('.cookie-banner').length) {
            ORW.cookieBanner = OneCookieBanner.init({
                el: $('.cookie-banner')
            });
        }
    },
    
    initFixedHeader: function() {
        var self = this;
        // Uncomment following code if you need better control on fixed header scrolling, by default the header always fixed by CSS 
        self.$header.scrollToFixed({
            dontSetWidth : true
        });
        
        // Mobile header scroll control
        var lastScrollTop = 0;
        var mobileHeaderHeight = 44;
        var checkScrollDirection = function(){
            var st = $(window).scrollTop();
            if (st > lastScrollTop && st >= mobileHeaderHeight){
                // downscroll code
                if (st - lastScrollTop >= 10) {
                    self.$header.removeClass('scroll-up').addClass('scroll-down');
                }
            } else {
                // upscroll code
                self.$header.removeClass('scroll-down');
                self.$header.addClass('scroll-up');
                if (st < mobileHeaderHeight) {
                    self.$header.removeClass('scroll-up');
                }
            }
            lastScrollTop = st;
        }

        checkScrollDirection();
        $(window).scroll(function(event){
            checkScrollDirection();
        });
    },

    countryCheck: async function () {
        var self = this;

        class LocalizationForm extends HTMLElement {
            constructor() {
              super();
              this.elements = {
                input: this.querySelector('input[name="language_code"], input[name="country_code"]'),
                button: this.querySelector('button'),
                panel: this.querySelector('ul'),
              };
              this.elements.button.addEventListener('click', this.openSelector.bind(this));
              this.elements.button.addEventListener('focusout', this.closeSelector.bind(this));
              this.addEventListener('keyup', this.onContainerKeyUp.bind(this));
              this.querySelectorAll('a').forEach(item => item.addEventListener('click', this.onItemClick.bind(this)));
            }
            hidePanel() {
              this.elements.button.setAttribute('aria-expanded', 'false');
              this.elements.panel.setAttribute('hidden', true);
            }
            onContainerKeyUp(event) {
              if (event.code.toUpperCase() !== 'ESCAPE') return;
              this.hidePanel();
              this.elements.button.focus();
            }
            onItemClick(event) {
              event.preventDefault();
              const form = this.querySelector('form');
              this.elements.input.value = event.currentTarget.dataset.value;
              if (form) form.submit();
            }
            openSelector() {
              this.elements.button.focus();
              this.elements.panel.toggleAttribute('hidden');
              this.elements.button.setAttribute('aria-expanded', (this.elements.button.getAttribute('aria-expanded') === 'false').toString());
            }
            closeSelector(event) {
              const shouldClose = event.relatedTarget && event.relatedTarget.nodeName === 'BUTTON';
              if (event.relatedTarget === null || shouldClose) {
                this.hidePanel();
              }
            }
          }
        customElements.define('localization-form', LocalizationForm);
        
        self.countryElem = '#CountryModal';

        self.countryModal = OneDrawer.init({
            drawerElem  : self.countryElem,
            triggerEvent: 'click',
            triggerElem : '.site-country',
            isModal     : true
        });

        // Check for country code cookie and set shipping threshold accordingly
        var countryRecommendationShown;
        if (ORW && ORW.utilities) {
            countryRecommendationShown = ORW.utilities.getCookie('country_recommendation_shown');
        }

        var suggestedCountries = await fetch(
            window.Shopify.routes.root
              + 'browsing_context_suggestions.json'
              + '?country[enabled]=true'
          ).then(r => r.json());

          var primaryCountryCode = suggestedCountries.suggestions[0]?.parts?.country?.handle;
          if(primaryCountryCode != "US" && !countryRecommendationShown){
            self.countryRecommendation(primaryCountryCode);
          }
    },

    countryRecommendation: function(countryCode, modal){
        var self = this;
        self.currencyElem = '#CountryModal';
        const operatedCountries = ["CA"];// countries other than primary shop locale

        if(operatedCountries.includes(countryCode)) {
            self.countryModal.openDrawer();
            $(self.currencyElem).addClass('recommend-country');
            ORW.utilities.setCookie('country_recommendation_shown', 'true');
        }
    },
    
    initNavi: function() {
        var self = this;
        
        self.$rawNav = self.$navi.clone();
        
        // Build mobile Nav
        var $slideInMenu = $('<div class="slide-in-menu"></div>');
        var $clonedNavi = self.$navi.clone();
        _.each($clonedNavi.find('.has-dropdown'), function(child){
            var $child = $(child);
            var $dropdown = $child.find('.dropdown');
            $dropdown.find('.lv2-image').remove();
            if (self.useSlideInMenuForLevel2) {
                $dropdown.appendTo($slideInMenu);
                $child.find('.dropdown').remove();  
            } else {
                $dropdown.appendTo($child);
                $child.find('.dropdown-wrapper').remove();
                $child.find('.nav-link').removeAttr('data-trigger');
                $child.addClass('expandable');
            }
        });
        
        if (self.useSlideInMenuForLevel2) {
            $slideInMenu.appendTo($clonedNavi);
        }
        self.$mobileNav.find('.header-utilities').before($clonedNavi);
        
        // Build desktop nav
        _.each(self.$navi.find('.children.column-layout'), function(child){
            var currentCol = 0, html = '<li class="back-to">Back</li>';
            var $child = $(child);
            var $level2 = $child.find('.level-2');
            var $level2Images = $child.find('.lv2-image'); 
            
            _.each($level2, function(item,index){
                var $item = $(item);
                var isLast = index == $level2.length-1 ? true : false;
                
                if (currentCol == 0 && currentCol != $item.data('column')) {
                    html += '<li class="divider"><ul>';
                    currentCol = $item.data('column');
                } else if (currentCol != $item.data('column')) {
                    html += '</ul></li><li class="divider"><ul>';
                    currentCol = $item.data('column');
                }
                
                html += $('<div>').append($item.clone()).html();
                
                if (isLast) {
                    html += '</ul></li>';
                }
            });
            
            _.each($level2Images, function(item){
                html += $(item)[0].outerHTML;
            });
            
            $child.html(html);
        });
    },
    
    initUtilities: function() {
        var self = this;
        var events = {};
        
        // Header hover control (Larger screen)
        self.$header.hoverIntent({
            over: function(){
                if (!self.isMobile()) {
                    self.$body.trigger('menu-opt-in');
                }
            },
            out: function(){
                if (!self.isMobile()) {
                    self.$body.trigger('menu-opt-out');
                }
            },
            sensitivity: 100
        });
        
        // Header dropdown hover control (Larger screen)
        self.$header.hoverIntent({
            over: function(){
                if (!self.isMobile()) {
                    $(this).addClass('active');
                    if (self.miniCartTimer) {
                        // Check if minicart close timer exists, if so kill it.
                        console.log('kill timer');
                        clearTimeout(self.miniCartTimer);
                    }
                }
            },
            out: function(){
                if (!self.isMobile()) {
                    $(this).removeClass('active');
                }
            },
            sensitivity: 100,
            selector: '.has-dropdown:not(.block-search)'
        });
        
        // Copy extra links (if available) to Mobile menu utilities (Small screen)
        var $extraLinkContainer = self.$header.find('.header-extra-links');
        if ($extraLinkContainer.length) {
            $extraLinkContainer = $extraLinkContainer.clone();
            self.$mobileNav.find('.header-utilities').prepend($extraLinkContainer.html());
        }
        
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },
    
    initSearch: function(){
        var self = this;
        if (self.searchInlineMode) {
            self.$header.hoverIntent({
                over: function(){
                    var $target = $(this).find('.block-content');
                    $target.on('transitionend', function(){
                        $target.off('transitionend');
                        setTimeout(function(){ $target.find('input').focus(); },100);
                    });
                    $(this).addClass('active');
                },
                out: function(){
                    $(this).removeClass('active');
                },
                sensitivity: 100,
                selector: '.block-search'
            });
        } else {
            self.searchCtl = OneDrawer.init({
                drawerElem: '#' + self.$searchBar.attr('id'),
                triggerEvent: 'click',
                triggerElem: '.block-search-mobile .search-toggle',
                openCallback: function(){
                    setTimeout(function(){ self.$searchBar.find('input').focus(); },100);
                },
                events: {
                    'click .search-form button' : function(e){
                        e.preventDefault();
                        var $form = $(e.currentTarget).parent('form');
                        if ($form.find('input').val()) {
                            this.closeDrawer();
                            $form.submit();
                        } else {
                            // May be show error message ...
                        }
                    }
                }
            });
        }

        var events = {
            'click .block-search-mobile button' : function(e){
                // e.preventDefault();
                self.$searchBar.addClass('opened');
            },
            'click #SearchBar .drawer-close' : function(e){
                // e.preventDefault();
                self.$searchBar.removeClass('opened');
            },
            'click .block-search-scroll' : function(e) {
                $('.block-search-scroll .search-toggle').addClass('hide');
                self.$scrollSearchBar.addClass('opened');
            },
            'click .scroll-search-container .predictive-search-form .close__button' : function(e) {
                e.preventDefault();
                e.stopPropagation();
                $('.block-search-scroll .search-toggle').removeClass('hide');
                self.$scrollSearchBar.removeClass('opened');
            }
        };
        _.extend(self.events, events);
        self.delegateEvents();

    },

    initPredictiveSearch: function() {
        var self = this;
        if ($('.predictive-search-form').length) {
            ORW.predictiveSearchModal = OnePredictiveSearch.init({
                el: $('.predictive-search-form')
            });
        }
    },
    
    initMobileMenu: function(){
        var self = this;
        
        self.mobileMenuCtl = OneDrawer.init({
            drawerElem: '#' + self.$mobileNav.attr('id'),
            triggerEvent: 'click',
            triggerElem: 'header .menu-toggle',
            openCallback: function(e){
                self.$menuToggle.find('.animated-hamburger').addClass('open');
            },
            closeCallback: function(e){
                self.$menuToggle.find('.animated-hamburger').removeClass('open');
            }
        });
        
        self.mobileInnerMenuCtl = OneMobileMenu.init({
            el: self.$mobileNav,
            openCallback: function(e){
                self.$mobileNav.addClass('inner-action-engaged');
                self.$menuToggle.find('.animated-hamburger').addClass('inner-action-engaged');
            },
            closeCallback: function(e){
                self.$mobileNav.removeClass('inner-action-engaged');
                self.$menuToggle.find('.animated-hamburger').removeClass('inner-action-engaged');
            }
        });
    },
    
    initMiniCart: function() {
        var self = this;
        var miniCartDrawerInit = function(){
            console.log('init minicart as drawer');
            return OneDrawer.init({
                drawerElem: '#' + self.$miniCart.attr('id'),
                triggerEvent: 'click',
                triggerElem: 'header .block-minicart',
                openCallback: function(){}
            });
        };
        var miniCartDropdownOpen = function(){
            self.$body.trigger('menu-opt-in');
            self.$header.find('.block-minicart').addClass('active');
        }
        var miniCartDropdownClose = function(){
            self.$header.find('.block-minicart').removeClass('active');
            self.$body.trigger('menu-opt-out');
        }
        
        self.miniCartCtl = miniCartDrawerInit();
        
        $('.add-to-cart-form').off('submit');
        
        if (self.miniCartAsDropdown) {
            // Init minicart as Dropdown on Desktop
            
            ORW.utilities.mediaCheck(function () {
                if (self.miniCartCtl) {
                    console.log('minicart drawer destory');
                    self.miniCartCtl.destroy();
                    self.miniCartCtl = false;
                }
            }, function () {
                if (!self.miniCartCtl) {
                    self.miniCartCtl = miniCartDrawerInit();
                }
            })
        }

        const miniCartElem = document.querySelector('#CartContainer form.cart');
        if (miniCartElem) {
            new OneCart({ el: miniCartElem });
        }

        self.unsubscribeMiniCart = subscribe(PUB_SUB_EVENTS.cartUpdate, async (data) => {
            
            const cart = await fetch('/cart.js').then(res => res.json());
            document.querySelectorAll('.minicart-count').forEach(el => {
                el.innerHTML = cart.item_count;

                if(cart.item_count > 0) {
                    el.classList.remove('hidden');
                } 
                else {
                    el.classList.add('hidden');
                }
            });

            if (window.location.pathname === '/cart') return;
            if (self.miniCartCtl.drawerOpened) return;

            clearTimeout(self.miniCartTimer);
            if (self.miniCartCtl) {
                self.miniCartCtl.openDrawer();
                self.miniCartTimer = setTimeout(function(){ self.miniCartCtl.closeDrawer(); }, 3000);
            } else {
                miniCartDropdownOpen();
                self.miniCartTimer = setTimeout(function(){ miniCartDropdownClose(); }, 3000);
            }
        })

        // Slick for minicart messaging carousel
            self.$minicartMessaging.slick({
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
    
    initSubscirbe: function() {
        var self = this;
        if ($('.subscribe-modal').length) {
            ORW.subscribeModal = OneSubscribe.init({
                el: $('.subscribe-modal')
            });
        }
    },
    
    initFooter: function() {
        var self = this;
        var events = {
            'click footer.site-footer .expandable': function(e){
                if (self.isMobile()) {
                    var $curr = $(e.currentTarget);
                    var $activeSiblings = $curr.siblings('.expandable.active');
                    if ($activeSiblings.length) {
                        $activeSiblings.removeClass('active');
                    }
                    $curr.toggleClass('active');
                }
            }
        };
        _.extend(self.events, events);
        self.delegateEvents();
    },
    
    isMobile: function () {
        if ( ORW.responsive == 'small') {
            return true;
        }
        return false;
    },

    devTools: function(){
        var self = this;
        var $indicator = $('#responsive-indicator');
        var $previewBar = $('#preview-bar-iframe');

         // This should only run when a theme is being previewed.
        if(Shopify.PreviewBarInjector !== undefined){
            if($indicator.length > 0 && $previewBar.length > 0 && Shopify.PreviewBarInjector.length == 1){
                $indicator.text("Preview: " + Shopify.theme.name).removeClass("hide");
                var events = {
                    'click #responsive-indicator': function(e){
                        $indicator.toggleClass('active');
                        $previewBar.toggleClass('active');
                    }
                };

                _.extend(self.events, events);
                self.delegateEvents();
            }else{
                $indicator.addClass("hide");
            }
        }
    }
});