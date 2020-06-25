javascript:(() => {
  var e = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0',
  t = window.open('about:blank').document;
  t.write(\`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Source of ${location.href}</title>
              <link rel=stylesheet href=${e}/themes/prism.min.css>
            </head>
            <body bgcolor=#f5f2f0>
              <script src=${e}/components/prism-core.min.js></script>
              <script src=${e}/plugins/autoloader/prism-autoloader.min.js></script>
              <script src=${e}/plugins/autolinker/prism-autolinker.min.js></script>
            </body>
          </html>\`),
        t.close();
        var r = t.body.appendChild(t.createElement('pre')).appendChild(t.createElement('code'));
        r.className = 'language-html',
        r.appendChild(t.createTextNode(document.documentElement.outerHTML))
      })();