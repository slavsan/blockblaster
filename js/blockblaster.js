$(document).ready(function() {
  (function() {

    var block_blaster_app = function() {

        var _config = {
            key_is_pressed : false
          },

          _overlay_element = $('#overlay'),

          _game = {
            score         : 0,
            is_paused     : false,
            ui            : {
              message : {
                paused  : function(bool) {
                  if (bool) {
                    _overlay_element.show().find('#msg-paused').show();
                    return;
                  }
                  _overlay_element.hide().find('#msg-paused').hide();
                },
                game_over : function() {
                  _overlay_element.show().find('#msg-game-over').show();
                },
                win       : function() {
                  _overlay_element.show().find('#msg-congratulations').show();
                }
              },
              refreshScore : function(points) {
                $('#score-points').text(points);
              }
            },
            pause         : function(ball) {
              if (this.is_paused === true) {
                this.is_paused = false;
                this.ui.message.paused(false);
                if (!ball.is_moving) {
                  return;
                }
                ball.move();
                return;
              }
              this.is_paused = true;
              this.ui.message.paused(true);
            },
            reset         : function() {
              // ...
            },
            scoreUp       : function(points) {
              this.score += points;
              this.ui.refreshScore(this.score);
            }
          },

          _grid_element     = $('#grid'),
          _ball_element     = $('#ball'),
          _platform_element = $('#platform'),

          _grid = {
            element       : _grid_element,
            width         : 400,
            height        : 500,
            alert         : function() {
              var count = 0;
              var interval = setInterval(function() {
                if (count > 4) {
                  clearInterval(interval);
                  interval = null;
                }
                if (_grid_element.css('border-left-color') === 'rgb(51, 51, 51)') {
                  _grid_element.css('border-color', 'red');
                } else {
                  _grid_element.css('border-color', '#333');
                }
                count += 1;
              }, 80);
            }
          },

          _blocks = {
            number   : 108, //81
            per_row  : 9,
            blocks   : {},
            size     : {
              width  : 40,
              height : 20
            },
            built    : 0,
            debugBlocks: function() {
              console.dir(_blocks.blocks);
            },
            ball     : {},
            build    : function() {
              var i,
                rowYAxis = _grid.height - 200,
                lastBlockLeftOffset = 17;
              for (i = 1; i <= this.number; i += 1) {
                if (this.built % this.per_row === 0) {
                  rowYAxis -= this.size.height;
                  lastBlockLeftOffset = 17;
                }
                _grid_element.append('<div class="block" id="block-id-' + i + '"></div>');
                $('#block-id-' + i)
                  .css('top', rowYAxis)
                  .css('left', lastBlockLeftOffset);
                this.blocks[i] = {
                  id           : i,
                  borderTop    : rowYAxis - this.size.height,
                  borderRight  : lastBlockLeftOffset + this.size.width,
                  borderBottom : rowYAxis,
                  borderLeft   : lastBlockLeftOffset
                };
                lastBlockLeftOffset += this.size.width;
                this.built += 1;
              }
              //this.debugBlocks();
            },
            destroy  : function(block_id) {
              delete this.blocks[block_id];
              $('#block-id-' + block_id).fadeOut('fast', function() {
                $(this).remove();
              });
              this.number -= 1;
              _game.scoreUp(10);
              if (this.number === 0) {
                console.log('Congratulations');
                this.ball.stop();
                _game.ui.message.win();
                //_game.pause(this.ball);
              }
            },
            parse    : function(sidesArray) {
              var block_id;
              var y;
              var x;
              if ($.inArray('top', sidesArray) !== -1 && $.inArray('left', sidesArray) !== -1) {
                for (block_id in this.blocks) {
                  if (this.blocks[block_id].hasOwnProperty('borderBottom')) {
                    //this.xAxisPosition + this.halfWidth, this.yAxisPosition - this.height
                    y = this.ball.yAxisPosition - this.ball.height;
                    x = this.ball.xAxisPosition;
                    if (this.blocks[block_id].borderBottom === y &&
                        (x >= this.blocks[block_id].borderLeft &&
                          x <= this.blocks[block_id].borderLeft + this.size.width + 5)) {
                      //console.log(this.blocks[block_id]);
                      this.destroy(block_id);
                      this.ball.direction = 'bottom_left';
                      return true;
                    }
                    y = this.ball.yAxisPosition - this.ball.halfHeight;
                    if (this.blocks[block_id].borderRight === x &&
                          (y < this.blocks[block_id].borderBottom &&
                            y > this.blocks[block_id].borderTop)) {
                      console.log(this.blocks[block_id]);
                      this.destroy(block_id);
                      this.ball.direction = 'top_right';
                      return true;
                    }
                  }
                }
              }
              if ($.inArray('top', sidesArray) !== -1 && $.inArray('right', sidesArray) !== -1) {
                for (block_id in this.blocks) {
                  if (this.blocks[block_id].hasOwnProperty('borderBottom')) {
                    //this.xAxisPosition + this.halfWidth, this.yAxisPosition - this.height
                    y = this.ball.yAxisPosition - this.ball.height;
                    x = this.ball.xAxisPosition + this.ball.halfWidth;
                    if (this.blocks[block_id].borderBottom === y &&
                        (x >= this.blocks[block_id].borderLeft &&
                          x <= this.blocks[block_id].borderLeft + this.size.width + 5)) {
                      //console.log(this.blocks[block_id]);
                      this.destroy(block_id);
                      this.ball.direction = 'bottom_right';
                      return true;
                    }
                    y = this.ball.yAxisPosition - this.ball.halfHeight;
                    if (this.blocks[block_id].borderLeft === x &&
                        (y < this.blocks[block_id].borderBottom &&
                          y > this.blocks[block_id].borderTop)) {
                      console.log(this.blocks[block_id]);
                      this.destroy(block_id);
                      this.ball.direction = 'top_left';
                      return true;
                    }
                  }
                }
              }
              if ($.inArray('bottom', sidesArray) !== -1 && $.inArray('left', sidesArray) !== -1) {
                for (block_id in this.blocks) {
                  if (this.blocks[block_id].hasOwnProperty('borderBottom')) {
                    //this.xAxisPosition + this.halfWidth, this.yAxisPosition
                    y = this.ball.yAxisPosition;
                    x = this.ball.xAxisPosition + this.ball.halfWidth;
                    if (this.blocks[block_id].borderTop === y &&
                        (x > this.blocks[block_id].borderLeft &&
                          x < this.blocks[block_id].borderLeft + this.size.width)) {
                      //console.log(this.blocks[block_id]);
                      this.ball.direction = 'top_left';
                      this.destroy(block_id);
                      return true;
                    }
                    y = this.ball.yAxisPosition - this.ball.halfHeight;
                    if (this.blocks[block_id].borderRight === x &&
                        (y < this.blocks[block_id].borderBottom &&
                          y > this.blocks[block_id].borderTop)) {
                      console.log(this.blocks[block_id]);
                      this.destroy(block_id);
                      this.ball.direction = 'bottom_right';
                      return true;
                    }
                  }
                }
              }
              if ($.inArray('bottom', sidesArray) !== -1 && $.inArray('right', sidesArray) !== -1) {
                for (block_id in this.blocks) {
                  if (this.blocks[block_id].hasOwnProperty('borderBottom')) {
                    //this.xAxisPosition + this.halfWidth, this.yAxisPosition
                    y = this.ball.yAxisPosition;
                    x = this.ball.xAxisPosition + this.ball.halfWidth;
                    if (this.blocks[block_id].borderTop === y &&
                        (x > this.blocks[block_id].borderLeft &&
                          x < this.blocks[block_id].borderLeft + this.size.width)) {
                      //console.log(this.blocks[block_id]);
                      this.destroy(block_id);
                      this.ball.direction = 'top_right';
                      return true;
                    }
                    y = this.ball.yAxisPosition - this.ball.halfHeight;
                    if (this.blocks[block_id].borderLeft === x &&
                        (y < this.blocks[block_id].borderBottom &&
                          y > this.blocks[block_id].borderTop)) {
                      console.log(this.blocks[block_id]);
                      this.destroy(block_id);
                      this.ball.direction = 'bottom_left';
                      return true;
                    }
                  }
                }
              }
              return false;
            }
          },

          _platform = {
            element       : _platform_element,
            width         : 100,
            height        : 20,
            leftBorder    : 0,
            rightBorder   : _grid.width - 102, // minus the platform width + 2 pixels for the border
            xAxisPosition : parseInt(_platform_element.css('left'), 10),
            yAxisPosition : parseInt(_platform_element.css('top'), 10),
            interval      : null,
            move_rate     : 1,
            speed         : 1,
            ball          : {},
            direction     : 'left',
            debug               : function() {
              console.log('x axis: ' + this.xAxisPosition);
            },
            stopMovement  : function() {
              clearInterval(this.interval);
              this.interval = null;
              //this.debug();
            },
            changeXAxisPosition : function(direction) {
              var self = this;
              self.direction = direction;
              if (direction === 'left') {
                this.interval = setInterval(function() {
                  if (self.xAxisPosition !== self.leftBorder) {
                    self.xAxisPosition -= self.move_rate;
                    $('#platform').css('left', self.xAxisPosition + 'px');
                    if (!self.ball.is_moving) {
                      self.ball.moveLeft();
                    }
                  } else {
                    console.log('REACHED LEFT BORDER');
                  }
                }, this.speed);
              } else {
                this.interval = setInterval(function() {
                  if (self.xAxisPosition !== self.rightBorder) {
                    self.xAxisPosition += self.move_rate;
                    $('#platform').css('left', self.xAxisPosition + 'px');
                    if (!self.ball.is_moving) {
                      self.ball.moveRight();
                    }
                  } else {
                    console.log('REACHED RIGHT BORDER');
                  }
                }, this.speed);
              }
            }
          },

          _ball = {
            element       : _ball_element,
            width         : 20,
            height        : 20,
            halfWidth     : 10,
            halfHeight    : 10,
            speed         : 0,
            startSpeed    : 1,
            interval      : null,
            xAxisPosition : parseInt(_ball_element.css('left'), 10),
            yAxisPosition : parseInt(_ball_element.css('top'), 10),
            xMovement     : 1,
            yMovement     : 1,
            direction     : 'top_left',
            topBorder     : 0,
            rightBorder   : _grid.width - 22,
            bottomBorder  : _grid.height - 22,
            leftBorder    : 0,
            is_moving     : false,
            double_move   : false,
            stop          : function() {
              clearInterval(this.interval);
              this.interval = null;
            },
            hitPlatform   : function() {
              var self = this;
              var hit_position;
              if ((self.xAxisPosition + self.width + self.halfWidth) > _platform.xAxisPosition &&
                  self.xAxisPosition - self.width < (_platform.xAxisPosition + _platform.width)) {
                if ((self.yAxisPosition + self.height) === _platform.yAxisPosition) {
                  hit_position = Math.abs(_platform.xAxisPosition - self.xAxisPosition);

                  if (hit_position < 40) {
                    // left
                    if (self.direction === 'bottom_left') {
                      self.xMovement = 2;
                      self.yMovement = 1;
                    } else {
                      // bottom_right
                      self.xMovement = 1;
                      self.yMovement = 1;
                    }
                  } else if (hit_position >= 40 && hit_position <= 60) {
                    self.xMovement = 1;
                    self.yMovement = 1;
                  } else {
                    // bigger than 60
                    // right
                    if (self.direction === 'bottom_right') {
                      self.xMovement = 2;
                      self.yMovement = 1;
                    } else {
                      // bottom_right
                      self.xMovement = 1;
                      self.yMovement = 1;
                    }
                  }

                  return true;
                }
              }
              return false;
            },
            hitBlock      : function() {
              var is_a_hit;
              switch (this.direction) {
                case 'top_left':
                is_a_hit = _blocks.parse(['top', 'left']);
                if (is_a_hit) {
                  //_ball.stop();
                  return is_a_hit;
                }
                return false;
                break;

              case 'top_right':
                is_a_hit = _blocks.parse(['top', 'right']);
                if (is_a_hit) {
                  //_ball.stop();
                  return true;
                }
                return false;
                break;

              case 'bottom_left':
                is_a_hit = _blocks.parse(['bottom', 'left']);
                if (is_a_hit) {
                  //_ball.stop();
                  return true;
                }
                return false;
                break;

              case 'bottom_right':
                is_a_hit = _blocks.parse(['bottom', 'right']);
                if (is_a_hit) {
                  //_ball.stop();
                  return true;
                }
                return false;
                break;

              default:
                //
              }
              return false;
            },
            moveLeft      : function() {
              this.xAxisPosition -= _platform.move_rate;
              _ball_element.css('left', this.xAxisPosition + 'px');
            },
            moveRight     : function() {
              this.xAxisPosition += _platform.move_rate;
              _ball_element.css('left', this.xAxisPosition + 'px');
            },
            getMovementX  : function(operation) {
              if (this.yMovement === 2) {
                if (this.double_move) {
                  this.double_move = false;
                  return this.xAxisPosition;
                } else {
                  if (operation === '+') {
                    this.xAxisPosition += 1;
                  } else {
                    this.xAxisPosition -= 1;
                  }
                  this.double_move = true;
                  return this.xAxisPosition;
                }
              } else {
                if (operation === '+') {
                  this.xAxisPosition += 1;
                } else {
                  this.xAxisPosition -= 1;
                }
                return this.xAxisPosition;
              }
            },
            getMovementY  : function(operation) {
              if (this.xMovement === 2) {
                if (this.double_move) {
                  this.double_move = false;
                  return this.yAxisPosition;
                } else {
                  if (operation === '+') {
                    this.yAxisPosition += 1;
                  } else {
                    this.yAxisPosition -= 1;
                  }
                  this.double_move = true;
                  return this.yAxisPosition;
                }
              } else {
                if (operation === '+') {
                  this.yAxisPosition += 1;
                } else {
                  this.yAxisPosition -= 1;
                }
                return this.yAxisPosition;
              }
            },
            move          : function() {
              var self = this;
              self.is_moving = true;
              this.interval = setInterval(function() {

                if (_game.is_paused) {
                  console.log('IS PAUSED');
                  clearInterval(self.interval);
                  self.interval = null;
                  return;
                }

                switch (self.direction) {
                case 'top_left':
                  if (self.hitBlock()) {
                    if (self.direction === 'bottom_left') {
                      self.xAxisPosition = self.getMovementX('-');
                      self.yAxisPosition = self.getMovementY('+');
                    } else if (self.direction === 'top_right') {
                      self.xAxisPosition = self.getMovementX('+');
                      self.yAxisPosition = self.getMovementY('-');
                    }
                  } else if (self.yAxisPosition === self.topBorder) {
                    self.direction = 'bottom_left';
                    self.xAxisPosition = self.getMovementX('-');
                    self.yAxisPosition = self.getMovementY('+');
                  } else if (self.xAxisPosition === self.leftBorder) {
                    // Hit left side
                    self.direction = 'top_right';
                    self.xAxisPosition = self.getMovementX('+');
                    self.yAxisPosition = self.getMovementY('-');
                  } else {
                    self.xAxisPosition = self.getMovementX('-');
                    self.yAxisPosition = self.getMovementY('-');
                  }
                  break;

                case 'top_right':
                  if (self.hitBlock()) {
                    if (self.direction === 'bottom_right') {
                      self.xAxisPosition = self.getMovementX('-');
                      self.yAxisPosition = self.getMovementY('+');
                    } else if (self.direction === 'top_left') {
                      self.xAxisPosition = self.getMovementX('-');
                      self.yAxisPosition = self.getMovementY('-');
                    }
                  } else if (self.xAxisPosition === self.rightBorder) {
                    self.direction = 'top_left';
                    self.xAxisPosition = self.getMovementX('-');
                    self.yAxisPosition = self.getMovementY('-');
                  } else if (self.yAxisPosition === self.topBorder) {
                    // Hit the top side
                    self.direction = 'bottom_right';
                    self.xAxisPosition = self.getMovementX('-');
                    self.yAxisPosition = self.getMovementY('+');
                  } else {
                    self.xAxisPosition = self.getMovementX('+');
                    self.yAxisPosition = self.getMovementY('-');
                  }
                  break;

                case 'bottom_right':
                  if (self.hitBlock()) {
                    if (self.direction === 'top_right') {
                      self.xAxisPosition = self.getMovementX('+');
                      self.yAxisPosition = self.getMovementY('-');
                    } else if (self.direction === 'bottom_left') {
                      self.xAxisPosition = self.getMovementX('-');
                      self.yAxisPosition = self.getMovementY('+');
                    }
                  } else if (self.hitPlatform()) {
                    self.direction = 'top_right';
                    self.xAxisPosition = self.getMovementX('+');
                    self.yAxisPosition = self.getMovementY('-');
                  } else if (self.xAxisPosition === self.rightBorder) {
                    self.direction = 'bottom_left';
                    self.xAxisPosition = self.getMovementX('-');
                    self.yAxisPosition = self.getMovementY('+');
                  } else if (self.yAxisPosition === self.bottomBorder) {
                    self.stop();
                    _grid.alert();
                    _game.ui.message.game_over();
                    //alert('GAME OVER');
                  } else {
                    self.xAxisPosition = self.getMovementX('+');
                    self.yAxisPosition = self.getMovementY('+');
                  }
                  break;

                case 'bottom_left':
                  if (self.hitBlock()) {
                    if (self.direction === 'top_left') {
                      self.xAxisPosition = self.getMovementX('-');
                      self.yAxisPosition = self.getMovementY('-');
                    } else if (self.direction === 'bottom_right') {
                      self.xAxisPosition = self.getMovementX('+');
                      self.yAxisPosition = self.getMovementY('+');
                    }
                  } else if (self.hitPlatform()) {
                    self.direction = 'top_left';
                    self.xAxisPosition = self.getMovementX('-');
                    self.yAxisPosition = self.getMovementY('-');
                  } else if (self.yAxisPosition === self.bottomBorder) {
                    self.stop();
                    _grid.alert();
                    _game.ui.message.game_over();
                    //alert('GAME OVER');
                  } else if (self.xAxisPosition === self.leftBorder) {
                    self.direction = 'bottom_right';
                    self.xAxisPosition = self.getMovementX('+');
                    self.yAxisPosition = self.getMovementY('+');
                  } else {
                    self.xAxisPosition = self.getMovementX('-');
                    self.yAxisPosition = self.getMovementY('+');
                  }
                  break;

                default:
                    // ...
                }

                self.element.css('top',  self.yAxisPosition);
                self.element.css('left', self.xAxisPosition);
              }, this.startSpeed);
            }
          };

        // Debug
        //console.log(_platform.rightBorder);
        //console.log(_grid.width);
        //console.log(_platform.width);
        //console.dir(_ball);
        //console.log(_platform);

        _platform.ball = _ball;
        _blocks.ball   = _ball;


        var _start = function() {
            _ball.move();
          },
          _moveLeft = function() {
            //console.log('Move: left');
            _platform.changeXAxisPosition('left');
            //_debugPlatform();
          },
          _moveRight = function() {
            //console.log('Move: right');
            _platform.changeXAxisPosition('right');
            //_debugPlatform();
          },
          _fire = function() {
            console.log('Fire');
          },
          _stopAction = function() {
            //console.log('Move: stop');
            _platform.stopMovement();
            _config.key_is_pressed = false;
          },
          _control = function(keyCode) {
            if (_config.key_is_pressed) {
              return;
            }
            //console.log('Key code: ' + keyCode);
            _config.key_is_pressed = true;
            switch (keyCode) {
            case 13:
              if (!_ball.is_moving) {
                if (_platform.direction === 'left') {
                  _ball.direction = 'top_left';
                } else {
                  _ball.direction = 'top_right';
                }
                _start();
              }
              break;
            case 37:
              if (_game.is_paused) {
                return;
              }
              _moveLeft();
              break;
            case 38:
              if (_game.is_paused) {
                return;
              }
              _fire();
              break;
            case 39:
              if (_game.is_paused) {
                return;
              }
              _moveRight();
              break;
            case 80:
              _game.pause(_ball);
              break;
            default:
              console.log('Unrecognised key press');
            }
          };



        return {
          start: function() {
            console.log('Start the game');
            _start();
          },
          control: function(keyCode) {
            _control(keyCode);
          },
          stopAction: function() {
            _stopAction();
          },
          buildBlocks: function() {
            _blocks.build();
          }
        };
      },
      block_blaster = block_blaster_app();

    //block_blaster.start();
    block_blaster.buildBlocks();



    $(document).on('keydown', function(e) {
      if (e.keyCode !== 116) {
        //e.preventDefault();
        block_blaster.control(e.keyCode);
      }
    });

    $(document).on('keyup', function() {
      block_blaster.stopAction();
    });

  }());
});
