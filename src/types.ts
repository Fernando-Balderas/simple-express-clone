import { IncomingMessage, ServerResponse } from 'http'
import { MatchFunction } from 'path-to-regexp'

export interface Request extends IncomingMessage {
  params: Params
  payload: ResponseBody
  [_: string]: any
}

export interface Response extends ServerResponse {
  status: (statusCode: number) => Response
  send: (body: ResponseBody) => void
}

export type ErrorHandlerFn = (err?: unknown) => void
export type NextHandlerFn = (err?: unknown) => void

export type ServerRequestHandler = (
  req: Request,
  res: Response,
  current: Middleware,
  next: NextHandlerFn
) => void

export type Middleware = {
  path: string
  matchPathFn: MatchFunction
  method: string
  handlers: ServerRequestHandler[]
}

export type Params = {
  [key: string]: string | number
}

export type ResponseBody = string | Buffer | object
