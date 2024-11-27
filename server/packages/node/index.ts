import { createServer, IncomingMessage } from "node:http";
import { parse } from "node:url";

import { AppAdapter, start } from "@this-project/common";

class NodeAppAdapter implements AppAdapter {
  private readonly routes: Map<
    string,
    (req: IncomingMessage, res: any) => void
  > = new Map();

  log(message: string): void {
    console.log(message);
  }

  handleRequest(route: string, handler: (req: any, res: any) => void): void {
    this.routes.set(route, handler);
  }

  listen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = createServer((req, res) => {
        const reqUrl = parse(req.url ?? "", true);
        const handler =
          this.routes.get(reqUrl.pathname ?? "*") ?? this.routes.get("*");

        if (handler) {
          handler(req, (response: { status: number; body: string }) => {
            res.writeHead(response.status, {
              "Content-Type": "application/json",
            });
            res.end(response.body);
          });
        }
      });

      server.on("error", (err) => reject(err));
      server.listen(port, () => resolve());
    });
  }
}

start(new NodeAppAdapter());
