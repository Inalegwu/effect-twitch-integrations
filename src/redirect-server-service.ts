import { randomBytes } from "crypto";
import {
  Context,
  Deferred,
  Effect,
  Layer,
  Option,
  Function,
  Secret,
} from "effect";
import { SpotifyConfigService } from "./spotify-config-service";

export type RedirectServerOptions = Readonly<{
  clientId: string;
  clientSecret: string;
  csrfToken: string;
  port: number;
  redirectServerPath: string;
}>;

export type IRedirectServer = Readonly<{
  getMailbox: () => Effect.Effect<Deferred.Deferred<string, Error>, Error>;
  getCsrfToken: () => string;
}>;

export class RedirectServer extends Context.Tag("redirect-server")<
  RedirectServer,
  IRedirectServer
>() {
  static Live = Layer.scoped(
    RedirectServer,
    Effect.flatMap(SpotifyConfigService, (config) => {
      return Effect.gen(function* () {
        const mailbox = yield* Deferred.make<string, Error>();
        const csrfToken = randomBytes(256).toString("hex");

        yield* Effect.acquireRelease(
          Effect.succeed(
            Bun.serve({
              port: config.port,
              fetch: makeRouter(mailbox, {
                clientId: config.clientId,
                clientSecret: Secret.value(config.clientSecret),
                csrfToken,
                port: config.port,
                redirectServerPath: config.redirectServerPath,
              }),
            }),
          ),
          (server) => {
            return Effect.succeed(server.stop()).pipe(() =>
              Effect.logInfo("stopped bun http server"),
            );
          },
        );

        return RedirectServer.of({
          getCsrfToken() {
            return csrfToken;
          },
          getMailbox() {
            return Effect.flatMap(Deferred.isDone(mailbox), (isDone) => {
              if (isDone) {
                return Effect.fail(new Error("Mailbox has already been read"));
              }

              return Effect.succeed(mailbox);
            });
          },
        });
      });
    }),
  ).pipe(Layer.provide(SpotifyConfigService.Live));
}

function makeRouter(
  mailbox: Deferred.Deferred<string, Error>,
  options: RedirectServerOptions,
) {
  return function router(req: Request) {
    return Effect.gen(function* () {
      const url = new URL(req.url);

      switch (url.pathname) {
        case "/ping": {
          return new Response("pong");
        }
        case `/${options.redirectServerPath}`: {
          return yield* Effect.all({
            code: Option.fromNullable(url.searchParams.get("code")).pipe(
              Effect.mapError(Function.constant(new Error("No code received"))),
            ),
            // TODO: Validate that state matches the csrfToken
            state: Option.fromNullable(url.searchParams.get("state")).pipe(
              Effect.mapError(
                Function.constant(new Error("No state received")),
              ),
            ),
          })
            .pipe(
              Effect.match({
                onSuccess: (params) => {
                  return Effect.gen(function* () {
                    yield* Deferred.succeed(mailbox, params.code);

                    return new Response("success", { status: 200 });
                  });
                },
                onFailure: (error) => {
                  return Effect.gen(function* () {
                    yield* Deferred.fail(mailbox, error);

                    return new Response(`bad request: ${error.message}`, {
                      status: 400,
                    });
                  });
                },
              }),
            )
            .pipe(Effect.runSync);
        }
        default: {
          yield* Deferred.fail(mailbox, new Error("not found"));
          return new Response("not found", { status: 404 });
        }
      }
    }).pipe(Effect.runPromise);
  };
}
