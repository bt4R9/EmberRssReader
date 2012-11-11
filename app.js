(function($) { 

	$.ajaxSetup({
		beforeSend: function() {
			$('<div>', {
				'id': 'blockui'
			}).css({
				'width': screen.width,
				'height': screen.height,
				'background': '#fff',
				'opacity': 0.85,
				'left': 0,
				'top': 0,
				'display': 'none'
			}).fadeIn(250).appendTo($('body'));
			
			$('<img>', {
				'src': 'loading.gif'
			}).css({
				'position': 'absolute',
				'left': screen.width/2 - 64,
				'top': screen.height/2 - 100
			}).appendTo($('#blockui'));
			$('body').css('overflow', 'hidden');
		},
		complete: function() {
			$('#blockui').fadeOut(250, function() {
				$('#blockui').remove();
				$('body').css('overflow', 'auto');
			});
		}
	});


	App = Em.Application.create();

	/*
	 * Controllers
	 */

	App.rssController = Em.ArrayController.create({
		content: [],
		url: '',
		loadRss: function() {
			var self = this;
			var corsGate = 'http://rss2json.yua-737.locum.ru/rss.php';
			var url = self.get("url");
			var urlSample = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

			if (urlSample.test(url)) {
			
				App.RecentRss.addRss(url);

				$.ajax({
					url: corsGate + '?url=' + url,
					dataType: 'xml',
					crossDomain: true,
					success: function(data) {
						self.set('content', []);
						var rss = $(data);
						var items = [];
						
						App.rssItems.set('content', []);
						
						$.each(rss.find('channel > item'), function() {

							var object = App.rssItemsModel.create({
								title: $(this).find('title').text(),
								descr: $(this).find('description').text().replace(/(<([^>]+)>)/ig, ''),
								link: $(this).find('link').text(),
								date: $(this).find('pubDate').text()
							});
							App.rssItems.pushObject(object);
							
						});
						
						var rssChannel = App.rssChannel.create({
							title: rss.find('channel > title').text(),
							image: rss.find('channel > image > url').text()
						});

						self.pushObject(rssChannel);

					}
				});
				
			}
			
		}
	});
	
	App.RecentRss = Em.ArrayController.create({
		content: [],
		addRss: function(url) {
			if ( this.contains(url) ) this.removeObject(url);
			this.pushObject(url);
		},
		removeRss: function(view){
			this.removeObject(view.context);
		},
		viewAgain: function(view) {
			App.rssController.set('url', view.context);
			App.rssController.loadRss();
		},
		reverse: function(){
			return this.toArray().reverse();
		}.property('@each')
	});
	
	App.rssItems = Em.ArrayController.create({
		content: []
	});
	
	/*
	 * Models
	 */
	 
	App.rssChannel = Em.Object.extend({
		title: null,
		image: null,
		items: null
	});

	App.rssItemsModel = Em.Object.extend({
		title: null,
		descr: null,
		link: null,
		date: null
	});
	
	/*
	 * Views
	 */
	App.SearchRssField = Em.TextField.extend({
		insertNewline: function() {
			App.RssController.loadRss();
		}
	});


})(jQuery);