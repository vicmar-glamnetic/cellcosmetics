/*
    Filter and Sorter HTML structure
    <div class="collection-nav-block">
        <div class="nav-title">[title]</div>
        <div class="nav-content">
            <div class="nav-list-container">
                [drop down content]
            </div>
        </div>
    </div>
*/

import $, { contains } from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import 'scrolltofixed';

export default Backbone.View.extend({
    
    initialize: function (opts) {
        var self = this;
        self.$collection = self.$el;
        self.$sorter = self.$collection.find('.collection-nav-block.sorting');
        self.$filter = self.$collection.find('.collection-nav-block.filters');
        self.$category = self.$collection.find('.collection-nav-block.category');
        self.$mode = self.$collection.find('.collection-nav-block.mode');
        self.$body = $('body');
        self.$header = $('header.site-header');
        self.$footer = $('footer.site-footer');
        self.layout = self.$collection.data('layout');
        
        self.navDropdown();
        // self.modeSwitcher();
        // self.fixNav();
        self.initSorting();

        if(self.$filter.hasClass('tag-filtering')){
            self.prepareParams();
            self.initFiltering();
        }

        if(self.$filter.hasClass('storefront-filtering')){
            // self.initSorting();
        }
  
    },

    events: {
        
    },
    
    navDropdown: function(){
        /*
            The goal here is to use one dropdown handle for both PLP (one-column, two columns) layouts on both large and smaller screen.
            Handling total 4 situations.
        */
        var self = this;
        var navDropdownCtl = function(e){
            e.preventDefault();
            e.stopPropagation();
            var $curr = $(e.currentTarget).parent();
            if (self.layout == 'one-column' && !self.isMobile()) {
                var $currentOpened = self.$collection.find('.nav-dropdown.opened').not($curr);
            } else if (self.isMobile()) {
                var $currentOpened = self.$collection.find('.collection-nav .opened').not($curr);
            } else {
                var $currentOpened = $curr.siblings('.opened');
            }
            $currentOpened.removeClass('opened');
            $curr.toggleClass('opened');
        }
        var events = {
            'click .nav-title' : navDropdownCtl,
            'click .filter-title' : navDropdownCtl,
        };
        
        // Click outside to close
        // $(window).on('click', function (e) {
        //     self.$body.removeClass('collection-nav-opened');
        //     self.$collection.find('.collection-nav-block.opened').removeClass('opened');
        // });
        
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },
    
    modeSwitcher: function(){
        var self = this;
        var modeSwitchCtl = function(e) {
            var $curr = $(e.currentTarget);
            var $currentActive = $curr.siblings();
            $currentActive.removeClass('active');
            self.$collection.removeClass($currentActive.data('mode')).addClass($curr.data('mode'));
            $curr.addClass('active');
        }
        var events = {
            'click .mode .mode-switcher:not(.active)' : modeSwitchCtl
        };
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },
    
    fixNav: function(){
        // Consider improve the logic below 
        // Consider better mobile fixed nav interaction with dynamic header interactions.
        var self = this;
        var initScrollFix = function(){
            // Deactive current fixed nav
            if (self.$activeFixedNav) {
                self.$activeFixedNav.trigger('detach.ScrollToFixed');
            }
            
            // Assign the correct nav to fix
            if (self.isMobile()) {
                if (self.layout == 'one-column') {
                    self.$activeFixedNav = self.$collection.find('.collection-nav .nav');
                } else if (self.layout == 'two-columns') {
                    self.$activeFixedNav = self.$collection.find('.collection-nav.nav');
                }
            } else {
                if (self.layout == 'one-column') {
                    self.$activeFixedNav = self.$collection.find('.collection-nav');
                } else if (self.layout == 'two-columns') {
                    // Only filter part will be fixed
                    self.$activeFixedNav = self.$collection.find('.collection-nav.nav .filters');
                    
                    // Whole nav part will be fixed
                    // self.$activeFixedNav = self.$collection.find('.collection-nav.nav');
                }
            }

            // Fix it
            if (self.$activeFixedNav) {
                self.$activeFixedNav.scrollToFixed({
                    zIndex: 2,
                    marginTop: function(){
                        if (self.isMobile()) {
                            // Note: if header stays at top (without going away during scrolling down) this return value will then need to be the header outter height.
                            return 0;
                        } else {
                            return self.$header.outerHeight();
                        }
                    },
                    removeOffsets: true,
                    dontSetWidth: true,
                    limit: function() {
                        var limit = self.$footer.offset().top - $(this).height();
                        return limit;
                    }
                });
            }
        }
        ORW.utilities.mediaCheck(function () {
            initScrollFix();
        }, function () {
            initScrollFix();
        });
        
        $(window).scroll(function(event){
            if (self.$activeFixedNav) {
                self.$activeFixedNav.removeClass('scroll-up');
                if (self.isMobile() && self.$header.hasClass('scroll-up')) {
                    self.$activeFixedNav.addClass('scroll-up');
                }
            }
        });
    },
    
    prepareParams: function(){
        var self = this;
        if (location.search.length) {
            for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
                aKeyValue = aCouples[i].split('=');
                // console.log(aKeyValue);
                if (aKeyValue.length > 1) {
                    Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
                }
            }
        }
        
        // Clean the pagination
        delete Shopify.queryParams.page;
        delete Shopify.queryParams.showAll;
        
        if (!$.isEmptyObject(Shopify.queryParams)) {
            $('.collection-nav-block.clear-all').removeClass('hide');
            $('.clear-all.clear-all-sort').removeClass('hide');
        }
    },

    initSorting: function(){
        var self = this;
        var events = {
            'click .collection-nav-block.sorting .filter' : function(e){
                e.preventDefault();
                var $curr = $(e.currentTarget),
                    sortVal = $curr.data('link');
                
                if (sortVal != '') {
                    $curr.addClass('active').siblings('.filter').removeClass('active');
                    Shopify.queryParams.sort_by = $curr.data('link');
                } else {
                    delete Shopify.queryParams.sort_by;
                }
                
                location.search = $.param(Shopify.queryParams);
            }
        }
        
        // Active Status
        if (Shopify.queryParams.sort_by) {
            self.$sorter.find('*[data-link="' + Shopify.queryParams.sort_by + '"]').addClass('active');
        }
        
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },
    
    initFiltering: function(){
        var self = this;
        var $filterSelects = self.$filter.find('select');
        var events = {
            'click .collection-nav-block.filters .filter-swatch' : function(e){
                e.preventDefault();
                var $curr = $(e.currentTarget),
                    $filterParent = $curr.parents('.filter-swatches'),
                    $fitlerSelect = $filterParent.siblings('select'),
                    filterVal = $curr.data('link');
                    
                if ($curr.hasClass('disabled')) {
                    return false;
                }
                
                if (filterVal !== '') {
                    $curr.addClass('active').siblings('.filter-swatch').removeClass('active');
                    $fitlerSelect.val(filterVal).change();
                } else {
                    // If found parent link for the fake collection filter, then go back to parent.
                    if (self.parentCollectionLink) {
                        console.log('go back to :' + self.parentCollectionLink)
                        var newURL = self.parentCollectionLink;
                    } else {
                        var newURL = '/collections/' + Shopify.collectionHandle;
                        var search = $.param(Shopify.queryParams);
                        if (search.length) {
                            newURL += '?' + search;
                        }
                    }
                    location.href = newURL;
                }
            },
            'change .collection-nav-block.filters select' : function(e){
                delete Shopify.queryParams.page;
                var newTags = [];
                _.each($filterSelects, function(select){
                    if ($(select).val()) {
                        newTags.push($(select).val());
                    }
                });
                if (Shopify.collectionHandle) {
                    // PLP
                    var newURL = '/collections/' + Shopify.collectionHandle;
                    var search = $.param(Shopify.queryParams);
                    
                    if (newTags.length) {
                        newURL += '/' + newTags.join('+');
                    }
                    if (search.length) {
                        newURL += '?' + search;
                    }
                    
                    location.href = newURL;
                } else {
                    // Search
                    if (newTags.length) {
                        Shopify.queryParams.constraint = newTags.join('+');
                    } else {
                        delete Shopify.queryParams.constraint;
                    }

                    location.search = $.param(Shopify.queryParams);
                }
            }
        }
        
        // Build the fake 'Style' filter using main navigation, will be disabled for Phase 2
        self.navLinkFilters();
        
        // Update applied filter count
        var appliedFilterCount = self.$filter.find('.active').length;
        if (appliedFilterCount > 0) {
            var $navTitle = self.$filter.find('.nav-title');
            $navTitle.text($navTitle.data('title') + ' (' + appliedFilterCount + ')');
        }
        
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },
    
    navLinkFilters: function(){
        var self = this;
        var $rawNav = ORW.Global?.$rawNav ? ORW.Global.$rawNav.clone() : $('header.site-header nav').clone();
        var currentUrl = self.$collection.data('url');
        self.parentCollectionLink = false;
        
        // Build fake collection filter
        var $activeLink = $rawNav.find('a[href="' + currentUrl + '"]');
        if ($activeLink.length) {
            var $children = $activeLink.siblings('.children');
            if ($children.length) {
                // console.log('on parent level!');
                self.$filter.find('.filter.collection .filter-swatches').html($children.html());
                self.$filter.find('.filter.collection').show();
            } else if ($activeLink.parent().hasClass('level-3')) {
                // console.log('on sub level!');
                $children = $activeLink.parent().parent('.children');
                if ($children.length) {
                    self.parentCollectionLink = $children.siblings('.nav-link').attr('href');
                    $children.find('a[href="' + currentUrl + '"]').addClass('active');
                    self.$filter.find('.filter.collection .filter-swatches').html($children.html());
                    self.$filter.find('.filter.collection').show();
                    self.$filter.find('.clear-all').removeClass('hide hidden');
                }
            }
        }
    },
    
    destroy: function() {
        var self = this;
        self.undelegateEvents();
    },
    
    isMobile: function () {
        if ( ORW.responsive == 'small') {
            return true;
        }
        return false;
    }
});