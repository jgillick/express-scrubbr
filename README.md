# Scrubbr Express TypeScript Serializer

Seamlessly serialize JSON data using TypeScript in express.

![Simple Example](https://github.com/jgillick/scrubbr/raw/main/example.png)

## Setup & Installation

This middleware requires [Scrubbr](https://github.com/jgillick/scrubbr) to be installed and setup.

```shell
npm i -S scrubbr
npm i -S express-scrubbr
```

Add middleware to your express app

```ts
import express from "express";
import Scrubbr from "scrubbr";
import scrubbrMiddleware from "express-scrubbr";

var app = express();

// Load typescript schema and set any scrubbr options
const scrubbr = new Scrubbr("./schema.ts");
app.use(scrubbrMiddleware(scrubbr));
```

Use it in your routes

```ts
app.get('/users', (req, res) => {
  const userData = fetchDataHere();
  resp.status(200)
    .scrubbr('UserList') // serialize userData with the UserList typescript type
    .send(userData);
}
```

## Setting route-level options

You can pass scrubbr options at the route level:

```ts
resp
  .status(200)
  .scrubbr("UserList", { logLevel: LogLevel.DEBUG })
  .send(userData);
```

You can also pass a custom scrubbr instance:

```ts
const customScrubbr = scrubbr.clone();
customScrubbr.addTypeSerializer("User", userTransformer);

resp.status(200).scrubbr("UserList", customScrubbr).send(userData);
```

# License

[MIT](https://github.com/ajv-validator/ajv/blob/HEAD/LICENSE)
