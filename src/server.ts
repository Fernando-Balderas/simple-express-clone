import http, { IncomingMessage, ServerResponse, Server } from 'http'
import { match, MatchFunction, MatchResult } from 'path-to-regexp'

export type ErrorHandler = (err?: unknown) => void
export type NextHandler = (err?: unknown) => void

export type ServerRequestHandler = (
  req: Request,
  res: Response,
  next: NextHandler
) => void

type Middleware = {
  path: string
  pathFn: MatchFunction
  method: string
  handlers: ServerRequestHandler[]
}

type Params = {
  [key: string]: string | number
}

export type Request = {
  params: Params
} & IncomingMessage

type ResponseBody = string | Buffer | object

export type Response = {
  status: (statusCode: number) => Response
  send: (body: ResponseBody) => void
  statusCode: number
} & ServerResponse

export default class HttpServer {
  private _server: Server
  private _middlewares: Middleware[]

  constructor(private readonly _port: number = 3000) {
    this._server = http.createServer(this.handle)
    this._middlewares = []
  }

  get(path: string, handler: ServerRequestHandler) {
    this._middlewares.push({
      path,
      pathFn: match(path),
      method: 'GET',
      handlers: [this.responseHandler, handler],
    })
  }

  // post(path: string, handler: ServerRequestHandler) {
  //   this._middlewares.push({
  //     path,
  //     method: 'POST',
  //     handlers: [this.responseHandler, handler],
  //   })
  // }

  delete(path: string, handler: ServerRequestHandler) {
    this._middlewares.push({
      path,
      pathFn: match(path),
      method: 'DELETE',
      handlers: [this.responseHandler, handler],
    })
  }

  put(path: string, handler: ServerRequestHandler) {
    this._middlewares.push({
      path,
      pathFn: match(path),
      method: 'PUT',
      handlers: [this.responseHandler, handler],
    })
  }

  handle = (req: IncomingMessage, res: ServerResponse) => {
    let i = 0
    let reqPath = ''
    const method: string = req.method ? req.method : ''
    if (req.url && req.headers) {
      const url = new URL(req.url, `http://${req.headers.host}`)
      reqPath = url.pathname
    }
    const found = this._middlewares.find(
      (route) => route.pathFn(reqPath) && route.method === method
    )
    // Overload req with params from uri
    let params = {}
    if (found != undefined) {
      const matched = found.pathFn(reqPath) as MatchResult
      params = matched.params
    }
    req = { ...req, params: { ...params } } as Request
    const errorHandler: ErrorHandler = (err) => {
      if (err == null) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
      }
    }
    const next: NextHandler = (err) => {
      if (err != null) return setImmediate(() => errorHandler(err))
      if (found === undefined) return setImmediate(() => errorHandler())
      if (i >= found.handlers.length) return setImmediate(() => errorHandler())
      const layer = found.handlers[i++]
      setImmediate(() => {
        try {
          layer(req as Request, res as Response, next)
        } catch (error) {
          next(error)
        }
      })
    }
    next()
  }

  responseHandler = (_: Request, res: Response, next: NextHandler) => {
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
