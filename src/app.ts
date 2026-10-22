import { autoDetect, InputAdapters } from "./adapter";
import { InputAdapter, InputEntry } from "./adapter/inputadapter";
import { RuleSet } from "./validationrules/ruleset";

export type StructurizerRunOptions = {
    inputFiles: string[];
    inputFormat: string;
    ruleFile: string;
};

type BaseValidationResponse = {
    /**
    * The statistics of the validation process.
    * 
    * Only present if the parsing process was successful.
    */
    stats?: {
        /**
         * The total number of entries processed.
         */
        totalEntries: number;
        /**
         * The number of valid entries.
         */
        validEntries: number;
        /**
         * The number of entries which failed validation and have no valid data.
         */
        invalidEntries: number;
    };

    /**
     * The validation errors for this entry.
     */
    errors?: string[];

    /**
     * The step which the validation process reached.
     */
    step: string;
}

type SuccessfulValidationResponse = {
    /**
     * Indicates if any of the validation steps were successful.
     */
    success: true;
    /**
     * The output of the validation process.
     * 
     * This may be casted to the output type specified by the rule file contract.
     */
    output: object;
} & BaseValidationResponse;
type FailedValidationResponse = {
    /**
     * Indicates that the validation process failed.
     */
    success: false;

    errors: string[];
} & BaseValidationResponse;

export type ValidationResponse = SuccessfulValidationResponse | FailedValidationResponse;

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
    private _rules: RuleSet | null = null;

    //#endregion

    //#region Properties

    get ruleFile() {
        return this._ruleFile;
    }

    set ruleFile(value: string) {
        this._rules = null;
        this._ruleFile = value;
    }

    get rules() {
        this._rules ??= RuleSet.fromFile(this._ruleFile);
        return this._rules!;
    }

    //#endregion

    //#region Methods

    private getInputAdapter(fileName: string): InputAdapter {
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

    /**
     * Processes multiple input files and returns an array of validation responses.
     * 
     * @param inputFiles The list of input files to process.
     * @returns A promise that resolves to an array of validation responses.
     */
    async processFiles(inputFiles: string[]): Promise<ValidationResponse[]> {
        return await Promise.all(
            inputFiles.map(async file => {
                try {
                    return this.processEntries(
                        await this.getInputAdapter(file)
                            .parseFile(file)
                    )
                } catch (error) {
                    return {
                        success: false,
                        errors: [(error instanceof Error ? error.message : String(error))],
                        step: "Parsing"
                    } satisfies FailedValidationResponse;
                }
            })
        );
    }

    /**
     * Processes a single file's entries and returns a validation response.
     * 
     * @param entries The parsed input entries from the file.
     * @returns A validation response indicating success and the output.
     */
    processEntries(entries: InputEntry[]): ValidationResponse {
        const validationResults = this.rules.validate(entries);

        const success = validationResults.every(result => result.valid);

        return {
            success: success as true,
            output: validationResults,
            stats: {
                totalEntries: validationResults.length,
                validEntries: validationResults.filter(result => result.valid).length,
                invalidEntries: validationResults.filter(result => !result.valid).length
            },
            step: "Validation"
        };
    }

    //#endregion

    //#region Static Methods

    /**
     * Runs the Structurizer application with the specified input files, input format, and rule file.
     * 
     * @param inputFiles The list of input files to process.
     * @param inputFormat The input format (csv, json, or auto).
     * @param ruleFile The rule file to use for validation.
     * @returns A promise that resolves to an array of validation responses.
     */
    static async run({ inputFiles, inputFormat, ruleFile }: StructurizerRunOptions): Promise<ValidationResponse[]> {
        const app = new Structurizer();
        app.inputFormat = inputFormat ?? app.inputFormat;
        app.ruleFile = ruleFile ?? app.ruleFile;

        return await app.processFiles(inputFiles);
    }

    //#endregion
}