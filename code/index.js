import http from 'http'
import websocket from 'websocket'
import fs from 'fs'


import htmlGenerator from './htmlGenerator'

const PORT = process.env.PORT || 3000

const index = fs.createReadStream('./code/template/index.php')
const header = fs.createReadStream('./code/template/header.php')
const content = fs.createReadStream('./code/template/content.php')
const footer = fs.createReadStream('./code/template/footer.php')

const streams = {
  index,
  header,
  content,
  footer
}

// htmlGenerator(streams)

const server = http.createServer((req, res) => {
  if(req.url === '/') {
    htmlGenerator(streams).then((html) => {
      res.statusCode = 200
      res.write(html)
      res.end()
    })
  }
  else {
    serveFile(req, res)
  }
})

const serveFile = (req, res) => {
  try {
    let file = fs.createReadStream(`./code/template${req.url}`)

    file.on('error', (e) => {
      console.log(e)
      res.statusCode = 404
      res.end()
    })

    file.pipe(res)

  }
  catch (e) {
    console.log(e)
    res.statusCode = 404
    res.end()
  }
}

const wsServer = new websocket.server({
  httpServer: server
})


let usersConnected = 0;
let clients = {}

wsServer.on('request', (r) => {
  const connection = r.accept('echo-protocol', r.origin)

  let id = usersConnected++
  clients[id] = connection

  console.log(`Connection accepted [${id}]`)

  connection.on('close', (reasonCode, description) => {
    delete clients[id]
    console.log(`Peer ${connection.remoteAddress} disconnected`)
  })

})

const onChange = () => {
  clients.forEach((c) => {
    c.sendUTF('reload!')
  })
}

















server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})