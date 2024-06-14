import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import 'slick-carousel';

import OneVideo from '@/modules/module-oneVideo';

import '../../styles/pages/home.scss';

export default Backbone.View.extend({
    
    initialize: function(opts){
        
        console.log('init home');
        
        var self = this;
        self.$content = self.$el;
        self.$body = $('body');
        self.$moduleA = self.$content.find('.hp-module-a');
        self.$moduleB = self.$content.find('.hp-module-b');
        self.$moduleE = self.$content.find('.hp-module-e');
        self.$moduleI = self.$content.find('.hp-module-i');
        // self.$moduleD = self.$content.find('.hp-module-d');

        if(self.$moduleA.length > 0){
            self.moduleA();
        }
        if(self.$moduleB.length > 0){
            self.moduleB();
        }
        if(self.$moduleE.length > 0){
            self.moduleE();
        }
        if(self.$moduleI.length > 0){
            self.moduleI();
        }
    },

    events: {
        
    },

    moduleA: function(){
        var self = this;
        var $videos = self.$moduleA.find('.video-wrapper');

        self.$moduleA.slick({
            dots: true,
            infinite: false,
            speed: 600,
            autoplaySpeed: 15000,
            dots: true,
            slidesToShow: 1,
            arrows: true,
            autoplay: true,
            responsive: [
                {
                    breakpoint: ORW.responsiveSizes.large,
                    settings: {
                        infinite: false
                    }
                }
            ]
        });

        $($videos).each(function() {
            OneVideo.init({
                el: this,
                isResponsive: false,
                bgVideo: true,
                autoplay: false
            });
        });

    },

    moduleB: function(){
        var self = this;
        var $productSlider = self.$moduleB.find('.product-slider.slick');

        $productSlider.slick({
            dots: false,
            infinite: true,
            speed: 600,
            centerMode: true,
            centerPadding: '0',
            slidesToShow: 2,
            arrows: false,
            mobileFirst: true,
            touchThreshold: 100,
            swipeToSlide: true,
            responsive: [
                {
                    breakpoint: ORW.responsiveSizes.medium,
                    settings: {
                        centerPadding: '0',
                        slidesToShow: 4,
                        arrows: true
                    }
                },
                {
                    breakpoint: ORW.responsiveSizes.large,
                    settings: {
                        centerPadding: '0',
                        slidesToShow: 4,
                        arrows: true
                    }
                }
            ]
        });

        // var $scrollableProducts = self.$moduleB.find('.scrollable');
        // OneCustomScroll.init({
        //     el: $scrollableProducts[0], // HTML object (required), not a jQuery object,
        //     margin: 40 // Number (optional), margin off of the containers bounds.
        // });
    },

    moduleE: function(){
        var self = this;
        var $images = $('.image-block');
        
        
        var events = {
            'mouseover .headline-link' : function(e){
                if ($(window).width() >= 1025) {
                    e.preventDefault();
                    var $curr = $(e.currentTarget);
                    var handle = $curr.data('handle');
                    var $selectedImage = $images.filter(function(index){
                        return $(this).data('handle') == handle;
                    });
                    $images.removeClass('show');
                    $selectedImage.addClass('show');
                }
            }
        }
        
        // Update and delegate adding events
        _.extend(self.events, events);
        self.delegateEvents();
    },

    moduleD: function(){
        var self = this;
        var $video = self.$moduleD.find('.video-wrapper');

        OneVideo.init({
            el: $video,
            isResponsive: false,
            bgVideo: true,
            autoplay: false
        });
    },

    moduleI: function(){
        var self = this;
        var $video = self.$moduleI.find('.video-wrapper');

        $($video).each(function() {
            OneVideo.init({
                el: this,
                isResponsive: false,
                bgVideo: true,
                autoplay: false
            });
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