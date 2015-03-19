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
            timeout: options.timeout || 5000,
            speed:   options.speed   || 2000
        };

        var elm = document.querySelector(selector),
            index = 0;

        for (var i = 0; i < elm.childNodes.length; i++) {
            var elmChild = elm.childNodes[i],
                elmImg = elmChild.querySelector('img'),
                elmCaption = createElement('div', 'caption'),
                elmTitle = createElement('span', 'title', elmImg.title),
                elmAlt = createElement('span', 'alt', elmImg.alt);

            elmCaption.appendChild(elmTitle);
            elmCaption.appendChild(elmAlt);

            elmChild.insertBefore(elmCaption, elmChild.firstChild);
        }

        elm.firstChild.classList.add('show-animation');

        setInterval(function () {
            elm.childNodes[index].classList.remove('show-animation');
            index = (index + 1) % elm.childNodes.length;
            elm.childNodes[index].classList.add('show-animation');
        }.bind(this), this.options.timeout);
    }

    return SlideShow;

}));
