import { describe, expect, it } from "bun:test";
import { Readable } from "stream";
import { InputAdapters } from "..";
import { Structurizer } from "../../app";
import { CsvAdapter } from "../csv";
import { JSONAdapter } from "../json";

describe("InputAdapters - Formats", () => {
    // Convert into consistent internal record representation
    it('validates identical csv and json records', async () => {
        const csv = 'name,age\nAlice,30\nBob,25';
        const json = '[{"name":"Alice","age":"30"},{"name":"Bob","age":"25"}]';
        const csvParser = InputAdapters.csv();
        const jsonParser = InputAdapters.json();

        const csvRecords = await csvParser.parseStream(Readable.from([csv]), 'test.csv');
        const jsonRecords = await jsonParser.parseStream(Readable.from([json]), 'test.json');

        // Compare the parsed records
        expect(csvRecords[0].fields.age).toEqual(jsonRecords[0].fields.age);
        expect(csvRecords[1].fields.name).toEqual(jsonRecords[1].fields.name);
    });
});

describe("InputAdapters - Auto", () => {
    it("should correctly identify a file with a csv extension", () => {
        const s = new Structurizer();
        const adapter = s["getInputAdapterFactory"]("file.csv")();
        expect(adapter).toBeDefined();
        expect(adapter).toBeInstanceOf(CsvAdapter);
    });

    it("should correctly identify a file with a json extension", () => {
        const s = new Structurizer();
        const adapter = s["getInputAdapterFactory"]("file.json")();
        expect(adapter).toBeDefined();
        expect(adapter).toBeInstanceOf(JSONAdapter);
    });
});

describe("InputAdapters - JSON", () => {
    it("should allow json as a format", () => {
        expect(Object.keys(InputAdapters)).toContain("json");
    });
    it("should accept json arrays", async () => {
        const jsonAdapter = InputAdapters["json"]();
        expect(jsonAdapter).toBeDefined();
        const result = await (async () => {
            return await jsonAdapter.parseStream(new Readable({
                read() {
                    this.push('[{"key": "value"}]');
                    this.push(null);
                }
            }), "file.json");
        })();
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
    });
    it("should reject non-array json", () => {
        const jsonAdapter = InputAdapters["json"]();
        expect(jsonAdapter).toBeDefined();
        expect(async () => {
            await jsonAdapter.parseStream(new Readable({
                read() {
                    this.push('{"key": "value"}\n');
                    this.push(null);
                }
            }));
        }).toThrow();
    });
});

describe("InputAdapters - CSV", () => {
    it("should allow csv as a format", () => {
        expect(Object.keys(InputAdapters)).toContain("csv");
    });
    it("should accept valid csv", async () => {
        const csvAdapter = InputAdapters["csv"]();
        expect(csvAdapter).toBeDefined();
        const result = await csvAdapter.parseStream(new Readable({
            read() {
                this.push('key,value\nfoo,bar');
                this.push(null);
            }
        }), "file.csv");
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].fields).toEqual({ key: "foo", value: "bar" });
    });
    // These need to be handled by the ruleset, not the parser.
    it("should not implicitly coerce a numeric string to a number", async () => {
        const csvAdapter = InputAdapters["csv"]();
        expect(csvAdapter).toBeDefined();
        const result = await csvAdapter.parseStream(new Readable({
            read() {
                this.push('key,value\nfoo,123');
                this.push(null);
            }
        }), "file.csv");
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].fields).toEqual({ key: "foo", value: "123" });
    });
});

describe("InputAdapters - TSV", () => {
    it("should allow tsv as a format", () => {
        expect(Object.keys(InputAdapters)).toContain("tsv");
    });
    it("should accept valid tsv", async () => {
        const tsvAdapter = InputAdapters["tsv"]();
        expect(tsvAdapter).toBeDefined();
        const result = await tsvAdapter.parseStream(new Readable({
            read() {
                this.push('key\tvalue\nfoo\tbar');
                this.push(null);
            }
        }), "file.tsv");
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].fields).toEqual({ key: "foo", value: "bar" });
    });
});