import * as p from "jsr:@std/path";
import $ from "jsr:@david/dax";

type ConfigImports = { project: string; imports: Record<string, string> };

function read(path: string | URL): string {
  try {
    return new TextDecoder("utf-8").decode(Deno.readFileSync(path));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return "";
    throw e;
  }
}
function remove(path: string | URL) {
  try {
    Deno.removeSync(path, { recursive: true });
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) throw e;
  }
}
function readFileTowardParent(current: string, file: string): [string, string] {
  const root = p.parse(current).root;
  while (current !== root) {
    const contents = read(p.join(current, file));
    if (contents) return [current, contents];
    current = p.dirname(current);
  }
  return [current, ""];
}
function getConfigImports(): ConfigImports {
  const CONFIG_FILE = "deno.json";
  const [project, text] = readFileTowardParent(p.resolve("."), CONFIG_FILE);
  if (!text) throw new Error(`cannot find ${CONFIG_FILE}`);
  const json = JSON.parse(text);
  if (!json["imports"]) throw new Error("no imports section");
  return { project, imports: json["imports"] };
}
function getPackageNames(imports: Record<string, string>): string[] {
  return Object.entries(imports).map(([key, value]) => {
    const platform = value.split(":")[0];
    return `${platform ?? "npm"}:${key}`;
  });
}
async function removePackages(packages: string[]) {
  for (const name of packages) {
    await $`deno remove ${name}`;
  }
}
async function addPackages(packages: string[]) {
  for (const name of packages) {
    await $`deno add ${name}`;
  }
}
async function reinstallPackages(project: string, packages: string[]) {
  remove(p.join(project, "deno.lock"));
  await removePackages(packages);
  remove(p.join(project, "node_modules"));
  await addPackages(packages);
}

try {
  const { project, imports } = getConfigImports();
  const packages = getPackageNames(imports);
  await reinstallPackages(project, packages);
} catch (e) {
  if (e instanceof Error) {
    console.log(`error: ${e.message}`);
  } else {
    throw e;
  }
}
