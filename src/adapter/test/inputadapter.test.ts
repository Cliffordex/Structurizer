import { describe, expect, it, spyOn } from "bun:test";
import { Readable } from "stream";
import { InputAdapters } from "..";
import { Structurizer } from "../../app";
import { CsvAdapter } from "../csv";
import { JSONAdapter } from "../json";

describe("InputAdapters", () => {
    describe("async file parsing", () => {
        it("should convert the file to a stream and run the stream parser on it", async () => {
            const csvParser = InputAdapters.csv();
            const err = new Error("mock error");
            const spy = spyOn(csvParser, "parseAwaitableStream").mockImplementation((a, b) => { throw err; });
            const records = [];
            try{
                await csvParser.parseFileAsync('test.csv');
            } catch (e) {
                expect(e).toBe(err);
            }
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockRestore();
        });
    });
});

describe("InputAdapters - Formats", () => {
    // Convert into consistent internal record representation
    it('validates identical csv and json records', async () => {
        const csv = 'name,age\nAlice,30\nBob,25';
        const json = '[{"name":"Alice","age":"30"},{"name":"Bob","age":"25"}]';
        const csvParser = InputAdapters.csv();
        const jsonParser = InputAdapters.json();

        const csvRecords = csvParser.parseAwaitableStream(Readable.from([csv]), 'test.csv');
        const jsonRecords = jsonParser.parseAwaitableStream(Readable.from([json]), 'test.json');

        // Compare the parsed records
        expect((await csvRecords.next()).value!.fields.age).toEqual((await jsonRecords.next()).value!.fields.age);
        expect((await csvRecords.next()).value!.fields.name).toEqual((await jsonRecords.next()).value!.fields.name);
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

    it("should reject unknown file extensions", () => {
        const s = new Structurizer();
        expect(() => s["getInputAdapterFactory"]("file.unknown")()).toThrow();
    });
});

describe("InputAdapters - JSON", () => {
    it("should allow json as a format", () => {
        expect(Object.keys(InputAdapters)).toContain("json");
    });
    it("should accept json arrays", async () => {
        const jsonAdapter = InputAdapters["json"]();
        expect(jsonAdapter).toBeDefined();
        const result = jsonAdapter.parseAwaitableStream(new Readable({
            read() {
                this.push('[{"key": "value"}]');
                this.push(null);
            }
        }), "file.json");
        expect(result).toBeDefined();
        const records = [];
        for await (const record of result) {
            records.push(record);
        }
        expect(records.length).toBe(1);
    });
    it("should reject non-array json", () => {
        const jsonAdapter = InputAdapters["json"]();
        expect(jsonAdapter).toBeDefined();
        expect(async () => {
            const result = jsonAdapter.parseAwaitableStream(new Readable({
                read() {
                    this.push('{"key": "value"}\n');
                    this.push(null);
                }
            }), "file.json");
            for await (const _ of result) {
            }
        }).toThrow();
    });
    it("should accept an empty json array", async () => {
        const jsonAdapter = InputAdapters["json"]();
        expect(jsonAdapter).toBeDefined();
        const result = jsonAdapter.parseAwaitableStream(new Readable({
            read() {
                this.push('[]');
                this.push(null);
            }
        }), "file.json");
        expect(result).toBeDefined();
        const records = [];
        for await (const record of result) {
            records.push(record);
        }
        expect(records.length).toBe(0);
    });
});

describe("InputAdapters - CSV", () => {
    it("should allow csv as a format", () => {
        expect(Object.keys(InputAdapters)).toContain("csv");
    });
    it("should accept valid csv", async () => {
        const csvAdapter = InputAdapters["csv"]();
        expect(csvAdapter).toBeDefined();
        const result = await csvAdapter.parseAwaitableStream(new Readable({
            read() {
                this.push('key,value\nfoo,bar');
                this.push(null);
            }
        }), "file.csv");
        expect(result).toBeDefined();
        const records = [];
        for await (const record of result) {
            records.push(record);
        }
        expect(records.length).toBe(1);
        expect(records[0].fields).toEqual({ key: "foo", value: "bar" });
    });
    // These need to be handled by the ruleset, not the parser.
    it("should not implicitly coerce a numeric string to a number", async () => {
        const csvAdapter = InputAdapters["csv"]();
        expect(csvAdapter).toBeDefined();
        const result = await csvAdapter.parseAwaitableStream(new Readable({
            read() {
                this.push('key,value\nfoo,123');
                this.push(null);
            }
        }), "file.csv");
        expect(result).toBeDefined();
        const records = [];
        for await (const record of result) {
            records.push(record);
        }
        expect(records.length).toBe(1);
        expect(records[0].fields).toEqual({ key: "foo", value: "123" });
    });
});

describe("InputAdapters - TSV", () => {
    it("should allow tsv as a format", () => {
        expect(Object.keys(InputAdapters)).toContain("tsv");
    });
    it("should accept valid tsv", async () => {
        const tsvAdapter = InputAdapters["tsv"]();
        expect(tsvAdapter).toBeDefined();
        const result = tsvAdapter.parseAwaitableStream(new Readable({
            read() {
                this.push('key\tvalue\nfoo\tbar');
                this.push(null);
            }
        }), "file.tsv");
        expect(result).toBeDefined();
        const records = [];
        for await (const record of result) {
            records.push(record);
        }
        expect(records.length).toBe(1);
        expect(records[0].fields).toEqual({ key: "foo", value: "bar" });
    });
});