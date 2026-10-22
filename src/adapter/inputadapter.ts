import { Readable } from "stream";
import { createReadStream } from "fs";

export interface InputEntry<T = Record<string, any>> {
    /**
     * The parsed data of the entry.
     */
    fields: T;

    /**
     * The position of the entry within the file.
     */
    filePosition: string;
}

export abstract class InputAdapter {
    abstract parseStream<T = Record<string, any>>(stream: Readable, fileName?: string): Promise<InputEntry<T>[]>;
    async parseFile<T = Record<string, any>>(fileName: string): Promise<InputEntry<T>[]> {
        const stream = createReadStream(fileName);
        return this.parseStream(stream, fileName);
    };
}