import { EVT_OPEN, EVT_MSG, EVT_CLOSE, EVT_ERR } from './defs.js'
import { LOG_DEBUG, LOG_SILENT, LOG_VERBOSE } from './defs.js'
// import { SCHEMA } from './defs.js'
import { REST_SET, REST_GET, REST_ADD, REST_UPDATE, REST_REMOVE } from './defs.js'

const EVENTS = [ EVT_OPEN, EVT_MSG, EVT_CLOSE, EVT_ERR ]

export const OPTIONS = {
	timeout: 3000,
	log: LOG_DEBUG,
	pid: 1
}
export const LOG = {
	DEBUG: LOG_DEBUG,
	SILENT: LOG_SILENT,
	VERBOSE: LOG_VERBOSE
}

export const REST = {
	SET: REST_SET,
	GET: REST_GET,
	ADD: REST_ADD,
	UPDATE: REST_UPDATE,
	REMOVE: REST_REMOVE
}

const READY_STATES = ['unopened','connecting','open','closing','closed']

let timeout_lookup = {}

const ERROR = (code, message, req) => {
	return {
		...req,
		code,
		message
	}
}

export const WSAPI = function(opts) {
	
	const t = this

	this.awaiting = {}
	this.createTimestamp = callback => {
		let ts = new Date() / 1;
		while ( this.awaiting[ts] ) {
			ts += 0.1
			ts = Math.round(ts * 100) / 100
		}
		this.awaiting[ts] = callback
		return ts

	}

	const SAY = (msg, data) => {
		let { readyState, url } = t?.socket || { readyState: -1, url: 'none '}
		url = url.substring(0, url.length-1)
		readyState = READY_STATES[readyState+1]
		console.log(`🌐 [${url}=${readyState}] ${msg}`, data || '')
	}

	function openRequest( type, path, data, opts ) {
		return new Promise( (resolve, reject) => {


			let timeoutFunc
			const req = {
				pid: t.options.pid || OPTIONS.pid,
				...opts,
				type,
				timestamp: t.createTimestamp( res => {
					if (timeoutFunc) clearTimeout(timeoutFunc)
					resolve( res )
				}),
				path,
				data
			}
			if (!t.socket) reject(ERROR(404, 'no connection', req))
			if (!type) return reject(ERROR(400, 'no type set', req))
			if (!path) return reject(ERROR(400, 'no path set', req))

			if (t.LOG_VERBOSE) SAY(`📩 ${type} ${path} ${req.timestamp}`)
			t.socket.send( JSON.stringify(req) )

			const timeout = opts?.timeout ?? t.options?.timeout ?? OPTIONS.timeout

			if (!timeout) return resolve(req)

			timeoutFunc = setTimeout( e => {
				SAY(`❌ ${req.timestamp} timed out`)
				reject(ERROR(408, 'timed out', req))
			}, timeout)
		})

	}



	this.options = { ...OPTIONS, ...opts }

	this.LOG_DEBUG = ( this.options.log == LOG_DEBUG )
	this.LOG_VERBOSE = ( this.options.log == LOG_VERBOSE )
	this.LOG_SILENT = ( this.options.log == LOG_SILENT )

	this.callbacks = {}

	/* add default blank callbacks */

	for (const evt of EVENTS ) this.callbacks[evt] = (e => {})

	/* API functions */

	this.on = (evt, cb) => {
		if ( EVENTS.indexOf(evt) == -1 ) throw `no such event ${evt}`
		this.callbacks[evt] = cb
	}

	for (const [key,name] of Object.entries(REST)) {

		this[name] = (path, data, opts) => openRequest( name, path, data, opts )
	}


	/* process schema message */

	async function processMessage( e ) {
		const { data } = e
		try {
			const res = JSON.parse( await data.text() )
			if (t.awaiting[res?.timestamp]) {
				t.awaiting[res.timestamp](res)
				delete t.awaiting[res.timestamp]
				if (t.LOG_VERBOSE && res?.timeout) SAY(`💌 onmessage ${res?.path} ${res?.timestamp}`)

			} else {
				if (t.LOG_VERBOSE && res?.timeout) SAY(`❌ no callback for ${res?.timestamp}`)
			}
		} catch(err) {
			SAY(`❌ could not parse message`, err.message)
		}
	}

	this.close = (code,reason) => {
		if (t.socket) t.socket.close( code, reason )
	}

	this.inited = false
	this.open = url => {

		return new Promise( (resolve, reject) => {

			t.inited = false
			t.socket = new WebSocket( url )

			/* bind W3C events */

			try {
				t.socket.onopen = e => {
					const { binaryType, URL, readyState } = t.socket
					if (t.LOG_DEBUG || t.LOG_VERBOSE) SAY(`✅ onopen as ${binaryType}`)
					t.callbacks[ EVT_OPEN ]()
					t.inited = true
					return resolve(t)

				}
				t.socket.onmessage = e => {
					const { data, isTrusted, bubbles, origin, type, lastEventId, eventPhase, composed, cancelable } = e
					processMessage( e )
					t.callbacks[ EVT_MSG ]()

				}
				t.socket.onclose = e => {
					const { target, code, wasClean } = e
					if (t.LOG_DEBUG || t.LOG_VERBOSE) SAY(`❌ onclose with code ${code} (${wasClean?`clean`:`not clean`})`)
					t.callbacks[ EVT_CLOSE ]()
					t.socket = null
					return reject(ERROR(502, 'closed', e))

				}
				t.socket.onerror = e => {
					const { target } = e
					if (t.LOG_DEBUG || t.LOG_VERBOSE) SAY(`🚨 onerror`)
					t.callbacks[ EVT_CLOSE ]()

				}
				return t
			} catch(err) {
				return reject(err)
			}

		})
	}


	return this



}