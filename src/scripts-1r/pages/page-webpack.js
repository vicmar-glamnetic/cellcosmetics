import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewWebpack from '@/views/view-webpack';

whenDomReady(() => {
    new ViewWebpack({el: $('.webpack-wrapper')});
});