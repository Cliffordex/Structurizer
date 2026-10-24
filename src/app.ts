import { autoDetect, InputAdapters } from "./adapter";
import { InputAdapter, InputRecord } from "./adapter/inputadapter";
import { RuleSet, RulesetResponse } from "./validationrules/ruleset";

export type StructurizerRunOptions = {
    inputFiles: string[];
    inputFormat: string;
    ruleFile: string;
};

export type ValidationResult = {
    /**
     * Indicates if the validation process was successful.
     */
    success: boolean;

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
     * The output of the validation process.
     * 
     * This may be casted to the output type specified by the rule file contract.
     */
    output?: object;

    /**
     * The validation errors for this record.
     */
    errors?: string[];

    /**
     * The step which the validation process reached.
     */
    step: string;
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

    private _inputAdapters: { [key: string]: InputAdapter } = {};

    private getInputAdapter(fileName: string): InputAdapter {
        if (!this._inputAdapters[fileName]) {
            const factory = this.getInputAdapterFactory(fileName);
            this._inputAdapters[fileName] = factory();
        }
        return this._inputAdapters[fileName];
    }

    /**
     * Processes a single file and iterates over its records, yielding validation responses.
     * 
     * @param file The input file to process.
     * @returns An async generator yielding validation responses for each record and the final validation result.
     */
    private async* processFileIterateRecords(file: string): AsyncGenerator<RulesetResponse<Record<string, any>>, ValidationResult, unknown> {
        try {
            const adapter = this.getInputAdapter(file);
            const recordsFromFile = await adapter.parseFileAsync(file);
            const stats = {
                total: 0,
                valid: 0,
                invalid: 0
            };

            for await (const record of recordsFromFile) {
                const response = this.processRecord(record);
                stats.total++;
                if (response.valid) {
                    stats.valid++;
                } else {
                    stats.invalid++;
                }
                yield response;
            }

            return {
                filename: file,
                success: stats.invalid === 0,
                stats,
                step: "Validation"
            } satisfies ValidationResult;
        } catch (error) {
            return {
                filename: file,
                success: false,
                errors: [error instanceof Error ? error.message : String(error)],
                step: "Validation"
            } satisfies ValidationResult;
        }
    }

    private async* processFilesIterateRecords(files: string[]): AsyncGenerator<RulesetResponse<Record<string, any>>, ValidationResult[], unknown> {
        const results: ValidationResult[] = [];
        for (const file of files) {
            const result = yield* this.processFileIterateRecords(file);
            results.push(result);
        }
        return results;
    }

    /**
     * Processes a single file's records and returns a validation response.
     * 
     * @param records The parsed input records from the file.
     * @returns A validation response indicating success and the output.
     */
    processRecords(records: InputRecord[], filename: string): ValidationResult {
        const validationResults = this.rules.validateRecords(records);

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

    processRecord(record: InputRecord) {
        return this.rules.validateRecord(record);
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
    static async validateFileCallback({
        inputFiles,
        inputFormat,
        ruleFile
    }: StructurizerRunOptions,
        {
            valid,
            invalid
        }: {
            valid: (entry: RulesetResponse) => void,
            invalid?: (entry: RulesetResponse) => void
        }
    ): Promise<ValidationResult[]> {
        const app = new Structurizer();
        app.inputFormat = inputFormat ?? app.inputFormat;
        app.ruleFile = ruleFile ?? app.ruleFile;

        const results = app.processFilesIterateRecords(inputFiles);
        while (true) {
            const { value, done } = await results.next();
            if (done) {
                return value;
            }
            if (value.valid) {
                valid(value);
            } else if (invalid) {
                invalid(value);
            }
        }
    }

    //#endregion
}