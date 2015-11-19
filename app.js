var express = require('express')
,	https = require('https')
,	csv = require('ya-csv')
,	parseString = require('xml2js').parseString
,	async = require('async')
,	client = require('cheerio-httpcli')
,	app = express();


/* appの設定 */
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

/* githubの草のオブジェクト */
function contribution(x, y, color, count, date){
  this.x = x;
  this.y = y;
  this.count = count;
  this.color = color;
  this.date = date;
}

/* usernameのContributionsをの色と位置を配列で取得する */
var getGitHubData = function(name, callback) {
    var url = 'https://github.com/users/' + name + '/contributions';
    var width, hegiht, contributions = [];
    
	https.get(url, function(res) {
		var body = '';
		res.on('data', function(chunk) {
    		body += chunk;
    		// bodyはxml形式
		});

		res.on('end', function() {
			parseString(body, function(err, result) {
				// width = result.svg.$.width,
				// height = result.svg.$.height;
				data = result.svg.g[0].g;

				// 並行実行
				async.forEach(data, function(datum, callback) {
					x = datum.$.transform.match(/\d+/)[0];
					datum.rect.forEach( function(rect) {
						y = rect.$.y;
						color = rect.$.fill;
						count = rect.$['data-count'];
						date = rect.$['data-date'];
						
						kusa = new contribution(x, y, color, count, date);
						contributions.push(kusa);
					});
					callback();
				}, function(err) {
					if( err ) console.log(err);
					// console.log(contributions);
					getGitHubImage(name, function(avatar, contrib_number) {
    					callback(contributions, avatar, contrib_number);
    				});
				});
			});
		});
	}).on('error', function(e) {
		console.log(e.message);
		callback(null, null, null, e);
  	});

};

/* nameからその人の画像とコントリビューション数を取得 */
var getGitHubImage = function(name, callback) {
	var url = "https://github.com/" + name;

	client.fetch(url, function(err, $, res) {
		contrib_number = $('.contrib-column-first .contrib-number').text();
		avatar = $('.avatar').attr('src');

		callback(avatar, contrib_number);
	});
};

/* ランキングcsvを取得 */
var readRanking = function(file) {
	var reader = csv.createCsvFileReader(file);
	var ranking = [];

	/* username, image, contributionsの順 */
	reader.on('data', function(record) {
		ranking.push(record);
	}).on('end', function() {
		console.log(ranking);
	});
};

/* ランキングcsvを更新 */
var writeRanking = function(file) {
	var writer = csv.createCsvFileWriter(file);
};

app.get('/', function(req, res) {
	readRanking('./ranking.csv');
	if( !req.query.username ) {
		res.render('index', {ok: false} );
		console.log('nothing');
		return;
	}
	var name = req.query.username;

	try{
		getGitHubData(name, function(contributions, image, count, e) {
			if(e){ res.render('index', {ok: false, message: e.message}); }
			res.render('index', {ok: true, contributions: JSON.stringify(contributions), name: name, image: image, count: count });
		});
	} catch(e) {
		console.log(e.message);
		res.render('index', {ok: false} );
	}

	return;
});


app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

