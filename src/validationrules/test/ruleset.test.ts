import { describe, expect, it } from "bun:test";
import { Readable } from "stream";
import { InputAdapters } from "../../adapter";
import { Structurizer } from "../../app";
import { RuleSet } from "../ruleset";

describe('RuleSet - Parsing', () => {

    // Validate rule config and reject invalid or unknown properties
    it('rejects invalid or unknown properties in the rule config', () => {
        expect(() => {
            RuleSet.fromYamlString(`fields:\n  age:\n    type: number\n  unknownProp: true\n`, "invalid rule test string");
        }).toThrow();
    });

    it('accepts a string field', () => {
        expect(() => {
            RuleSet.fromYamlString(`fields:\n  name:\n    type: string\n`, "string test string");
        }).not.toThrow();
    });

    it('accepts a number field', () => {
        expect(() => {
            RuleSet.fromYamlString(`fields:\n  age:\n    type: number\n`, "number test string");
        }).not.toThrow();
    });

    it('accepts a boolean field', () => {
        expect(() => {
            RuleSet.fromYamlString(`fields:\n  isActive:\n    type: boolean\n`, "bool test string");
        }).not.toThrow();
    });

    it('accepts a date field', () => {
        expect(() => {
            RuleSet.fromYamlString(`fields:\n  birthDate:\n    type: date\n`, "date test string");
        }).not.toThrow();
    });

    it('accepts a required field', () => {
        expect(() => {
            RuleSet.fromYamlString(`fields:\n  name:\n    type: string\n    required: true\n`, "required test string");
        }).not.toThrow();
    });
});

describe('RuleSet - Validation', () => {
    it('implicitly coerces csv numeric strings to numbers when rules specify numeric type', async () => {
        const csv = 'name,age\nAlice,30\nBob,25';
        const csvParser = InputAdapters.csv();
        const csvRecords = await csvParser.parseStream(Readable.from([csv]), 'test.csv');
        expect(csvRecords[0].fields.age).toEqual("30");
        expect(csvRecords[1].fields.age).toEqual("25");
        const s = new Structurizer();
        s["rules"] = RuleSet.fromYamlString(`fields:\n  age:\n    type: number\n`, "test string");
        const processed = s.processRecords(csvRecords, "alice_bob.csv");
        expect(processed.errors).toBeUndefined();
        expect(processed.success).toBe(true);
        expect((processed as any).output[0].data.age).toEqual(30);
        expect((processed as any).output[1].data.age).toEqual(25);
        expect(processed.filename).toBe("alice_bob.csv");
    });

    it('rejects blank strings for number fields instead of coercing them to zero', () => {
        const ruleSet = RuleSet.fromYamlString(`fields:\n  age:\n    type: number\n`, "test string");
        const result = ruleSet.validateRecord({ fields: { age: "" }, filePosition: "test.csv:1" });

        expect(result.valid).toBe(false);
    });

    it("rejects non-numeric strings for number fields", () => {
        const ruleSet = RuleSet.fromYamlString(`fields:\n  age:\n    type: number\n`, "test string");
        const result = ruleSet.validateRecord({ fields: { age: "abc" }, filePosition: "test.csv:1" });

        expect(result.valid).toBe(false);
    });

    it('does not define an errors property on a valid record', () => {
        const schema = RuleSet.fromYamlString(`fields:\n  age:\n    type: number\n`, "test string");
        const result = schema.validateRecord({ fields: { age: 25 }, filePosition: "test.csv:1" });

        expect(result.errors).toBeUndefined();
    });

    it('rejects an unknown property in the ruleset', () => {
        expect(() => {
            RuleSet.fromYamlString(`fields:\n  age:\n    type: number\n  unknownProp: true\n`, "invalid rule test string");
        }).toThrow();
    });

    it('reports an error and marks the record as invalid for missing required fields', () => {
        const ruleSet = RuleSet.fromYamlString(`fields:\n  name:\n    type: string\n    required: true\n`, "test string");
        const result = ruleSet.validateRecord({ fields: { }, filePosition: "test.csv:1" });

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
    });
});

