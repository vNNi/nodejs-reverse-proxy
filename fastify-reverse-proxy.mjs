import { Agent } from "undici";

import Fastify from "fastify";
import cors from "@fastify/cors";

import { encodeContent } from "./encode-content.mjs";

const fastify = Fastify({
  logger: true,
});
await fastify.register(cors, {});

fastify.get("/proxy", async function handler(request, reply) {
  const targetUrl = decodeURIComponent(request.query?.target || "");
  let parsedUrl;

  if (!targetUrl) {
    reply.code(400);
    return reply.send({ error: "should has target url for proxy" });
  }

  try {
    parsedUrl = new URL(targetUrl);
  } catch (error) {
    parsedUrl = null;
  }

  if (!parsedUrl) {
    return reply.status(204).send();
  }

  try {
    const urlFinal = parsedUrl.toString();
    const agent = new Agent({
      connect: {
        keepAlive: true,
        rejectUnauthorized: false,
      },
    });

    const currentHeaders = new Headers({ ...Object(request.raw.headers) });

    const response = await fetch(urlFinal, {
      dispatcher: agent,
      method: request.method,
      mode: "no-cors",
      headers: currentHeaders,
    });
    const data = await response.text();

    if (response.headers.get("content-encoding")) {
      /**
       * we should encode to return...
       * ref: https://nodejs.org/api/zlib.html
       */
      // encodeContent(response, data)
    }
    // this doesn't work...
    // on: http://localhost:3000/proxy?target=https%3A%2F%2Fanalytics.tiktok.com/i18n/pixel/static/main.MTc5M2Y0YjUwMQ.js
    response.headers.forEach((value, key) => {
      /**
       * Here we need (for while) we need to ignore
       * encoding or instead encode de data with same
       * encoding algorithm, otherwise we receive the error: ERR_CONTENT_DECODING_FAILED
       * https://kinsta.com/knowledgebase/err_content_decoding_failed/
       */
      if (["content-encoding"].includes(key)) {
        return;
      }
      reply.header(key, value);
    });

    reply.header("Content-Type", response.headers.get("content-type") || "");

    return reply.status(response.status).send(data);
  } catch (error) {
    return reply.status(500).send({ error: "true" });
  }
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
