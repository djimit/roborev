// roborev event contract — mirrors the Paperclip-ready JSONL schema in
// ~/.djimit/roborev/paperclip-integration.md §8.
// Zero-dependency (Node ESM). Keep in sync with the integration artifact.

export const TASK_TYPES = ["review_fix", "triage", "skill_candidate", "knowledge_drift", "projection_update"];
export const SEVERITIES = ["critical", "high", "medium", "low"];
export const PRIORITIES = ["critical", "high", "medium", "low"];
export const STATUSES = ["backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"];

const SEV_TO_PRIORITY = { critical: "critical", high: "high", medium: "medium", low: "low" };

function isoNow() { return new Date().toISOString(); }

function dedupeKey(e) {
  const parts = [e.source, e.repo || "norepo", e.sha || "nosha"];
  if (e.finding_class) parts.push(e.finding_class);
  else if (e.event) parts.push(e.event);
  return parts.filter(Boolean).join(":");
}

function asArray(x) { return Array.isArray(x) ? x : x == null ? [] : [x]; }

// Normalize a partial event into a complete Paperclip-ready task row.
export function normalizeEvent(input) {
  if (!input || typeof input !== "object") throw new Error("event must be an object");
  const source = input.source || "roborev";
  const event = input.event;
  if (!event) throw new Error("event.event is required");
  const severity = input.severity || "medium";
  const taskType = input.task_type || defaultTaskType(event);
  if (!TASK_TYPES.includes(taskType)) throw new Error(`invalid task_type: ${taskType}`);
  if (!SEVERITIES.includes(severity)) throw new Error(`invalid severity: ${severity}`);
  const triage = input.triage === true || input.auto_assign === false;

  const e = {
    source,
    target: "paperclip",
    event,
    task_title: input.task_title || defaultTitle(event, taskType),
    task_type: taskType,
    repo: input.repo || null,
    branch: input.branch || null,
    sha: input.sha || null,
    review_id: input.review_id || null,
    affected_files: asArray(input.affected_files),
    finding_class: input.finding_class || null,
    repeat_count: Number(input.repeat_count || 0),
    severity,
    priority: input.priority || SEV_TO_PRIORITY[severity] || "medium",
    assignee_role: triage ? null : (input.assignee_role || defaultAssigneeRole(taskType)),
    labels: [...new Set([...defaultLabels(source, event, taskType), ...asArray(input.labels)])],
    auto_assign: !triage,
    status: input.status || (triage ? "backlog" : defaultStatus(taskType)),
    parent_task_id: input.parent_task_id || null,
    blocked_by: asArray(input.blocked_by),
    wiki_ref: input.wiki_ref || null,
    qdrant_reembed_required: !!input.qdrant_reembed_required,
    graphstore_update_required: !!input.graphstore_update_required,
    skill_candidate: !!input.skill_candidate || taskType === "skill_candidate",
    dedupe_key: input.dedupe_key || dedupeKey({ source, repo: input.repo, sha: input.sha, finding_class: input.finding_class, event }),
    context: input.context || "",
    created_at: input.created_at || isoNow(),
  };
  if (e.auto_assign === false && !e.labels.includes("needs-assignment")) {
    e.labels.push("needs-assignment");
    if (taskType === "triage" || /high|completed|failed/i.test(event)) e.labels.push("triage");
  }
  return e;
}

function defaultTaskType(event) {
  if (/failed/i.test(event)) return "review_fix";
  if (/completed|high/i.test(event)) return "triage";
  if (/repeat/i.test(event)) return "skill_candidate";
  if (/knowledge|drift/i.test(event)) return "knowledge_drift";
  if (/projection|qdrant|graph/i.test(event)) return "projection_update";
  return "review_fix";
}
function defaultTitle(event, taskType) {
  switch (taskType) {
    case "review_fix": return "Fix failed roborev review";
    case "triage": return "Triage high severity review finding";
    case "skill_candidate": return "Create or improve skill for recurring issue";
    case "knowledge_drift": return "Review wiki knowledge drift";
    case "projection_update": return "Update knowledge projection";
  }
}
function defaultAssigneeRole(taskType) {
  switch (taskType) {
    case "review_fix": return "patch-agent";
    case "triage": return "architecture/security-reviewer";
    case "skill_candidate": return "skill-factory-agent";
    case "knowledge_drift": return "knowledge-curator-agent";
    case "projection_update": return "memory/graph-agent";
  }
}
function defaultLabels(source, event, taskType) {
  const base = [source];
  if (/failed/i.test(event)) base.push("review-failed");
  if (/high|completed/i.test(event)) { base.push("review-failed", "triage"); }
  if (/repeat/i.test(event)) base.push("repeated-finding", "skill-candidate");
  if (taskType === "skill_candidate") base.push("skill-candidate");
  if (taskType === "knowledge_drift") base.push("djimitkbwiki", "knowledge-drift", "graphstore", "qdrant");
  if (taskType === "projection_update") base.push("projection-needed");
  if (source === "openspec") base.push("openspec", "implementation-quality");
  return [...new Set(base)];
}
function defaultStatus(taskType) {
  return taskType === "triage" ? "backlog" : taskType === "skill_candidate" ? "backlog" : "todo";
}

export function validate(e) {
  if (!PRIORITIES.includes(e.priority)) throw new Error(`invalid priority: ${e.priority}`);
  if (!STATUSES.includes(e.status)) throw new Error(`invalid status: ${e.status}`);
  return e;
}
