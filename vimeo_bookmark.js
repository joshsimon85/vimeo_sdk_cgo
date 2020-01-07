var VimeoBookmarks = {
  $: jQuery,
  duration: 700,
  offset: 100,
  parseSeconds: function(time) {
    var timeParts = time.split(':');

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
    e.preventDefault();

    var self = this;
    var $target = this.$(e.target);
    var $iframe = $target.parents('.video-time-bookmarks').next('.cgo-vp-video-wrapper');
    var seconds = this.parseSeconds($target.attr('data-time'));
    var $optionsBar = $iframe.next('.ab-loop-wrapper');

    VimeoPlayer.checkPlayerStatus($iframe);
    VimeoPlayer.checkOptionsBarStatus($optionsBar);
    VimeoPlayer.removeCuePoints();
    VimeoPlayer.setStartTime(seconds);

    this.scrollTo($iframe);
  },
  initializeVimeoPlayer: function() {
    var player = this.$('.video-time-bookmarks').next('.cgo-vp-video-wrapper');
    VimeoPlayer.initializePlayer(player);
  },
  bind: function() {
    self.$('.video-time-bookmarks').on('click', 'a', this.setStartTime.bind(this));
  },
  init: function() {
    this.bind();
  }
};

VimeoBookmarks.init();
