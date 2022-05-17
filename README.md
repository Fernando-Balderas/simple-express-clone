# NodeJS assignment
Write a class to simulate a very basic & minimized version of ExpressJS framework. Lets call it `HttpServer` and the usage is as following:
```
// 3000 is port number
const server = new HttpServer(3000)

server.get('/', (req, res) => {
  res.status(200).send('Home page')
})

server.post('/api/posts', (req, res) => {
  const post = req.payload
  res.status(200).send(post)
})

server.delete('/api/posts/:postId', (req, res) => {
  const postId = req.params.postId
  res.status(200).send(`Deleted ${postId}`)
})

server.put('/api/posts/:postId', (req, res) => {
  const postId = req.params.postId
  res.status(200).send(`Updated ${postId}`)
})

server.listen()
```

The basic skeleton of the class is something like this:
```
import {IncomingMessage, ServerResponse} from 'http'

class HttpServer {
  constructor(private readonly _port: number = 3000) {
  }
  
  get(path: string, handler: ServerRequestHandler) {
    // Your code here
  }
  
  post(path: string, handler: ServerRequestHandler) {
    // Your code here
  }
  
  delete(path: string, handler: ServerRequestHandler) {
  }
  
  put(path: string, handler: ServerRequestHandler) {
    // Your code here
  }
  
  listen() {
    // Your code here
  }
}
```

## Requirements & references
* Use TypeScript & vanilla NodeJS
* You can't use Express but instead, use [Http module](https://nodejs.org/api/http.html)
* Use [path-to-regexp](https://github.com/pillarjs/path-to-regexp) module to parse the URL, query parameters etc
* To read request payload, check: https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
* For type definitions of Http module, check: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/http.d.ts

You can use this template to do the assignment. Follow instructions below:

## Usage
* Install
```
yarn install
```

* Run & automatically reload on changes
```
yarn start:watch
```

* Write your code in `src/server.ts`, don't touch `start.ts`
