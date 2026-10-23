import { autoDetect, InputAdapters } from "./adapter";
import { InputAdapter, InputRecord } from "./adapter/inputadapter";
import { RuleSet } from "./validationrules/ruleset";

export type StructurizerRunOptions = {
    inputFiles: string[];
    inputFormat: string;
    ruleFile: string;
};

type BaseValidationResult = {
    /**
     * The name of the file being validated.
     */
    filename: string;

    /**
    * The statistics of the validation process.
    * 
    * Only present if the parsing process was successful.
    */
    stats?: {
        /**
         * The total number of records processed.
         */
        total: number;
        /**
         * The number of valid records.
         */
        valid: number;
        /**
         * The number of records which failed validation and have no valid data.
         */
        invalid: number;
    };

    /**
     * The validation errors for this record.
     */
    errors?: string[];

    /**
     * The step which the validation process reached.
     */
    step: string;
}

export type SuccessfulValidationResult = {
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
} & BaseValidationResult;
export type FailedValidationResult = {
    /**
     * Indicates that the validation process failed.
     */
    success: false;

    errors: string[];
} & BaseValidationResult;

export type ValidationResult = SuccessfulValidationResult | FailedValidationResult;

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

    private set rules(value: RuleSet) {
        this._rules = value;
    }

    get rules() {
        this._rules ??= RuleSet.fromFile(this._ruleFile);
        return this._rules!;
    }

    //#endregion

    //#region Methods

    private getInputAdapterFactory(fileName: string): () => InputAdapter {
        if (this.inputFormat == "auto") {
            const ext = fileName.split('.').pop()?.toLowerCase();
            if (!ext) {
                throw new Error(`Unable to determine file extension for file: ${fileName}`);
            }
            return InputAdapters[autoDetect(ext)];
        }
        if (!InputAdapters.hasOwnProperty(this.inputFormat)) {
            throw new Error(`Unsupported input format: ${this.inputFormat}`);
        }
        return InputAdapters[this.inputFormat];
    }

    /**
     * Processes multiple input files and returns an array of validation responses.
     * 
     * @param inputFiles The list of input files to process.
     * @returns A promise that resolves to an array of validation responses.
     */
    async processFiles(inputFiles: string[]): Promise<ValidationResult[]> {
        return await Promise.all(
            inputFiles.map(async file => {
                try {
                    const records = await this.getInputAdapterFactory(file)()
                        .parseFile(file);
                    return this.processRecords(records, file);
                } catch (error) {
                    return {
                        filename: file,
                        success: false,
                        errors: [(error instanceof Error ? error.message : String(error))],
                        step: "Parsing"
                    } satisfies FailedValidationResult;
                }
            })
        );
    }

    /**
     * Processes a single file's records and returns a validation response.
     * 
     * @param records The parsed input records from the file.
     * @returns A validation response indicating success and the output.
     */
    processRecords(records: InputRecord[], filename: string): ValidationResult {
        const validationResults = this.rules.validate(records);

        const success = validationResults.every(result => result.valid);

        return {
            filename: filename,
            success: success as true,
            output: validationResults,
            stats: {
                total: validationResults.length,
                valid: validationResults.filter(result => result.valid).length,
                invalid: validationResults.filter(result => !result.valid).length
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
    static async run({ inputFiles, inputFormat, ruleFile }: StructurizerRunOptions): Promise<ValidationResult[]> {
        const app = new Structurizer();
        app.inputFormat = inputFormat ?? app.inputFormat;
        app.ruleFile = ruleFile ?? app.ruleFile;

        return await app.processFiles(inputFiles);
    }

    //#endregion
}