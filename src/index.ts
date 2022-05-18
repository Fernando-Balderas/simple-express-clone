'use strict'

import HttpServer, { Request, Response } from './server'

const server = new HttpServer(3000)

server.get('/', (_: Request, res: Response) => {
  res.status(200).send('Get works!')
})

server.post('/api/posts', (req: Request, res: Response) => {
  const post = req.payload
  res.status(200).send(post)
})

server.delete('/api/posts/:postId', (req: Request, res: Response) => {
  const postId = req.params.postId
  res.status(200).send(`Deleted ${postId}`)
})

server.put('/api/posts/:postId', (req: Request, res: Response) => {
  const postId = req.params.postId
  res.status(200).send(`Updated ${postId}`)
})

// server.use((req: Request, res: Response, next: NextHandler) => {
//   res.end('Hello, world!')
//   next()
// })

server.listen()
