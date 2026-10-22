import { parse } from 'yaml';
import * as z from 'zod';
import { InputEntry } from '../adapter/inputadapter';

export const fieldSchema = z.object({
    type: z.string(),
    required: z.boolean().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional()
});

export const ruleSchema = z.object({
    fields: z.record(z.string(), fieldSchema),
});

export type RulesetResponse<T = Record<string, any>> = {
    valid: boolean;
    errors: string[];
    data: T;
    filePosition: string;
};

export class RuleSet {
    private _builtEntrySchema: z.ZodObject<any>;

    private constructor(private rules: z.infer<typeof ruleSchema>) {
        this._builtEntrySchema = z.object(
            Object.fromEntries(
                Object.entries(this.rules.fields).map(([key, field]) => {
                    let schema: z.ZodType = z.string();
                    if (field.type === 'string') {
                        let stringSchema = z.string();
                        if (field.minLength !== undefined) stringSchema = stringSchema.min(field.minLength);
                        if (field.maxLength !== undefined) stringSchema = stringSchema.max(field.maxLength);
                        if (field.pattern !== undefined) stringSchema = stringSchema.regex(new RegExp(field.pattern));
                        schema = stringSchema;
                    } else if (field.type === 'number') {
                        let numberSchema = z.number();
                        if (field.min !== undefined) numberSchema = numberSchema.min(field.min);
                        if (field.max !== undefined) numberSchema = numberSchema.max(field.max);
                        schema = numberSchema;
                    }
                    if (field.required === false) schema = schema.optional();
                    return [key, schema];
                })
            )
        );
    }

    validate(data: InputEntry[]) {
        return data.map(entry => this.validateEntry(entry));
    }

    validateEntry<T>(data: InputEntry<T>): RulesetResponse<T> {
        const errors: string[] = [];
        const result = this._builtEntrySchema.safeParse(data.fields);
        if (!result.success) {
            for (const issue of result.error.issues) {
                errors.push(`${data.filePosition} \"${issue.path.join('.')}\" failed validation. ${issue.message}`);
            }
        }
        return {
            valid: result.success,
            errors,
            data: data.fields,
            filePosition: data.filePosition
        };
    }

    static fromYamlString(yamlString: string, fileName?: string): RuleSet {
        const parsedRules = parse(yamlString);
        let validatedRules;
        try {
            validatedRules = ruleSchema.parse(parsedRules);
        } catch (error) {
            const fileNameStr = fileName ? `in file ${fileName}` : '';
            if (error instanceof z.ZodError) {
                throw new Error(`Invalid rule set ${fileNameStr}: ${z.prettifyError(error)}`);
            }
            throw new Error(`Error loading rule set ${fileNameStr}: ${error}`);
        }
        const ruleSet = new RuleSet(validatedRules);
        return ruleSet;
    }

    static fromFile(filePath: string): RuleSet {
        const fs = require('fs');
        const yamlString = fs.readFileSync(filePath, 'utf-8');
        return RuleSet.fromYamlString(yamlString, filePath);
    }
}