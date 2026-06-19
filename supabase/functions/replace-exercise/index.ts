import {
  createDemoReplacement,
  createEnvelope,
  isReplaceExerciseOutput,
  parseReplaceExerciseInput
} from "../../../shared/ai-contracts.ts";
import { handleStubRequest } from "../_shared/ai-stub.ts";

Deno.serve((request) =>
  handleStubRequest(
    request,
    "replace-exercise",
    parseReplaceExerciseInput,
    createDemoReplacement,
    isReplaceExerciseOutput,
    createEnvelope
  )
);
