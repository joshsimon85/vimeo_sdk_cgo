var options_template = ' \
  <div class="ab-loop-wrapper fullscreen"> \
    <div class="video-toolbar-titles fullscreen">AB Loop Toolbar</div> \
    <form class="video-loop-select"> \
      <input type="button" value="Set A Point" data-btn="a" class="set-a-button" /> \
      <input type="text" name="apoint" data-input="a" class="set-a-input" placeholder="00:00 min"> \
      <div class="ab-loop-icon">&#x21ba;</div> \
      <input type="text" name="bpoint" data-input="b" class="set-b-input" placeholder="00:00 min"> \
      <input type="button" value="Set B Point" data-btn="b" class="set-b-button" /> \
      <input class="run-loop-button" type="submit" value="Run Loop"> \
      <input type="button" value="Remove Loop" class="reset-loop" /> \
    </form> \
    <div class="video-toolbar-error abloop"></div> \
    <div class="video-toolbar-titles fullscreen">Adjust Playback Speed</div> \
    <form class="video-speed-select"> \
      <div class="video-speed-caret">	&#8964;</div> \
      <select class="video-speed-options"> \
        <option class="default" value="" disabled selected>Video Speed</option> \
        <option value = "0.5">0.5x</option> \
        <option value = "0.6">0.6x</option> \
        <option value = "0.7">0.7x</option> \
        <option value = "0.8">0.8x</option> \
        <option value = "0.9">0.9x</option> \
        <option value = "1.0">normal</option> \
        <option value = "1.1">1.1x</option> \
        <option value = "1.2">1.2x</option> \
        <option value = "1.3">1.3x</option> \
        <option value = "1.4">1.4x</option> \
        <option value = "1.5">1.5x</option> \
      </select> \
    </form> \
    <div class="video-toolbar-error speed"></div> \
  </div> \
';

VimeoPlayer = {
  $: jQuery,
  loop: false,
  playing: false,
  initialLoop: true,
  cueIdA: null,
  cueTimeA: null,
  cueIdB: null,
  cueTimeB: null,
  play: function() {
    this.player.play();
  },
  resetSpeedSelect: function() {
    var $optionsBar = this.$('[data-options="' + this.optionsId + '"]');

    $optionsBar.find('.video-speed-select').get(0).reset();
  },
  addToolBarError: function(error) {
    this.$inputError.append(error);
  },
  removeInputErrors: function() {
    this.$inputA.removeClass('error');
    this.$inputB.removeClass('error');
    this.$inputError.text('');
  },
  removePlaybackErrors: function() {
    this.$playbackError.text('');
  },
  resetErrors: function() {
    this.removeInputErrors();
    this.removePlaybackErrors();
  },
  resetInputValues: function() {
    this.$inputA.val('');
    this.$inputB.val('');
  },
  resetPlayerState: function() {
    this.player.unload();
    this.resetErrors();
    this.resetInputValues();
    this.resetSpeedSelect();
    this.loop = false;
    this.playing = false;
    this.initialLoop = true;
    this.player = null;
    this.playerId = null;
    this.$loopBtn = null;
    this.cueIdA = null;
    this.cueTimeA = null;
    this.cueIdB = null;
    this.cueTimeB = null;
    this.$inputA = null;
    this.$inputB = null;
    this.$inputError = null;
    this.$playbackError = null;
    this.optionsId = null;
  },
  checkPlayerStatus: function(player) {
    var id;

    if (this.player) {
      id = player.attr('src');

      if (id !== this.playerId) {
        this.resetPlayerState();
        this.initializePlayer(player);
      }
    } else {
      this.initializePlayer(player);
    }
  },
  checkCuePointStatus: function(cuePoint) {
    var self = this;
    if (cuePoint === 'a') {
      if (this.cueIdA) {
        this.player.removeCuePoint(this.cueIdA).catch(function(error) {
          self.addToolBarError(error.message);
        });
      }
    } else {
      if (this.cueIdB) {
        this.player.removeCuePoint(this.cueIdB).catch(function(error) {
          self.addToolBarError(error.message);
        });
      }
    }
  },
  isValidCuePoint: function(seconds, cuePoint) {
    if (this.cueTimeA === null && this.cueTimeB === null) {
      return true;
    }

    if (cuePoint === 'a') {
      if (seconds >= this.cueTimeB) {
        return false;
      }
    } else if (cuePoint === 'b') {
      if (seconds <= this.cueTimeA) {
        return false;
      }
    }

    return true;
  },
  setInputTime: function($el, seconds) {
    $el.val(View.formatTime(seconds) + ' min');
  },
  findIframeFromOptionsBar: function($el) {
    return $el.parents('.ab-loop-wrapper')
              .prev('.cgo-vp-video-wrapper')
              .find('iframe');
  },
  cacheBtns: function($optionsBar) {
    this.$inputA = $optionsBar.find('.set-a-input');
    this.$inputB = $optionsBar.find('.set-b-input');
    this.$loopBtn = $optionsBar.find('.run-loop-button');
    this.$inputError = $optionsBar.find('.video-toolbar-error').first();
    this.$playbackError = this.$($optionsBar.find('.video-toolbar-error').get(1));
  },
  checkOptionsBarStatus: function($optionsBar) {
    var id = $optionsBar.attr('data-options');

    if (this.optionsId !== id) {
      this.cacheBtns($optionsBar);
      this.optionsId = id;
    }
  },
  addCuePoint: function(seconds, cuePoint) {
    var self = this;

    this.removeInputErrors();
    this.player.addCuePoint(seconds, {
      customKey: cuePoint
    }).then(function(id) {
      if (cuePoint === 'a') {
        self.cueIdA = id;
        self.cueTimeA = seconds;
        self.setInputTime(self.$inputA, seconds);
      } else {
        self.cueIdB = id;
        self.cueTimeB = seconds;
        self.setInputTime(self.$inputB, seconds);
      }
    }).catch(function(error) {
      self.addToolBarError(error.message);
    });
  },
  handleInputError: function(cuePoint, error) {
    this.removeInputErrors();

    if (cuePoint === 'a') {
      this.$inputA.toggleClass('error', true);
    } else {
      this.$inputB.toggleClass('error', true);
    }
    this.addToolBarError(error);
  },
  setStartTime: function(seconds) {
    return this.player.setCurrentTime(seconds);
  },
  setCuePoint: function(e) {
    e.preventDefault();
    var $target = this.$(e.target);
    var $optionsBar = $target.parents('.ab-loop-wrapper');
    var $iframe = this.findIframeFromOptionsBar($target);
    var cuePoint = $target.data('btn');
    var self = this;

    this.checkPlayerStatus($iframe);
    this.checkOptionsBarStatus($optionsBar);
    this.checkCuePointStatus(cuePoint);

    this.player.getCurrentTime().then(function(seconds) {
      if (!(self.isValidCuePoint(seconds, cuePoint))) {
        self.handleInputError(cuePoint, 'A point must be less than B point');
        return;
      } else {
        self.addCuePoint(seconds, cuePoint);
      }
    });
  },
  playerPausedState: function() {
    this.playing = false;
    this.changeLoopBtnState();
  },
  playerPlayingState: function(_) {
    this.playing = true;
    this.changeLoopBtnState();
  },
  changeLoopBtnState: function() {
    var STOP = 'Pause Loop';
    var RUN = 'Run Loop';

    if (this.playing === false && this.loop === false) {
      this.$loopBtn.val(RUN);
      this.toggleRunningClass(false);
    }

    if (this.playing === true && this.loop === false) {
      this.$loopBtn.val(RUN);
      this.toggleRunningClass(false);
    }

    if (this.playing === true && this.loop === false) {
      this.$loopBtn.val(RUN);
      this.toggleRunningClass(false);
    }

    if (this.playing === false && this.loop === true) {
      this.$loopBtn.val(RUN);
      this.toggleRunningClass(false);
    }

    if (this.playing === true && this.loop === true) {
      this.$loopBtn.val(STOP);
      this.toggleRunningClass(true);
    }
  },
  toggleRunningClass: function(bool) {
    this.$inputA.toggleClass('ab-loop-running', bool);
    this.$inputB.toggleClass('ab-loop-running', bool);
  },
  startLoop: function(e) {
    var self = this;

    this.resetErrors();

    this.player.getCurrentTime().then(function(seconds) {
      if (seconds < self.cueTimeA || seconds >= self.cueTimeB) {
        self.player.setCurrentTime(self.cueTimeA).then(function(result) {
          self.loop = true;
          self.playing = true;
          self.changeLoopBtnState();
          self.player.getPaused().then(function(state) {
            if (state === true) {
              self.playing = true;
              self.player.play();
            }
          });
        });
      } else {
        self.loop = true;
        self.player.play();
      }
    });
  },
  endLoop: function(e) {
    var self = this;

    this.playing = false;
    this.player.pause().then(function(_) {
      self.changeLoopBtnState();
    });
  },
  isValidLoop: function() {
    if (this.cueIdA === null || this.cueIdB === null) {
      return { error: true, message: 'A point and B point must be set' };
    }

    if (this.cueTimeA >= this.cueTimeB ) {
      return { error: true, message: 'A point must be less than B point' };
    }

    if (this.cueTimeB <= this.cueTimeA) {
      return { error: true, message: 'B point must be greater than A point' };
    }

    return { error: false };
  },
  changeLoopState: function(e) {
    e.preventDefault();

    var $target = this.$(e.target);
    var $iframe = this.findIframeFromOptionsBar($target);
    var $optionsBar = $target.parents('.ab-loop-wrapper');
    var loopValidation = this.isValidLoop();

    this.checkPlayerStatus($iframe);
    this.checkOptionsBarStatus($optionsBar);
    this.resetErrors();

    if (loopValidation.error === true) {
      this.$inputError.append(loopValidation.message);
      return;
    }

    if (this.playing === false) {
      this.startLoop(e);
      this.initialLoop = false;
    } else if (this.playing === true && this.initialLoop === true) {
      this.initialLoop = false;
      this.startLoop(e);
    } else {
      this.endLoop(e);
    }
  },
  removeCuePoints: function() {
    if (this.cueIdA) {
      this.player.removeCuePoint(this.cueIdA);
      this.cueIdA = null;
      this.cueTimeA = null;
    }

    if (this.cueIdB) {
      this.player.removeCuePoint(this.cueIdB);
      this.cueIdB = null;
      this.cueTimeB = null;
    }
  },
  removeCuePoint: function(cueId) {
    var id = cueId;

    this.player.removeCuePoint(id);
  },
  removeLoop: function(e) {
    e.preventDefault();

    var self = this;
    var $target = this.$(e.target);
    var $el = $target.parents('.ab-loop-wrapper');
    var $iframe = this.findIframeFromOptionsBar($target);
    var $optionsBar = $target.parents('.ab-loop-wrapper');

    this.checkPlayerStatus($iframe);
    this.checkOptionsBarStatus($optionsBar);
    this.resetErrors();
    this.resetInputValues();
    this.removeCuePoints();

    this.loop = false;
    this.initialLoop = true;

    this.changeLoopBtnState();
  },
  setPlaybackRateError: function(error) {
    this.$playbackError.append(error);
  },
  setSpeed: function(e) {
    var self = this;
    var $target = this.$(e.target);
    var speed = $target.val();
    var $iframe = this.findIframeFromOptionsBar($target);
    var $optionsBar = $target.parents('.ab-loop-wrapper');

    this.checkPlayerStatus($iframe);
    this.checkOptionsBarStatus($optionsBar);

    this.player.setPlaybackRate(+speed).then(function() {
      self.removePlaybackErrors();
    }).catch(function(error) {
      self.removePlaybackErrors();
      self.resetSpeedSelect();
      self.setPlaybackRateError(error.message);
    });
  },
  bind: function() {
    this.$('.set-a-button, .set-b-button').on('click', this.setCuePoint.bind(this));
    this.$('.video-loop-select').on('submit', this.changeLoopState.bind(this));
    this.$('.reset-loop').on('click', this.removeLoop.bind(this));
    this.$('.video-speed-select').on('change', this.setSpeed.bind(this));
  },
  resetPlayBackTime: function(e) {
    if (this.loop === false) { return; }
    if (e.id !== this.cueIdB) { return; }
    this.player.setCurrentTime(this.cueTimeA);
  },
  bindPlayerEvents: function() {
    this.player.on('cuepoint', this.resetPlayBackTime.bind(this));
    this.player.on('pause', this.playerPausedState.bind(this));
    this.player.on('play', this.playerPlayingState.bind(this));
  },
  setPlayerId: function() {
    this.playerId = this.$(this.player.element).attr('src');
  },
  initializePlayer: function(player) {
    this.player = new Vimeo.Player(player);
    this.setPlayerId();
    this.bindPlayerEvents();
  },
  init: function() {
    View.addOptionsBar();
    this.bind();
  }
};

var View = {
  formatTime: function(seconds) {
    var utc;
    var time;
    var date = new Date(null);

    date.setSeconds(seconds);
    utc = date.toUTCString();
    return utc.substr(utc.indexOf(':') + 1, 5);
  },
  optionsTemplate: options_template,
  addOptionsBar: function() {
    var self = this;
    jQuery('.cgo-vp-video-wrapper').each(function(index) {
      var $optionsBar = jQuery(self.optionsTemplate);
      $optionsBar.attr('data-options', index);
      jQuery(this).after($optionsBar);
    });
  },
  init: function() {
    this.addOptionsBar();
  }
};

VimeoPlayer.init();
