import { readdir } from "node:fs/promises"
import path from "node:path"

async function main(): Promise<void> {
  const endpointsDir = path.resolve(process.cwd(), "src/endpoints")
  const testsDir = path.resolve(process.cwd(), "src/tests/endpoints")

  const endpointEntries = await readdir(endpointsDir, { withFileTypes: true })

  const endpointNames = endpointEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => entry.name.replace(/\.ts$/, ""))
    .sort()

  const testEntries = new Set(await readdir(testsDir))

  const missing: string[] = []

  for (const endpointName of endpointNames) {
    const unitFile = `${endpointName}.unit.test.ts`
    const integrationFile = `${endpointName}.integration.test.ts`

    if (!testEntries.has(unitFile)) {
      missing.push(`missing unit test: src/tests/endpoints/${unitFile}`)
    }

    if (!testEntries.has(integrationFile)) {
      missing.push(`missing integration test: src/tests/endpoints/${integrationFile}`)
    }
  }

  if (missing.length > 0) {
    console.error("Endpoint test presence check failed:")
    for (const item of missing) {
      console.error(`  - ${item}`)
    }
    process.exit(1)
  }

  console.log("Endpoint test presence check passed.")
}

await main()
