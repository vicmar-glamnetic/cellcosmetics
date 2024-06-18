import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import 'slick-carousel';

import OneVideo from '@/modules/module-oneVideo';
import OneTabSystem from '@/modules/module-oneTabSystem';

export default Backbone.View.extend({
    
    initialize: function(opts){
        
        console.log('init multisection page');
        
        var self = this;
        self.$content = self.$el;
        self.$body = $('body');
        self.$moduleA = self.$content.find('.multisection-module-1');
        self.$moduleB = self.$content.find('.multisection-module-2');
        self.$moduleC = self.$content.find('.multisection-module-3');
        self.$moduleE = self.$content.find('.multisection-module-5');
        self.$moduleG = self.$content.find('.multisection-module-7');

        if(self.$moduleA.length > 0){
            self.moduleA();
        }

        if(self.$moduleB.length > 0){
            self.moduleB();
        }

        if(self.$moduleC.length > 0){
            self.moduleC();
        }

        if(self.$moduleE.length > 0){
            self.moduleE();
        }

        if(self.$moduleG.length > 0){
            self.moduleG();
        }

        self.initAccordions();

    },

    events: {
        
    },

    moduleA: function(){
        var self = this;
        self.$imageSlides = self.$moduleA.find('.image-block.slick');

        self.$imageSlides.slick({
            dots: false,
            infinite: true,
            speed: 600,
            slidesToShow: 1,
            arrows: true,
            responsive: [
                {
                    breakpoint: ORW.responsiveSizes.large,
                    settings: {
                        
                    }
                }
            ]
        });
    },

    moduleB: function(){
        var self = this;
        self.$imageSlides = self.$moduleB.find('.slider.slick');

        self.$imageSlides.slick({
            dots: false,
            infinite: false,
            speed: 600,
            slidesToShow: 2,
            centerMode: false,
            centerPadding: '0',
            arrows: true,
            responsive: [
                {
                    breakpoint: ORW.responsiveSizes.large,
                    settings: {
                       slidesToShow: 1, 
                       centerMode: true,
                       centerPadding: '30px',
                       infinite: true
                    }
                }
            ]
        });
    },

    moduleC: function(){
        var self = this;
        var $videos = self.$moduleC.find('.video-wrapper');
        
        $($videos).each(function() {
            OneVideo.init({
                el: this,
                isResponsive: false,
                bgVideo: true,
                autoplay: false
            });
        });
    },

    moduleE: function(){
        var self = this;
        var $videos = self.$moduleE.find('.video-wrapper');
        
        $($videos).each(function() {
            OneVideo.init({
                el: this,
                isResponsive: false,
                bgVideo: true,
                autoplay: false
            });
        });
    },

    moduleG: function(){
        var self = this;
        var $videos = self.$moduleG.find('.video-wrapper');

        $($videos).each(function() {
            OneVideo.init({
                el: this,
                isResponsive: false,
                bgVideo: true,
                autoplay: false
            });
        });
    },

    initAccordions: function(){
        var self = this;
        OneTabSystem.init({
            el: $('.accordion-block')
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