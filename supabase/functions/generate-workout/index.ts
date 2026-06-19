import {
  createDemoWorkout,
  createEnvelope,
  isWorkoutOutput,
  parseGenerateWorkoutInput
} from "../../../shared/ai-contracts.ts";
import { handleStubRequest } from "../_shared/ai-stub.ts";

Deno.serve((request) =>
  handleStubRequest(
    request,
    "generate-workout",
    parseGenerateWorkoutInput,
    createDemoWorkout,
    isWorkoutOutput,
    createEnvelope
  )
);
