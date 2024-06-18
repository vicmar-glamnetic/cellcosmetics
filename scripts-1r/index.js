/*
	1R Scripts Entry
*/
import './public-path';
import 'intersection-observer';
import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener';
import './lib/media-check';

import route from './router';
import OnePerformance from '@/modules/module-onePerformance';

import '../styles/style.scss';

/*
	Extending ORW object
*/
ORW.utilities.mediaCheck = function(entryCallback, exitCallback){
    if (!entryCallback) {
        entryCallback = function(){};
    }
    if (!exitCallback) {
        exitCallback = function(){};
    }
    mediaCheck({
        media: ORW.breakpoint,
        entry: entryCallback,
        exit: exitCallback
    });
}

/*
	Global Function Calls
*/
ORW.utilities.mediaCheck(function () {
    console.log('large screen');
    ORW.responsive = 'large';
}, function () {
    console.log('small screen');
    ORW.responsive = 'small';
});

/*
    1R Performance Injections
*/
if (ORW.performance.webVitalsEnable) {
    OnePerformance.init();
}

console.log('ORW Index JS loaded test 111');

route();