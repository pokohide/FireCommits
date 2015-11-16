enchant();

/* ゲーム用の定数設定 */
var ScreenWidth = 700
,   ScreenHeight = 550
,   ScreenCenterX = ScreenWidth / 2
,   ScreenCenterY = ScreenHeight / 2;

/* 敵機を生成。 */
var Enemy = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, color) {
        enchant.Sprite.call(this, 11, 11);

        /* Enemyの草を描画 */
        var surface = new Surface(11, 11);
        surface.context.fillStyle = color;
        surface.context.fillRect(0, 0, 11, 11);
        this.image = surface;

        this.x = x; this.y = y; this.frame = 3; this.time = 0;

        /* まだ今回は草を動かさないので未定 */
        // this.omega = (160 > y ? 1 : -1); this.direction = 0; this.moveSpeed = 3;
        // this.move = function() {
        //     this.direction += Math.PI / 180 * this.omega;
        //     this.x -= this.moveSpeed * Math.cos(this.direction);
        //     this.y += this.moveSpeed * Math.sin(this.direction);
        // };
        this.addEventListener('enterframe', function() {
            //this.move();
            if( this.y > ScreenHeight || this.x > ScreenWidth || this.x < -this.width || this.y < -this.height) {
                this.remove()   // 画面外に出たら自爆する
            } else if (this.time++ % 10 == 0) {
                var s = new EnemyShoot(this.x, this.y); // 10フレームに一回打つ
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
        enchant.Sprite.call(this, 40, 16);      // 自機をスプライトとして定義
        this.image = game.assets['../images/player.png'];     // 画像を読み込む
        this.x = x; this.y = y; this.frame = 0;

        var s = new PlayerShoot(x, y);
        this.addEventListener('enterframe', function(){
            if(/*game.touched &&*/ game.frame % 3 == 0){ 
                //console.log('打たれたはず');
                var s = new PlayerShoot(this.x, this.y); 
                //console.log(s);
            }
        });

        game.rootScene.addChild(this);
    }
});

/* 弾を定義 */
var Shoot = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, direction) {
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['../images/shot.png'];
        this.x = x; this.y = y; this.frame = 1;
        this.direction = direction; this.moveSpeed = 3;
        this.addEventListener('enterframe', function() {    // 弾をまいフレーム動かす
            this.x += this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);
            if(this.y > ScreenHeight || this.x > ScreenWidth || this.x < -this.width || this.y < -this.height){
                this.remove();
            }
        });
    },
    remove: function(){ game.rootScene.removeChild(this); delete this; }
});

/* プレイヤーの弾を定義 */
var PlayerShoot = enchant.Class.create(Shoot, {
    initialize: function(x, y){
        Shoot.call(this, x, y, Math.PI);
        this.addEventListener('enterframe', function() {
            for(var i in enemies) {
                if(enemies[i].intersect(this)) {     // 敵に当たったら、敵を消してスコアを足す
                    /* ここを当たってから当たった相手のライフを一つ減らして色を変えて、0だったら破壊するようにする */
                    this.remove();
                    // enemies[i].remove();
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
            if(player.within(this, 8)){ game.end(game.score, "SCORE: " + game.score )}
        })
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
    game.preload(['../images/player.png', '../images/shot.png']);
    game.score = 0;
    game.fps = 24;



    game.onload = function() {
        player = new Player(ScreenCenterX, ScreenHeight - 40);//プレイヤーを作成する
        enemies = [];

        game.rootScene.backgroundColor = 'rgb(240, 255, 255)';

        /* 敵を生成 */
        if(contributions) {
            contributions.forEach(function(c) {
                var enemy = new Enemy(parseInt(c.x), parseInt(c.y) + 20, c.color);
                enemy.key = game.frame; enemies[game.frame] = enemy;
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
 




    
