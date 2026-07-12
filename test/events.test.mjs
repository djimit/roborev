// Test suite for roborev event contract (src/events.mjs).
// Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeEvent, validate, TASK_TYPES, SEVERITIES } from "../src/events.mjs";

test("normalizeEvent: minimal valid event produces complete task row", () => {
  const e = normalizeEvent({ event: "review.failed" });
  assert.equal(e.event, "review.failed");
  assert.equal(e.task_type, "review_fix");
  assert.equal(e.severity, "medium");
  assert.equal(e.target, "paperclip");
  assert.ok(e.dedupe_key);
  assert.ok(e.created_at);
  assert.equal(e.auto_assign, true);
});

test("normalizeEvent: severity defaults to medium", () => {
  const e = normalizeEvent({ event: "review.failed" });
  assert.equal(e.severity, "medium");
  assert.equal(e.priority, "medium");
});

test("normalizeEvent: severity→priority mapping", () => {
  for (const sev of SEVERITIES) {
    const e = normalizeEvent({ event: "review.failed", severity: sev });
    assert.equal(e.priority, sev);
  }
});

test("normalizeEvent: review.failed → review_fix + patch-agent", () => {
  const e = normalizeEvent({ event: "review.failed", severity: "high" });
  assert.equal(e.task_type, "review_fix");
  assert.equal(e.assignee_role, "patch-agent");
  assert.ok(e.labels.includes("review-failed"));
});

test("normalizeEvent: review.completed → triage + architecture-reviewer", () => {
  const e = normalizeEvent({ event: "review.completed", severity: "high" });
  assert.equal(e.task_type, "triage");
  assert.equal(e.assignee_role, "architecture/security-reviewer");
  assert.ok(e.labels.includes("triage"));
});

test("normalizeEvent: repeated finding → skill_candidate + skill-factory-agent", () => {
  const e = normalizeEvent({ event: "repeated finding", severity: "medium" });
  assert.equal(e.task_type, "skill_candidate");
  assert.equal(e.assignee_role, "skill-factory-agent");
  assert.ok(e.labels.includes("skill-candidate"));
});

test("normalizeEvent: knowledge drift → knowledge_drift + knowledge-curator-agent", () => {
  const e = normalizeEvent({ event: "knowledge drift detected" });
  assert.equal(e.task_type, "knowledge_drift");
  assert.equal(e.assignee_role, "knowledge-curator-agent");
  assert.ok(e.labels.includes("djimitkbwiki"));
});

test("normalizeEvent: projection update → projection_update + memory/graph-agent", () => {
  const e = normalizeEvent({ event: "qdrant projection stale" });
  assert.equal(e.task_type, "projection_update");
  assert.equal(e.assignee_role, "memory/graph-agent");
});

test("normalizeEvent: triage=true forces backlog + needs-assignment", () => {
  const e = normalizeEvent({ event: "review.failed", severity: "high", triage: true });
  assert.equal(e.status, "backlog");
  assert.equal(e.auto_assign, false);
  assert.equal(e.assignee_role, null);
  assert.ok(e.labels.includes("needs-assignment"));
  assert.ok(e.labels.includes("triage"));
});

test("normalizeEvent: auto_assign=false adds needs-assignment label", () => {
  const e = normalizeEvent({ event: "review.failed", auto_assign: false });
  assert.ok(e.labels.includes("needs-assignment"));
});

test("normalizeEvent: dedupe_key is deterministic", () => {
  const a = normalizeEvent({ event: "review.failed", repo: "x/y", sha: "abc", finding_class: "z" });
  const b = normalizeEvent({ event: "review.failed", repo: "x/y", sha: "abc", finding_class: "z" });
  assert.equal(a.dedupe_key, b.dedupe_key);
});

test("normalizeEvent: dedupe_key varies by finding_class", () => {
  const a = normalizeEvent({ event: "review.failed", repo: "x/y", sha: "abc", finding_class: "z" });
  const b = normalizeEvent({ event: "review.failed", repo: "x/y", sha: "abc", finding_class: "q" });
  assert.notEqual(a.dedupe_key, b.dedupe_key);
});

test("normalizeEvent: affected_files always array", () => {
  const e = normalizeEvent({ event: "review.failed", affected_files: "single.ts" });
  assert.deepEqual(e.affected_files, ["single.ts"]);
});

test("normalizeEvent: custom labels preserved, defaults merged", () => {
  const e = normalizeEvent({ event: "review.failed", labels: ["custom-label"] });
  assert.ok(e.labels.includes("custom-label"));
  assert.ok(e.labels.includes("roborev"));
});

test("normalizeEvent: custom task_title overrides default", () => {
  const e = normalizeEvent({ event: "review.failed", task_title: "My custom title" });
  assert.equal(e.task_title, "My custom title");
});

test("normalizeEvent: throws on missing event", () => {
  assert.throws(() => normalizeEvent({}), /event is required/);
});

test("normalizeEvent: throws on non-object", () => {
  assert.throws(() => normalizeEvent(null), /must be an object/);
  assert.throws(() => normalizeEvent("string"), /must be an object/);
});

test("normalizeEvent: throws on invalid severity", () => {
  assert.throws(() => normalizeEvent({ event: "review.failed", severity: "extreme" }), /invalid severity/);
});

test("normalizeEvent: throws on invalid task_type", () => {
  assert.throws(() => normalizeEvent({ event: "review.failed", task_type: "unknown_type" }), /invalid task_type/);
});

test("normalizeEvent: all 5 task types are valid", () => {
  for (const tt of TASK_TYPES) {
    const e = normalizeEvent({ event: "custom", task_type: tt });
    assert.equal(e.task_type, tt);
  }
});

test("validate: accepts valid normalized event", () => {
  const e = normalizeEvent({ event: "review.failed" });
  assert.doesNotThrow(() => validate(e));
});

test("validate: throws on invalid priority", () => {
  const e = normalizeEvent({ event: "review.failed" });
  e.priority = "extreme";
  assert.throws(() => validate(e), /invalid priority/);
});

test("validate: throws on invalid status", () => {
  const e = normalizeEvent({ event: "review.failed" });
  e.status = "unknown";
  assert.throws(() => validate(e), /invalid status/);
});

test("normalizeEvent: wiki_ref, qdrant, graphstore flags preserved", () => {
  const e = normalizeEvent({
    event: "knowledge drift detected",
    wiki_ref: "https://wiki.example.com/drift",
    qdrant_reembed_required: true,
    graphstore_update_required: true,
  });
  assert.equal(e.wiki_ref, "https://wiki.example.com/drift");
  assert.equal(e.qdrant_reembed_required, true);
  assert.equal(e.graphstore_update_required, true);
});

test("normalizeEvent: openspec source adds openspec labels", () => {
  const e = normalizeEvent({ event: "review.failed", source: "openspec" });
  assert.ok(e.labels.includes("openspec"));
  assert.ok(e.labels.includes("implementation-quality"));
});
