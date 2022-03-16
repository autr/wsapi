import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 9092 })

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', JSON.parse(data) )
    ws.send(data)
  })

  // ws.send('something')
})