# Running Structurizer standalone

This guide is for using Structurizer as a local command-line tool or a compiled executable. If your software calls Structurizer directly, start with the [README](../README.md) instead.

## Install from source

```sh
git clone https://github.com/Cliffordex/Structurizer.git
cd Structurizer
bun install --frozen-lockfile
```

Run the test suite and type check before packaging a release:

```sh
bun test
bunx tsc --noEmit
```

## Run from the repository

```text
bun run src/index.ts [options] <input_file> [<input_file>...]
```

For example, validate the included CSV file with the included rules:

```sh
bun run src/index.ts \
  --rule example/referral.rules.yaml \
  --output results.json \
  example/referrals.csv
```

The command prints a summary and writes valid record results to `results.json`.

| Option | Description |
| --- | --- |
| `-h`, `--help` | Show usage information. |
| `-f`, `--in-format <format>` | Input format: `csv`, `tsv`, `json`, or `auto`. `auto` selects by file extension. |
| `-r`, `--rule <file>` | YAML validation rules file. Defaults to `rules.yaml` in the current directory. |
| `-o`, `--output <file>` | Write valid record results as formatted JSON. |
| `-p`, `--report <file>` | Write a self-contained HTML summary report. |

You can supply multiple files. CSV and TSV inputs must have a header row. JSON input must be a top-level array of records.

> **JSON size warning:** JSON input is currently read in full before records are validated. Do not use it for large files or unbounded streams; use CSV or TSV, or split the data into smaller files. Streaming JSON support is not implemented yet.

## Build an executable

```sh
bun run build
```

This creates `dist/structurizer` with the platform-specific extension where applicable. Build separately on each operating system and CPU architecture you plan to support.

Run the compiled executable with the same options:

```sh
./dist/structurizer --rule example/referral.rules.yaml example/referrals.csv
```

On Windows, use the extension created by Bun:

```powershell
.\dist\structurizer.exe --rule example\referral.rules.yaml example\referrals.csv
```

## Results and exit behavior

The console summary lists totals and failed files. A completed command can contain invalid records: validation failures do not stop other records or input files from being processed. The current JSON output contains only valid records, so it is not a complete audit trail of failed records.

Keep the YAML rule file external to the executable so it can be updated without rebuilding. Ensure the process can write to the directories supplied for `--output` and `--report`.

Return to the [README](../README.md) for in-process integration and rule syntax.
