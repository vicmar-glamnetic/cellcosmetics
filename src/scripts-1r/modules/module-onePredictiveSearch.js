/*
	onePredictiveSearch 2.0.0 Usage (Webpack)
	alyssa @onerockwell
	
	Please replace 'YourModuleCallName' with your module's call name, e.g. OneModal, MyModule, HelloWorld etc.
	
*/

// Import all dependencies here
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

// import '../../styles/modules/yourModuleCallName.scss';

import SearchResultsTemp from '@/templates/template-onePredictiveSearchResults.html';

// Define the Backbone View here (Optional)
let OnePredictiveSearchView = Backbone.View.extend({
	
	initialize: function (settings) {
		var self = this;

		console.log('init predictive search module');

		self.initSearchResults();
		self.resetInput();
		self.closeResults();

	},

	events: {
		
	},

	initSearchResults: function() {
		var self = this;
		
		$('#SearchForm input').keyup(function(){
		    var q = $(this).val();
		    // console.log(q);

		    $(".predictive-search--search-template").empty();

		    $.ajax('/search/suggest.json?q=' + q + '&resources[limit]=3&section_id=predictive-search',{
		      type: 'GET',
		      dataType: 'json', // added data type
		      success: function(response) {
		          console.log(response);

		          var productSuggestions = response.resources.results.products;
		          var querySuggestions = response.resources.results.queries;
		          var collectionSuggestions = response.resources.results.collections;
		          var pageSuggestions = response.resources.results.pages;
		          var articleSuggestions = response.resources.results.articles;

		          	var content = self.buildTemplate({
						response: response,
						productSuggestions: response.resources.results.products,
		          		querySuggestions: response.resources.results.queries,
		          		collectionSuggestions: response.resources.results.collections,
		          		pageSuggestions: response.resources.results.pages,
		          		articleSuggestions: response.resources.results.articles,
		          		searchPageResults: '#predictive-search'
					});

					self.$search = $('.predictive-search--search-template').append(content);

		      }
		    });
		});
				
	},

	resetInput: function() {

		$('.reset__button').on('click', function(e){
			e.preventDefault();
			// console.log($(this).parent().find('input')[0].value);
			$(this).parent().find('input')[0].value = '';
			$(this).parent().find('input')[0].focus();
		});
	},

	closeResults: function() {

	  document.addEventListener("click", function(e) {
        var inputForm = document.getElementById('SearchResult'),
          targetEl = e.target; // clicked element      
        do {
          if(targetEl == inputForm) {
            // This is a click inside, does nothing, just return.
            return;
          }
          // Go up the DOM
          targetEl = targetEl.parentNode;
        } while (targetEl);
        // This is a click outside.
        $(".predictive-search--search-template").empty();
      });

	},

	buildTemplate: function (content, type) {
		var self = this,
			typeTemplate;
		
		switch(type) {
			case '':
				break;
			default:
				typeTemplate = SearchResultsTemp;
				break;
		};
		
		return typeTemplate({content: content});
	},
	
	destroy: function() {
		var self = this;
		self.undelegateEvents();
	}

});

// Define the module here 
let OnePredictiveSearch = {
	init: function (settings) {
		
		return new OnePredictiveSearchView(settings);
		
	}
}

// Output the module
export default OnePredictiveSearch;