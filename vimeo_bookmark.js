var VimeoBookmarks = {
  $: jQuery,
  duration: 500,
  offset: 100,
  parseSeconds: function(time) {
    var parts = time.split(' ');
    var timeParts = parts[0].split(':');

    return (+timeParts[0] * 60) + (+timeParts[1]);
  },
  scrollTo: function(player) {
    var height = (player.offset().top) - this.offset;

    this.$('html, body').animate(
      {
        scrollTop: height
      }, this.duration
    );
  },
  setStartTime: function(e) {
    var self = this;
    var $target = this.$(e.target);
    var player = $target.parents('.video-time-bookmarks').next('.cgo-vp-video-wrapper');
    var seconds = this.parseSeconds($target.text());

    VimeoPlayer.setCurrentTime(seconds).then(function() {
      self.scrollTo(player);
    });
  },
  initializeVimeoPlayer: function() {
    var player = this.$('.video-time-bookmarks').next('.cgo-vp-video-wrapper');
    VimeoPlayer.initializePlayer(player);
  },
  addClassToBookmarks: function(duration) {
    var $trs = this.$('.video-time-bookmarks').find('tr').slice(1);
    var self = this;

    $trs.each(function() {
      var $tr = self.$(this);
      var $td = self.$(this).find('td:first-of-type');
      var time = self.parseSeconds($td.text());

      if (time <= duration) {
        $tr.addClass('auth-user-bookmark');
      }
    });
  },
  bind: function() {
    self.$('.auth-user-bookmark').on('click', this.setStartTime.bind(this));
  },
  locateBookmarks: function() {
    var $bookMarks = this.$('.video-time-bookmarks');
    var self = this;

    if ($bookMarks.length > 0) {
      this.initializeVimeoPlayer();
      VimeoPlayer.getVideoDuration().then(function(duration) {
        self.addClassToBookmarks(duration);
        VimeoPlayer.unloadPlayer();
        self.bind();
      });
    }

  },
  init: function() {
    this.locateBookmarks();
  }
};

VimeoBookmarks.init();

//this.$('.video-time-bookmarks').on('click', 'tr > td:first-of-type', this.setStartTime.bind(this));

// steps first on page load we need to see if there are a tags under video-time-bookmarks
// if there are we need to
