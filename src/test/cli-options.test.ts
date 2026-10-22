import { describe, it, expect } from "bun:test";

describe("CLI Help", () => {
    it("should display help information when no arguments are provided", () => {
        const result = Bun.spawnSync(["bun", "run", "src/index.ts"]);
        expect(result.stdout.toString()).toContain("Usage");
    });
    it("should display help information with --help flag", () => {
        const result = Bun.spawnSync(["bun", "run", "src/index.ts", "--help"]);
        expect(result.stdout.toString()).toContain("Usage");
        
    });
    it("should display the same help information with --help, -h, and -? flags", () => {
        const resultHelp = Bun.spawnSync(["bun", "run", "src/index.ts", "--help"]);
        const resultH = Bun.spawnSync(["bun", "run", "src/index.ts", "-h"]);
        const resultQuestion = Bun.spawnSync(["bun", "run", "src/index.ts", "-?"]);
        expect(resultHelp.stdout.toString()).toContain("Usage");
        expect(resultH.stdout.toString()).toContain("Usage");
        expect(resultQuestion.stdout.toString()).toContain("Usage");
    });
    it("should show the expected call structure in help", () => {
        const result = Bun.spawnSync(["bun", "run", "src/index.ts", "--help"]);
        expect(result.stdout.toString()).toContain("structurizer [options] <input_file> [<input_file>...]");
    });
    it("should show what options are available in help", () => {
        const result = Bun.spawnSync(["bun", "run", "src/index.ts", "--help"]);
        expect(result.stdout.toString()).toContain("[options]");
        expect(result.stdout.toString()).toContain("--help");
        expect(result.stdout.toString()).toContain("-f, --in-format <format>");
        expect(result.stdout.toString()).toContain("[default: auto]");
        expect(result.stdout.toString()).toContain("-r, --rule <file>");
        expect(result.stdout.toString()).toContain("[default: rules.yaml]");
        expect(result.stdout.toString()).toContain("-o, --output <file>");
        expect(result.stdout.toString()).toContain("-p, --report <file>");
    });
});

describe("CLI Options", () => {
    it("should display an error when a non-existent input file is specified", () => {
        const result = Bun.spawnSync(["bun", "run", "src/index.ts", "nonexistentfile.csv"]);
        expect(result.stderr.toString()).toContain("no such file or directory");
    });
});

describe("CLI Options with Input Format", () => {
    it("should accept the -f or --in-format option", () => {
        const result = Bun.spawnSync(["bun", "run", "src/index.ts", "-f", "csv", "nonexistentfile.csv"]);
        expect(result.stderr.toString()).toContain("no such file or directory");
    });
});