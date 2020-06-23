fresh
==========================

HTTP response freshness tester for Deno. Code ported from `https://github.com/jshttp/fresh`.


API
--------------------------

```js
import fresh from "https://deno.land/x/fresh/mod.ts";
```

### [fresh( reqHeaders, resHeaders )](#fresh)

Verifies if a browsers cache could be considered fresh.

**Returns:** A boolean indicating if the request has a fresh cache of the response.

#### Parameters
* `reqHeaders {Headers}` - Headers from the server request.
* `resHeaders {Headers}` - Headers from the server response.


Examples
--------------------------

```js
import { serve } from "https://deno.land/std/http/server.ts";
import fresh from "https://deno.land/x/fresh/mod.ts";

const server = serve({ port: 3000 });
console.log("Server listening on port 3000");

for await (const req of server) {
  const res = {
    status: 404,
    headers: new Headers({
      "ETag": '"ABC"',
      "Content-Type": "text/plain",
    }),
    body: '',
  };

  // If browser already has a matching etag it should render from client cache
  if (fresh(req.headers, res.headers)) {
    res.status = 304;
    console.log('fresh request');
  } else {
    res.status = 200;
    res.body = "Hello world, this should be cached";
    console.log('stale request');
  }

  req.respond(res);
}

```

Testing
--------------------------

```sh
$ deno test
```

License
--------------------------

[MIT](./LICENSE)
