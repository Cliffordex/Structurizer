import { getNodeValue, parseTree } from "jsonc-parser";
import { Readable } from "stream";
import { InputAdapter } from "./inputadapter";

export class JSONAdapter extends InputAdapter {
    async parseStream(stream: Readable, fileName: string = "stream"): Promise<{ fields: any; filePosition: string }[]> {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const content = Buffer.concat(chunks).toString("utf-8");
        const tree = parseTree(content);

        if (tree?.type !== "array") {
            throw new Error(`Expected JSON array in ${fileName}, but found ${typeof tree?.value}`);
        }

        const result = tree.children?.map((child, index) => {
            return {
                fields: getNodeValue(child),
                filePosition: `${fileName}:` + (child.offset ?? `invalid`) + ` (record ${index + 1})`
            };
        }) ?? [];
        return result;
    }
}