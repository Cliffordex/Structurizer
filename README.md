# Structurizer

[![License](https://img.shields.io/github/license/Cliffordex/Structurizer)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Cliffordex/Structurizer)](https://github.com/Cliffordex/Structurizer/stargazers)
[![Bun](https://img.shields.io/badge/runtime-Bun%201.4%2B-f9f1e1)](https://bun.sh/)  
[![GitHub Release](https://img.shields.io/github/v/release/:user/:repo)](https://github.com/Cliffordex/Structurizer/releases)

Structurizer is a TypeScript validation engine for parsing CSV, TSV, and JSON records against YAML rules. Embed it in your import service, API, or worker to receive valid and invalid records with source locations.

## Requirements

- [Bun](https://bun.sh/) 1.4 or later

## Integrate with your software

Use Structurizer in-process from a TypeScript application: configure the input and rule paths, receive valid and invalid records through callbacks, and decide whether to persist, reject, or route each record. Your software owns the workflow; Structurizer supplies parsing and validation.

The current repository exposes this API from source modules rather than a dedicated package entry point, so pin the revision when consuming it directly.

```ts
import { Structurizer } from "../Structurizer/src/app";

const validRecords = [];
const invalidRecords = [];

const summaries = await Structurizer.runCallback(
  {
    inputFiles: ["jobs/42/upload.csv"],
    inputFormat: "auto",
    ruleFile: "config/customer.rules.yaml"
  },
  {
    valid: (record) => validRecords.push(record),
    invalid: (record) => invalidRecords.push(record)
  }
);

if (invalidRecords.length > 0 || summaries.some((file) => !file.success)) {
  throw new Error("Import rejected; inspect the validation results.");
}

await saveCustomers(validRecords);
```

If you want to build and run Structurizer as a command-line executable instead, see [Standalone use](./docs/STANDALONE.md).

## Rules

Rules are YAML objects with a `fields` map. A field is required unless `required: false` is specified. The supported constraints are:

- `string`: `minLength`, `maxLength`, and regular-expression `pattern`
- `number`: `min` and `max`; numeric strings are converted to numbers when valid

For example:

```yaml
fields:
  name:
    type: string
    minLength: 1
  age:
    type: number
    min: 0
    required: false
```

The current validator does not provide special date, email, or phone validation. For now, declare such fields as `type: string` if string validation is sufficient.

## Validation results

The `valid` callback receives converted, validated records. The `invalid` callback receives failed records with their source positions and messages. The returned file summaries report file-level parsing or rule-loading errors.

Validation failures do not stop other records or files from being processed. Your application decides whether a partial result is acceptable; many import workflows reject the entire job when any invalid record or failed file is present.

## Deployment notes

- For HTTP uploads, save the request body to a job directory and pass that path to Structurizer. Select the rule file from trusted application configuration rather than a user-controlled path.
- For queues and batch jobs, give every job its own input and result directory so concurrent work cannot overwrite files and retries remain easy to audit.
- Test your rules in CI with representative valid and invalid data, and log the Structurizer revision, rule revision, source file name, and validation totals.
- Treat stored validation errors and application logs as sensitive when input data may contain personal or confidential information.

## Current limitations

- JSON files are read fully into memory before validation, so JSON input is not suitable for large files or unbounded streams. CSV and TSV can be processed record by record.
- Nested schemas, data normalization/transforms, and specialized date/email/phone validation are not currently implemented.

See [ROADMAP.md](./ROADMAP.md) for planned scope and milestones.
