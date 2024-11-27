import { AppAdapter, AppHandler, start } from "@this-project/common/index.ts";

class DenoAppAdapter implements AppAdapter {
  private readonly routes: Map<string, AppHandler> = new Map();

  log(message: string): void {
    console.log(message);
  }

  handleRequest(route: string, handler: AppHandler): void {
    this.routes.set(route, handler);
  }

  async listen(port: number): Promise<void> {
    await Deno.serve({ port }, async (req) => {
      const url = new URL(req.url);
      const handler = this.routes.get(url.pathname) || this.routes.get("*");

      if (handler) {
        try {
          const contentType = req.headers.get("content-type");
          const response =
            contentType === "text/plain"
              ? await handler({
                  method: req.method,
                  body: { type: "text", content: await req.text() },
                })
              : contentType === "application/json"
              ? await handler({
                  method: req.method,
                  body: { type: "text", content: await req.json() },
                })
              : ({
                  status: 400,
                  body: { type: "text", content: "Unknown content type" },
                } as const);
          return new Response(
            response.body.type === "text"
              ? response.body.content
              : JSON.stringify(response.body.content),
            {
              status: response.status,
              headers: {
                "Content-Type":
                  response.body.type === "text"
                    ? "text/plain"
                    : "application/json",
              },
            },
          );
        } catch {
          return new Response("Internal server error", { status: 500 });
        }
      }

      return new Response("Route not found", { status: 404 });
    });
  }
}

start(new DenoAppAdapter());
