import { PolicyEngine } from "./policy.js";
import { ActionLogger } from "./logger.js";
import { ToolCallRequest, ActionLog } from "./types.js";
import { randomUUID } from "crypto";

/**
 * SentinelProxy intercepts MCP tool calls and evaluates them against policies.
 * This is a simplified implementation; production version would use proper MCP transport.
 */
export class SentinelProxy {
  private policyEngine: PolicyEngine;
  private actionLogger: ActionLogger;
  private downstreamCommand: string;

  constructor(
    policyFilePath: string,
    dbPath: string,
    downstreamCommand: string
  ) {
    this.policyEngine = new PolicyEngine(policyFilePath);
    this.actionLogger = new ActionLogger(dbPath);
    this.downstreamCommand = downstreamCommand;
  }

  /**
   * Evaluate a tool call request against active policies
   */
  evaluateRequest(toolName: string, serverId: string, args: Record<string, unknown>) {
    const requestId = randomUUID();
    const timestamp = Date.now();

    // Create tool call request
    const toolCall: ToolCallRequest = {
      id: requestId,
      serverId,
      toolName,
      arguments: args,
      timestamp,
    };

    // Evaluate against policy
    const decision = this.policyEngine.evaluateToolCall(toolCall);

    // Log the action
    const log: ActionLog = {
      id: randomUUID(),
      requestId,
      serverId,
      toolName,
      arguments: JSON.stringify(args),
      action: decision.action,
      severity: decision.severity,
      ruleId: decision.ruleId,
      approvalStatus:
        decision.action === "REQUIRE_APPROVAL" ? "PENDING" : "CLEARED",
      timestamp,
      expiresAt: timestamp + 24 * 60 * 60 * 1000, // 24h retention
    };

    this.actionLogger.logAction(log);

    if (decision.action === "BLOCK") {
      throw new Error(
        `Tool call blocked by policy: ${decision.ruleId || "unknown"}`
      );
    }

    if (decision.action === "REQUIRE_APPROVAL") {
      // In real implementation, would wait for approval via dashboard
      throw new Error(`Tool call requires approval: ${requestId}`);
    }

    return { success: true, requestId, decision };
  }

  async start() {
    // In production, this would spawn the downstream MCP server as a child process
    // and set up proper stdio transport for MCP protocol
    console.log(`🔗 Sentinel Proxy initialized for: ${this.downstreamCommand}`);
  }

  shutdown() {
    this.actionLogger.close();
  }
}
