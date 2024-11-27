import { createServer } from "node:http";
import { parse } from "node:url";

import { AppAdapter, AppBody, AppHandler, start } from "@this-project/common";

class NodeAppAdapter implements AppAdapter {
  private readonly routes: Map<string, AppHandler> = new Map();

  log(message: string): void {
    console.log(message);
  }

  handleRequest(route: string, handler: AppHandler): void {
    this.routes.set(route, handler);
  }

  listen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        const reqUrl = parse(req.url ?? "", true);
        const handler =
          this.routes.get(reqUrl.pathname ?? "*") ?? this.routes.get("*");

        if (handler) {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString();

            const contentType = req.headers["content-type"];
            const body: AppBody =
              contentType === "application/json"
                ? { type: "json", content: JSON.parse(rawBody) }
                : contentType === "text/plain"
                ? { type: "text", content: rawBody }
                : { type: "text", content: "Unknown content type" };

            const response = await handler({
              method: req.method ?? "",
              body,
            });

            res.writeHead(response.status, {
              "Content-Type":
                response.body.type === "text"
                  ? "text/plain"
                  : "application/json",
            });
            res.end(
              response.body.type === "text"
                ? response.body.content
                : JSON.stringify(response.body.content),
            );
          } catch (error) {
            console.error("Error handling request:", error);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal server error");
          }
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Route not found");
        }
      });

      server.on("error", (err) => reject(err));
      server.listen(port, () => {
        this.log(`Node.js server running on http://localhost:${port}/`);
        resolve();
      });
    });
  }
}

start(new NodeAppAdapter());
