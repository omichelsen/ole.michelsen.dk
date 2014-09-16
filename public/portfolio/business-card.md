For kicks I've designed a business card for myself, mostly because I wanted to try out a real world application of QR codes. Whenever you receive a card from anybody you would actually like to contact again, you have to arduously enter his/her information. With a QR code you can scan the card and immediately send the [vCard](http://en.wikipedia.org/wiki/VCard) to your phone address book.

<div class="column-left c">
    [![Front](/portfolio/business-card/card-front.svg)](/portfolio/business-card/card-front.svg)

_Front_
</div>
<div class="column-right c">
    [![Back](/portfolio/business-card/card-back.svg)](/portfolio/business-card/card-back.svg)

_Back_
</div>

For my further amusement I also decided to create the cards using SVG. With no decent editor on hand, and since I wanted to familiarize myself with the standard, I decided to write them by hand (not withstanding the QR code, which was [created with a tool](http://www.quickmark.cn/en/qrcode-datamatrix-generator/?qrVCard)). The result is fairly simple, but very scalable and portable.

```svg
<svg width="1600" height="960" xmlns="http://www.w3.org/2000/svg">
<g>
    <rect x="0" y="0" width="1600" height="20" fill="#b00" />
    <rect x="0" y="20" width="1600" height="5" fill="#eee" />
    <rect x="1200" y="10" rx="10" ry="10" width="300" height="80" fill="#b00" />
    <text x="1350" y="60" fill="#fff" style="font:100 30 'Helvetica Neue'" text-anchor="middle">ole.michelsen.dk</text>
</g>
<g>
    <text x="100" y="700" fill="#333" style="font:100 90 Century Gothic">Ole Bjørn Michelsen</text>
    <text x="100" y="800" fill="#555" style="font:italic 100 60 Georgia">Web Developer</text>
    <rect x="0" y="950" width="1600" height="10" fill="#000" />
</g>
</svg>
```
