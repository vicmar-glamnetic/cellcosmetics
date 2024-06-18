import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewBlog from '@/views/view-blog';

import '../../styles/pages/blog.scss';

whenDomReady(() => {
    new ViewBlog({el: $('#MainContent')});
});