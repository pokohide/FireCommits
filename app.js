var express = require('express')
,	https = require('https')
,	parseString = require('xml2js').parseString
,	async = require('async')
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
				width = result.svg.$.width,
				height = result.svg.$.height;
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
					console.log(contributions);
					callback(contributions);
				});



			});
		});
	}).on('error', function(e) {
		res.render('index', { message: "githubアカウントの草が取得できません。" });
  	});

};




app.get('/', function(req, res) {

	getGitHubData('hyde2able', function(contributions) {
		res.render('index', {contributions: contributions});
	});

	return;

	if( !req.query.username ) {
		res.render('index');
		return;
	}

    var name = req.query.username;


	promise.then(function(results) {
		var returning = []
		,	validNames = [];

		names.forEach(function(name, i) {
			if (results[i] != 'invalid') {
				returning.push({ key: name, value: results[i].value });
				validNames.push(name);
			}
		});

		res.render('index', {
			calendarData: returning,
			names: validNames
		});
	}).fail(function() {
		res.render('index');
	});

});


app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

