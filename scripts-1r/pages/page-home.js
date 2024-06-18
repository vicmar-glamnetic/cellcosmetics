import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewHome from '@/views/view-home';

whenDomReady(() => {
    new ViewHome({el: $('#MainContent')});
});
