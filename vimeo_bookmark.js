parseSeconds: function(time) {
var parts = time.split(' ');
var timeParts = parts[0].split(':');

return (+timeParts[0] * 60) + (+timeParts[1]);
},
setStartTime: function(e) {
  var $target = this.$(e.target);
  var player = $target.parents('.video-time-bookmarks').next('.cgo-vp-video-wrapper');
  var seconds = this.parseSeconds($target.text());
  this.initializePlayer(player, false);
  debugger;
  this.player.setCurrentTime(seconds);
},

this.$('.video-time-bookmarks').on('click', 'tr > td:first-of-type', this.setStartTime.bind(this));
