import http, { IncomingMessage, ServerResponse, Server } from 'http'

export type NextHandler = (err?: unknown) => void

export type ServerRequestHandler = (
  req: IncomingMessage,
  res: Response,
  next: NextHandler
) => void

type Route = {
  path: string
  method: string
  stack: any[]
}

type ResponseBody = string | Buffer | object

export type Response = {
  status: (statusCode: number) => Response
  send: (body: ResponseBody) => void
  statusCode: number
} & ServerResponse

export default class HttpServer {
  private _server: Server
  private _routes: Route[]
  // private _stack: any[]

  constructor(private readonly _port: number = 3000) {
    this._server = http.createServer(this.handler)
    this._routes = []
    // this._stack = []
  }

  get(path: string, handler: ServerRequestHandler) {
    this._routes.push({
      path,
      method: 'GET',
      stack: [this.responseHandler, handler],
    })
  }

  // post(path: string, handler: ServerRequestHandler) {
  //   this._routes.push({
  //     path,
  //     method: 'POST',
  //     stack: [this.responseHandler, handler],
  //   })
  // }

  // delete(path: string, handler: ServerRequestHandler) {
  //   this._routes.push({
  //     path,
  //     method: 'DELETE',
  //     stack: [this.responseHandler, handler],
  //   })
  // }

  // put(path: string, handler: ServerRequestHandler) {
  //   this._routes.push({
  //     path,
  //     method: 'PUT',
  //     stack: [this.responseHandler, handler],
  //   })
  // }

  // use(middleware: any) {
  //   if (typeof middleware !== 'function') {
  //     throw new Error('Middleware must be a function!')
  //   }
  //   this._stack.push(middleware)
  // }

  handler = (req: IncomingMessage, res: ServerResponse) => {
    let i = 0
    let path = ''
    const method: string = req.method ? req.method : ''
    if (req.url && req.headers) {
      const url = new URL(req.url, `http://${req.headers.host}`)
      path = url.pathname
    }
    const errorHandler = (err?: any) => {
      if (err == null) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
      }
    }
    const next = (err?: any) => {
      if (err != null) return setImmediate(() => errorHandler(err))
      const found = this._routes.find(
        (route) => route.path === path && route.method === method
      )
      if (found === undefined) return setImmediate(() => errorHandler())
      if (i >= found.stack.length) return setImmediate(() => errorHandler())
      const layer = found.stack[i++]
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

  responseHandler = (_: IncomingMessage, res: Response, next: NextHandler) => {
    res.status = (statusCode) => {
      res.statusCode = statusCode
      return res
    }
    res.send = (body) => {
      if (typeof body === 'string') {
        res.setHeader('Content-Type', 'text/plain')
      } else if (body instanceof Buffer) {
        if (!res.getHeader('Content-Type'))
          res.setHeader('Content-Type', 'application/octet-stream')
      } else if (body != null && typeof body === 'object') {
        res.setHeader('Content-Type', 'application/json')
        body = JSON.stringify(body)
      }
      res.writeHead(res.statusCode, undefined, res.getHeaders())
      res.end(body, 'utf8')
    }
    next()
  }

  listen(): void {
    this._server.listen(this._port, () =>
      console.log(`Server running on port ${this._port}`)
    )
  }
}
