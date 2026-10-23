import { createReadStream } from "fs";
import { Readable } from "stream";

export interface InputRecord<T = Record<string, any>> {
    /**
     * The parsed data of the record.
     */
    fields: T;

    /**
     * The position of the record within the file.
     */
    filePosition: string;
}

export abstract class InputAdapter {
    abstract parseStream<T = Record<string, any>>(stream: Readable, fileName?: string): Promise<InputRecord<T>[]>;
    async parseFile<T = Record<string, any>>(fileName: string): Promise<InputRecord<T>[]> {
        const stream = createReadStream(fileName);
        return this.parseStream(stream, fileName);
    };
}