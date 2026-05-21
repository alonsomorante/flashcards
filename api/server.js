const { app } = require("./server.cjs");

module.exports = async (req, res) => {
  const url = `https://${req.headers.host}${req.url}`;
  const body = req.method !== "GET" && req.method !== "HEAD" 
    ? await new Promise((resolve) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      })
    : undefined;

  const request = new Request(url, {
    method: req.method,
    headers: new Headers(Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v])),
    body,
  });

  try {
    const response = await app.fetch(request);
    res.statusCode = response.status;
    res.statusMessage = response.statusText;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const text = await response.text();
    res.end(text);
  } catch (err) {
    console.error("Error handling request:", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
