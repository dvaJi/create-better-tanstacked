import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const sourcePath = join(import.meta.dir, "../../../packages/template-generator/templates-binary");
const targetPath = join(import.meta.dir, "../dist/templates-binary");

await mkdir(dirname(targetPath), { recursive: true });
await cp(sourcePath, targetPath, { recursive: true, force: true });
