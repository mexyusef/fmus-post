/**
 * Basic examples of FMUS-POST library usage
 */
import { get, post, put, del, client, createMiddleware } from '../src';

/**
 * Example 1: Simple GET request
 */
async function simpleGetRequest() {
  console.log('Example 1: Simple GET request');

  try {
    const response = await get('https://jsonplaceholder.typicode.com/users');
    console.log(`Status: ${response.status}`);
    console.log(`Time: ${response.time}ms`);
    console.log(`Data: ${JSON.stringify(response.json().slice(0, 2), null, 2)}`);
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('-----------------------------------');
}

/**
 * Example 2: POST request with body
 */
async function postWithBody() {
  console.log('Example 2: POST request with body');

  try {
    const response = await post('https://jsonplaceholder.typicode.com/posts', {
      body: {
        title: 'FMUS-POST Example',
        body: 'This is an example post created with FMUS-POST',
        userId: 1
      }
    });

    console.log(`Status: ${response.status}`);
    console.log(`Created post with ID: ${response.json().id}`);
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('-----------------------------------');
}

/**
 * Example 3: Using middleware
 */
async function usingMiddleware() {
  console.log('Example 3: Using middleware');

  // Create a simple logger middleware
  const logger = createMiddleware({
    name: 'logger',
    request: (req) => {
      console.log(`Request: ${req.method} ${req.url}`);
      return req;
    },
    response: (res) => {
      console.log(`Response: ${res.status} (${res.time}ms)`);
      return res;
    }
  });

  // Register middleware
  client.use(logger);

  try {
    // Make a request with middleware applied
    const response = await get('https://jsonplaceholder.typicode.com/todos/1');
    console.log(`Todo: ${response.json().title}`);
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('-----------------------------------');
}

/**
 * Example 4: Making multiple requests and handling responses
 */
async function multipleRequests() {
  console.log('Example 4: Multiple requests');

  try {
    // Get a post
    const post = await get('https://jsonplaceholder.typicode.com/posts/1');
    console.log(`Got post: ${post.json().title}`);

    // Update the post
    const updated = await put('https://jsonplaceholder.typicode.com/posts/1', {
      body: {
        id: 1,
        title: 'Updated title',
        body: 'Updated body',
        userId: 1
      }
    });
    console.log(`Updated post: ${updated.json().title}`);

    // Delete the post
    const deleted = await del('https://jsonplaceholder.typicode.com/posts/1');
    console.log(`Deleted post - status: ${deleted.status}`);
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('-----------------------------------');
}

/**
 * Example 5: Using assertions
 */
async function usingAssertions() {
  console.log('Example 5: Using assertions');

  try {
    const response = await get('https://jsonplaceholder.typicode.com/posts/1');

    // Assert status code
    response.assert.status(200);
    console.log('✓ Status is 200');

    // Assert on headers
    response.assert.header('content-type', 'application/json; charset=utf-8');
    console.log('✓ Content-Type is correct');

    // Assert on body
    response.assert.body((body) => body.id === 1);
    console.log('✓ Body has correct ID');

    console.log('All assertions passed!');
  } catch (error: any) {
    console.error('Assertion failed:', error.message);
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  await simpleGetRequest();
  await postWithBody();
  await usingMiddleware();
  await multipleRequests();
  await usingAssertions();
}

// Run the examples
runExamples().catch(console.error);
