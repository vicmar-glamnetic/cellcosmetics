import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewUtility from '@/views/view-utility';

import '../../styles/pages/utility.scss';

whenDomReady(() => {
    new ViewUtility({el: $('#MainContent')});
});