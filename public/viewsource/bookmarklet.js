javascript:(function(){
    var w = window.open('about:blank'),
        d = w.document;
    d.write('<!DOCTYPE html><html><head><title>Loading Source</title></head><body></body></html>');
    d.close();
    var f = d.createElement('form');
        f.setAttribute('method','post');
        f.setAttribute('action','https://ole.michelsen.dk/viewsource/?uri='+encodeURIComponent(location.href));
    var i = d.createElement('input');
        i.setAttribute('type','hidden');
        i.setAttribute('name','DOM');
        i.setAttribute('value',encodeURIComponent(document.documentElement.innerHTML));
    d.body.appendChild(f).appendChild(i);
    f.submit();
})();