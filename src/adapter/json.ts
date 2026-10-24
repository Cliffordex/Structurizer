import { getNodeValue, parseTree } from "jsonc-parser";
import { Readable } from "stream";
import { InputAdapter } from "./inputadapter";

// Actually streaming records would require handwriting a new parser, which is outside of the scope of this project.
// Therefore, this adapter reads the entire stream into memory before parsing it as a JSON array.

export class JSONAdapter extends InputAdapter {
    async *parseAwaitableStream(stream: Readable, fileName: string = "stream"): AsyncGenerator<{ fields: any; filePosition: string }, void, unknown> {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const content = Buffer.concat(chunks).toString("utf-8");
        const tree = parseTree(content);
        if (tree?.type !== "array") {
            throw new Error(`Expected JSON array in ${fileName}, but found ${typeof tree?.value}`);
        }
        for (const [index, child] of (tree.children ?? []).entries()) {
            yield {
                fields: getNodeValue(child),
                filePosition: `${fileName}:` + (child.offset ?? `invalid`) + ` (record ${index + 1})`
            };
        }
    }

    parse(stream: Readable, fileName: string = "stream"): Promise<{ fields: any; filePosition: string }[]> {
        const records: { fields: any; filePosition: string }[] = [];
        return (async () => {
            for await (const record of this.parseAwaitableStream(stream, fileName)) {
                records.push(record);
            }
            return records;
        })();
    }
}