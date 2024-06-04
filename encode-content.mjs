import zlib from "node:zlib";

import { promisify } from "node:util";

const deflate = promisify(zlib.createInflate);
const gzip = promisify(zlib.gunzip);
const brotili = promisify(zlib.createBrotliDecompress);

export const encodeContent = async (response, data) => {
  switch (response.headers.get("content-encoding")) {
    case "deflate":
      console.log(
        "decode!! ##",
        (await deflate(Buffer.from(data))).toString()
      );
      break;
    case "gzip":
      console.log(
        "decode!! ##",
        (await gzip(Buffer.from(data))).toString()
      );
      break;
    case "br":
      console.log(
        "decode!! ##",
        (await brotili(Buffer.from(data))).toString()
      );
      break;
    default:
      console.log("#### none of them #####");
  }
};
