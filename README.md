# Partytown reverse proxy in NodeJS (Fastify and Next.JS)

🔁 Reverse proxy requests from basic NodeJS server w/ Fastify and Next.JS API handler.

This repo is to show a example of a reverse proxy to use with [Partytown](https://partytown.builder.io/proxying-requests).

## Running

### Fastify

```sh
npm install && node fastify-reverse-proxy.mjs
```

## Testing

```sh
curl "http://localhost:3000/proxy?target=https://analytics.tiktok.com/i18n/pixel/static/main.MTc5M2Y0YjUwMQ.js"
```

Should return the `text/html` from script. Now in the browser, you can test if not will trouble in CORS anymore:

```js
fetch("http://localhost:3000/proxy?target=http://bat.bing.com/bat.js").then((r) => {
  r.text().then((t) => {
    console.log("text retrieved", t);
  });
});
```

### Missing features

1. Return encoded data based on `content-encoding` Header
2. Return 401 for urls not included in a `allow list` for proxy
