enchant();

/* ゲーム用の定数設定 */
var ScreenWidth = 700
,   ScreenHeight = 550
,   ScreenCenterX = ScreenWidth / 2
,   ScreenCenterY = ScreenHeight / 2;

var LifeColor = ['death', '#eeeeee', '#d6e685', '#8cc665', '#44a340', '#1e6823'];
var RandColor = {'#eeeeee': 500, '#d6e685': 300, '#8cc665': 200, '#44a340': 100, '#1e6823': 50 };

function rand(num){
    return Math.floor(Math.random() * num);
}
/* コミット数と草の色からそのcontributionの強さを返す */
function strength(color, count){
    var ret = RandColor[color] - 30 / (1.0 + Math.exp(-count / 25.0));
    return parseInt(ret);
}

/* 敵機を生成。 */
var Enemy = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, color, count) {
        enchant.Sprite.call(this, 11, 11);

        /* Enemyの草を描画 */
        var surface = new Surface(11, 11);
        surface.context.fillStyle = color;
        surface.context.fillRect(0, 0, 11, 11);
        this.image = surface;
        this.color = color;
        this.strength = strength(color, count);
        this.life = LifeColor.indexOf(color);    // 色によって定められたライフ値を持つ。

        this.x = x; this.y = y; this.frame = 3; this.time = 0;

        this.addEventListener('enterframe', function() {
            if( rand(this.strength) == 0 ){   // 1/100で敵が打つ
                 var s = new EnemyShoot(this.x, this.y);
            }
            // this.opacity = Math.random() * 100;
            if( this.y > ScreenHeight || this.x > ScreenWidth || this.x < -this.width || this.y < -this.height) {
                this.remove()   // 画面外に出たら自爆する
            } else if (this.time++ % 10 == 0) {
                // var s = new EnemyShoot(this.x, this.y); // 10フレームに一回打つ
            }

        });
        game.rootScene.addChild(this);
    },
    remove: function() {
        game.rootScene.removeChild(this);
        delete enemies[this.key];  delete this;
    }
});

/* 自機を生成。 */
var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function(x,y) {
        enchant.Sprite.call(this, 50, 20);      // 自機をスプライトとして定義
        this.image = game.assets['../images/player.png'];     // 画像を読み込む
        this.x = x; this.y = y; this.frame = 0;

        var s = new PlayerShoot(x, y);
        this.addEventListener('enterframe', function(){
            /* 8フレームごとに発射 */
            if(game.frame % 8 == 0){ 
                var s = new PlayerShoot(player.x + 20, player.y - 10); 
            }
        });
        game.rootScene.addChild(this);
    }
});

/* 弾を定義 */
var Shoot = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, direction) {
        enchant.Sprite.call(this, 10, 10);
        /* 自機と敵機で弾を変える */
        if( direction > 0) {
            this.image = game.assets['../images/shot.png'];
        } else {
            this.image = game.assets['../images/enemyshot.png'];
        }
        this.x = x; this.y = y; this.frame = 1;
        this.direction = direction; this.moveSpeed = 10;
        this.addEventListener('enterframe', function() {    // 弾をまいフレーム動かす
            this.x += this.moveSpeed * Math.sin(this.direction);
            this.y += this.moveSpeed * Math.cos(this.direction);
            if(this.y > ScreenHeight || this.x > ScreenWidth || this.x < -this.width || this.y < -this.height){
                this.remove();
            }
        });
        game.rootScene.addChild(this);
    },
    remove: function(){ game.rootScene.removeChild(this); delete this; }
});

/* プレイヤーの弾を定義 */
var PlayerShoot = enchant.Class.create(Shoot, {
    initialize: function(x, y){
        Shoot.call(this, x, y, Math.PI);
        this.addEventListener('enterframe', function() {
            for(var i in enemies) {
                if(enemies[i].intersect(this)) {
                    this.remove();
                    // var blast = new Blast(enemies[i].x, enemies[i].y);

                    /* 草に当たったら色が変わってライフが減る。ライフが0になれば、死ぬ */
                    if(--enemies[i].life === 0){
                        enemies[i].remove();
                    } else {
                        var surface = new Surface(11, 11);
                        this.color = LifeColor[enemies[i].life];
                        surface.context.fillStyle = this.color;
                        surface.context.fillRect(0, 0, 11, 11);
                        enemies[i].image = surface;
                    }
                    // game.score += 100;
                }
            }
        });
    }
});

/* 敵の弾を定義 */
var EnemyShoot = enchant.Class.create(Shoot, {
    initialize: function(x, y) {
        Shoot.call(this, x, y, 0);
        this.addEventListener('enterframe', function() {    // プレイヤーに当たったらゲームオーバーに
            //if(player.within(this, 8)) { 
            if(player.intersect(this)) {
                game.end(game.score, "SCORE: " + game.score );
            }
        })
    }
});

/* 破壊エフェクト */
var Blast = enchant.Class.create(enchant.Sprite,{
    initialize: function(x, y){
        enchant.Sprite.call(this, 16, 16);
        this.x        = x;
        this.y        = y;
        this.image    = game.assets[BLAST];
        this.time     = 0;
        this.duration = 20;
        this.frame    = 0;
        game.rootScene.addChild(this);
    },
    onenterframe:function(){
        this.time++;
        this.frame = Math.floor(this.time/this.duration *5);
        if(this.time == this.duration) this.remove();
    },
    remove: function(){
        game.rootScene.removeChild(this);
    }
});


/*
 *      メイン処理
 */
window.onload = function() {
    var contributions = $('.contributions').text();
    contributions = JSON.parse(contributions);

    game = new Game(ScreenWidth, ScreenHeight);
    /* game設定 */
    game.preload(['../images/player.png', '../images/shot.png','../images/enemy.png', '../images/enemyshot.png']);
    game.score = 0;
    game.fps = 24;
    game.touched = false;



    game.onload = function() {
        player = new Player(ScreenCenterX, ScreenHeight - 40);//プレイヤーを作成する
        var enemies = [], i = 0;

        game.rootScene.backgroundColor = 'rgb(240, 255, 255)';

        /* 敵を生成 */
        if(contributions) {
            contributions.forEach(function(c) {
                var enemy = new Enemy(parseInt(c.x), parseInt(c.y) + 20, c.color, c.count);
                enemy.key = i; enemies[i++] = enemy;
            })
        };

        game.addEventListener('enterframe', function() {
            if(game.input.right) {
                player.x += 10;
            }
            if(game.input.left) {
                player.x -= 10;
            }
        });
        // scoreLabel.score = game.score;
        // scoreLabel = new ScoreLabel(8, 8);
        // game.rootScene.addChild(scoreLabel);

    }
    game.start();
}
 




    
