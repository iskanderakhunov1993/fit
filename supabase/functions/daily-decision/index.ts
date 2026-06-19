import {
  createDemoDailyDecision,
  createEnvelope,
  isDailyDecisionOutput,
  parseDailyDecisionInput
} from "../../../shared/ai-contracts.ts";
import { handleStubRequest } from "../_shared/ai-stub.ts";

Deno.serve((request) =>
  handleStubRequest(
    request,
    "daily-decision",
    parseDailyDecisionInput,
    createDemoDailyDecision,
    isDailyDecisionOutput,
    createEnvelope
  )
);
