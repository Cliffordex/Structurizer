import { parse } from "csv-parse";
import { Readable } from "stream";
import { InputAdapter, InputRecord } from "./inputadapter";

export class CsvAdapter extends InputAdapter {

    constructor(options?: { delimiter?: string }) {
        super();
        this.options = options || {};
    }
    private options: { delimiter?: string };

    async *parseAwaitableStream<T = Record<string, any>>(stream: Readable, fileName?: string): AsyncGenerator<InputRecord<T>, void, unknown> {
        const parser = stream.pipe(parse({ columns: true, delimiter: this.options.delimiter }));
        for await (const row of parser) {
            const record = { fields: row, filePosition: `${fileName}:${parser.info.lines} (record ${parser.info.records + 1})` };
            yield record;
        }
    }

    parse<T = Record<string, any>>(stream: Readable, fileName: string = "stream"): InputRecord<T>[] {
        const records: InputRecord<T>[] = [];
        const parser = stream.pipe(parse({ columns: true, delimiter: this.options.delimiter }));
        parser.on("data", (row) => {
            const record = { fields: row, filePosition: `${fileName}:${parser.info.lines} (record ${parser.info.records + 1})` };
            records.push(record);
        });
        return records;
    }
}