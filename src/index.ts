'use strict'

import { IncomingMessage, ServerResponse } from 'http'
import HttpServer, { Response } from './server'

const server = new HttpServer(3000)

server.get('/', (req: IncomingMessage, res: Response) => {
  console.log('into GET HANDLER')
  res.status(200).send('Get works!')
})

// server.post('/api/posts', (req: IncomingMessage, res: Response) => {
//   const post = req.payload
//   res.status(200).send(post)
// })

// server.delete('/api/posts/:postId', (req: IncomingMessage, res: Response) => {
//   const postId = req.params.postId
//   res.status(200).send(`Deleted ${postId}`)
// })

// server.put('/api/posts/:postId', (req: IncomingMessage, res: Response) => {
//   const postId = req.params.postId
//   res.status(200).send(`Updated ${postId}`)
// })

// server.use((req: IncomingMessage, res: ServerResponse, next: NextHandler) => {
//   res.end('Hello, world!')
//   next()
// })

server.listen()
