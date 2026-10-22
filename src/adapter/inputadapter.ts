export interface InputEntry {
    /**
     * The parsed data of the entry.
     */
    fields: Record<string, string | number>;

    /**
     * The position of the entry within the file.
     */
    filePosition: string;
}

export abstract class InputAdapter {
    abstract parseFile(path: string): Promise<InputEntry[]>;
}