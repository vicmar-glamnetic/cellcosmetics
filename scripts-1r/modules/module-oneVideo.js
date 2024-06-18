/*
	OneVideo 2.0.0 Usage (Webpack)
	Yang @onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import Player from '@vimeo/player';

import '../../styles/modules/oneVideo.scss';

// Define the Backbone View here (Optional)
let OneVideoView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;
		self.$videoBoxes = self.$el;
		self.isResponsive = settings.isResponsive || false;
		self.bgVideo = settings.bgVideo || false;
		self.autoplay = settings.autoplay || false;
		
		self.initVideos();
	},

	events: {

	},
	
	initVideos: function() {
		var self = this;
		
		_.each(self.$videoBoxes, function(box){
			var $box = $(box);
			var boxId = $box.data('video-id');
			var type = $box.data('video-type');
			var videoId = $box.data('video-id');
			var videoSrc = $box.data('video-src');

			if(type == "vimeo"){
				self.loadVimeoPlayer(videoId,videoSrc,$box,boxId);
			} else if (type == "youtube") {
				let ytTimeToLoad = 0;
				const ytInterval = setInterval(() => {
					// If it doesn't load in 5 seconds, just stop
					if(ytTimeToLoad > 5000) {
						clearInterval(ytInterval);
						return;
					}
					if('YT' in window){ // it's sometimes not immediately avaiable so we need to wait to ensure that loadYoutubePlayer will run if needed
						clearInterval(ytInterval);
						self.loadYoutubePlayer(videoId,videoSrc,$box,boxId);
					}
					ytTimeToLoad += 100
				}, 100);
			} else {
				self.loadHostPlayer(videoId,videoSrc,$box,boxId);
			}
		});
	},
	
	loadHostPlayer: function(video_id,video_src,$video_box,video_box_id){
		// Works for vimeo or self-hosted videos
		var self = this, id = '', $videoWrapper = $video_box;
		var videoRatio = $videoWrapper.data('ratio') ? $videoWrapper.data('ratio') : 0.6; // 0.6 is default for product video
		var $playerCtl = $videoWrapper.find('.video-ctl');

		var responsive = function(r){
			var wrapperRatio = $videoWrapper.width()/$videoWrapper.height();
			if (wrapperRatio >= r) {
				$videoWrapper.find('video').css({
					'width' : '100%',
					'height': $videoWrapper.width()/r
				});
			} else {
				$videoWrapper.find('video').css({
					'height' : '100%',
					'width': $videoWrapper.height()*r
				});
			}
		};
		
		if(self.autoplay){
			var $video = $('<video preload="metadata" loop muted autoplay playsinline><source src="' + video_src + '" type="video/mp4"></video>');
		}else{
			var $video = $('<video preload="metadata" loop muted playsinline><source src="' + video_src + '" type="video/mp4"></video>');
		}
		$playerCtl.text('Play');
		$video_box.prepend($video);
		
		var theVideo = $video[0]; 
		theVideo.muted = true;
		$video.on('play', function() {
			$video.isPlaying = true;
			$playerCtl.text('Pause');
			$playerCtl.removeClass('paused').addClass('playing');
			$video.isPlaying = true;
			$video_box.find('video').css({
				'visibility': 'visible',
				'opacity': '1'
			});
			// console.log('play the video!');
		});
		$video.on('pause', function() {
			$video.isPlaying = false;
			$playerCtl.text('Play');
			$playerCtl.removeClass('playing').addClass('paused');
			$video.isPlaying = false;
			if(!self.autoplay && self.bgVideo){
				$video_box.find('video').css({
					'visibility': 'hidden',
					'opacity': '0'
				});
			}
			// console.log('pause the video!');
		});

		function toggleVideo(){
			if ($video.isPlaying) {
				theVideo.pause();
				$playerCtl.text('Play');
				$playerCtl.removeClass('playing').addClass('paused');
			} else {
				theVideo.play();
				$playerCtl.text('Pause');
				$playerCtl.removeClass('paused').addClass('playing');
			}
		}

		$video.on('click', function(){
			toggleVideo();
		});
		
		if ($playerCtl.length) {
			$playerCtl.text('Pause');
			// $playerCtl.removeClass('paused').addClass('playing');
			$playerCtl.on('click', function(){
				toggleVideo();
			});
		}
		
		$video.on('bufferend', function(){
			console.log("video buffered");
			if (self.isResponsive) {
				responsive(videoRatio);
			}
			console.log('init video');
		});
		
		if (self.isResponsive) {
			$(window).resize(function() {
				clearTimeout(id);
				id = setTimeout(function(){
					responsive(videoRatio);
				}, 400);
			});
		}
	},

	loadYoutubePlayer: function(video_id,video_src,$video_box,video_box_id){
		var self = this, $videoWrapper = $video_box;
		var $videoPlayer = $videoWrapper.find('.video-player');
		var $videoControls = $videoWrapper.find('.video-ctl');
		var pausedClass = 'paused';
		var playingClass = 'playing';

		var videoActions = function(actionName){
			if(actionName == 'play'){
				$videoWrapper.addClass(playingClass).removeClass(pausedClass);
				$videoControls.addClass(playingClass).removeClass(pausedClass);
			}else{
				$videoWrapper.removeClass(playingClass).addClass(pausedClass);
				$videoControls.removeClass(playingClass).addClass(pausedClass);
			}
		}

    	window.YT.ready(function() {
			self.player = new YT.Player(video_box_id, {
				videoId: video_id, // YouTube Video ID
				width: 1440,        // Player width (in px)
				height: 1080,       // Player height (in px)
				playerVars: {
					autoplay: 0,        // Auto-play the video on load
					controls: 1,        // Show pause/play buttons in player
					loop: 1,            // Run the video in a loop
					playlist: video_id, // Needed to loop the video
					showinfo: 0,        // Hide the video title
					modestbranding: 1,  // Hide the Youtube Logo
					fs: 0,              // Hide the full screen button
					autohide: 1,        // Hide video controls when playing
					rel: 0
				},
				events: {
					onReady: function(e) {
						console.log('YT ready');
						// e.target.mute();
					},
					onStateChange: function(e){
						if(e.target.getPlayerState() == 1){
							console.log('playing');
							videoActions('play');
						}else{
							console.log('paused');
							videoActions('');
						}
					}
				}
			});
		});

		$videoControls.click(function(e){
			console.log('click controls status:'+self.player.getPlayerState());
			if(self.player.getPlayerState() == 1){
				self.player.pauseVideo();
				// videoActions('');
			}else{
				self.player.playVideo();
				// videoActions('play');
			}
		});
	},
	
	loadVimeoPlayer: function(video_id,video_src,$video_box,video_box_id){
		var self = this, id= '', $videoWrapper = $video_box, pausedClass = 'paused', playingClass = 'playing';
		var $videoPlayer = $videoWrapper.find('.video-player');
		var $videoControls = $videoWrapper.find('.video-ctl');
		var videoRatio = $videoWrapper.data('ratio') ? $videoWrapper.data('ratio') : 0.6; // 0.6 is default for product video

		var responsive = function(r){
			var wrapperRatio = $videoWrapper.width()/$videoWrapper.height();
			// console.log(wrapperRatio + '/' + r);
			if (wrapperRatio >= r) {
				$videoWrapper.find('iframe').css({
					'width' : '100%',
					'height': $videoWrapper.width()/r
				});
			} else {
				$videoWrapper.find('iframe').css({
					'height' : '100%',
					'width': $videoWrapper.height()*r
				});
			}
		};

		var videoActions = function(actionName){
			if(actionName == 'play'){
				$videoWrapper.addClass(playingClass).removeClass(pausedClass);
				$videoControls.addClass(playingClass).removeClass(pausedClass);
			}else{
				$videoWrapper.removeClass(playingClass).addClass(pausedClass);
				$videoControls.removeClass(playingClass).addClass(pausedClass);
			}
		}
		
		// if (self.isMobile()) {
		// 	var options = {
		// 		// id: video_id,
		// 		byline: false,
		// 		portrait: false,
		// 		title: false,
		// 		loop: false,
		// 		background: true
		// 	};
		// 	var vmplayer = new Player(video_box_id, options);
		// } else {
			var $iframe = $('<iframe height="100%" width="100%" class="video-player" frameborder="0" src="' + video_src + '?title=0&amp;byline=0&amp;portrait=1&amp;autoplay=0&amp;loop=1&amp;controls=1&amp;background=0">');
			$videoPlayer.replaceWith($iframe);
			var vmplayer = new Player($iframe); 
			// console.log(vmplayer);
		// }
		
		if ($videoControls.length) {
			// if (!self.isMobile()) {
			// 	$videoControls.text('Pause');
			// 	$videoWrapper.addClass(pausedClass).removeClass(playingClass);
			// 	$videoControls.addClass(pausedClass).removeClass(playingClass);
				$videoControls.on('click', function(){
					if (vmplayer.isPlaying) {
						vmplayer.pause();
						$videoControls.text('Play');
						$videoControls.removeClass(playingClass).addClass(pausedClass);
						$videoWrapper.removeClass(playingClass).addClass(pausedClass);
					} else {
						vmplayer.play();
						// vmplayer.playVideo();
						$videoControls.text('Pause');
						// videoActions('play');
						$videoControls.removeClass(pausedClass).addClass(playingClass);
						$videoWrapper.removeClass(pausedClass).addClass(playingClass);
					}
				})
			// } else {
				// $videoControls.text('Play');
				// $videoControls.removeClass(playingClass).addClass(pausedClass);
				// $videoWrapper.removeClass(playingClass).addClass(pausedClass);
				// $videoControls.on('click', function(){
					// if (vmplayer.isPlaying) {
						// vmplayer.pause();
					// }
					// vmplayer.play();
				// })
			// }
			
		}
		
		vmplayer.setVolume(0);
		vmplayer.on('play', function() {
			vmplayer.isPlaying = true;
			// if (self.isMobile()) {
				// $video_box.find('iframe').css({
				// 	'opacity' : '1'
				// })
			// 	$videoControls.css({
			// 		'z-index' : '3'
			// 	});
				$videoControls.text('Pause');
				$videoControls.removeClass(pausedClass).addClass(playingClass);
				$videoWrapper.removeClass(pausedClass).addClass(playingClass);
			// }
			console.log('played vm video!');
		});
		vmplayer.on('pause', function() {
			vmplayer.isPlaying = false;
			// if (self.isMobile()) {
			// 	$video_box.find('iframe').css({
			// 		'opacity' : '0'
			// 	});
				$videoControls.text('Play');
				$videoControls.removeClass(playingClass).addClass(pausedClass);
				$videoWrapper.removeClass(playingClass).addClass(pausedClass);
			// }
			console.log('pause vm video!');
		});
		vmplayer.on('loaded', function() {
			if (self.isResponsive) {
				responsive(videoRatio);
			}
			console.log('init vm video');
		});
		
		if (self.isResponsive) {
			$(window).resize(function() {
				clearTimeout(id);
				id = setTimeout(function(){
					responsive(videoRatio);
				}, 400);
			});
		}
	},

	destroy: function() {
		var self = this;
		self.undelegateEvents();
	},

	isMobile: function () {
		if ( ORW.responsive == 'small') {
			return true;
		}
		return false;
	},

	isDesktop: function () {
		if ( ORW.responsive == 'large') {
			return true;
		}
		return false;
	}
	
});

// Define the module here 
let OneVideo = {
	init: function (settings) {
		return new OneVideoView(settings);
	}
}

// Output the module
export default OneVideo;