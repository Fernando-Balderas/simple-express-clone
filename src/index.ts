'use strict'

import { IncomingMessage, ServerResponse } from 'http'
import HttpServer, { NextHandler } from './server'

const server = new HttpServer(3000)

server.use((req: IncomingMessage, res: ServerResponse, next: NextHandler) => {
  res.end('Hello, world!')
  next()
})

// server.get('/', (req: IncomingMessage, res: ServerResponse) => {
//   res.status(200).send('Home page')
// })

// server.post('/api/posts', (req: IncomingMessage, res: ServerResponse) => {
//   const post = req.payload
//   res.status(200).send(post)
// })

// server.delete(
//   '/api/posts/:postId',
//   (req: IncomingMessage, res: ServerResponse) => {
//     const postId = req.params.postId
//     res.status(200).send(`Deleted ${postId}`)
//   }
// )

// server.put('/api/posts/:postId', (req: IncomingMessage, res: ServerResponse) => {
//   const postId = req.params.postId
//   res.status(200).send(`Updated ${postId}`)
// })

server.listen()
