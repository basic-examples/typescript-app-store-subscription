export type Awaitable<T> = T | PromiseLike<T>;

export interface AppRequest {
  method: string;
  body: AppBody;
}

export interface AppResponse {
  status: number;
  body: AppBody;
}

export type AppBody = AppBodyJson | AppBodyText;

export interface AppBodyJson {
  type: "json";
  content: object;
}

export interface AppBodyText {
  type: "text";
  content: string;
}

export type AppHandler = (req: AppRequest) => Awaitable<AppResponse>;

export interface AppAdapter {
  log: (message: string) => void;
  handleRequest: (route: string, handler: AppHandler) => void;
  listen: (port: number) => Promise<void>;
}

export interface AppConfig {
  port?: number;
}

export async function start(
  adapter: AppAdapter,
  { port = 3000 }: AppConfig = {},
) {
  adapter.handleRequest("/hello", (req) => {
    return {
      status: 200,
      body: { type: "json", content: { message: { message: "Hello World!" } } },
    };
  });

  adapter.handleRequest("/", (req) => {
    return {
      status: 200,
      body: { type: "text", content: "Welcome to the Home Page!" },
    };
  });

  await adapter.listen(port);
  adapter.log(`Server running at http://localhost:${port}/`);
}
