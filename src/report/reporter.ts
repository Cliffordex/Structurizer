import { ValidationResult } from "../app";

export type ReportGenerator = (result: ValidationResult[]) => string;

export const consoleReport: ReportGenerator = (result: ValidationResult[]): string => {
    const report: string[] = [];

    const totals = {
        total: 0,
        valid: 0,
        invalid: 0,
        errors: 0
    };

    for (const file of result) {

        report.push(`File: ${file.filename}`);
        report.push(`  Success: ${file.success}`);
        if (file.errors) {
            report.push(`  Errors: ${file.errors.join(", ")}`);
        }
        if (file.stats) {
            report.push(`  Total: ${file.stats.total}`);
            report.push(`  Valid: ${file.stats.valid}`);
            report.push(`  Invalid: ${file.stats.invalid}`);

            totals.total += file.stats.total;
            totals.valid += file.stats.valid;
            totals.invalid += file.stats.invalid;
        }
        if (file.errors?.length) totals.errors += file.errors.length;
        report.push("");
    }

    report.push(`Total Records: ${totals.total}`);
    report.push(`  Valid: ${totals.valid}`);
    report.push(`  Invalid: ${totals.invalid}`);
    report.push(`Errors: ${totals.errors}`);

    return report.join("\n");
};