import type { TrackItem } from "@spotify/web-api-ts-sdk";
import { Data, Types } from "effect";
import type { QueueItem } from "../song-queue/client";

export type Message = Data.TaggedEnum<{
  CurrentlyPlaying: {
    song: string;
    artists: ReadonlyArray<string>;
    requesterDisplayName: string;
  };
  CurrentlyPlayingRequest: { requesterDisplayName: string };
  KeyboardRaffleRequest: { requesterDisplayName: string };
  SendTwitchChat: { message: string };
  SongRequest: {
    eventId: string;
    requesterDisplayName: string;
    rewardId: string;
    url: string;
  };
  StartNixTimer: {};
  StopNixTimer: {};
  SongAddedToSpotifyQueue: { track: TrackItem; requesterDisplayName: string };
  SongQueueRequest: {};
  SongQueue: {
    queue: ReadonlyArray<QueueItem>;
  };
  RefundRewardRequest: {
    eventId: string;
    requesterDisplayName: string;
    rewardId: string;
  };
}>;

export const Message = Data.taggedEnum<Message>();

export type MessageType = Types.Tags<Message>;

type ExtractMessage<T extends MessageType> = Types.ExtractTag<Message, T>;

export type CurrentlyPlayingRequestMessage =
  ExtractMessage<"CurrentlyPlayingRequest">;

export type CurrentlyPlayingMessage = ExtractMessage<"CurrentlyPlaying">;

export type KeyboardRaffleRequestMessage =
  ExtractMessage<"KeyboardRaffleRequest">;

export type SendTwitchChatMessage = ExtractMessage<"SendTwitchChat">;

export type SongAddedToSpotifyQueueMessage =
  ExtractMessage<"SongAddedToSpotifyQueue">;

export type SongRequestMessage = ExtractMessage<"SongRequest">;

export type SongQueueRequestMessage = ExtractMessage<"SongQueueRequest">;

export type SongQueueMessage = ExtractMessage<"SongQueue">;

export type RefundRewardRequestMessage = ExtractMessage<"RefundRewardRequest">;

export type StartNixTimerMessage = ExtractMessage<"StartNixTimer">;
export type StopNixTimerMessage = ExtractMessage<"StopNixTimer">;

export type MessageTypeToMessage = {
  CurrentlyPlayingRequest: CurrentlyPlayingRequestMessage;
  CurrentlyPlaying: CurrentlyPlayingMessage;
  KeyboardRaffleRequest: KeyboardRaffleRequestMessage;
  SendTwitchChat: SendTwitchChatMessage;
  SongAddedToSpotifyQueue: SongAddedToSpotifyQueueMessage;
  SongRequest: SongRequestMessage;
  SongQueueRequest: SongQueueRequestMessage;
  SongQueue: SongQueueMessage;
  RefundRewardRequest: RefundRewardRequestMessage;
  StartNixTimer: StartNixTimerMessage;
  StopNixTimer: StopNixTimerMessage;
};
