#!/usr/bin/env node
// roborev CLI — commit-native review daemon event emitter.
// Emits Paperclip-ready task rows into the pending JSONL spillover.
import { readFileSync } from "node:fs";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { homedir } from "node:os";
import { normalizeEvent, validate } from "../src/events.mjs";

const DEFAULT_OUT = resolvePath(homedir(), ".djimit/roborev/paperclip-tasks.pending.jsonl");

function readInput() {
  // Explicit flags first, then fall back to stdin.
  const args = process.argv.slice(2);
  const jsonIdx = args.indexOf("--json");
  if (jsonIdx !== -1 && args[jsonIdx + 1]) return args[jsonIdx + 1];
  const fileIdx = args.indexOf("--event");
  if (fileIdx !== -1 && args[fileIdx + 1]) return readFileSync(args[fileIdx + 1], "utf8");
  if (!process.stdin.isTTY) return readFileSync(0, "utf8");
  console.error("roborev emit: pipe JSON on stdin, or use --json '<json>' / --event <file>");
  process.exit(2);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const outIdx = args.indexOf("--out");
  const out = outIdx !== -1 && args[outIdx + 1] ? args[outIdx + 1] : DEFAULT_OUT;
  const dry = args.includes("--dry-run");
  return { cmd, out, dry };
}

function cmdStatus(out) {
  if (!existsSync(out)) {
    console.log(`roborev: no pending file at ${out}`);
    console.log("  tasks: 0");
    return;
  }
  const lines = readFileSync(out, "utf8").split("\n").filter(Boolean);
  const counts = {};
  const byStatus = {};
  const byType = {};
  for (const line of lines) {
    try {
      const t = JSON.parse(line);
      const sev = t.severity || "unknown";
      counts[sev] = (counts[sev] || 0) + 1;
      const st = t.status || "unknown";
      byStatus[st] = (byStatus[st] || 0) + 1;
      const tt = t.task_type || "unknown";
      byType[tt] = (byType[tt] || 0) + 1;
    } catch { /* skip malformed */ }
  }
  console.log(`roborev status: ${out}`);
  console.log(`  tasks: ${lines.length}`);
  console.log(`  by severity: ${JSON.stringify(counts)}`);
  console.log(`  by status:   ${JSON.stringify(byStatus)}`);
  console.log(`  by type:     ${JSON.stringify(byType)}`);
}

function main() {
  const { cmd, out, dry } = parseArgs();
  if (cmd === "emit") {
    const raw = readInput();
    let input;
    try { input = JSON.parse(raw); } catch (e) { console.error("invalid JSON:", e.message); process.exit(2); }
    if (dry || process.argv.includes("--no-assign")) input = { ...input, triage: true };
    const e = validate(normalizeEvent(input));
    const line = JSON.stringify(e);
    if (dry) { console.log(line); return; }
    mkdirSync(dirname(out), { recursive: true });
    appendFileSync(out, line + "\n");
    console.error(`roborev: appended 1 task to ${out}`);
    console.error(`  dedupe_key=${e.dedupe_key}`);
    console.error(`  ship with: scripts/ship-to-paperclip.sh ${out}`);
    return;
  }
  if (cmd === "schema") { console.log(JSON.stringify({ task_types: ["review_fix","triage","skill_candidate","knowledge_drift","projection_update"], severities:["critical","high","medium","low"] }, null, 2)); return; }
  if (cmd === "status") { return cmdStatus(out); }
  if (cmd === "version" || cmd === "--version" || cmd === "-v") { console.log("roborev 0.1.0"); return; }
  console.error("usage: roborev <emit|schema|status|version> [--out <path>] [--dry-run] [--no-assign] [--json '<json>' | --event <file>]");
  process.exit(2);
}
main();
