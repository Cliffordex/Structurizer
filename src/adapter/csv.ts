import { InputAdapter, InputEntry } from "./inputadapter";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { Readable } from "stream";

export class CsvAdapter extends InputAdapter {
    async parseStream<T = Record<string, any>>(stream: Readable, fileName?: string): Promise<InputEntry<T>[]> {
        return new Promise((resolve, reject) => {
            const entries: InputEntry<T>[] = [];
            const parser = stream.pipe(parse({ columns: true }));
            parser.on("data", (row) => {
                entries.push({ fields: row, filePosition: `${fileName ?? `stream`}:${parser.info.lines} (entry ${entries.length + 1})` });
            });
            parser.on("end", () => resolve(entries));
            parser.on("error", (err) => reject(err));
        });
    }

    async parseFile<T = Record<string, any>>(fileName: string): Promise<InputEntry<T>[]> {
        const stream = createReadStream(fileName, { encoding: "utf-8" });
        return this.parseStream(stream, fileName);
    }
}