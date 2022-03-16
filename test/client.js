
import { WSAPI, LOG  } from '/index.js'

const run = async e => {


	const wsapi = new WSAPI({ log: LOG.VERBOSE })
	window.wsapi = wsapi

		await wsapi.open('ws://localhost:9092').catch(err => {
			console.error('ERROR OPENING', err.message, err.code)
		})
		wsapi.get('immediate get', {})
		wsapi.set('immediate set', {})
		wsapi.update('immediate update', {})
		wsapi.add('immediate add', {})
		wsapi.remove('immediate remove', {})

		try {
			await wsapi.get('await get', {})
			await wsapi.set('await set', {})
			await wsapi.update('await update', {})
			await wsapi.add('await add', {})
			await wsapi.remove('await remove', {})
		} catch(err) {
			console.error('ERROR', err.message)
		}

}

run()