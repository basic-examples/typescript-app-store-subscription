import { AppAdapter, start } from "@this-project/common/index.ts";

class DenoAppAdapter implements AppAdapter {
  private readonly routes: Map<string, (req: Request, res: any) => void> =
    new Map();

  log(message: string): void {
    console.log(message);
  }

  handleRequest(route: string, handler: (req: any, res: any) => void): void {
    this.routes.set(route, handler);
  }

  async listen(port: number): Promise<void> {
    await Deno.serve({ port }, (req) => {
      const url = new URL(req.url);
      const handler = this.routes.get(url.pathname) || this.routes.get("*");

      if (handler) {
        let response: { status: number; body: string } = {
          status: 500,
          body: "Internal Server Error",
        };
        handler(req, (res: any) => (response = res));
        return new Response(response.body, {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Route not found", { status: 404 });
    });
  }
}

// Example usage
const adapter = new DenoAppAdapter();
start(adapter, { port: 3000 });
