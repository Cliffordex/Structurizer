import { describe, expect, it } from "bun:test";
import { htmlReport } from "../reporter";

describe("HTML report", () => {
    it("renders a responsive summary and per-file validation details", () => {
        const html = htmlReport([
            {
                filename: "members.csv",
                success: false,
                output: [
                    {
                        valid: false,
                        errors: ["email failed validation"],
                        data: { email: "not-an-email" },
                        filePosition: "members.csv:3 (record 2)"
                    }
                ],
                stats: { total: 1, valid: 0, invalid: 1 },
                step: "Validation"
            }
        ]);

        expect(html).toContain("<!doctype html>");
        expect(html).toContain("name=\"viewport\"");
        expect(html).toContain("grid-template-columns: repeat(auto-fit");
        expect(html).toContain("Files processed");
        expect(html).toContain("Invalid records");
        expect(html).toContain("members.csv:3 (record 2)");
        expect(html).toContain("email failed validation");
        expect(html).toContain("Record validation issues (1)");
    });

    it("escapes filenames and errors before inserting them into the HTML", () => {
        const html = htmlReport([
            {
                filename: '<img src=x onerror="alert(1)">',
                success: false,
                errors: ["<script>alert('bad')</script>"],
                step: "Parsing"
            }
        ]);

        expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
        expect(html).toContain("&lt;script&gt;alert(&#39;bad&#39;)&lt;/script&gt;");
        expect(html).not.toContain("<script>alert");
    });
});
