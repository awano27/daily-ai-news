const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 4173);
const root = __dirname;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
};

http
  .createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname === "/api/runtime-config") {
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      });
      response.end(JSON.stringify({
        supabase: {
          enabled: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
          url: process.env.SUPABASE_URL || "",
          anonKey: process.env.SUPABASE_ANON_KEY || "",
        },
      }));
      return;
    }
    const requestedPath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const filePath = path.join(root, requestedPath);

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("not found");
        return;
      }

      const type = contentTypes[path.extname(filePath)] || "text/plain; charset=utf-8";
      response.writeHead(200, { "Content-Type": type });
      response.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`http://127.0.0.1:${port}/`);
  });
