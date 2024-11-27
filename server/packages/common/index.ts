export interface AppAdapter {
  log: (message: string) => void;
  handleRequest: (route: string, handler: (req: any, res: any) => void) => void;
  listen: (port: number) => Promise<void>;
}

export interface AppConfig {
  port?: number;
}

export async function start(adapter: AppAdapter, { port = 3000 }: AppConfig = {}) {
  adapter.handleRequest("/hello", (req, res) => {
    res({ status: 200, body: JSON.stringify({ message: "Hello World!" }) });
  });

  adapter.handleRequest("/", (req, res) => {
    res({ status: 200, body: "Welcome to the Home Page!" });
  });

  adapter.handleRequest("*", (req, res) => {
    res({ status: 404, body: "Route not found" });
  });

  await adapter.listen(port);
  adapter.log(`Server running at http://localhost:${port}/`);
}
