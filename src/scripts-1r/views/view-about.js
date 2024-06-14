import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import 'slick-carousel';

import OneVideo from '@/modules/module-oneVideo';

export default Backbone.View.extend({
    
    initialize: function(opts){
        
        console.log('init about page');
        
        var self = this;
        self.$content = self.$el;
        self.$moduleE = self.$content.find('.about-module-e');
        self.$moduleF = self.$content.find('.about-module-f');

        if(self.$moduleE.length > 0){
            self.moduleE();
        }
        if(self.$moduleF.length > 0){
            self.moduleF();
        }
    },

    events: {
        
    },

    moduleE: function(){
        var self = this;
        var $videos = self.$moduleE.find('.video-wrapper');
        
        $($videos).each(function() {
            OneVideo.init({
                el: this,
                isResponsive: false,
                bgVideo: true,
                autoplay: true
            });
        });
    },

    moduleF: function(){
        var self = this;
        var $productSlider = self.$moduleF.find('.product-slider.slick');
        var $editorialSlider = self.$moduleF.find('.editorial-slider.slick');
        var $editorialTitleSlider = self.$moduleF.find('.editorial-title-slider.slick');

        $productSlider.slick({
            dots: false,
            infinite: true,
            speed: 600,
            centerMode: true,
            centerPadding: '40px',
            slidesToShow: 2,
            arrows: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: ORW.responsiveSizes.medium,
                    settings: {
                        centerPadding: '80px',
                        slidesToShow: 4
                    }
                },
                {
                    breakpoint: ORW.responsiveSizes.large,
                    settings: {
                        centerPadding: '100px',
                        slidesToShow: 5
                    }
                }
            ]
        });

        // var $scrollableProducts = self.$moduleB.find('.scrollable');
        // OneCustomScroll.init({
        //     el: $scrollableProducts[0], // HTML object (required), not a jQuery object,
        //     margin: 40 // Number (optional), margin off of the containers bounds.
        // });
        if ($editorialSlider.length && $editorialTitleSlider.length) {
            $editorialSlider.slick({
                dots: true,
                infinite: true,
                speed: 600,
                slidesToShow: 1,
                arrows: false,
                mobileFirst: true,
                asNavFor: $editorialTitleSlider
            });

            $editorialTitleSlider.slick({
                dots: false,
                infinite: true,
                speed: 600,
                slidesToShow: 1,
                arrows: false,
                mobileFirst: true,
                asNavFor: $editorialSlider
            });
        }
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