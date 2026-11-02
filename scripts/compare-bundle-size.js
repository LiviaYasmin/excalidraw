const fs = require("fs");

const readMeasurements = (file) => {
  const results = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`Invalid size measurements: ${file}`);
  }
  const names = new Set();
  for (const result of results) {
    if (
      typeof result.name !== "string" ||
      !result.name ||
      names.has(result.name) ||
      !Number.isFinite(result.size) ||
      result.size <= 0 ||
      !Number.isFinite(result.sizeLimit) ||
      result.sizeLimit <= 0 ||
      typeof result.passed !== "boolean"
    ) {
      throw new Error(`Missing files or invalid size measurement: ${file}`);
    }
    names.add(result.name);
  }
  return results;
};

const base = readMeasurements(process.argv[2]);
const current = readMeasurements(process.argv[3]);
if (base.length !== current.length) {
  throw new Error("Base and pull request must measure the same groups");
}

const lines = [
  "## Bundle size (gzip bytes)",
  "",
  "| Group | Base | Pull request | Limit | Result |",
  "| --- | ---: | ---: | ---: | --- |",
];
let failed = false;
for (const result of current) {
  const previous = base.find((entry) => entry.name === result.name);
  if (!previous || previous.sizeLimit !== result.sizeLimit) {
    throw new Error("Base and pull request must use the same configuration");
  }
  // Keep existing budgets; an already oversized base must not grow further.
  const passed = result.size <= Math.max(result.sizeLimit, previous.size);
  const status = !passed
    ? "FAIL: size regression above budget"
    : result.size <= result.sizeLimit
    ? "Within budget"
    : "Base already above budget; no increase";
  failed ||= !passed;
  lines.push(
    `| ${result.name} | ${previous.size} | ${result.size} | ${result.sizeLimit} | ${status} |`,
  );
}
lines.push(
  "",
  "Missing or zero-size measurements fail the check. Existing over-budget groups may not increase; their original budgets remain unchanged.",
);
const summary = `${lines.join("\n")}\n`;
process.stdout.write(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
if (failed) {
  process.exitCode = 1;
}
