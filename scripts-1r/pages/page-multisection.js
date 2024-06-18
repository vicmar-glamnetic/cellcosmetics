import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewMultisection from '@/views/view-multisection';

import '../../styles/pages/multisection.scss';

whenDomReady(() => {
    new ViewMultisection({el: $('#MainContent')});
});