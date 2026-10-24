import { CsvAdapter } from "./csv";
import { InputAdapter } from "./inputadapter";
import { JSONAdapter } from "./json";

// The registry keeps adapter selection in one place, but requires each adapter
// to have a no-argument constructor.
// An adapter may be reused for multiple file extensions.

/**
 * A registry of available input adapters keyed by their file extension.
 */
export const InputAdapters: Record<string, () => InputAdapter> = {
    "csv": () => new CsvAdapter(),
    "tsv": () => new CsvAdapter({ delimiter: '\t' }),
    "json": () => new JSONAdapter()
};

/**
 * Auto-detects the input adapter based on the file extension.
 * @param extension The file extension to detect.
 * @returns The key of the detected input adapter.
 * @throws If no suitable adapter is found for the given extension.
 */
export function autoDetect(extension: string): string {
    if (extension && InputAdapters[extension]) {
        return extension;
    }
    throw new Error(`Unable to auto-detect input adapter for file extension: ${extension}`);
}