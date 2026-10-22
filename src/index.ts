import { Structurizer, StructurizerRunOptions } from "./app";

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h") || args.includes("-?")) {
    console.log("Usage: structurizer [options] <input_file> [<input_file>...]");
    console.log("");
    console.log("Options:");
    console.log("  -h, --help                Show this help message");
    console.log("  -f, --in-format <format>  Specify the input format (csv, json, or auto)  [default: auto]");
    console.log("  -r, --rule <file>         Specify the YAML validation rule file          [default: rules.yaml]");
    console.log("  -o, --output <file>       Specify the output file for the results");
    console.log("  -p, --report <file>        Specify a file to save the processing report");
} else {
    // Parse options and collect only positional arguments as input files.
    const options: StructurizerRunOptions = {
        inputFiles: [],
        inputFormat: "auto",
        ruleFile: "rules.yaml"
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case "-f":
            case "--in-format":
                if (args[i + 1] !== undefined) options.inputFormat = args[++i];
                break;
            case "-r":
            case "--rule":
                if (args[i + 1] !== undefined) options.ruleFile = args[++i];
                break;
            case "-o":
            case "--output":
            case "-p":
            case "--report":
                if (args[i + 1] !== undefined) i++;
                break;
            default:
                if (!arg.startsWith("-")) options.inputFiles.push(arg);
        }
    }

    if (!options.inputFiles.length) {
        console.error("Error: No input files specified.");
        process.exit(1);
    }

    Structurizer.run(options)
        .then(responses => {
            console.log(responses);
        });
}