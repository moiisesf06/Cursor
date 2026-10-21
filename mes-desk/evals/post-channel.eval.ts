import { defineEval } from "@cursor/bdk/evals";

export default defineEval({
  tags: ["smoke"],
  cases: [
    {
      id: "transactions",
      description: "A trade card goes to #transactions through post-channel.",
      async test(t) {
        await t.send(
          "Publica en #transactions la operación 21_10-1. Hora 09:33 ET, entrada 7773, stop 7768, take profit 7783.",
        );
        t.succeeded();
        t.calledTool("post-channel");
        t.notCalledTool("echo");
      },
    },
  ],
});
