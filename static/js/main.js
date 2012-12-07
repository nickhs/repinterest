$(function() {
  items = new Items($('#shortcut').text().trim());
  itemsView = new ItemsView();
  searchView = new SearchView();
  statusView = new StatusView();

  console.log("Houston we have liftoff");
});

var SearchView = Backbone.View.extend({
  el: ".search",

  events: {
    'keypress input[type=text]': 'searchOnEnter'
  },

  searchOnEnter: function(e) {
    if (e.keyCode == 13) {
      this.search();
    }
  },

  search: function() {
    var search_text = this.$el.children().val();
    console.log('text:', search_text);

    history.pushState(search_text, "repinterest", search_text);

    items.changeSub(search_text);
  }
});

var ItemView = Backbone.View.extend({
  tagName: 'div',
  className: 'item',

  events: {
    'click': 'itemClicked',
    'click a': 'stopProp'
  },

  initialize: function() {
    this.template = _.template($('#item-template').html());
  },

  render: function() {
    console.log("render item");
    console.log(this.model.toJSON());
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },

  itemClicked: function() {
    if (this.sv) {
      this.sv.remove();
    }

    this.sv = new ShowView({model: this.model});
  },

  stopProp: function(e) {
    e.stopPropagation();
  }
});

var ShowView = Backbone.View.extend({
  tagName: 'div',
  className: 'show-view',

  events: {
    'click': 'closeView',
    'click img': 'stopProp'
  },

  initialize: function() {
    this.template = _.template($('#show-template').html());
    this.render();
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    $('body').append(this.el);
    return this;
  },

  closeView: function() {
    this.remove();
  },

  stopProp: function(e) {
    e.stopPropagation();
  }
});

var ItemsView = Backbone.View.extend({
  el: 'section',

  initialize: function() {
    // fixme, bind collection
    items.on('reset', this.render, this);
  },

  render: function() {
    console.log("render pane");

    if (this.$el.hasClass('isotope')) {
      this.$el.isotope('destroy');
    }

    this.$el.empty();

    statusView.render({message: "loading..."});

    items.each(function(model, idx) {
      var v = new ItemView({model: model});
      var t_el = v.render();
      this.$el.append(t_el.el);
    }, this);

    this.$el.imagesLoaded(this.startIsotope.bind(this));
    this.timer = setTimeout(this.startIsotope.bind(this), 5000);
  },

  startIsotope: function() {
    if (this.timer) {
      console.log('images Loaded');
      this.timer = null;
    } else {
      console.log('force load');
    }

    this.$el.isotope({
      itemSelector: '.item',
      layoutMode: 'masonry',
      masonry: {
        columnWidth: 305
      }
    });

    statusView.hide();
  }
});

var StatusView = Backbone.View.extend({
  tagName: 'div',
  className: 'status-view',

  initialize: function() {
    this.template = _.template($('#status-template').html());
  },

  render: function(json) {
    if (this.$el) {
      this.remove();
      this.$el.empty();
      this.$el.attr('class', 'status-view');
    }

    this.$el.html(this.template(json));
    $('body').append(this.el);
    return this;
  },

  hide: function() {
    this.$el.addClass('flyup');
    setTimeout(function() {
      this.remove();
    }.bind(this), 3000);
  }
});

var Item = Backbone.Model.extend({
  initialize: function(item) {
    this.item = item;
  },

  parse: function(response) {
    return response;
  }
});

var Items = Backbone.Collection.extend({
  model: Item,

  initialize: function(url) {
    console.log('init', url);
    if (url) {
      this.url = '/r/' + url;
    } else {
      this.url = '/r/pics';
    }

    this.fetch({success: this.success.bind(this), failure: this.failure.bind(this)});
  },

  parse: function(response) {
    return response.data;
  },

  success: function(collection, response, options) {
    console.log("fetched successfully", response);
  },

  failure: function() {
    console.log("Critical failure");
  },

  changeSub: function(sub) {
    this.url = '/r/' + sub;
    this.fetch({success: this.success.bind(this), failure: this.failure.bind(this)});
  }
});
