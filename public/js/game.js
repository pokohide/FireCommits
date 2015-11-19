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
};
/* コミット数と草の色からそのcontributionの強さを返す */
function strength(color, count) {
    var ret = RandColor[color] - 30 / (1.0 + Math.exp(-count / 25.0));
    return parseInt(ret);
};
/* コミット数と草の色からスコアを返す */
function getScore(color, count) {
    var ret = 1000 - RandColor[color] + 100 / (1.0 + Math.exp(-count / 25.0));
    return parseInt(ret);
};

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
        this.count = count;
        this.strength = strength(color, count);
        this.life = LifeColor.indexOf(color);    // 色によって定められたライフ値を持つ。

        this.x = x; this.y = y; this.frame = 3; this.time = 0;

        this.addEventListener('enterframe', function() {
            /* 一度でもプライヤーを動かしたら撃ってくるように */
            if( game.started && rand(this.strength) == 0 ){
                var s = new EnemyShoot(this.x, this.y);
            }
            /* strengthのフレームごとに消えたりするようにする？ */
            // this.opacity = Math.random() * 100;

        });
        playingGame.addChild(this);
    },
    remove: function() {
        playingGame.removeChild(this);
        delete enemies[this.key];  delete this;
    }
});

/* 自機を生成。 */
var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y) {
        enchant.Sprite.call(this, 50, 20);
        this.image = game.assets['../images/player' + playID + '.png'];     // 画像を読み込む
        this.x = x; this.y = y; this.frame = 0;

        var s = new PlayerShoot(x, y);
        this.addEventListener('enterframe', function(){
            /* 8フレームごとに発射 */
            if(game.frame % 8 == 0){ 
                var s = new PlayerShoot(player.x + 20, player.y - 10); 
            }
            if( this.x < 0 ) this.x = 0;
            if( this.x + 50 > ScreenWidth) this.x = ScreenWidth - 50;
        });
        playingGame.addChild(this);
    },
    remove: function(){ playingGame.removeChild(this); delete this; }
});

/* バリアを定義 */
var Barrier = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y) {
        enchant.Sprite.call(this, 50, 10);

        var surface = new Surface(50, 10);
        surface.context.fillStyle = '#9A8F8F';
        surface.context.fillRect(0, 0, 50, 10);
        this.image = surface;
        this.life = 10; this.frame = 1;
        this.x = x; this.y = y;

        /* 寿命あり */
        this.addEventListener('enterframe', function() {
            if(this.frame % 1000 == 0) this.remove();
        });
        playingGame.addChild(this);

    },
    remove: function(){ barriered = false; playingGame.removeChild(this); delete this; }
});


/* 弾を定義 */
var Shoot = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, direction) {
        enchant.Sprite.call(this, 10, 10);
        /* 自機と敵機で弾を変える */
        if( direction > 0) {
            this.image = game.assets['../images/shot' + playID + '.png'];
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
        playingGame.addChild(this);
    },
    remove: function(){ playingGame.removeChild(this); delete this; }
});

/* プレイヤーの弾を定義 */
var PlayerShoot = enchant.Class.create(Shoot, {
    initialize: function(x, y){
        Shoot.call(this, x, y, Math.PI);
        this.addEventListener('enterframe', function() {
            for(var i in enemies) {
                if(enemies[i].intersect(this)) {
                    this.remove();
                    game.score += getScore(enemies[i].color, enemies[i].count);
                    /* 草に当たったら色が変わってライフが減る。ライフが0になれば、死ぬ */
                    if(--enemies[i].life === 0){
                        enemies[i].remove();
                    } else {
                        var surface = new Surface(11, 11);
                        enemies[i].color = LifeColor[enemies[i].life];
                        surface.context.fillStyle = enemies[i].color;
                        surface.context.fillRect(0, 0, 11, 11);
                        enemies[i].image = surface;
                    }
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
            // if(player.within(this, 8)) { 
            if(player.intersect(this)) {
                GameOverScene();
                game.pause();
                // playingGame.end(game.score, "SCORE: " + game.score + "points." );
            }

            if(barriered && barrier.intersect(this)) {
                this.remove();
                if( barrier.life-- == 0 ){
                    barrier.remove();
                } 
            }

        })
    }
});

/* タイトルシーン */
var PushTitleScene = function() {
    var TitleScene = new Scene();
    TitleScene.backgroundColor = 'rgb(240, 255, 255)';
    game.pushScene(TitleScene);     // rootScene - TitleScene

    var FireCommits = new Label("FireCommits");
    FireCommits.font = "32px 'Consolas', 'Monaco', 'MS ゴシック'";
    FireCommits.moveTo((ScreenWidth - FireCommits._boundWidth)/2, ScreenCenterY - 100);
    TitleScene.addChild(FireCommits);
    
    var howto = new Label("スペースを押すと、ゲーム開始");
    howto.moveTo((ScreenWidth - howto._boundWidth)/2, ScreenCenterY + 50);
    howto.font = "14px, 'Consolas'";
    TitleScene.addChild(howto);

    var usage = new Label("左キー: 左に移動    右キー: 右に移動");
    usage.moveTo((ScreenWidth - usage._boundWidth)/2, ScreenCenterY + 100);
    usage.font = "14px, 'Consolas'";
    TitleScene.addChild(usage);

    game.keybind(32, 'space');      // spaceを割り当てる
    // スペースをクリックしたらゲーム開始
    TitleScene.addEventListener('spacebuttondown', function() {
        GameScene();
    });
};

/* ゲームシーン */
var GameScene = function(next) {
    playingGame = new Scene();
    playingGame.backgroundColor = 'rgb(240, 255, 255)';

    /* ゲームシーンはルートシーン上に */
    game.replaceScene(playingGame);

    /* プレイヤーを生成 */
    player = new Player(ScreenCenterX, ScreenHeight - 40);
    /* 敵を生成 */
    if(contributions) {
        contributions.forEach(function(c) {
            var enemy = new Enemy(parseInt(c.x) + 7, parseInt(c.y) + 30, c.color, c.count);
            enemy.key = i; enemies[i++] = enemy;
        })
    };

    barriered = false;
    playingGame.addEventListener('enterframe', function() {
        if(game.input.right) player.x += 10; game.started = true;
        if(game.input.left)  player.x -= 10; game.started = true;

        if(game.input.up && game.score > 10000) {
            game.score -= 10000; 
            barrier = new Barrier(player.x, player.y - 20);
            barriered = true;
        }

    });

    /* スコア */
    var score = new Label();
    score.moveTo()
    score.x = score.y = 2;  score.text = "Score: 0";
    score.addEventListener('enterframe', function() {
        this.text = "Score: " + game.score;
    });
    playingGame.addChild(score);

    /* タイム */
    var time = new Label();
    time.x = ScreenCenterX; time.y = 2;
    time.addEventListener('enterframe', function() {
        this.text = "Time: " + parseInt(game.frame / game.fps) + "s";
    });
    playingGame.addChild(time);
};

/* クリアシーン */
var ClearScene = function() {
    var ClearScene = new Scene();
    game.popScene(ClearScene);
    var clearMessage = new Label("white");
    clearMessage.font = "20px, 'Consolas', 'Monaco'";
    clearMessage.text = "You beat ";
    clearMessage.x = 10;    clearMessage.y = 10;
    ClearScene.addChild(clearMessage);

    var user = new Sprite(40, 40);
    user.image = game.assets[image];
    user.x = 30;    user.y = 30;  
    user.scale(0.5, 0.5);  
    ClearScene.addChild(user);

    // var score = new Label("white");



};

/* ゲームオーバーシーン */
var GameOverScene = function() {
    var gameover = new Label("white");
    gameover.font = "32px 'Consolas', 'Monaco', 'MS ゴシック'";
    gameover.text = "Game Over!!";
    gameover.moveTo((ScreenWidth - gameover._boundWidth)/2, ScreenCenterY);
    playingGame.addChild(gameover);

    game.keybind(32, 'space');      // spaceを割り当てる
    // スペースをクリックしたらゲーム開始
    playingGame.addEventListener('spacebuttondown', function() {
        /* 自機、敵機を全て削除・初期化 */
        player.remove();
        enemies = [];
        for(var i in enemies){ enemies[i].remove(); }
        game.frame = 0; game.score = 0;
        GameScene();
        game.resume();
    });
    // var tweet = new Label("white");
    // tweet.y = ScreenCenterX - 30;
    // tweet.y = ScreenCenterY + 30;
    // tweet.text = "Tweetする";
    // tweet._element.style.cursor = "pointer";
    // tweet.addEventListener('touch_start', function() {
    //     var EUC = encodeURIComponent;
    //     var twiiter_url = "http://twitter.com/?status=";
    //     var message = "あなたのスコアは " + game.score + " point です。";
    //     location.href = twitter_url + EUC(message);
    // });
    // game.rootScene.addChild(tweet);

};


/*
 *      メイン処理
 */
window.onload = function() {
    contributions = $('.contributions').text();
    image = $('.image').text();

    contributions = JSON.parse(contributions);

    game = new Game(ScreenWidth, ScreenHeight);
    /* game設定 */
    game.preload(['../images/player0.png', '../images/player1.png', '../images/player2.png', '../images/player3.png', '../images/player4.png', '../images/player5.png', '../images/shot0.png', '../images/shot1.png', '../images/shot2.png', '../images/shot3.png', '../images/shot4.png', '../images/shot5.png', '../images/enemy.png', '../images/enemyshot.png', image]);
    game.score = 0;
    game.fps = 24;
    game.started = false;

    game.onload = function() {
        enemies = [], i = 0;
        playID = rand(6);
        PushTitleScene();
    }
    game.start();
}
 




    
