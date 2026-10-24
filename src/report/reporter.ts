import { ValidationResult } from "../app";

export type ReportGenerator = (result: ValidationResult[]) => string;

export const consoleReport: ReportGenerator = (result: ValidationResult[]): string => {
    const report: string[] = [];

    const totals = {
        total: 0,
        valid: 0,
        invalid: 0,
        errors: 0
    };

    for (const file of result) {

        report.push(`File: ${file.filename}`);
        report.push(`  Success: ${file.success}`);
        if (file.errors) {
            report.push(`  Errors: ${file.errors.join(", ")}`);
        }
        if (file.stats) {
            report.push(`  Total: ${file.stats.total}`);
            report.push(`  Valid: ${file.stats.valid}`);
            report.push(`  Invalid: ${file.stats.invalid}`);

            totals.total += file.stats.total;
            totals.valid += file.stats.valid;
            totals.invalid += file.stats.invalid;
        }
        if (file.errors?.length) totals.errors += file.errors.length;
        report.push("");
    }

    report.push(`Total Records: ${totals.total}`);
    report.push(`  Valid: ${totals.valid}`);
    report.push(`  Invalid: ${totals.invalid}`);
    report.push(`Errors: ${totals.errors}`);

    return report.join("\n");
};

const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]!);

type FailedRecord = {
    valid: false;
    filePosition: string;
    errors?: string[];
};

const isFailedRecord = (value: unknown): value is FailedRecord =>
    typeof value === "object"
    && value !== null
    && "valid" in value
    && value.valid === false
    && "filePosition" in value
    && typeof value.filePosition === "string";

const renderErrorList = (errors: string[]): string =>
    `<ul class="error-list">${errors.map(error => `<li>${escapeHtml(error)}</li>`).join("")}</ul>`;

export const htmlReport: ReportGenerator = (result: ValidationResult[]): string => {
    const report: string[] = [];
    const totals = result.reduce((summary, file) => {
        summary.files += 1;
        if (file.stats) {
            summary.records += file.stats.total;
            summary.valid += file.stats.valid;
            summary.invalid += file.stats.invalid;
        }
        summary.errors += file.errors?.length ?? 0;
        if ("output" in file && Array.isArray(file.output)) {
            summary.errors += file.output.reduce((count, record) =>
                count + (isFailedRecord(record) ? record.errors?.length ?? 0 : 0), 0);
        }
        return summary;
    }, { files: 0, records: 0, valid: 0, invalid: 0, errors: 0 });

    report.push(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Structurizer validation report</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #172033;
      background: #f3f6fb;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
    }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 320px; }
    .page { width: min(1040px, calc(100% - 40px)); margin: 0 auto; padding: 48px 0 64px; }
    .hero { margin-bottom: 28px; }
    .eyebrow { margin: 0 0 8px; color: #536b91; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 0; color: #101a2d; font-size: clamp(28px, 5vw, 38px); letter-spacing: -.04em; }
    .subtitle { margin: 10px 0 0; color: #64718a; font-size: 15px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 12px; margin-bottom: 30px; }
    .metric, .file-card { border: 1px solid #e1e7f0; border-radius: 14px; background: #fff; box-shadow: 0 4px 16px rgb(25 45 80 / 4%); }
    .metric { padding: 18px 20px; }
    .metric-label { display: block; margin-bottom: 8px; color: #68758c; font-size: 12px; font-weight: 650; }
    .metric-value { color: #18243a; font-size: 26px; font-weight: 750; letter-spacing: -.03em; }
    .metric-value.good { color: #14734b; }
    .metric-value.bad { color: #b42332; }
    .section-title { margin: 0 0 14px; color: #283750; font-size: 17px; }
    .file-list { display: grid; gap: 14px; }
    .file-card { overflow: hidden; }
    .file-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 20px; border-bottom: 1px solid #edf0f5; }
    .file-name { min-width: 0; margin: 0; color: #1d2c45; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 14px; overflow-wrap: anywhere; }
    .status { flex: 0 0 auto; padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 750; letter-spacing: .04em; text-transform: uppercase; }
    .status.success { color: #126441; background: #e7f6ed; }
    .status.failure { color: #a42330; background: #fff0f0; }
    .file-content { padding: 18px 20px 20px; }
    .file-stats { display: flex; flex-wrap: wrap; gap: 8px 22px; margin: 0; color: #5f6d83; font-size: 13px; }
    .file-stats strong { color: #293851; }
    .issue-heading { margin: 20px 0 8px; color: #9f2631; font-size: 13px; font-weight: 700; }
    .error-list { display: grid; gap: 7px; margin: 0; padding-left: 20px; color: #8f2933; font-size: 13px; line-height: 1.55; overflow-wrap: anywhere; }
    .record-error { margin-top: 14px; padding: 13px 14px; border: 1px solid #f0d9da; border-radius: 10px; background: #fffafa; }
    .record-position { margin: 0 0 8px; color: #6b3540; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; overflow-wrap: anywhere; }
    .empty-state { margin: 0; color: #77849a; font-size: 13px; }
    .empty-card { padding: 24px; color: #68758c; text-align: center; }
    @media (max-width: 520px) {
      .page { width: min(100% - 24px, 1040px); padding-top: 32px; }
      .file-heading, .file-content { padding-right: 15px; padding-left: 15px; }
      .file-heading { flex-direction: column; gap: 10px; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Structurizer</p>
      <h1>Validation report</h1>
      <p class="subtitle">A summary of parsed files, validated records, and issues found.</p>
    </header>
    <section class="summary" aria-label="Overall summary">
      <div class="metric"><span class="metric-label">Files processed</span><span class="metric-value">${totals.files}</span></div>
      <div class="metric"><span class="metric-label">Records</span><span class="metric-value">${totals.records}</span></div>
      <div class="metric"><span class="metric-label">Valid records</span><span class="metric-value good">${totals.valid}</span></div>
      <div class="metric"><span class="metric-label">Invalid records</span><span class="metric-value ${totals.invalid ? "bad" : ""}">${totals.invalid}</span></div>
      <div class="metric"><span class="metric-label">Issues</span><span class="metric-value ${totals.errors ? "bad" : ""}">${totals.errors}</span></div>
    </section>
    <section aria-labelledby="files-heading">
      <h2 class="section-title" id="files-heading">File details</h2>
      <div class="file-list">`);
    for (const file of result) {
        report.push(`<article class="file-card">
  <header class="file-heading">
    <h3 class="file-name">${escapeHtml(file.filename)}</h3>
    <span class="status ${file.success ? "success" : "failure"}">${file.success ? "Success" : "Failed"}</span>
  </header>
  <div class="file-content">`);
        if (file.stats) {
            report.push(`<p class="file-stats">
    <span><strong>Total:</strong> ${file.stats.total}</span>
    <span><strong>Valid:</strong> ${file.stats.valid}</span>
    <span><strong>Invalid:</strong> ${file.stats.invalid}</span>
  </p>`);
        }
        if (file.errors?.length) {
            report.push(`<h4 class="issue-heading">${escapeHtml(file.step)} errors</h4>${renderErrorList(file.errors)}`);
        }
        if ("output" in file && Array.isArray(file.output)) {
            const failedRecords = file.output.filter(isFailedRecord);
            if (failedRecords.length) {
                report.push(`<h4 class="issue-heading">Record validation issues (${failedRecords.length})</h4>`);
                for (const record of failedRecords) {
                    report.push(`<div class="record-error">
  <p class="record-position">${escapeHtml(record.filePosition)}</p>
  ${record.errors?.length ? renderErrorList(record.errors) : '<p class="empty-state">No error details provided.</p>'}
</div>`);
                }
            } else {
                report.push('<p class="empty-state">No record validation issues.</p>');
            }
        }
        report.push("</div></article>");
    }
    if (result.length === 0) {
        report.push('<div class="file-card empty-card">No files were processed.</div>');
    }
    report.push(`</div>
    </section>
  </main>
</body>
</html>`);

    return report.join("\n");
};