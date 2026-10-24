import { describe, expect, it, spyOn } from "bun:test";
import { InputRecord } from "../adapter/inputadapter";
import { Structurizer } from "../app";
import { RuleSet } from "../validationrules/ruleset";

describe("App", () => {
    it("should clear the rules when a new rule file is specified", () => {
        const s = new Structurizer();
        s["_rules"] = RuleSet.fromYamlString("fields:\n  name:\n    type: string\n");
        s.ruleFile = "rules1.json";
        expect(s["_rules"]).toBeNull();
    });

    it("should defer loading new rules after setting a rule file", () => {
        const s = new Structurizer();
        s.ruleFile = "rules2.json";
        expect(s["_rules"]).toBeNull();
        expect(s.ruleFile).toBe("rules2.json");
    });

    it("should call the rules validator when processing a record", () => {
        const s = new Structurizer();
        const rules = RuleSet.fromYamlString("fields:\n  name:\n    type: string\n");
        const spy = spyOn(rules, "validateRecord").mockImplementation(() => ({} as any));
        s["_rules"] = rules;
        const record: InputRecord = {
            fields: {
                name: "John Doe"
            },
            filePosition: "test:1"
        };
        const result = s.processRecord(record);
        expect(result).toBeDefined();
        expect(spy).toHaveBeenCalled();
    });
});