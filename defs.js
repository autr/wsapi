export const EVT_OPEN = 'open'
export const EVT_MSG = 'message'
export const EVT_CLOSE = 'close'
export const EVT_ERR = 'error'

export const LOG_DEBUG = 'debug'
export const LOG_VERBOSE = 'verbose'
export const LOG_SILENT = 'silent'

export const REST_SET = 'set'
export const REST_GET = 'get'
export const REST_ADD = 'add'
export const REST_UPDATE = 'update'
export const REST_REMOVE = 'remove'

export const SCHEMA = {
	type: 'object',
	required: ['type', 'pid', 'path', 'data', 'timestamp'],
	properties: {
		type: {
			type: 'string',
			oneOf: [REST_SET,REST_GET,REST_ADD,REST_UPDATE,REST_REMOVE]
		},
		pid: {
			type: 'integer|string'
		},
		path: {
			type: 'string'
		},
		timestamp: {
			type: 'float'
		},
		data: {}
	}
}