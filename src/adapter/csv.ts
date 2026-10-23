import { parse } from "csv-parse";
import { Readable } from "stream";
import { InputAdapter, InputRecord } from "./inputadapter";

export class CsvAdapter extends InputAdapter {
    constructor(options?: { delimiter?: string }) {
        super();
        this.options = options || {};
    }
    private options: { delimiter?: string };

    async parseStream<T = Record<string, any>>(stream: Readable, fileName: string = "stream"): Promise<InputRecord<T>[]> {
        return new Promise((resolve, reject) => {
            const records: InputRecord<T>[] = [];
            const parser = stream.pipe(parse({ columns: true, delimiter: this.options.delimiter }));
            parser.on("data", (row) => {
                records.push({ fields: row, filePosition: `${fileName}:${parser.info.lines} (record ${records.length + 1})` });
            });
            parser.on("end", () => resolve(records));
            parser.on("error", (err) => reject(err));
        });
    }
}