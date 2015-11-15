enchant();

/* ゲーム用の定数設定 */
var ScreenWidth = 360
,   ScreenHeight = 480
,   ScreenCenterX = ScreenWidth / 2
,   ScreenCenterY = ScreenHeight / 2;



/* 敵機を生成。カラーはContributionsの色で、位置も受け取る */
var EnemySprite = function(x, y, color) {
    var sprite = new Sprite(20, 20);
    var surface = new Surface(20, 20);

    /* 四角を描画 */
    surface.context.fillStyle = color;
    surface.context.fillRect(0, 0, 20, 20);

    sprite.image = surface;     // surfaceを画像としてセット
    sprite.x = x;
    sprite.y = y;

    return sprite;
}




/* メイン処理 */
window.onload = function() {
    game = new Game(ScreenWidth, ScreenHeight);
    game.preload('../images/bump.png');

    game.onload = function() {
        /* 敵を生成 */
        for( var i=0; i < 8; i++) {
            var enemy = new EnemySprite(i*30, i*30, 'rgb(0, 255, 0)');
            game.rootScene.addChild(enemy);
        }
    }

    game.rootScene.backgroundColor = 'rgb(240, 255, 255)';
    game.start();
}
 




    
