# Structurizer

[![License](https://img.shields.io/github/license/Cliffordex/Structurizer)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Cliffordex/Structurizer)](https://github.com/Cliffordex/Structurizer/stargazers)
[![Bun](https://img.shields.io/badge/runtime-Bun%201.4%2B-f9f1e1)](https://bun.sh/)  
[![GitHub Release](https://img.shields.io/github/v/release/:user/:repo)](https://github.com/Cliffordex/Structurizer/releases)

Structurizer is a TypeScript command-line tool for parsing records from CSV, TSV, and JSON files and validating them against a YAML rules file. It reports record-level validation errors with source locations and can write the complete results as JSON.

## Requirements

- [Bun](https://bun.sh/) 1.4 or later

## Get started

Install the project dependencies:

```sh
bun install
```

Validate the included CSV example with its rules:

```sh
bun run src/index.ts --rule example/referral.rules.yaml --output results.json example/referrals.csv
```

The command prints a summary to the console and writes detailed results to `results.json`. The example rules file includes `date`, `phone`, and `email` type labels, but the current validator only has special handling for `string` and `number`; other type labels are treated as strings. See [Rules](#rules) for the implemented behavior.

## Usage

```text
bun run src/index.ts [options] <input_file> [<input_file>...]
```

| Option | Description |
| --- | --- |
| `-h`, `--help` | Show usage information. |
| `-f`, `--in-format <format>` | Input format: `csv`, `tsv`, `json`, or `auto`. Defaults to `auto`, which selects by file extension. |
| `-r`, `--rule <file>` | YAML validation rules file. Defaults to `rules.yaml` in the current directory. |
| `-o`, `--output <file>` | Write the detailed result array as formatted JSON. |
| `-p`, `--report <file>` | Write a self-contained, styled HTML validation report. |

You can pass multiple input files; each result is included in the console summary and JSON output. With auto-detection, supported extensions are `.csv`, `.tsv`, and `.json`.

CSV and TSV files must have a header row. JSON input must be an array of records, for example:

```json
[
  { "name": "Ada", "age": "36" },
  { "name": "Grace", "age": "40" }
]
```

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

## Results

The console summary reports success, record totals, and parsing or validation errors for each file. With `--output`, Structurizer writes a JSON array containing one result per input file. With `--report`, it creates a responsive HTML report with aggregate counts, file statuses, and validation issues:

- Successfully parsed files include each record's validity, data, source position, and validation errors, along with valid/invalid record counts.
- A parsing failure includes the file name, parsing error, and the processing step.

Validation failures do not prevent other records or input files from being processed.

## Development

Run the test suite:

```sh
bun test
```

Build a standalone executable:

```sh
bun run build
```

## Current limitations

- Input records are collected before validation; the current implementation is not a bounded-memory streaming pipeline. JSON files are read fully into memory.
- Nested schemas, data normalization/transforms, and specialized date/email/phone validation are not currently implemented.

See [ROADMAP.md](./ROADMAP.md) for planned scope and milestones.
