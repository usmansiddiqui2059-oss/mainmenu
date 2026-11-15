import { readFile, writeFile } from "node:fs/promises";
import ts from "typescript";
const input = await readFile("adapters/canvas.ts", "utf8"),
  output = ts.transpileModule(input, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      removeComments: false,
    },
  });
await writeFile("adapters/canvas.js", output.outputText);
