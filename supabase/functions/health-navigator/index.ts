import {
  createDemoHealthNavigator,
  createEnvelope,
  isHealthNavigatorOutput,
  parseHealthNavigatorInput
} from "../../../shared/ai-contracts.ts";
import { handleStubRequest } from "../_shared/ai-stub.ts";

Deno.serve((request) =>
  handleStubRequest(
    request,
    "health-navigator",
    parseHealthNavigatorInput,
    createDemoHealthNavigator,
    isHealthNavigatorOutput,
    createEnvelope
  )
);
