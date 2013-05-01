/* Based on http://mths.be/slideshow v1.0.0 by @mathias */
;(function($) {
	$.fn.slideshow = function(options) {
		options = $.extend({
			'timeout': 3000,
			'speed': 400
		}, options);

		return this.each(function() {
			var $elem = $(this);

			// Create a caption element for each slide
			$elem.children().each(function() {
				$img = $('img', this);
				$(this).prepend('<div class="caption"><span class="title">' + $img.attr('title') + '</span><span class="alt">' + $img.attr('alt') + '</span></div>');
			});
			
			// Show the first element and it's caption
			$elem.children().eq(0).appendTo($elem).show()
				.children('.caption').show();

			// Iterate through the slides
			setInterval(function() {
				$next = $elem.children().eq(0);
				
				// Hide current caption, and display the next, each running in half the time of the slide change
				$('.caption', $elem.children().last()).slideToggle(options.speed / 2, function () { 
					$('.caption', $next).slideToggle(options.speed / 2); 
				});	
				
				// Hide the current slide and append it to the end of the image stack
				$next.hide().appendTo($elem)
					// Fade in the next slide
					.fadeIn(options.speed);

			}, options.timeout);
		});
	};
}(jQuery));