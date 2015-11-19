$(function() {

	/* githubをクリックしたら */
	$(document).on('click', '#github', function() {
		var name = $(this).find('#name').text();
		$('#username').val(name);
	});

	$.ajax({
		url: 'csv/ranking.csv',
		success: function(result) {
			ranking = [];
			result = result.split(/\r\n|\r|\n/);
			/* username, image, contributions, score */
			for(var i in result) {
				ranking.push(result[i].split(','));
			}

    		for(var i in ranking) {
    			var name = ranking[i][0];
    			var image = ranking[i][1];
    			var contributions = ranking[i][2];
    			var score = ranking[i][3];
    			var html = "<li class='menu-item github' id='github'><img class='avatar left' src='" + image + "' width='40' height='40'>";
    			html += "<p class='text-center'><b id='name'>" + name + "</b><span class='counter'>" + contributions + " total</span></p>";
				html += "<p>Score: " + score + "</p></li>";
    			$('#githubs').append(html);
    		}
		}
	});




});