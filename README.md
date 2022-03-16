# WSAPI

An abstraction to add RESTful functionality to websockets, with PID / timestamp information, request timeout and schema.

**This is the clientside only.**

Your websockets server should implement the logic for WSAPI, with an example given in `server.js`.

## API Methods

Functions of WSAPI are designed to update a JSON tree, with RESTful equivalents like so:

* *get=GET* - get the JSON structure
* *add=POST* - add an element to an object or array
* *set=PUT* - set the entire JSON structure
* *update=PATCH* - update properties of a JSON structure
* *remove=DELETE* - delete an elment of an object or array

## Usage

Options can be set globally as well as on each request:

```javascript

// GLOBAL
// ======

const ws = new WSAPI('ws://localhost:9092', {
	timeout: 3000, // default is 3000ms, falsey argument means no response is expected,
	pid: 1, // default is 1, any integer is accepted
})

// REQUEST
// =======

const res = await ws.get( '/hello-world', { foo: 'bar' }, {
	timeout: 1000, // overrides global option
	pid: 3, // overrides global option
	customValue:  1234 // send custom request value
})

```
An outgoing WebSockets message will always be formatted as:

```javascript

// STRINGIFIED 
// ===========
// WebSockets.send()

{
	"type": "set",
	"pid": 1,
	"path": "/entries/47",
	"timestamp": 1647466021863.3,
	"data": { "foo": "bar" }
}

```

WSAPI will generate a unique timestamp when a request is made.

*This timestamp will be appended with a floating point if multiple requests are being made at the same time:*

```python

// BEFORE:
// ======

GET /helloworld @ 1647466021863
GET /helloworld @ 1647466021863
GET /helloworld @ 1647466021863
GET /helloworld @ 1647466021863

// AFTER:
// =====

GET /helloworld @ 1647466021863
GET /helloworld @ 1647466021863.1
GET /helloworld @ 1647466021863.2
GET /helloworld @ 1647466021863.3


````

## Development & Testing

```zsh
# install basic clientside server
pnpm i --global simple-autoreload-server

# run both client and server
pnpm run client
pnpm run server
```