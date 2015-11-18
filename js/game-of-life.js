// (function() {
function GameOfLife(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.resize();
}

GameOfLife.prototype.resize = function() {
  this.clear();
  this.height = canvas.height;
  this.width = canvas.width;

  this.cellSize = canvas.height / 200;
  this.rheight = Math.floor(this.height / this.cellSize);
  this.rwidth = Math.floor(this.width / this.cellSize);

  this.grid = repeat(undefined, this.rheight)
    .map(repeat.bind(null, false, this.rwidth));
  this.newgrid = repeat(undefined, this.rheight)
    .map(repeat.bind(null, false, this.rwidth));

  for(var i = 0; i < this.rwidth; i++) {
    for(var j = 0; j < this.rheight; j++) {
      if(Math.random() < 0.1) {
        this.toggle(i, j);
      }
    }
  }
};

GameOfLife.prototype.start = function() {
  var _this = this;
  this.interval = setInterval(function loop() {
    _this.step();
    _this.redraw();
  }, 100);
  this.running = true;
};

GameOfLife.prototype.stop = function() {
  clearInterval(this.interval);
  this.interval = undefined;
  this.running = false;
};

GameOfLife.prototype.toggle = function(x, y) {
  this.grid[y][x] = !this.grid[y][x];
};

GameOfLife.prototype.redraw = function() {
  var grid = this.grid;
  var cellSize = this.cellSize;
  var rheight = this.rheight;
  var rwidth = this.rwidth;
  var surroundSize = cellSize * 0.9;
  var containedSize = cellSize * 0.7;
  var fillStyles = [
    '#99f999',
    '#99dbf7',
  ];
  var lastColor = 0;
  function nextColor() {
    lastColor = (lastColor + 1) % 2;
    return fillStyles[lastColor];
  }

  this.clear();

  for(var i = 0; i < rheight; i++) {
    var posy = i * cellSize;
    for(var j = 0; j < rwidth; j++) {
      var posx = j * cellSize;

      this.context.fillStyle = '#f8f8f8';
      this.drawSquare(posx, posy, surroundSize);

      if(grid[i][j]) {
        this.context.fillStyle = nextColor();
        this.drawSquare(posx, posy, containedSize);
      }
    }
  }

  return this;
};

GameOfLife.prototype.clear = function() {
  this.context.clearRect(0, 0, this.width, this.height);
};

GameOfLife.prototype.neighboorsAlive = function(x, y) {
  var alive = 0;

  for(var i = -1; i < 2; i++) {
    var testx = (x + i) % this.rwidth;
    for(var j = -1; j < 2; j++) {
      var testy = (y + j) % this.rheight;
      if(this.outofBounds(testx, testy) || (i === 0 && j === 0)) continue;

      var neighboor = this.grid[testy][testx];
      if(neighboor === true) alive += 1;
    }
  }

  return alive;
};

GameOfLife.prototype.outofBounds = function(x, y) {
  return !(x >= 0 && x < this.rwidth && y >= 0 && y < this.rheight);
};

GameOfLife.prototype.step = function() {
  var grid = this.grid;
  var newgrid = this.newgrid;

  for(var i = 0; i < this.rheight; i++) {
    newgrid[i] = [];

    for(var j = 0; j < this.rwidth; j++) {
      var neighboorsAlive = this.neighboorsAlive(j, i);

      if(grid[i][j]) {
        if(neighboorsAlive < 2 || neighboorsAlive > 3) {
          newgrid[i][j] = false;
        } else {
          newgrid[i][j] = grid[i][j];
        }
      } else if(neighboorsAlive === 3) {
        newgrid[i][j] = true;
      }
    }
  }

  this.grid = newgrid;
  this.newgrid = grid;
};

GameOfLife.prototype.drawSquare = function(posx, posy, size) {
  this.context.fillRect(posx, posy, size, size);
};

function repeat(v, n) {
  var ret = new Array(n);
  for(var i = 0; i < n; i++) {
    ret[i] = v;
  }
  return ret;
}

var canvas = document.getElementById('home-canvas');

canvas.height = screen.height;
canvas.width = screen.width;

var game = new GameOfLife(canvas);
game.step();
game.step();
game.redraw();
canvas.onclick = function() {
  if(game.running) {
    game.stop();
  } else {
    game.start();
  }
};

// })();
