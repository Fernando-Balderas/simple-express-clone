'use strict'

import http, { IncomingMessage, ServerResponse, Server } from 'http'

export type ServerRequest = IncomingMessage

export type NextHandler = (err?: unknown) => void

export type ServerRequestHandler = (
  req: ServerRequest,
  res: ServerResponse,
  next: NextHandler
) => void

export default class HttpServer {
  private _server: Server
  private _stack: any[] = []

  constructor(private readonly _port: number = 3000) {
    console.log('into constructor')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('It works!')
    })
  }

  // get(path: string, handler: ServerRequestHandler) {}

  // post(path: string, handler: ServerRequestHandler) {}

  // delete(path: string, handler: ServerRequestHandler) {}

  // put(path: string, handler: ServerRequestHandler) {}

  use(middleware: any) {
    console.log('into use')
    console.log('middleware ', middleware)
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function!')
    }
    console.log('stack ', this._stack)
    this._stack.push(middleware)
    console.log('stack ', this._stack)
  }

  handler(req: ServerRequest, res: ServerResponse) {
    console.log('into handler')
    console.log('this _stack ', this._stack)
    let i = 0
    const errorHandler = (err?: any) => {
      console.log('into error handler')
      if (err == null) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
      }
    }
    const next = (err?: any) => {
      console.log('into next')
      console.log('i ', i)
      console.log('err ', err)
      console.log('this _stack ', this._stack)
      if (err != null) return setImmediate(() => errorHandler(err))
      if (i >= this._stack.length) return setImmediate(() => errorHandler())
      const layer = this._stack[i++]
      setImmediate(() => {
        try {
          layer(req, res, next)
        } catch (error) {
          next(error)
        }
      })
    }
    next()
  }

  listen(): void {
    console.log('into listen')
    console.log('this _stack ', this._stack)
    this._server.listen(this._port, () =>
      console.log(`Server running on port ${this._port}`)
    )
  }
}
