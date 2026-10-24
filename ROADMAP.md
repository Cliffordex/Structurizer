# Structurizer - Product Roadmap and Feature Scope
_Last updated: 2026-10-23_
## Product vision
A streaming TypeScript toolkit for parsing, normalizing, and validating heterogeneous data using declarative rules.
**Core proposition:** Define a data contract once, apply it across multiple input formats, and produce consistent validated data and actionable diagnostics. Healthcare interoperability (HL7 v2, FHIR JSON, vendor JSON) is an initial specialty, not a restriction on the core engine.
**Scope boundary:** Structurizer owns parsing, optional translation/normalization, validation, and diagnostics. Applications or integration platforms own transport, routing, storage, retries, and scheduling.
## Status legend
- **SHOULD:** Intended product capability; not necessarily implemented or committed to a particular release.
- **MAY:** Candidate capability to evaluate against actual user demand.
- **SHOULD NOT:** Explicitly excluded from the foreseeable core product scope.
## Feature inventory
| Feature | Decision | Definition / rationale |
|---|---|---|
| Asynchronous streaming parsing | SHOULD - already present in v0.1 | Incremental processing; account for record/message framing and backpressure. |
| Concurrent file processing | SHOULD - already present in v0.1 | Parse multiple independent files while validating emitted chunks/records asynchronously. |
| YAML validation rules | SHOULD - v0.1 | Human-readable declarative validation contract. |
| Zod validation | SHOULD - v0.1 | Sole supported validation execution engine. |
| NPM Package | SHOULD - v0.1 | Package presence on NPM |
| Nested schemas and arrays | SHOULD - v0.2 | Nested objects, collections, optional/nullable fields, paths. Required for JSON and FHIR. |
| Declarative translation rules | SHOULD - v0.2 | Map vendor/source fields into a specified destination schema; optional pipeline stage. |
| Deterministic basic transforms | SHOULD - v0.2 | Small, documented transform vocabulary (e.g. date normalization), with explicit missing/conflict policies. |
| Source-aware diagnostics | SHOULD - v0.2 onward | Stable error envelope with logical path, phase (parse/map/validate), and optional original source location. |
| Canonical nested rule model | SHOULD - v0.2 | Shared internal representation behind YAML parsing, Zod compilation, and generators. |
| HL7 v2 ER7 parsing | SHOULD - v0.4 proposed | Frame messages, handle delimiters, segments, repetitions, components, escapes, and source locations. Not full conformance. |
| FHIR JSON input | SHOULD - v0.4 proposed | Accept JSON resources and map/validate selected fields; not automatic profile conformance. |
| YAML to TypeScript definitions | SHOULD - v0.3 | Generate validated-output `.d.ts` types from canonical rule model. Distinguish input/output when transformations alter types. |
| YAML to property documentation | SHOULD - v0.3 | Generate Markdown property tables, descriptions, constraints, examples. |
| Rule-language JSON Schema | SHOULD - v0.3 | Describe YAML *rule syntax* for editor validation, completions, and hover help; distinct from exporting data schema. |
| Lightweight browser playground | SHOULD - v0.3 | Paste sample data and YAML, run the real engine, inspect results; presets and reproducible copy-out. No account required. |
| TypeScript interface to YAML scaffold | MAY | One-time import for simple structural types, with warnings for unsupported constructs; YAML authoritative afterward. |
| Property-path autocomplete | MAY | Context-aware completion of source/destination fields after nested schemas and mapping model stabilize. |
| Mapping dry-run / explanation | MAY | Display mapping decisions, unmapped fields, conflicts, and provenance. |
| Shareable playground examples | MAY | Share or reproduce small examples, with privacy safeguards. |
| JSON Schema data-contract export | MAY | Export supported subset; disclose nonrepresentable constraints. |
| Database adapters | MAY | Only if demonstrated demand; callers can otherwise supply streams. |
| Automatic input format detection | MAY | Explicit format selection is more predictable initially. |
| Multiple validation backends | SHOULD NOT | Avoid a public backend plugin promise and cross-backend compatibility burden; keep only a simple internal separation if useful. |
| Full ETL / aggregation | SHOULD NOT | No joins, stateful aggregation, or generalized data orchestration. |
| Scheduling, routing, persistence | SHOULD NOT | Leave to hosting applications and integration platforms. |
| Full HL7/FHIR conformance engine | SHOULD NOT | No comprehensive profile, terminology, or implementation-guide validation promise. |
| MLLP/FHIR server transports | SHOULD NOT (core) | Prefer embedding in existing integration workflows; revisit separately only on strong demand. |
| Continuous bidirectional YAML/TS synchronization | SHOULD NOT | Avoid reconciliation, conflict resolution, and loss of hand-authored validation metadata. |
| Visual drag-and-drop rule builder | SHOULD NOT | A text-based playground is enough for initial adoption. |
| Custom scripting language | SHOULD NOT | Use constrained deterministic transforms instead. |
| Arbitrary Zod-schema import | SHOULD NOT | Would make YAML semantics incomplete or lossy. |
## Proposed milestones
### v0.1 - Core validation engine (nearly complete)
**Goal:** Ship a credible installable streaming validation library and CLI.
**Reported as implemented:** YAML rules, Zod-backed validation, asynchronous streaming, validation as chunks arrive, and concurrent file processing.
**Remaining:** README, logo, badges, tests, packaging/release readiness, and a reproducible end-to-end example.
**Release gate:** A developer can install the package, validate sample data through the actual streaming pipeline, and understand the output without changing library code.
### v0.2 - Nested schemas and normalization (planned)
**Goal:** Support complex JSON and normalize different vendor inputs to one contract.
**Features:** Nested objects/arrays and path handling; normalized rule representation; optional YAML mapping rules; basic deterministic transforms; explicit mapping conflict and missing-field policies; source-aware diagnostics.
**Release gate:** Two differently named vendor JSON inputs normalize into the same nested output and validate against identical rules. Invalid fields can be traced to source locations.
### v0.3 - Developer tooling and playground (proposed)
**Goal:** Make rules easy to author, inspect, reuse, and try.
**Features:** YAML-to-TypeScript `.d.ts`; YAML-to-Markdown property documentation; JSON Schema for the rule language; minimal browser playground powered by the real Structurizer engine; example presets and copyable reproductions.
**Potential later addition:** One-time TypeScript interface to YAML scaffolding.
**Release gate:** One YAML contract drives Zod validation, generated TypeScript types, generated docs, and a working playground example without duplicating interpretation logic.
### v0.4 - Healthcare interoperability (proposed)
**Goal:** Demonstrate shared contracts across healthcare formats.
**Features:** HL7 v2 ER7 parser; FHIR JSON input; synthetic ADT/Patient examples; mapping into a shared normalized patient contract; format-aware source diagnostics.
**Explicit exclusions:** Full HL7/FHIR conformance, MLLP listeners, FHIR servers, routing, terminology services.
**Release gate:** Synthetic HL7 v2 and FHIR patient data produce a shared normalized shape and consistent validation results, with errors traceable to source fields.
**Scheduling caveat:** HL7/FHIR may move earlier if prospective users prioritize it. These versions are planning boundaries, not deadlines.
### v0.5 - Adoption and usability (feedback-driven)
**Goal:** Reduce friction in real integrations.
**Candidates:** Better playground ergonomics, contextual property autocomplete, mapping dry-run, shareable examples, diagnostics refinement, performance improvements, and fixes from early adopters.
**Release gate:** Improvements respond to observed usage and repeatable pain points, not feature-count targets.
### v1.0 - Stable public contracts (future target)
**Goal:** Dependable production integration.
**Features:** Stable YAML semantics, TypeScript API and diagnostic contracts, compatibility/versioning policy, regression tests, clear documentation.
**Release gate:** Reliable integrations, documented compatibility commitments, and evidence of external usage.
## Architectural decisions
1. **One authoritative contract:** YAML is the editable validation contract. The internal normalized rule model is independent of YAML serialization.
2. **One runtime validator:** Zod. Do not expose multiple-backend support as a roadmap promise.
3. **Optional mapping:** Translation maps input into an explicitly defined destination schema; it does not silently extend or redefine that schema.
4. **Separation of concerns:** Parsing, mapping, validation, and diagnostics remain distinct stages; parsing and mapping failures are distinguishable from validation failures.
5. **Streaming semantics:** Input byte chunks are not necessarily logical records. HL7 messages and JSON records must be framed correctly before record-level validation. Preserve backpressure and concurrency isolation.
6. **Provenance:** Track source metadata, initially at record level and later field level, so normalized-field failures can be traced to source data.
7. **Generators share one model:** Zod compilation, `.d.ts`, docs, and editor metadata derive from one normalized rule representation.
8. **Hybrid authoring without sync:** YAML → TS generation is repeatable; TS → YAML is optional one-time scaffolding; no continuous two-way synchronization.
9. **Browser playground reuses production engine:** Avoid a separate validation implementation. Keep sample data local where possible and use synthetic healthcare data.
10. **Portability is about data contracts and sources:** Avoid claiming that similarly named HL7/FHIR fields are automatically semantically equivalent.
## Adoption plan
| Stage | Objective |
|---|---|
| v0.1 launch | Publish GitHub repo/npm release, clear README, quick-start, real examples, architecture write-up. |
| Immediately afterward | Recruit 3–5 developers to test their own datasets; seek actionable friction reports, not just stars. |
| v0.2 | Demonstrate cross-vendor normalization with one shared validation contract. |
| v0.3 | Link the browser playground from README; provide a path from sample → experiment → copy reproduction → install. |
| v0.4 | Ask known healthcare developers to test HL7/FHIR workflows and identify missing real-world requirements. |
| v0.5 onward | Prioritize repeat usage, actual integrations, bug reports, and contributors over vanity metrics. |
**Suggested early signals:** 5 external testers, 3 trying their own data, 3 actionable feedback reports, and 1 repeat user or contributor in the first month. These are targets, not forecasts.
## Scope-control checklist
Before accepting a feature, ask:
1. Does it directly improve parsing, normalization, validation, diagnostics, or authoring contracts?
2. Can it be delivered without making Structurizer responsible for transport, persistence, scheduling, or operational orchestration?
3. Does it reinforce the single shared rule model instead of introducing a competing source of truth?
4. Is there a concrete developer workflow or user request behind it?
5. Can it be demonstrated end-to-end without excessive setup?
If not, defer or reject it.
## Open design questions
- Exact nested rule AST and YAML syntax, including arrays, optional versus nullable fields, and defaults.
- Path syntax for repeated HL7 fields, nested JSON, and FHIR arrays.
- Mapping conflict resolution, missing values, transform errors, and unmapped field policies.
- Whether input and validated-output TypeScript types both need generation.
- Diagnostic envelope and provenance granularity without excessive memory overhead.
- Browser compatibility and bundling of the current Node-oriented streaming core.
- Which HL7 v2 versions/message types and FHIR resources to support first.
- Whether healthcare adopters would benefit from an earlier experimental HL7 adapter.
## Short summary
**Validate → Normalize → Generate reusable contracts → Add healthcare adapters → Refine adoption → Stabilize.**
Ship v0.1 before expanding scope. Prioritize nested schemas and normalization as the architectural investment, developer tooling/playground as the adoption investment, and HL7/FHIR as the domain-specific differentiator. Avoid becoming a general ETL or healthcare integration engine.