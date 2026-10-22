import { autoDetect, InputAdapters } from "./adapter";
import { InputAdapter, InputEntry } from "./adapter/inputadapter";
import { RuleSet } from "./validationrules/ruleset";

export type StructurizerRunOptions = {
    inputFiles: string[];
    inputFormat: string;
    ruleFile: string;
    outputFile?: string;
    reportFile?: string;
};

export type ValidationResponse = {
    success: boolean;
    errors?: string[];
    output?: object;
}

export class Structurizer {

    //#region Fields

    // Provide defaults for input and rule file values, in case users wish to use the app without the CLI

    /**
     * The input format (csv, json, or auto).
     */
    private inputFormat: string = "auto";
    /**
     * The rule file to use for validation.
     */
    private _ruleFile: string = "rules.json";
    /**
     * The loaded rules from the rule file.
     */
    private rules: RuleSet | null = null;

    //#endregion

    //#region Properties

    private inputAdapter(fileName: string): InputAdapter {
        if (this.inputFormat == "auto") {
            const ext = fileName.split('.').pop()?.toLowerCase();
            if (!ext) {
                throw new Error(`Unable to determine file extension for file: ${fileName}`);
            }
            return new InputAdapters[autoDetect(ext)]();
        }
        if (!InputAdapters.hasOwnProperty(this.inputFormat)) {
            throw new Error(`Unsupported input format: ${this.inputFormat}`);
        }
        return new InputAdapters[this.inputFormat]();
    }

    get ruleFile() {
        return this._ruleFile;
    }

    set ruleFile(value: string) {
        this.rules = null;
        this._ruleFile = value;
    }

    //#endregion

    //#region Methods
    async processFiles(inputFiles: string[]): Promise<ValidationResponse[]> {
        return await Promise.all(
            inputFiles.map(async file => {
                try {
                    return this.processFile(
                        await this.inputAdapter(file)
                            .parseFile(file)
                    )
                } catch (error) {
                    return {
                        success: false,
                        errors: [(error instanceof Error ? error.message : String(error))]
                    };
                }
            })
        );
    }

    processFile(entries: InputEntry[]): ValidationResponse {
        return {
            success: true,
            output: {}
        };
    }
    //#endregion

    //#region Static Methods

    static async run({ inputFiles, inputFormat, ruleFile }: { inputFiles: string[], inputFormat: string, ruleFile: string }): Promise<ValidationResponse[]> {
        const app = new Structurizer();
        app.inputFormat = inputFormat ?? app.inputFormat;
        app.ruleFile = ruleFile ?? app.ruleFile;

        return await app.processFiles(inputFiles);
    }

    //#endregion
}