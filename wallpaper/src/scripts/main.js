'use strict';

// handle events
(function () {
    var Menu;

    var global = {
        color: [255, 255, 255],
        alpha: 0.4,
        interval: 1000
    };

    var getColorByGlobal = getColorString.bind(null, global.color, global.alpha);

    var config = {
        color: getColorByGlobal(),
        interval: global.interval,
        initEntropy: 0
    };

    var game = new ConwayLife('canvas', config).start();
    game.reBoard = game.resetBoard();

    game.on('beforeUpdate', function () {
        this.cxt.fillStyle = getColorByGlobal();
        this.draw(this.reBoard);
    });

    game.on('beforeDraw', function () {
        for (var i = 0; i < this.reBoard.length; i++) {
            if (this.reBoard[i]) {
                this.board[i] = this.reBoard[i];
            }
        }
        this.reBoard = this.resetBoard();
    });

    var dragging = false;
    function handleEvent(e) {
        var x = Math.round(e.clientX * game.config.colSize / game.canvas.width);
        var y = Math.round(e.clientY * game.config.rowSize / game.canvas.height);
        game.setCell(game.reBoard, x, y, 1);
    }

    game.canvas.onmousedown = function (e) {
        dragging = true;
        handleEvent(e);
    }

    game.canvas.onmouseup = function (e) {
        dragging = false;
        handleEvent(e);
    }

    game.canvas.onmousemove = function (e) {
        if (!dragging) return;
        handleEvent(e);
    }

    game.canvas.onclick = handleEvent;

    // menu
    Menu = new Vue({
        el: '#menu',

        data: function () {
            return {
                isPaused: false
            };
        },

        methods: {
            pause: function () {
               this.isPaused = game.isPaused = !game.isPaused;
            },

            clear: function () {
                this.isPaused = game.isPaused = true;
                game.board = game.resetBoard();
                game.reBoard = game.resetBoard();
                game.clear();
            }
        }
    });

    // wallpaper engine
    window.wallpaperPropertyListener = {
        applyUserProperties: function(properties) {
            // color
            if (properties.color) {
                var color = properties.color.value.split(' ');
                global.color = color.map(function(c) {
                    return Math.ceil(c * 255);
                });
                game.cxt.fillStyle = getColorByGlobal();
            }

            // alpha
            if (properties.colorAlpha) {
                global.alpha = properties.colorAlpha / 100;
                game.cxt.fillStyle = getColorByGlobal();
            }

            // interval
            if (properties.interval > 0) {
                game.config.interval = global.interval = parseInt(properties.interval);
            }
        }
    };

    // utils
    function getColorString(color, alpha) {
        return 'rgba(' + color.join(',') + ',' + alpha + ')';
    }
})();
