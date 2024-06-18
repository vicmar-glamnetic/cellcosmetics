import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewAbout from '@/views/view-about';

import '../../styles/pages/about.scss';

whenDomReady(() => {
    new ViewAbout({el: $('#MainContent')});
});