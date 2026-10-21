import {
  credentialsFromEnv,
  postMessage,
  tryResolveBotToken,
} from "@cursor/bdk/channels/slack";
import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";

const CHANNELS = {
  transactions: "C0CAYPJLKU3",
  "transactions-result": "C0CB4QZJ5B4",
} as const;

const credentials = credentialsFromEnv("MES_DESK");

type PostedRecord = {
  channel: keyof typeof CHANNELS;
  channelId: string;
  ts: string;
  clientMessageId: string;
};

function isPostedRecord(value: unknown): value is PostedRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.channel === "string" &&
    typeof record.channelId === "string" &&
    typeof record.ts === "string" &&
    typeof record.clientMessageId === "string"
  );
}

export default defineTool({
  description:
    "Post one message to #transactions or #transactions-result. Refuses every other destination. Repeating the same clientMessageId does not post again.",
  effect: "write",
  inputSchema: z.object({
    channel: z.enum(["transactions", "transactions-result"]),
    text: z.string().min(1).max(4000),
    clientMessageId: z.string().min(1).max(80),
  }),
  dryRunResult: ({ channel, clientMessageId }) => ({
    posted: false,
    dryRun: true,
    channel,
    clientMessageId,
  }),
  async execute({ channel, text, clientMessageId }, ctx) {
    const channelId = CHANNELS[channel];
    const key = `slack-post:${channel}:${clientMessageId}`;
    if (ctx.session.purpose === "eval") {
      return {
        posted: false,
        eval: true,
        channel,
        channelId,
        clientMessageId,
      };
    }
    const existing = await ctx.host.kv.get(key);
    if (isPostedRecord(existing)) {
      return { posted: false, duplicate: true, ...existing };
    }
    const botToken = await tryResolveBotToken(credentials);
    if (botToken === undefined) {
      return {
        posted: false,
        error: "missing_bot_token",
        env: "MES_DESK_SLACK_BOT_TOKEN",
      };
    }
    const result = await postMessage({
      botToken,
      channel: channelId,
      text,
      plainText: true,
    });
    const record: PostedRecord = {
      channel,
      channelId,
      ts: result.ts,
      clientMessageId,
    };
    await ctx.host.kv.put(key, record);
    return { posted: true, ...record };
  },
});
