import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewArticle from '@/views/view-article';

import '../../styles/pages/article.scss';

whenDomReady(() => {
    new ViewArticle({el: $('#MainContent')});
});