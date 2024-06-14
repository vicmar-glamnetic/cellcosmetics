import $ from "jquery";
import _ from "underscore";
import Backbone from "backbone";

export default Backbone.View.extend({
  initialize: function (opts) {
    console.log("init article page");

    var self = this;
    self.$content = self.$el;
  },

  events: {},

  destroy: function () {
    var self = this;
    self.undelegateEvents();
  },

  responsive: function () {
    var self = this;
    ORW.utilities.mediaCheck(
      function () {
        // Desktop actions
      },
      function () {
        // Mobile actions
      }
    );
  },

  isMobile: function () {
    if (ORW.responsive == "small") {
      return true;
    }
    return false;
  },
});
