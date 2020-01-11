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
  setUpPlayer: function($iframe) {
    VimeoPlayer.resetPlayerState(false);
    VimeoPlayer.initializePlayer($iframe);
  },
  setStartTimeAndPlay: function(seconds) {
    VimeoPlayer.player.pause().then(function() {
      VimeoPlayer.setStartTime(seconds);
    }).then(function() {
        VimeoPlayer.player.play();
    });
  },
  startPlayer: function(e) {
    e.preventDefault();

    var $target = this.$(e.target);
    var $iframe = $target.parents('.video-time-bookmarks').next('.cgo-vp-video-wrapper');
    var seconds = this.parseSeconds($target.attr('data-time'));

    this.setUpPlayer($iframe);
    this.setStartTimeAndPlay(seconds);
    this.scrollTo($iframe);
  },
  bind: function() {
    this.$('.video-time-bookmarks').on('click', 'a', this.startPlayer.bind(this));
  },
  init: function() {
    this.bind();
  }
};

VimeoBookmarks.init();
