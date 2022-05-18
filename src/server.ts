import http, { IncomingMessage, ServerResponse, Server } from 'http'
import { match, MatchFunction, MatchResult } from 'path-to-regexp'

export interface Request extends IncomingMessage {
  params: Params
  payload: ResponseBody
  [_: string]: any
}

export interface Response extends ServerResponse {
  status: (statusCode: number) => Response
  send: (body: ResponseBody) => void
}

export type ErrorHandler = (err?: unknown) => void
export type NextHandler = (err?: unknown) => void

export type ServerRequestHandler = (
  req: Request,
  res: Response,
  current: Middleware,
  next: NextHandler
) => void

type Middleware = {
  path: string
  matchPathFn: MatchFunction
  method: string
  handlers: ServerRequestHandler[]
}

type Params = {
  [key: string]: string | number
}

type ResponseBody = string | Buffer | object

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
      matchPathFn: match(path),
      method: 'GET',
      handlers: [
        this.enhanceParamsHandler,
        this.enhanceResponseHandler,
        handler,
      ],
    })
  }

  post(path: string, handler: ServerRequestHandler) {
    this._middlewares.push({
      path,
      matchPathFn: match(path),
      method: 'POST',
      handlers: [
        this.enhanceParamsHandler,
        this.payloadHandler,
        this.enhanceResponseHandler,
        handler,
      ],
    })
  }

  delete(path: string, handler: ServerRequestHandler) {
    this._middlewares.push({
      path,
      matchPathFn: match(path),
      method: 'DELETE',
      handlers: [
        this.enhanceParamsHandler,
        this.enhanceResponseHandler,
        handler,
      ],
    })
  }

  put(path: string, handler: ServerRequestHandler) {
    this._middlewares.push({
      path,
      matchPathFn: match(path),
      method: 'PUT',
      handlers: [
        this.enhanceParamsHandler,
        this.payloadHandler,
        this.enhanceResponseHandler,
        handler,
      ],
    })
  }

  handle = (req: IncomingMessage, res: ServerResponse) => {
    let i = 0
    const reqUrl: string = req.url ? req.url : ''
    const reqMethod: string = req.method ? req.method : ''
    const found = this._middlewares.find(
      (route) => route.matchPathFn(reqUrl) && route.method === reqMethod
    )
    const errorHandler: ErrorHandler = (err) => {
      console.error('into errorHandler ', err)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
    }
    const next: NextHandler = (err) => {
      if (err != null) return setImmediate(() => errorHandler(err))
      if (found === undefined)
        return setImmediate(() => errorHandler('MIDDLEWARE NOT FOUND'))
      if (i >= found.handlers.length)
        return setImmediate(() => errorHandler('INDEX LIMIT EXCEEDED'))
      const layer = found.handlers[i++]
      setImmediate(() => {
        try {
          layer(req as Request, res as Response, found, next)
        } catch (error) {
          next(error)
        }
      })
    }
    next()
  }

  enhanceResponseHandler = (
    _: Request,
    res: Response,
    current: Middleware,
    next: NextHandler
  ) => {
    res.status = (statusCode) => {
      res.statusCode = statusCode
      return res
    }
    res.send = (body = '') => {
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

  enhanceParamsHandler = (
    req: Request,
    _: Response,
    current: Middleware,
    next: NextHandler
  ) => {
    const reqUrl: string = req.url ? req.url : ''
    const matched = current.matchPathFn(reqUrl) as MatchResult
    if (matched) req.params = { ...matched.params }
    else req.params = {}
    next()
  }

  payloadHandler = (
    req: Request,
    _: Response,
    current: Middleware,
    next: NextHandler
  ) => {
    if (req.method === 'POST') {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
        if (data.length > 1e6) req.connection.destroy()
      })
      req.on('end', () => {
        req.payload = JSON.parse(data)
        next()
      })
      req.on('error', () => {
        req.payload = {}
        next()
      })
    } else next()
  }

  listen(): void {
    this._server.listen(this._port, () =>
      console.log(`Server running on port ${this._port}`)
    )
  }
}
