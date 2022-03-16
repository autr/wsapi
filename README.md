# WSAPI

An abstraction to add RESTful functionality to WebSockets API, to create request *responses*.

**This is client-side only.**

Your WebSockets server should implement the logic for WSAPI, with an example given in `test/server.js`.

Server logic is pretty much: *return the same timestamp*.

## Methods

Functions of WSAPI are intended to update a JSON tree:

```javascript
import { WSAPI } from 'wsapi'

const ws = new WSAPI()
await ws.open('ws://localhost:9092')

// Equivalent to GET (get)
// =======================

ws.get('/object') // get a structure

// Equivalent to POST (add)
// ========================

ws.add('/object/list', { foo: 'bar' }) // add an element of an object or array

// Equivalent to PUT (set)
// =======================

ws.set('/object/list', [ { foo: 'bar' } ] ) // set an entire structure

// Equivalent to PATCH (update)
// ============================

ws.update('/object/list/42', { hello: 'world' } ) // update properties of a structure

// Equivalent to DELETE (remove)
// =============================

ws.remove('/object/list/42') // remove an element of an object or array

```

*This functionality should be implemented on your server!*

## Configuration

Options can be set globally as well as on each request:

```javascript

import { WSAPI, LOG_VERBOSE, LOG_SILENT, LOG_DEBUG } from 'wsapi'

// GLOBAL OPTIONS
// ==============

const ws = new WSAPI({
	timeout: 3000, // default is 3000ms, falsey argument means no response is expected,
	pid: 1, // default is 1, any integer is accepted,
	log: LOG_VERBOSE
})

ws.open('ws://localhost:9092')

// REQUEST OPTIONS
// ===============

const res = await ws.get( '/hello-world', { foo: 'bar' }, {
	timeout: 1000, // overrides global option
	pid: 3, // overrides global option
	customValue:  1234 // send custom request value
})

```

## Schema & Timestamps

An outgoing WebSockets message will always be formatted and stringified JSON like so:

```javascript
{
	"type": "set",
	"pid": 1,
	"path": "/entries/47",
	"timestamp": 1647466021863.3, // important
	"data": { "foo": "bar" }
}
```

Server logic must return this same object in order for requests to *resolve* using the **timestamp**:

```javascript
{
	"type": "set",
	"pid": 1,
	"path": "/entries/47",
	"timestamp": 1647466021863.3, // important
	"data": "I received this, thanks!"
}
```

## Unique Timestamps

The timestamp is used to resolve requests when returned from the WebSockets server, so will always be unique. 

A **floating point** of `0.1` is added to the integer timestamp if it is one of multiple requests:

```bash

// If I were to make multiple requests at the same time:

GET /helloworld @ 1647466021863 // 1st
GET /helloworld @ 1647466021863 -> 1647466021863.1 // 2nd
GET /helloworld @ 1647466021863 -> 1647466021863.2 // 3rd
GET /helloworld @ 1647466021863 -> 1647466021863.3 // 4th

````

## Development & Testing

```zsh
# install basic clientside server
pnpm i --global simple-autoreload-server

# run both client and server
pnpm run client
pnpm run server
```
