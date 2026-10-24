# Structurizer roadmap
_Last updated: 2026-10-23. This is a direction, not a release promise._

## What Structurizer is for

Structurizer helps software teams turn messy files into dependable records. Define rules once, validate CSV, TSV, or JSON against them, and get errors that point back to the source data.

The project focuses on parsing, optional data cleanup, validation, and clear diagnostics. Your application remains responsible for receiving data, storing it, scheduling work, and retrying failed jobs.

## What comes next

- **Make the basics dependable.** Complete the core validation experience, examples, tests, packaging, and documentation.
- **Handle real-world data shapes.** Add nested objects and arrays, then let teams map differently named source fields into one shared structure.
- **Make rules easier to use.** Generate useful types and documentation from rules, and provide a lightweight browser playground.
- **Explore healthcare formats.** Add focused, practical support for HL7 v2 and FHIR JSON after the shared data model is ready.

We will prioritize features that solve proven integration problems over a fixed feature list.

## Milestones

### Now — a dependable core

Finish the validation workflow: clear examples, reliable tests, a usable package and CLI, and documentation that helps a new user succeed with their own file.

### Next — complex data and normalization

Support nested objects, arrays, optional fields, and clear paths to invalid values. Let teams map different source formats into one agreed structure and apply a small set of predictable transforms, such as date normalization.

**MAY — streaming JSON input:** Evaluate [`stream-json`](https://www.npmjs.com/package/stream-json) or an equivalent incremental parser so large top-level JSON arrays can be validated without loading the entire file into memory.

### Later — better authoring tools

Generate TypeScript types and documentation from rules, improve editor support, and build a small playground for trying rules against sample data.

### Future exploration — healthcare data

Explore practical HL7 v2 and FHIR JSON support with synthetic examples. This is not a promise of full healthcare-standard conformance, servers, transports, or terminology services.

### Toward 1.0 — stable contracts

Stabilize rule behavior, the TypeScript API, and diagnostic formats. Back those promises with versioning guidance, regression tests, and feedback from real integrations.

## Guiding principles

- **Rules are the source of truth.** A YAML rule file describes the data contract; generated types and docs should agree with it.
- **Errors should be actionable.** Tell users which field failed, why, and where it came from.
- **Keep the job focused.** Structurizer validates and reshapes data. It does not replace queues, databases, schedulers, or full ETL platforms.
- **Prefer predictable behavior.** Transformations and mappings should be explicit, documented, and easy to test.
- **Build from real use.** New adapters and convenience features need a clear workflow and user demand behind them.

## Outside the planned scope

Structurizer is not intended to become a general ETL product, workflow scheduler, database layer, visual drag-and-drop builder, or a full HL7/FHIR conformance platform. It will not offer continuous two-way synchronization between TypeScript and YAML.

## Questions we will answer as we build

- What is the clearest rule syntax for nested objects, arrays, defaults, and nullable values?
- How should mappings handle missing data, conflicts, and unmapped fields?
- Which generated artifacts are most useful: TypeScript types, property documentation, editor hints, or data schemas?
- Which HL7 and FHIR use cases are valuable enough to support first?
