
$(function() {
  items = new Items($('#shortcut').text().trim());
  itemsView = new ItemsView();
  statusView = new StatusView();
  searchView = new SearchView();

  searchView.typeahead = new Typeahead({parent: searchView});
  console.log("Houston we have liftoff");
});

var SearchView = Backbone.View.extend({
  el: ".search",

  events: {
    'keypress': 'keyPressMarshall',
    'keyup': 'keyPressMarshall',
    'focusin': 'showTypeahead',
    'focusout': 'hideTypeahead'
  },

  keyPressMarshall: function(e) {
    console.log('keycode', e.keyCode);
    if (e.keyCode === 13) {
      this.search();
    } else if (e.keyCode === 27) {
      this.hideTypeahead();
    } else if (e.keyCode === 38) {
      this.selectItem(-1);
    } else if (e.keyCode === 40) {
      this.selectItem(1);
    } else {
      this.filterTypeahead(e);
    }
  },

  selectItem: function(position) {
    var check = false;
    var typitems = this.typeahead.$el.find('li');

    typitems.each(function(idx, item) {
      if (check) return;

      item = $(item);
      if (item.hasClass('selected')) {
        item.removeClass('selected');
        $(typitems[idx + position]).addClass('selected');
        check = true;
      }
    });

    if (!check && position > 0) {
      console.log('here');
      $(typitems[0]).addClass('selected');
    }
  },

  search: function() {
    var search_text = this.$el.children().val();
    items.changeSub(search_text);
  },

  showTypeahead: function(e) {
    this.typeahead.show();
  },

  hideTypeahead: function(e) {
    this.$el.children().val('');
    setTimeout(function() {
      this.typeahead.hide();
    }.bind(this), 200);
  },

  filterTypeahead: function(e) {
    window.e = this.$el;
    this.typeahead.filter(this.$el.children().val());
  }
});

var Typeahead = Backbone.View.extend({
  tagName: 'div',
  className: 'typeahead',

  initialize: function(stuff) {
    this.parent = stuff.parent; // FIXME dirty hack
    this.template = _.template($('#typeahead-template').html());
    this.reddits = new Reddits();
    this.reddits.fetch();
  },

  render: function(toShow) {
    console.log("rendering typeahead", toShow);
    this.$el.html(this.template({'data': toShow.toJSON()}));
    this.parent.$el.append(this.el);
    this.showing = true;
    return this;
  },

  itemClicked: function(event) {
    console.log("itemClicked", event);
    this.hide();
    items.changeSub(event.currentTarget.innerText);
  },

  hide: function() {
    this.showing = false;
    this.remove();
  },

  show: function() {
    if (!this.showing) {
      this.render(this.reddits);
    }
  },

  filter: function(crit) {
    if (crit === "") {
      this.render(this.reddits);
      return;
    }

    this.remove();
    var temp = this.reddits.filter(function(item) {
      if (item.id.toLowerCase().indexOf(crit.toLowerCase()) > -1)
        return item;
    });

    var toShow = new Reddits(temp);
    this.render(toShow);
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
    'click': 'closeView'
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
    setTimeout(this.animateLoading, 500);
    return this;
  },

  hide: function() {
    this.$el.addClass('flyup');
    setTimeout(function() {
      this.remove();
    }.bind(this), 3000);
  },

  animateLoading: function() {
    $('.status-view input').prop('checked', true);
  }
});

var Items = Backbone.Collection.extend({
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
    history.pushState(sub, "repinterest", sub);
    this.fetch({success: this.success.bind(this), failure: this.failure.bind(this)});
  }
});

var Reddit = Backbone.Model.extend({
  parse: function(response) {
    return {id: response};
  }
});

var Reddits = Backbone.Collection.extend({
  url: '/d',
  model: Reddit,

  parse: function(response) {
    return response.data;
  }
});
