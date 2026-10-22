import { parse } from "csv-parse";
import { Readable } from "stream";
import { InputAdapter, InputEntry } from "./inputadapter";

export class CsvAdapter extends InputAdapter {
    async parseStream<T = Record<string, any>>(stream: Readable, fileName: string = "stream"): Promise<InputEntry<T>[]> {
        return new Promise((resolve, reject) => {
            const entries: InputEntry<T>[] = [];
            const parser = stream.pipe(parse({ columns: true }));
            parser.on("data", (row) => {
                entries.push({ fields: row, filePosition: `${fileName}:${parser.info.lines} (entry ${entries.length + 1})` });
            });
            parser.on("end", () => resolve(entries));
            parser.on("error", (err) => reject(err));
        });
    }
}