import { describe, it, expect } from "bun:test";
import { InputAdapters, autoDetect } from "../";
import { Readable } from "stream";

describe("InputAdapters - Auto", () => {
    it("should correctly identify a file with a csv extension", () => {
        const result = autoDetect("csv");
        expect(result).toBe("csv");
    });

    // it("should correctly identify a file with a json extension", () => {
    //     const result = autoDetect("file.json");
    //     expect(result).toBe("json");
    // });
});

// describe("InputAdapters - JSON", () => {
// it("should allow json as a format", () => {
//     expect(Object.keys(InputAdapters)).toContain("json");
// });
//     it("should accept valid json", () => {
//         const jsonAdapter = new InputAdapters["json"]();
//         expect(jsonAdapter).toBeDefined();
//         jsonAdapter.parseStream(new Readable({
//             read() {
//                 this.push('{"key": "value"}');
//                 this.push(null);
//             }
//         }), "file.json");
//     });
// });

describe("InputAdapters - CSV", () => {
    it("should allow csv as a format", () => {
        expect(Object.keys(InputAdapters)).toContain("csv");
    });
    it("should accept valid csv", async () => {
        const csvAdapter = new InputAdapters["csv"]();
        expect(csvAdapter).toBeDefined();
        const result = await csvAdapter.parseStream(new Readable({
            read() {
                this.push('key,value\nfoo,bar');
                this.push(null);
            }
        }), "file.csv");
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].fields).toEqual({ key: "foo", value: "bar" });
    });
});