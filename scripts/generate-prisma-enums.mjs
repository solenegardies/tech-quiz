/**
 * Auto-generates TypeScript enums from Prisma schema DMMF.
 * Run: node scripts/generate-prisma-enums.mjs
 * Outputs to: packages/shared/src/enums/prismaEnums.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read the Prisma DMMF from the generated client
async function main() {
  let dmmf;
  try {
    const { Prisma } = await import(
      join(rootDir, "apps/server/node_modules/.prisma/client/index.js")
    );
    dmmf = Prisma.dmmf;
  } catch {
    console.warn("⚠ Could not load Prisma DMMF. Using schema file fallback.");
    dmmf = parseSchemaFallback();
  }

  const enums = dmmf.datamodel.enums;

  if (enums.length === 0) {
    console.log("No enums found in Prisma schema.");
    return;
  }

  let output = `// AUTO-GENERATED from Prisma schema — DO NOT EDIT\n`;
  output += `// Run \`pnpm prisma:generate\` to regenerate\n\n`;

  for (const enumDef of enums) {
    const name = enumDef.name;
    const values = enumDef.values.map((v) => v.name);
    const valuesStr = values.map((v) => `${v}: "${v}"`).join(", ");
    const valuesArrayStr = values.map((v) => `"${v}"`).join(", ");

    output += `export const ${name} = { ${valuesStr} } as const;\n`;
    output += `export type ${name} = (typeof ${name})[keyof typeof ${name}];\n`;
    output += `export const ${name}Values = [${valuesArrayStr}] as const;\n\n`;
  }

  const outputPath = join(rootDir, "packages/shared/src/enums/prismaEnums.ts");
  writeFileSync(outputPath, output.trimEnd() + "\n");
  console.log(`✓ Generated ${enums.length} enum(s) → ${outputPath}`);
}

function parseSchemaFallback() {
  const schemaPath = join(rootDir, "apps/server/prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf-8");
  const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g;
  const enums = [];

  let match;
  while ((match = enumRegex.exec(schema)) !== null) {
    const name = match[1];
    const body = match[2];
    const values = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//"))
      .map((line) => ({ name: line }));
    enums.push({ name, values });
  }

  return { datamodel: { enums } };
}

main().catch(console.error);
