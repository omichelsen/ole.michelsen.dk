Writing JavaScript libraries using [TypeScript](https://www.typescriptlang.org/) makes a lot of sense. You get extra peace of mind from type safety, you can still deliver the library to normal JavaScript consumers, and if they happen to also use TypeScript, you get the definition files for free.

But if you are serious about creating libraries, proper test coverage is a must, so here I'll show how to get started with some of the more popular testing libraries out there. Linting also keeps your code tip top, so I have thrown that in as well.

<!-- more-->

## Setup

To get started you'll need these libraries. I'm including some handy plugins for [Chai](http://chaijs.com/) and [Sinon](http://sinonjs.org/), but you can pick what you need:

```bash
npm install -D chai chai-as-promised mocha nyc proxyquire sinon sinon-chai ts-node tslint typescript
```

Since we are working with TypeScript, we need type definitions for the libraries that doesn't already have them:

```bash
npm install -D @types/chai @types/chai-as-promised @types/mocha @types/node @types/proxyquire @types/sinon @types/sinon-chai
```

This whole boilerplate code is also available as a GitHub project [typescript-mocha-sinon-nyc](https://github.com/omichelsen/typescript-mocha-sinon-nyc).


### TypeScript

Configuration of the TypeScript compiler is pretty easy, so I'll just show you the whole `tsconfig.json` here:

    {
      "compilerOptions": {
        "declaration": true,
        "module": "commonjs",
        "outDir": "lib",
        "sourceMap": true,
        "target": "es6"
      },
      "files": [
        "src/index.ts"
      ],
      "exclude": [
        "node_modules"
      ]
    }

We're targeting ES6 here, but you can pick your desired level of compatibility. Notice the `"declaration": true` - this means that we'll automatically output `.d.ts` files, which will make TypeScript consumers of our library very happy.

Under the "scripts" section of your `package.json`, add the following scripts:

    {
      "scripts": {
        "build": "tsc",
        "lint": "tslint {src,test}/**/*.ts --format stylish",
        "test": "nyc mocha",
        "test:watch": "mocha -w --reporter min"
      }
    }

Once everything is setup, you can run `npm run build` to compile your TypeScript into normal JavaScript, and `npm run lint` to check the formatting of your code.


### Coverage

We also need to stick a bit of configuration in our [nyc](https://github.com/istanbuljs/nyc) config (in `package.json`):

    "nyc": {
      "require": [
        "ts-node/register"
      ],
      "extension": [
        ".ts"
      ],
      "reporter": [
        "lcov",
        "text-summary"
      ],
      "sourceMap": true,
      "instrument": true
    },

Now `npm test` will run your unit tests and generate code coverage. I would recommend adding `--check-coverage --lines 100` to the `test` script, so tests will fail if coverage goes below 100%. This will keep your library trustworthy.

The tests are run with `mocha`, but this actually takes a little more configuration. We can stick all of that in a `test/mocha.opts` file to make it easier to run:

    --require ts-node/register
    --watch-extensions ts
    test/**/*.test.ts

Here I am registering TypeScript, watching for changes to any `.ts` file and telling [Mocha](https://mochajs.org/) where to find my tests.


#### Chai and Sinon

To finish our test environment, we need to configure Chai and Sinon with some helpful plugins. If you are coming from JavaScript, we could just do it in a test setup file and use it globally. TypeScript is a little more strict, so the way to do it, is to create a file called something like `test/expect.ts`:

    import * as chai from 'chai'
    import * as chaiAsPromised from 'chai-as-promised'
    import * as sinonChai from 'sinon-chai'

    chai.use(chaiAsPromised)
    chai.use(sinonChai)

    export const expect = chai.expect

You will have to include this in all your tests like so:

    import { expect } from './expect'

    expect(mySpy).to.have.been.calledWith('foo');

It might be a little more work, but you now have the pleasure of getting auto-completion for all Chai/Sinon commands.


#### Output

If you've done things correctly (and written tests), running `npm test` should now output something like this:

    =============================== Coverage summary ===============================
    Statements   : 100% ( 7/7 )
    Branches     : 100% ( 4/4 )
    Functions    : 100% ( 1/1 )
    Lines        : 100% ( 7/7 )
    ================================================================================

The HTML report can be found in `coverage/lcov-report/index.html`.

As an added bonus you can run only parts of your test suite by using grep: `mocha -g SomeTestName`. You can also combine the predefined npm scripts with grep like this: `npm run test:watch -- -g SomeTestName` (note the double dashes).


## Testing without side effects

It's pretty common to have modules that use other modules to get the work done. But if your module imports a third party library that does e.g. platform detection, how do you write tests for all platforms?

For this [proxyquire](https://github.com/thlorenz/proxyquire) is a life-saver. It allows you to mock all `import` modules, either partially or fully.

So say we need to test our `../src/index.ts` file, which has a dependency on `./platform.ts`. Instead of doing a normal `import` in our test suite, we use proxyquire like so:

    const { greeter } = proxyquire.noCallThru().load('../src/index', {
      './platform': {
        isMac: false,
        isWindows: true,
      }
    })

In this case we are mocking the normal props of `platform.ts` to pretend that the test is running on Windows. The code from `platform.ts` won't even be executed due to the `noCallThru()` option.


## Tips

If want to use a third party JavaScript library that does not have any corresponding `@types` definitions, you might hit the following error when importing it:

```
Cannot find type definition file for 'some-module'.
```

To fix this, you can place a `.d.ts` definition file somewhere in your project with a minimum definition for that library (you can be as specific as you want):

    declare module 'some-module' {
      const x: any;
      export myFunction = x;
    }

Then just include it in your `tsconfig.json`:

    files: {
      "./src/index.ts",
      "./src/typings.d.ts"
    }

This will make the compiler errors go away.

All in all working with TypeScript has gotten very easy over time. More libraries includes type definitions, or you will be able to find them under [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) (`npm install @types/*`). TypeScript is especially helpful when writing libraries, as you can catch uninteded ambiguities in parameters and return types at an early stage, before your consumers do. And finally the tooling is as easy to setup as the alternative [Babel](https://babeljs.io/) configuration. Give it a go :-)
