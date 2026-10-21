import { slackChannel } from "@cursor/bdk/channels/slack";

const TRANSACTIONS = "C0CAYPJLKU3";
const TRANSACTIONS_RESULT = "C0CB4QZJ5B4";

/**
 * Socket Mode bot for the MES desk.
 * Tokens: MES_DESK_SLACK_BOT_TOKEN + MES_DESK_SLACK_APP_TOKEN
 * Setup: npx @cursor/bdk slack create --dir .
 */
export default slackChannel({
  envPrefix: "MES_DESK",
  suggestedPrompts: [
    {
      title: "Operación",
      message: "Publica una operación de prueba en #transactions.",
    },
    {
      title: "Resultado",
      message: "Publica un resultado de prueba en #transactions-result.",
    },
  ],
  engagement: {
    channelPosts: {
      allow: [TRANSACTIONS, TRANSACTIONS_RESULT],
      posts: "top-level",
    },
  },
  // The desk posts into these channels. A top-level post should not
  // start another turn, or the bot would answer its own trade cards.
  onChannelPost: async () => null,
});
