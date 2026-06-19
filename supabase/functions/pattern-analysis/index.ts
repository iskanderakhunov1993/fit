import {
  createDemoPatternAnalysis,
  createEnvelope,
  isPatternAnalysisOutput,
  parsePatternAnalysisInput
} from "../../../shared/ai-contracts.ts";
import { handleStubRequest } from "../_shared/ai-stub.ts";

Deno.serve((request) =>
  handleStubRequest(
    request,
    "pattern-analysis",
    parsePatternAnalysisInput,
    createDemoPatternAnalysis,
    isPatternAnalysisOutput,
    createEnvelope
  )
);
