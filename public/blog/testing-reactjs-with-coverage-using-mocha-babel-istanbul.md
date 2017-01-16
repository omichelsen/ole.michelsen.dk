I recently worked on a project with all the latest and greatest tools: [React](https://facebook.github.io/react/), [Redux](http://redux.js.org/) and [webpack](https://webpack.github.io/). But our unit tests were running slowly to the point where we found ourselves constantly blocked in our workflow. Going for coffee every time you need to run `npm test` will quickly give you an upset stomach, so we decided to see what could be done to speed up the process, and ended up with a _95% speed improvement_ and being able to remove a lot of dependencies to boot.

<!-- more-->

The requirements for our testing setup remained unchanged though: if a unit test or a piece of code fails, we need to have a correct error log of the source file, line and column. We write our code in ES6/ES7, so support for [Babel](http://babeljs.io/) is mandatory. And we need code coverage of the original source files, not the transpiled version.


### Bad Karma

The first part of our testing tool chain we looked to get rid of was [Karma](https://karma-runner.github.io/1.0/index.html). Karma is great, and running tests against real browsers has its uses, but I would argue that it's not needed for unit tests. It also makes it difficult to run only parts of a test suite (grep), which made us look to running just [Mocha](https://mochajs.org/) and [jsdom](https://github.com/tmpvar/jsdom) instead.


### Testing without webpack

The biggest performance hog in our testing setup was actually webpack. Since webpack need to create a bundle before your tests can run, you also have to generate sourcemaps to know where your code is failing and to generate code coverage for the original source files. This is slooow. Especially if you [pick sourcemaps](https://webpack.github.io/docs/configuration.html#devtool) that are actually useful.

Our solution was to completely cut webpack out of the equation. This will not be an option for everybody though. If your code relies on some special plugins and loaders, this might not be practical for you. In our case we only use loaders for image files, which we don't care about in our tests.

With these considerations we're ready to set up our test suite.


## Setup

I'll assume you've already configured Babel, and focus on the packages you need to run tests and create coverage from the command line:

```bash
npm install babel-cli babel-core babel-register isparta istanbul jsdom jsdom-global mocha
```

You can leave out jsdom if you don't need a browser-like DOM for testing, e.g. only use [shallow rendering](https://facebook.github.io/react/docs/test-utils.html#shallow-rendering).


### Test scripts

Under the "scripts" section of your `package.json`, add the following scripts:

```json
{
    "scripts": {
        "coverage": "babel-node ./node_modules/.bin/isparta cover --include 'src/**/*.js*' _mocha",
        "test": "mocha",
        "test:watch": "mocha --watch --reporter min"
    }
}
```

Now you can run `npm test` to just run unit tests and `npm run coverage` to run the tests and also generate code coverage. There is quite a performance difference, so it's nice to have them separated.

Notice how I'm able to just run `mocha`. This actually takes a little more configuration, but we can stick all of that in a `test/mocha.opts` file to make it easier to run:

```bash
--compilers js:babel-register
--require jsdom-global/register
--require test/setup.js
src/**/*.spec.js
```

You can put all your Mocha configuration in here; I am registering Babel, injecting jsdom (instead of having a real browser) and doing some general setup in `test/setup.js` like the extension handling detailed below, registering [sinon](http://sinonjs.org/) etc. Lastly I'm specifying where my tests are. Mocha will automatically scan the `test/` folder, so you can leave this out if all your tests are in here.

### Excludes and includes

In the `npm run coverage` script we include all the files we want covered (`'src/**/*.js*'` also matches `.jsx`), but something is still off with the coverage reports. It includes our test files (`*.spec.js`) and still doesn't include our react files (`*.jsx`). To fix this we need some configuration for Istanbul specifically, so create a `.istanbul.yml` file in the root of your project containing:

    instrumentation:
      excludes: ['*.spec.js']
      extensions: ['.js', '.jsx']


### Ignoring required static files

To make the code run without the webpack build step, we need to make sure node doesn't get confused about non-JavaScript files, like images and style sheets. So we have to do a bit of [short circuiting](https://nodejs.org/api/globals.html#globals_require_extensions) in our `test/setup.js` script:

```js
const noop = () => {};

require.extensions['.css'] = noop;
require.extensions['.ico'] = noop;
require.extensions['.png'] = noop;
require.extensions['.svg'] = noop;
```

This will instruct node to ignore these file types when they are required, and our code will tug along nicely.


## Output

If you've done things correctly (and written tests), your output of running `npm run coverage` should now look something like this:

    ================================================================================
    Writing coverage object [/Users/olem/myProject/coverage/coverage.json]
    Writing coverage reports at [/Users/olem/myProject/coverage]
    ================================================================================

    =============================== Coverage summary ===============================
    Statements   : 97.4% ( 75/77 ), 2 ignored
    Branches     : 96.88% ( 31/32 ), 4 ignored
    Functions    : 93.33% ( 14/15 )
    Lines        : 95.92% ( 47/49 )
    ================================================================================

The HTML report can be found in `coverage/lcov-report/index.html`.

As an added bonus you can now run only parts of your test suite by using grep: `mocha -g SomeTestName`. You can also combine the predefined npm scripts with grep like this: `npm run test:watch -- -g SomeTestName` (note the double dashes).


## Performance and conclusion

For our project this setup meant we could remove a lot of dependencies, and it also runs incredibly fast:

| Setup | `npm test` | `npm run coverage` |
|-------|-----------:|-------------------:|
| Karma + webpack + mocha + istanbul | 1m 45s |  |
| mocha + istanbul | 5s | 25s |

In the end we saw an impressive _95% performance gain_ on running just our tests, and _76%_ improvement for coverage. Cutting out webpack gave us the biggest boost, but mind you this might not be for everybody. If you have a complicated setup of loaders etc., your code might not be able to run without it.

Tests should be an integrated part of your development workflow, and if it slows you down you should fix it. With the kind of speed we've achieved here, testing is actually fun, and paves the way to other interesting optimization challenges in your code.
