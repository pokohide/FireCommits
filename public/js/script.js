$(function() {

	/* githubをクリックしたら */
	$(document).on('click', '#github', function() {
		var name = $(this).find('#name').text();
		$('#username').val(name);
	});



	var milkcocoa = new MilkCocoa('readih652j8r.mlkcca.com');
	var ranking;
    milkcocoa.dataStore('ranking').stream().size(5).sort('desc').next(function(err, data) {
    	data.sort(function(a,b) {
    		if(a.value.score < b.value.score) return -1;
    		if(a.value.score > b.value.score) return 1;
    		return 0;
    	});
    	data.forEach(function(datum) {
    		datum = datum.value;
    		var name = datum.name
    		,	image = datum.image
    		,	contributions = datum.count
    		,	score = datum.score;

    		var html = "<img class='avatar left' src='" + image + "' width='40' height='40'>";
    		html += "<p class='text-center'><b id='name'>" + name + "</b><span class='counter'>" + contributions + " total</span></p>";
			html += "<p class='right'><strong>" + score + "</strong> pt</p>";

 			$github = $('<li></li>', {
 				addClass: 'menu-item github',
 				id: 'github',
 				html: html
 			});
 			$github.appendTo("#githubs").hide().fadeIn(1000);
 		});
    });

});