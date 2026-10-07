// Tests for scripts/ship-to-djimitflo.sh and scripts/vps/scan-watchdog.sh against a fake event bus.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SHIP = path.join(ROOT, "scripts/ship-to-djimitflo.sh");
const WATCHDOG = path.join(ROOT, "scripts/vps/scan-watchdog.sh");

const row = (o) => ({ source: "roborev", event: "review.failed", task_type: "review_fix", task_title: "fix it",
  severity: "medium", repo: "djimit/x", sha: "abc", created_at: "2026-10-01T00:00:00Z", ...o });
const ROWS = [
  row({ dedupe_key: "roborev:x:abc:a" }),
  row({ dedupe_key: "roborev:x:abc:b", task_type: "triage", event: "review.completed", severity: "high" }),
  row({ dedupe_key: "pi:1", source: "prompt-intel", task_type: "knowledge_drift" }),
  row({ dedupe_key: "dc:1", source: "dream-cycle", task_type: "skill_candidate" }),
  row({ dedupe_key: "roborev:x:abc:c", task_type: "knowledge_drift" }),
  { _meta: true, dedupe_key: "m", task_title: "meta" },
];

async function withBus(fn, { fail = false } = {}) {
  const posts = [];
  const server = createServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") return res.end('{"status":"ok"}');
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      if (fail) { res.statusCode = 500; return res.end("boom"); }
      posts.push({ url: req.url, ev: JSON.parse(body) });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ stream: "djimit.events", id: `${posts.length}-0` }));
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try { return await fn(`http://127.0.0.1:${server.address().port}`, posts); }
  finally { server.close(); }
}

function run(cmd, args, env = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { env: { ...process.env, ...env } });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => resolve({ code, out }));
  });
}

function pendingFile(rows = ROWS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "roborev-ship-"));
  const file = path.join(dir, "pending.jsonl");
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  return file;
}

test("ship: dry-run posts nothing, writes nothing, counts only roborev review_fix/triage", async () => {
  await withBus(async (bus, posts) => {
    const file = pendingFile();
    const r = await run("bash", [SHIP, file], { DJIMIT_EVENT_BUS_URL: bus });
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /would ship 2 \(review_fix=1, triage=1\); already shipped 0; filtered 3 \(dream-cycle\/skill_candidate=1, prompt-intel\/knowledge_drift=1, roborev\/knowledge_drift=1\); invalid 1; failed 0/);
    assert.equal(posts.length, 0);
    assert.ok(!fs.existsSync(file + ".processed"));
    assert.ok(!fs.existsSync(path.join(path.dirname(file), "ship-last.json")));
  });
});

test("ship: --live posts roborev.finding with dedupe_key preserved, ledgers, keeps the pending file, is idempotent", async () => {
  await withBus(async (bus, posts) => {
    const file = pendingFile();
    const r = await run("bash", [SHIP, file, "--live"], { DJIMIT_EVENT_BUS_URL: bus });
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /shipped 2 \(review_fix=1, triage=1\)/);
    assert.equal(posts.length, 2);
    assert.equal(posts[0].url, "/events/djimit.events");
    const ev = posts[0].ev;
    assert.equal(ev.event_type, "roborev.finding");
    assert.equal(ev.source, "roborev");
    assert.equal(ev.dedupe_key, "roborev:x:abc:a");
    assert.equal(ev.event_id, "roborev:roborev:x:abc:a");
    assert.equal(ev.task_title, "fix it");
    assert.equal(ev.context, "fix it");
    assert.equal(ev.occurred_at, "2026-10-01T00:00:00Z");
    assert.ok(fs.existsSync(file), "pending file must stay in place (read by Djimitflo PromptIntel / PR review)");
    assert.deepEqual(fs.readFileSync(file + ".processed", "utf8").split("\n").filter(Boolean), ["roborev:x:abc:a", "roborev:x:abc:b"]);
    const state = JSON.parse(fs.readFileSync(path.join(path.dirname(file), "ship-last.json"), "utf8"));
    assert.equal(state.shipped, 2);
    assert.equal(state.last_bus_id, "2-0");

    const again = await run("bash", [SHIP, file, "--live"], { DJIMIT_EVENT_BUS_URL: bus });
    assert.match(again.out, /shipped 0 \(-\); already shipped 2/);
    assert.equal(posts.length, 2);
    const dry = await run("bash", [SHIP, file], { DJIMIT_EVENT_BUS_URL: bus });
    assert.match(dry.out, /would ship 0 /);
  });
});

test("ship: bus failure exits 1 and ledgers nothing", async () => {
  await withBus(async (bus) => {
    const file = pendingFile();
    const r = await run("bash", [SHIP, file, "--live"], { DJIMIT_EVENT_BUS_URL: bus });
    assert.equal(r.code, 1);
    assert.match(r.out, /failed 2/);
    assert.equal(fs.readFileSync(file + ".processed", "utf8"), "");
  }, { fail: true });
});

test("ship: ROBOREV_SHIP_TYPES widens the allowlist (roborev source only)", async () => {
  await withBus(async (bus) => {
    const r = await run("bash", [SHIP, pendingFile()], { DJIMIT_EVENT_BUS_URL: bus, ROBOREV_SHIP_TYPES: "review_fix,triage,knowledge_drift" });
    assert.match(r.out, /would ship 3 \(knowledge_drift=1, review_fix=1, triage=1\)/);
  });
});

function watchdogDir(bus) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "roborev-wd-"));
  fs.mkdirSync(path.join(dir, "scan"));
  fs.copyFileSync(SHIP, path.join(dir, "ship-to-djimitflo.sh"));
  fs.writeFileSync(path.join(dir, "emit-event.mjs"),
    `process.stdout.write(JSON.stringify({source:"roborev",task_type:"triage",task_title:"alert",dedupe_key:"roborev:wd"})+"\\n")`);
  fs.writeFileSync(path.join(dir, "scan/flush-last.log"), "=== scan ===\ngeen bevindingen\n");
  return { dir, env: { ROBOREV_DIR: dir, DJIMIT_EVENT_BUS_URL: bus } };
}

test("watchdog: OK only when every recent finding is bus-acked", async () => {
  await withBus(async (bus) => {
    const { dir, env } = watchdogDir(bus);
    const scanFile = path.join(dir, "scan/domain-scan-20261005.jsonl");
    fs.writeFileSync(scanFile, JSON.stringify(row({ dedupe_key: "roborev:ds:1" })) + "\n");
    const bad = await run("bash", [WATCHDOG], env);
    assert.equal(bad.code, 1, bad.out);
    assert.match(bad.out, /domain-scan-20261005\.jsonl: 1 bevindingen niet op de bus/);
    fs.writeFileSync(scanFile + ".processed", "roborev:ds:1\n");
    const ok = await run("bash", [WATCHDOG], env);
    assert.equal(ok.code, 0, fs.readFileSync(path.join(dir, "scan/watchdog-last.log"), "utf8"));
    assert.match(fs.readFileSync(path.join(dir, "scan/watchdog-last.log"), "utf8"), /OK: scan gedraaid en alle bevindingen bus-acked/);
  });
});

test("watchdog: fresh log that records a dead flush (old Paperclip path) is a FAIL, alert goes to the bus", async () => {
  await withBus(async (bus, posts) => {
    const { dir, env } = watchdogDir(bus);
    fs.writeFileSync(path.join(dir, "scan/flush-last.log"), "Error: Cannot find module '/srv/paperclip/cli/node_modules/tsx/dist/cli.mjs'\n");
    const r = await run("bash", [WATCHDOG], env);
    assert.equal(r.code, 1);
    assert.match(r.out, /FAIL: flush-last.log meldt ship-fout/);
    assert.equal(posts.length, 1);
    assert.equal(posts[0].ev.event_type, "roborev.finding");
  });
});
