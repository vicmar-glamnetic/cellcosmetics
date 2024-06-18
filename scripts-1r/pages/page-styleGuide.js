import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewStyleGuide from '@/views/view-styleGuide';

import '../../styles/pages/styleguide.scss';

whenDomReady(() => {
    new ViewStyleGuide({el: $('.style-guide-wrapper')});
});