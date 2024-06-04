
import { Agent } from 'undici';

const reverseProxy = async (_req, res) => {
  const url = (_req.query?.url || []).join('/');
  const targetUrl = decodeURIComponent((_req.query?.target) || '');

  const { target: _unusedTarget, url: _unusedUrl, ...restQuery } = { ..._req?.query };

  let parsedUrl = null;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (error) {
    console.error('[Proxy] - Error building url', error);
    parsedUrl = null;
  }

  if (!parsedUrl) {
    console.log('[Proxy] Returning 204', parsedUrl);
    return res.status(204).send(JSON.stringify({ message: 'not found target url' }));
  }

  let targetQueryString = '';
  if (Object.keys(restQuery).length > 0) {
    targetQueryString = `?${new URLSearchParams(
      restQuery
    ).toString()}`;
  }

  try {
    const urlFinal = `${targetUrl}/${url}${targetQueryString}`;
    const agent = new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    });

    const options = {
      dispatcher: agent,
      method: _req.method,
      mode: 'no-cors',
      headers: {
        'User-Agent': _req.headers['user-agent'] || '',
      },
    };

    if (_req.body) {
      try {
        options.body = JSON.stringify(_req.body);
      } catch (error) {
        console.error('[Proxy] - Error trying to build body', error);
      }
    }
    const response = await fetch(urlFinal, options);

    const data = await response.text();

    /**
     *
     * Back this below headers bypass understanding why
     * http://localhost:3000/api/reverse-proxy/i18n/pixel/events.js?target=https%3A%2F%2Fanalytics.tiktok.com&sdkid=C1I87V1T0U322RQPSRKG&lib=ttq
     * do not work...
     */
    // response.headers.forEach((value, key) => {
    //   res.setHeader(key, value);
    // });
    res.setHeader('Content-Type', response.headers.get('content-type') || '');

    console.log('[Proxy] Returning 200 and data', urlFinal);
    return res.status(200).send(data);
  } catch (error) {
    console.error('[Proxy] General error', error);
    return res.status(500).send({ error: 'true' });
  }
};

export default reverseProxy;
