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
        let currentOffset = 0;
        let line = 1;
        for (const [index, child] of (tree.children ?? []).entries()) {
            if (child.offset !== undefined) {
                while (currentOffset < child.offset) {
                    if (content[currentOffset] === "\r") {
                        line++;
                        if (content[currentOffset + 1] === "\n") currentOffset++;
                    } else if (content[currentOffset] === "\n") {
                        line++;
                    }
                    currentOffset++;
                }
            }
            yield {
                fields: getNodeValue(child),
                filePosition: `${fileName}:` + (child.offset === undefined ? `invalid` : line) + ` (record ${index + 1})`
            };
        }
    }
}