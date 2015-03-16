(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.SlideShow = factory();
    }
}(this, function () {

    function createElement(tag, className, text) {
        var elm = document.createElement(tag);
        elm.className = className;
        if (text) elm.appendChild(document.createTextNode(text));
        return elm;
    }

    function SlideShow(selector, options) {
        options = options || {};
        this.options = {
            timeout: options.timeout || 3000,
            speed:   options.speed   || 400
        };

        var elm = document.querySelector(selector);

        for (var i = 0; i < elm.childNodes.length; i++) {
            var elmChild = elm.childNodes[i],
                elmImg = elmChild.getElementsByTagName('IMG')[0],
                elmCaption = createElement('div', 'caption'),
                elmTitle = createElement('span', 'title', elmImg.title),
                elmAlt = createElement('span', 'alt', elmImg.alt);

            elmCaption.appendChild(elmTitle);
            elmCaption.appendChild(elmAlt);

            elmChild.insertBefore(elmCaption, elmChild.firstChild);
        }

        elm.appendChild(elm.firstChild).classList.add('fade-in');

        setInterval(function () {
            // Fade out the current sldie
            elm.lastChild.classList.remove('fade-in');

            // Move next slide up and delay for animation to run
            var elmNext = elm.firstChild;
            elm.appendChild(elmNext);
            elmNext.classList.add('fade-in-setup');
            setTimeout(function () {
                elmNext.classList.add('fade-in');
            }, 100);

            // Clean up animations
            setTimeout(function () {
                elmNext.classList.remove('fade-in-setup');
            }, this.options.timeout);
        }.bind(this), this.options.timeout);
    }

    return SlideShow;

    $.fn.slideshow = function(options) {
        options = $.extend({
            'timeout': 3000,
            'speed': 400 // 'normal'
        }, options);
        // We loop through the selected elements, in case the slideshow was called on more than one element e.g. `$('.foo, .bar').slideShow();`
        return this.each(function() {
            // Inside the setInterval() block, `this` references the window object instead of the slideshow container element, so we store it inside a var
            var $elem = $(this);
            // Create a caption element for each slide
            $elem.children().each(function() {
                $img = $('img', this);
                $(this).prepend('<div class="caption"><span class="title">' + $img.attr('title') + '</span><span class="alt">' + $img.attr('alt') + '</span></div>');
            });
            // Show the first element and its caption
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

}));
