#!/usr/bin/env node
import { Command } from "commander";
import { SentinelProxy } from "./proxy.js";
import { PolicyEngine } from "./policy.js";
import { ActionLogger } from "./logger.js";
import { Dashboard } from "./dashboard.js";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import os from "os";

const program = new Command();
const SENTINEL_DIR = path.join(os.homedir(), ".sentinel");

function ensureConfig() {
  if (!fs.existsSync(SENTINEL_DIR)) {
    fs.mkdirSync(SENTINEL_DIR, { recursive: true });
  }
}

program.name("sentinel").description("CuratedMCP local-first action firewall").version("0.1.0");

program
  .command("proxy")
  .description("Run Sentinel as an MCP proxy")
  .argument("[command...]", "downstream MCP server command")
  .option("--policy <path>", "policy file path", path.join(SENTINEL_DIR, "policy.json"))
  .option("--db <path>", "database path", path.join(SENTINEL_DIR, "actions.db"))
  .option("--port <port>", "dashboard port", "4242")
  .action((args, options) => {
    ensureConfig();
    const proxy = new SentinelProxy(options.policy, options.db, args.join(" "));
    const dashboard = new Dashboard(
      new ActionLogger(options.db),
      new PolicyEngine(options.policy),
      parseInt(options.port)
    );
    
    dashboard.start();
    proxy.start().catch(console.error);
  });

// Policy subcommands
const policyCmd = program
  .command("policy")
  .description("Manage policies");

policyCmd
  .command("list")
  .description("List all active policies")
  .action(() => {
    ensureConfig();
    const engine = new PolicyEngine(path.join(SENTINEL_DIR, "policy.json"));
    const rules = engine.listRules();
    console.log("Active Policies:");
    rules.forEach((rule) => {
      console.log(`  - ${rule.name} (${rule.id}): ${rule.action}`);
    });
  });

policyCmd
  .command("add")
  .description("Add a new policy rule")
  .option("--name <name>", "rule name")
  .option("--server <pattern>", "server name glob", "*")
  .option("--tool <pattern>", "tool name glob")
  .option("--action <action>", "ALLOW|BLOCK|REQUIRE_APPROVAL", "BLOCK")
  .option("--severity <severity>", "INFO|WARNING|CRITICAL", "WARNING")
  .action((options) => {
    ensureConfig();
    const engine = new PolicyEngine(path.join(SENTINEL_DIR, "policy.json"));
    const rule = {
      id: `rule-${randomUUID()}`,
      name: options.name || options.tool,
      serverName: options.server,
      toolName: options.tool || "*",
      action: options.action,
      severity: options.severity,
      enabled: true,
      createdAt: Date.now(),
    };
    engine.addRule(rule);
    console.log(`✓ Added rule: ${rule.name}`);
  });

policyCmd
  .command("remove <ruleId>")
  .description("Remove a policy rule")
  .action((ruleId) => {
    ensureConfig();
    const engine = new PolicyEngine(path.join(SENTINEL_DIR, "policy.json"));
    engine.removeRule(ruleId);
    console.log(`✓ Removed rule: ${ruleId}`);
  });

program
  .command("retention")
  .description("Set action log retention")
  .argument("<minutes>", "retention minutes")
  .action((minutes) => {
    ensureConfig();
    const config = path.join(SENTINEL_DIR, "config.json");
    const data = fs.existsSync(config) ? JSON.parse(fs.readFileSync(config, "utf-8")) : {};
    data.retentionMinutes = parseInt(minutes);
    fs.writeFileSync(config, JSON.stringify(data, null, 2));
    console.log(`✓ Set retention to ${minutes} minutes`);
  });

program
  .command("dashboard")
  .description("Open the Sentinel dashboard")
  .option("--port <port>", "dashboard port", "4242")
  .action((options) => {
    ensureConfig();
    const logger = new ActionLogger(path.join(SENTINEL_DIR, "actions.db"));
    const engine = new PolicyEngine(path.join(SENTINEL_DIR, "policy.json"));
    const dashboard = new Dashboard(logger, engine, parseInt(options.port));
    dashboard.start();
  });

program.parse();
