import { Config, Context, Effect, Layer, Secret } from "effect";
// import AccessTokenJson from "./do_not_open_on_stream/access-token.json";
import type { AccessToken } from "@spotify/web-api-ts-sdk";

// TODO Schema decode
const accessToken: AccessToken = undefined as unknown as AccessToken;

const make = Effect.gen(function* () {
  const clientId = yield* Config.string("SPOTIFY_CLIENT_ID");
  const clientSecret = yield* Config.secret("SPOTIFY_CLIENT_SECRET");
  const port = yield* Config.number("REDIRECT_SERVER_PORT").pipe(
    Config.withDefault(3939)
  );
  const redirectServerPath = yield* Config.string("REDIRECT_SERVER_PATH").pipe(
    Config.withDefault("redirect")
  );

  return {
    accessToken,
    clientId,
    clientSecret,
    port,
    redirectServerPath,
  } as const;
});

export class SpotifyConfigService extends Context.Tag("spotify-config-service")<
  SpotifyConfigService,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(SpotifyConfigService, make);
}
