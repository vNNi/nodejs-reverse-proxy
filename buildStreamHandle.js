const buildHandleStreamble = (parsedSSL, reply) => (options) => {
  if (process.env.resolveAsStream) {
    const parsedHost = parsedUrl.hostname;

    let parsedPort = 443;
    let parsedSSL = https;
    if (targetUrl.startsWith("https://")) {
      parsedPort = 443;
      parsedSSL = https;
    } else if (targetUrl.startsWith("http://")) {
      parsedPort = 80;
      parsedSSL = http;
    }

    const options = {
      hostname: `${parsedHost}`,
      port: parsedPort,
      path: parsedUrl.pathname,
      method: request.method,
      rejectUnauthorized: false,
      headers: {
        "User-Agent": request.headers["user-agent"],
      },
    };

    try {
      const serverRequest = parsedSSL
        .request(options, (serverResponse) => {
          console.log("server response", serverResponse);

          reply.send(serverResponse);
        })
        .on("error", (error) => {
          reply.send(error);
        });
      serverRequest.end();
    } catch (error) {
      console.log("error", error);
    }
  }
};
