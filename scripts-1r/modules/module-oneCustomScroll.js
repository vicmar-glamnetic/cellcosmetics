/*
	OneCustomScroll 2.0.0 Usage (Webpack)
	ezra@onerockwell & patrick@onerockwell.com
	Description: This module will show custom styled scrollbars only if the content is overflowing.
	No dependencies. Adapted from https://stackoverflow.com/questions/27322881/how-can-i-create-a-simple-page-vertical-scroll-bar-without-using-jquery

	HTML:
	<div class="scrollable [scrollable-x|scrollable-y]">
		<div>
			// Scrollable content goes here
		</div>
	</div>
	
	Initialization:
	OneOneCustomScroll.init({
		el: child // HTML object (required), not a jQuery object,
		margin: 40 // Number (optional), margin off of the containers bounds.
	});
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import '../../styles/modules/oneCustomScroll.scss';

// Define the Backbone View here (Optional)
let OneCustomScrollView = Backbone.View.extend({
	
	initialize: function (settings) {
		
		var self = this;
		var scrollDirection = 'vertical';
		
		if(self.el.className.indexOf('scrollable-x') > -1){
			scrollDirection = 'horizontal';
		}

		var offsetDimension = scrollDirection === 'vertical' ? 'offsetHeight' : 'offsetWidth',
			scrollDimension = scrollDirection === 'vertical' ? 'scrollHeight' : 'scrollWidth',
			scrollEdge = scrollDirection === 'vertical' ? 'scrollTop' : 'scrollLeft',
			page = scrollDirection === 'vertical' ? 'pageY' : 'pageX';

		var scrollContainer = self.el,
			scrollContentWrapper = self.el.children[0],
			contentPosition = 0,
			margin = settings.margin > -1 ? settings.margin : 25,
			scrollerBeingDragged = false,
			track,
			scroller,
			normalizedPosition,
			scrollerDimension,
			visibleRatio = scrollContainer[offsetDimension] / scrollContentWrapper[scrollDimension];
		
		if(scrollDirection == 'vertical'){
			margin = 0;
		}

		// calculation of how tall scroller should be
		var calculateScrollerDimension = function calculateScrollerDimension() {
			var offset = 0;
			if(scrollDirection == 'horizontal'){
				offset = margin * 2;
			}
			return (visibleRatio * scrollContainer[offsetDimension]) - (offset);
		};
		
		// move scroll bar to top offset
		var moveScroller = function moveScroller(evt) {
			var scrollPercentage = evt.target[scrollEdge] / scrollContentWrapper[scrollDimension]; // 5px arbitrary offset so scroll bar doesn't move too far beyond content wrapper bounding box
			var position = (scrollPercentage * scrollContainer[offsetDimension]) + margin;
			scroller.style[scrollDirection === 'vertical' ? 'top' : 'left'] = "".concat(position, "px");
		};

		var startDrag = function startDrag(evt) {
			normalizedPosition = evt[page];
			contentPosition = scrollContentWrapper[scrollEdge];
			scrollerBeingDragged = true;
		};

		var stopDrag = function stopDrag() {
			scrollerBeingDragged = false;
		};

		var scrollBarScroll = function scrollBarScroll(evt) {
			if (scrollerBeingDragged !== true) return;
			var mouseDifferential = evt[page] - normalizedPosition;
			var scrollEquivalent = mouseDifferential * (scrollContentWrapper[scrollDimension] / scrollContainer[offsetDimension]);
			scrollContentWrapper[scrollEdge] = contentPosition + scrollEquivalent;
		};
		
		// creates scroller element and appends to '.scrollable' div
		var createScroller = function createScroller() {
			// create scroller element
			scroller = document.createElement('div');
			scroller.className = 'scroller'; // determine how big scroller should be based on content
			track = document.createElement('div');
			track.className = 'track'; // determine how big scroller should be based on content
			scrollerDimension = calculateScrollerDimension();
			if (visibleRatio < 1) {
				// if there is a need to have scroll bar based on content size
				scroller.style[scrollDirection === 'vertical' ? 'height' : 'width'] = "".concat(scrollerDimension, "px"); // append scroller to scrollContainer div
				if(scrollDirection == 'horizontal'){
					scroller.style.left = "".concat(margin, "px");
					track.style.left = "".concat(margin, "px");
					track.style.right = "".concat(margin, "px");
				}else{
					scroller.style.top = "".concat(margin, "px");
					track.style.top = "".concat(margin, "px");
					track.style.bottom = "".concat(margin, "px");
				}
				scrollContainer.appendChild(track); // show scroll path div
				scrollContainer.appendChild(scroller); // show scroll path div
				scrollContainer.className += ' showScroll'; // attach related draggable listeners
				scroller.addEventListener('mousedown', startDrag);
				window.addEventListener('mouseup', stopDrag);
				window.addEventListener('mousemove', scrollBarScroll);
			}
		};
		createScroller();
		scrollContentWrapper.addEventListener('scroll', moveScroller);
	},

	events: {
		
	},
	
	isDesktop: function () {
		var self = this;
		var w = window.innerWidth;
		if (w > ORW.responsiveSizes.large) {
			return true;
		}
		return false;
	},
	
	isMobile: function () {
		var self = this;
		var w = window.innerWidth;
		if (w <= ORW.responsiveSizes.medium) {
			return true;
		}
		return false;
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OneCustomScroll = {
	init: function (settings) {
		return new OneCustomScrollView(settings);
	}
}

// Output the module
export default OneCustomScroll;