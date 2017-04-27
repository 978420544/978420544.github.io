var jade = require('jade');
var markdown = require('marked');

hexo.extend.helper.register('formatArray', function(array) {
	if(array && array.length !== undefined) {
		return array;
	} else if(array) {
		return [array];
	} else {
		return [];
	}
});

hexo.extend.helper.register('renderJade', function(source) {
	return jade.render(source);
});

hexo.extend.helper.register('renderMarkdown', function(source) {
	return markdown(source);
});

hexo.extend.helper.register('commentKey', function(post) {
	var commentKey = post.raw.match(/comment_key: ?(.*)/);
	var duoshuoId = post.raw.match(/duoshuo_id: ?(.*)/);
	var permalink = post.raw.match(/permalink: ?(.*)/);

	return(commentKey && commentKey[1]) || (duoshuoId && duoshuoId[1]) || (permalink && permalink[1]);
});

hexo.extend.helper.register('sourceOfPost', function(post, sourceUrl) {
	return sourceUrl + encodeURIComponent(post.source);
});

hexo.extend.helper.register('fixPaginator', function(html) {
	return html.replace(/\/\//g, '/');
});
hexo.extend.helper.register('page_excerpt', function(post) {
	var p = post ? post : this.page;
	var excerpt = p.excerpt;
	if(!excerpt) {
		var pos = p.content.indexOf('</p>');
		if(pos > 0) {
			excerpt = p.content.substring(0, pos) + "<a href='" + p.permalink + "' style='white-space:nowrap;'>全文↓</a>";
		}
	}
	return excerpt;
});
hexo.extend.helper.register('site_archive_tree', function(site) {
	var lastYear;
    var lastMonth;
    var html='';
	var posts=site.posts.sort('date', 'desc').each(function(post){
		var currentYear = post.date.year();
		var currentMonth = post.date.format('MM');
		if (lastYear != currentYear) {
			if (lastYear != null) {
				html+='</div>';
				lastMonth = null;
			}
			lastYear = currentYear
			html+='<div class="archive archive-year box" data-date="'+post.date.year()+'"><h4 class="archive-title"><a class="link-unstyled" href="/archives/' + currentYear+'">'+ currentYear +'</a></h4>';
		}
		if (lastMonth != currentMonth) {
			if (lastMonth != null) { 
				html+='</ul>';
			}
			html+='<ul class="archive-posts archive-month" data-date="'+post.date.format('YYYYMM') +'"><h5 class="archive-title"><a class="link-unstyled" href="/archives/' + post.date.format('YYYY/MM') +'">'+ post.date.format("MMMM") +'</a></h5>';
			lastMonth = currentMonth;
		}
		html+='<li class="archive-post archive-day" data-date="'+post.date.format('YYYYMMDD')+'"><a class="archive-post-title" href="/'+post.path +'">'+ post.title +'</a><span class="archive-post-date">' + post.date.format('YYYY.MM.DD') +'</span> </li>';
	});
	return html;
});