<img class="floatright" src="/images/blog/testing-your-api-with-phpunit/phpunit.png" srcset="/images/blog/testing-your-api-with-phpunit/phpunit@2x.png 2x" alt="Example output from PHPUnit" height="352" width="482"> It's always a good idea to have tests for your code, and your API is no exception. In addition to normal unit tests, API tests can test the full code stack, and ensure that the data from your database actually reaches the clients in the correct format.

REST uses the standard [HTTP status codes](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes) to indicate the success of a request, so we must ensure it returns the expected codes, especially in error scenarios.

I recently implemented a simple REST API in PHP for [Regex Crossword](https://regexcrossword.com/), so in this article I will show how to write some API tests using PHPUnit (4.8) and Guzzle (6.1). Actually we can test _any_ API written in _any_ language using this, but if you are used to PHP this will be very easy.

<!-- more-->

__Update 2015-11-30__: This article and examples have been updated to GuzzleHttp 6.

## PHPUnit and Guzzle

First we download [PHPUnit](https://phpunit.de/) which is the testing framework in which we will write our tests. Then we download [Guzzle](http://guzzle.readthedocs.org/en/latest/overview.html#installation), which is a library that helps us make requests to the API. You can install both using [Composer](https://getcomposer.org/) if you like:

    $ composer require guzzlehttp/guzzle:^6.1 phpunit/phpunit:^4.8

## Testing the API

Let's assume we have a small REST endpoint called `/books` which supports GET and POST.

We'll add our first test file called `BooksTest.php`:

    <?php

    require('vendor/autoload.php');

    class BooksTest extends PHPUnit_Framework_TestCase
    {
        protected $client;

        protected function setUp()
        {
            $this->client = new GuzzleHttp\Client([
                'base_uri' => 'http://mybookstore.com'
            ]);
        }

        public function testGet_ValidInput_BookObject()
        {
            $response = $this->client->get('/books', [
                'query' => [
                    'bookId' => 'hitchhikers-guide-to-the-galaxy'
                ]
            ]);

            $this->assertEquals(200, $response->getStatusCode());

            $data = json_decode($response->getBody(), true);

            $this->assertArrayHasKey('bookId', $data);
            $this->assertArrayHasKey('title', $data);
            $this->assertArrayHasKey('author', $data);
            $this->assertEquals(42, $data['price']);
        }
    }

There's a few going on here. First we include Guzzle and PHPUnit. If you installed them using Composer, you just have to require the `autoload.php`.

Then we create a test class for our `/books` endpoint called `BooksTest`. You can name this whatever you like, but I prefer to have tests for each endpoint in separate files/classes.

Using the special `setUp()` function, we can instantiate a new Guzzle client before each test. This saves us some lines of code if we have more than one test.

The last function `testGet_ValidInput_BookObject` is our actual test, which verifies that we can GET a single book from our API. We then assert that this book has the properties we are expecting.

### Testing POST and DELETE

Let's add an additional test, to see if we can also create a new book.

    public function testPost_NewBook_BookObject()
    {
        $bookId = uniqid();

        $response = $this->client->post('/books', [
            'json' => [
                'bookId'    => $bookId,
                'title'     => 'My Random Test Book',
                'author'    => 'Test Author'
            ]
        ]);

        $this->assertEquals(200, $response->getStatusCode());

        $data = json_decode($response->getBody(), true);

        $this->assertEquals($bookId, $data['bookId']);
    }

Now we have some tests for the "happy path", but we should also check that our API correctly rejects invalid requests like DELETE:
    
    public function testDelete_Error()
    {
        $response = $this->client->delete('/books/random-book', [
            'http_errors' => false
        ]);
        
        $this->assertEquals(405, $response->getStatusCode());
    }

The option `'http_errors' => false` makes sure Guzzle don't throw an exception if our API returns an error code.

## Running the tests

Now you should be able to run our tests by starting PHPUnit. If you installed it using Composer, it should be in your `vendor` folder:

    $ php vendor/bin/phpunit BooksTest.php

Remember it's just as important to test failing/edge cases as testing when things go well. Also you should run these tests against an isolated testing environment if they modify your data.
