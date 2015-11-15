enchant();

/* ゲーム用の定数設定 */
var ScreenWidth = 780
,   ScreenHeight = 550
,   ScreenCenterX = ScreenWidth / 2
,   ScreenCenterY = ScreenHeight / 2;



/* 敵機を生成。カラーはContributionsの色で、位置も受け取る */
var EnemySprite = function(x, y, color) {
    var sprite = new Sprite(11, 11);
    var surface = new Surface(11, 11);

    /* 四角を描画 */
    surface.context.fillStyle = color;
    surface.context.fillRect(0, 0, 11, 11);

    sprite.image = surface;     // surfaceを画像としてセット
    sprite.x = x;
    sprite.y = y;

    return sprite;
}




/* メイン処理 */
window.onload = function() {
    var contributions = $('.contributions').text();
    contributions = JSON.parse(contributions);

    // console.log(contributions);

    game = new Game(ScreenWidth, ScreenHeight);
    game.preload('../images/bump.png');

    game.onload = function() {
        /* 敵を生成 */
        contributions.forEach(function(c) {
            console.log(c.color);
            var enemy = new EnemySprite(parseInt(c.x), parseInt(c.y), c.color);
            game.rootScene.addChild(enemy);
        });

    }

    game.rootScene.backgroundColor = 'rgb(240, 255, 255)';
    game.start();
}
 




    
