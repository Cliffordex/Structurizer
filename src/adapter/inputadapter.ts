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

//TODO: Implement callbacks and/or yield-based parsing and processing.

export abstract class InputAdapter {
    abstract parseAwaitableStream<T = Record<string, any>>(stream: Readable, fileName?: string): AsyncGenerator<InputRecord<T>, void, unknown>;
    async parseFileAsync<T = Record<string, any>>(fileName: string): Promise<AsyncGenerator<InputRecord<T>, void, unknown>> {
        const stream = createReadStream(fileName);
        return this.parseAwaitableStream(stream, fileName);
    };
}