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
        options = {
            timeout: options && options.timeout || 5000
        };

        var index = 0;
            elm = document.querySelector(selector);
            elm.classList.add('preload');

        // Create caption elements from image properties
        for (var i = 0; i < elm.childNodes.length; i++) {
            var elmChild = elm.childNodes[i],
                elmImg = elmChild.querySelector('img')
            if (elmImg.title) {
                var elmCaption = createElement('div', 'caption');
                elmCaption.appendChild(createElement('span', 'title', elmImg.title));
                elmCaption.appendChild(createElement('span', 'alt', elmImg.alt));
                elmChild.appendChild(elmCaption);
            }
        }

        // Show the first slide
        elm.firstChild.classList.add('show-animation');

        // Remove preload class to enable transition animations
        setTimeout(function () {
            elm.classList.remove('preload');
        });

        // Start the slidehshow
        setInterval(function () {
            elm.childNodes[index].classList.remove('show-animation');
            index = (index + 1) % elm.childNodes.length;
            elm.childNodes[index].classList.add('show-animation');
        }, options.timeout);
    }

    return SlideShow;

}));
