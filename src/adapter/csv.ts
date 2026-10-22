import { InputAdapter, InputEntry } from "./inputadapter";
import { parse } from "csv-parse";
import { createReadStream } from "fs";

export class CsvAdapter extends InputAdapter {
    async parseFile(file: string): Promise<InputEntry[]> {
        return new Promise((resolve, reject) => {
            const entries: InputEntry[] = [];
            const parser = createReadStream(file, { encoding: "utf-8" }).pipe(parse({ columns: true }));
            parser.on("data", (row) => {
                entries.push({ fields: row, filePosition: `${file}:${parser.info.lines} (entry ${entries.length + 1})` });
            });
            parser.on("end", () => resolve(entries));
            parser.on("error", (err) => reject(err));
        });
    }
}