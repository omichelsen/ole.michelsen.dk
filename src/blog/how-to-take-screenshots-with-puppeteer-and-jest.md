---
title: How to take screenshots with Puppeteer and Jest
description: How to use Puppeteer to take full-page screenshots, screenshots of a specific HTML element and how to use this to write E2E and screenshot tests in Jest.
date: 2023-04-08
# tags: ["javascript"]
---

You can use a Puppeteer, a headless browser that lets you program user interactions, to load your website and capture screenshots (and videos). This can be highly useful for documentation, marketing (App Store, blog posts etc.), comparison testing etc.

_Note_: For this article I'm going to use the following example project with a simple input form: https://github.com/omichelsen/puppeteer-example.

## Taking screenshots with Puppeteer

Install Puppeteer in your project: `yarn add -D puppeteer` and create a js file with the following:

```js
import puppeteer from 'puppeteer'

// create a new browser and open a page
const browser = await puppeteer.launch()
const page = await browser.newPage()

// set the size of the browser window
await page.setViewport({ width: 500, height: 300, deviceScaleFactor: 2 });

// open the URL you want to capture and wait for loading to complete
await page.goto(`http://localhost:4000`, {
	waitUntil: 'networkidle0',
})

// take a screenshot of the window
await page.screenshot({ path: 'page.png' })

// close the browser (or the script will hang)
await browser.close()
```

Running this will give us a nice screenshot of the whole page:

<picture>
	<source srcset="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/page.webp, /images/blog/how-to-take-screenshots-with-puppeteer-and-jest/page@2x.webp 2x" type="image/webp">
	<img
		alt="Screenshot of the whole page for example name input form"
		itemprop="image"
		src="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/page.png"
		srcset="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/page@2x.png 2x"
		width="500"
		height="300"
	>
</picture>

If you want to capture just a single component (could be a button or a whole table), replace the above line `await page.screenshot(...)` with this:

```js
// take a screenshot of the input component
const element = await page.$('input')
await element.screenshot({ path: 'component.png' })
```

Which gives us a screenshot of only the input element:

<picture>
	<source srcset="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/component.webp, /images/blog/how-to-take-screenshots-with-puppeteer-and-jest/component@2x.webp 2x" type="image/webp">
	<img
		alt="Screenshot of the input element in example name input form"
		itemprop="image"
		src="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/component.png"
		srcset="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/component@2x.png 2x"
		width="188"
		height="36"
	>
</picture>

### Screenshot testing with Puppeteer and Jest

With screenshot testing you can compare snapshots of a whole page or a single component to catch unintentional changes. This is particularly useful when refactoring CSS or higher level components where changes can cascade to other parts of the app.

Here we are using the following packages: `yarn add -D puppeteer jest jest-image-snapshot`

```js
import puppeteer from 'puppeteer'

// extend Jest with expect - usually put this in a Jest setup file (setupFilesAfterEnv)
import { toMatchImageSnapshot } from 'jest-image-snapshot'
expect.extend({ toMatchImageSnapshot })

describe('puppeteer-example', () => {
	let browser
	let page

	beforeAll(async () => {
		browser = await puppeteer.launch()
		page = await browser.newPage()
	})

	afterAll(() => browser.close())

	it('page renders correctly', async () => {
		await page.goto('http://localhost:4000/')
		const image = await page.screenshot()
		expect(image).toMatchImageSnapshot()
	})

	it('component renders correctly', async () => {
		await page.goto('http://localhost:4000/')
		const element = await page.$('input')
		const image = await element.screenshot()
		expect(image).toMatchImageSnapshot()
	})
})
```

On the first run the snapshots will be written, and the output will look like this:

```bash
 PASS  ./screenshot.test.js
  puppeteer-example
    ✓ page renders correctly (476 ms)
    ✓ component renders correctly (112 ms)

 › 2 snapshots written.
```

Now for the testing part: let's say you go and change the `placeholder` text of the input field. Our tests will now fail with a visual diff:

```bash
 FAIL  ./screenshot.test.js
  puppeteer-example
    ✕ page renders correctly (326 ms)
    ✕ component renders correctly (128 ms)

  ● puppeteer-example › component renders correctly

    Expected image to match or be a close match to snapshot but was 2.485963356973995% different from snapshot (673 differing pixels).
    See diff for details: /Users/olem/projects/puppeteer-example/__image_snapshots__/__diff_output__/screenshot-test-js-puppeteer-example-component-renders-correctly-1-snap-diff.png
```

<picture>
	<source srcset="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/screenshot-test-js-puppeteer-example-component-renders-correctly-1-snap-diff.webp, /images/blog/how-to-take-screenshots-with-puppeteer-and-jest/screenshot-test-js-puppeteer-example-component-renders-correctly-1-snap-diff@2x.webp 2x" type="image/webp">
	<img
		alt="Expected image to match or be a close match to snapshot but was 2.485963356973995% different from snapshot (673 differing pixels)"
		itemprop="image"
		src="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/screenshot-test-js-puppeteer-example-component-renders-correctly-1-snap-diff.png"
		srcset="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/screenshot-test-js-puppeteer-example-component-renders-correctly-1-snap-diff@2x.png 2x"
		width="564"
		height="36"
	>
</picture>

The diff output shows a before and after (left and right) and an overlay in the middle marking differences with yellow and red (before and after).

We are now protected against unexpected changes to our app! In case the change was intended, you can update your snapshots by running `jest -u`.

Snapshots will be saved in the folder `__image_snapshots__` which should be checked into git so they can be compared on future runs.

### E2E testing and video recording with Puppeteer and Jest

I thought I'd show how to write end-to-end (E2E) tests using Puppeteer since the code is very similar. This also is a nice use case for recording videos. Since Puppeteer is headless (no UI), videos can help debug complex user interaction flows of an E2E test if a test unexpectedly fails.

Recording videos can also be a powerful tool to produce marketing videos (e.g. to show in the App Store), examples for documentation etc.

Here we are using the following packages: `yarn add -D puppeteer jest puppeteer-screen-recorder`. For this test we're going to fill out the input field and click the submit button:

```js
import puppeteer from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'

describe('puppeteer-example e2e', () => {
	let browser
	let page
	let recorder

	beforeAll(async () => {
		browser = await puppeteer.launch()
		page = await browser.newPage()
		await page.setViewport({ width: 500, height: 300, deviceScaleFactor: 2 })

		// record the e2e test
		recorder = new PuppeteerScreenRecorder(page)
	})

	afterAll(() => browser.close())

	it('should greet me', async () => {
		// start recording
		await recorder.start('./e2e.mp4')

		await page.goto(`http://localhost:4000`, {
			waitUntil: 'networkidle0',
		})

		// type in the name and submit
		await page.type('input', 'Mr McDuck')
		await page.click('button')

		// find the text element and assert that the name is shown
		const text = await page.$eval('h2', (e) => e.textContent)
		expect(text).toContain('Hi, Mr McDuck!')

		// stop recording
		await recorder.stop()
	})
})
```

We now have a passing test of our example form as you can see here:

<video width="500" height="300" autoplay loop>
  <source src="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/e2e.webm" type="video/webm">
  <source src="/images/blog/how-to-take-screenshots-with-puppeteer-and-jest/e2e.mp4" type="video/mp4">
</video>

You do not have to use Jest to record videos, you can also use `puppeteer-screen-recorder` in a normal script like in our first example.

These are just some of the use cases I have found very helpful when developing, testing and marketing web apps. If you have other ideas how to use Puppeteer, please let me know in the comments below!
