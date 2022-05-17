import http, { IncomingMessage, ServerResponse, Server } from 'http'

export type NextHandler = (err?: unknown) => void

export type ServerRequestHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextHandler
) => void

type Route = {
  path: string
  method: string
  stack: any[]
}
export default class HttpServer {
  private _server: Server
  private _stack: any[]
  private _routes: Route[]

  constructor(private readonly _port: number = 3000) {
    this._server = http.createServer(this.handler)
    this._stack = []
    this._routes = []
  }

  // get(path: string, handler: ServerRequestHandler) {}

  // post(path: string, handler: ServerRequestHandler) {}

  // delete(path: string, handler: ServerRequestHandler) {}

  // put(path: string, handler: ServerRequestHandler) {}

  use(middleware: any) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function!')
    }
    this._stack.push(middleware)
  }

  handler = (req: IncomingMessage, res: ServerResponse) => {
    let i = 0
    const errorHandler = (err?: any) => {
      if (err == null) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
      }
    }
    const next = (err?: any) => {
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
    this._server.listen(this._port, () =>
      console.log(`Server running on port ${this._port}`)
    )
  }
}
