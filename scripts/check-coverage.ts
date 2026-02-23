import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

type CoverageRecord = {
  functionsFound: number
  functionsHit: number
  branchesFound: number
  branchesHit: number
  linesFound: number
  linesHit: number
}

function normalizeSourcePath(sourcePath: string): string {
  const cwdPrefix = `${process.cwd()}${path.sep}`

  if (sourcePath.startsWith(cwdPrefix)) {
    return sourcePath.slice(cwdPrefix.length)
  }

  return sourcePath
}

function percent(hit: number, found: number): number {
  if (found === 0) {
    return 100
  }

  return (hit / found) * 100
}

async function getTopLevelEndpoints(): Promise<string[]> {
  const entries = await readdir(path.resolve(process.cwd(), "src/endpoints"), {
    withFileTypes: true,
  })

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => path.posix.join("src/endpoints", entry.name))
    .sort()
}

function parseLcov(lcovText: string): Map<string, CoverageRecord> {
  const map = new Map<string, CoverageRecord>()

  let currentPath: string | null = null
  let currentRecord: CoverageRecord | null = null

  const lines = lcovText.split(/\r?\n/)
  for (const line of lines) {
    if (line.startsWith("SF:")) {
      currentPath = normalizeSourcePath(line.slice(3).trim())
      currentRecord = {
        functionsFound: 0,
        functionsHit: 0,
        branchesFound: 0,
        branchesHit: 0,
        linesFound: 0,
        linesHit: 0,
      }
      continue
    }

    if (!currentRecord || !currentPath) {
      continue
    }

    if (line.startsWith("FNF:")) {
      currentRecord.functionsFound = Number(line.slice(4))
      continue
    }

    if (line.startsWith("FNH:")) {
      currentRecord.functionsHit = Number(line.slice(4))
      continue
    }

    if (line.startsWith("BRF:")) {
      currentRecord.branchesFound = Number(line.slice(4))
      continue
    }

    if (line.startsWith("BRH:")) {
      currentRecord.branchesHit = Number(line.slice(4))
      continue
    }

    if (line.startsWith("LF:")) {
      currentRecord.linesFound = Number(line.slice(3))
      continue
    }

    if (line.startsWith("LH:")) {
      currentRecord.linesHit = Number(line.slice(3))
      continue
    }

    if (line === "end_of_record") {
      map.set(currentPath, currentRecord)
      currentPath = null
      currentRecord = null
    }
  }

  return map
}

async function main(): Promise<void> {
  const lcovPath = path.resolve(process.cwd(), "coverage/lcov.info")
  const lcovText = await readFile(lcovPath, "utf8")

  const records = parseLcov(lcovText)

  const endpointTargets = await getTopLevelEndpoints()
  const targets = [
    ...endpointTargets,
    "src/api-client.ts",
    "src/utils/compose-search-parameters.ts",
  ]

  const failures: string[] = []

  for (const target of targets) {
    const record = records.get(target)

    if (!record) {
      failures.push(`${target}: missing coverage record`)
      continue
    }

    const lineCoverage = percent(record.linesHit, record.linesFound)
    const functionCoverage = percent(record.functionsHit, record.functionsFound)
    const branchCoverage = percent(record.branchesHit, record.branchesFound)
    const statementCoverage = lineCoverage

    if (lineCoverage < 100) {
      failures.push(`${target}: line coverage ${lineCoverage.toFixed(2)}% < 100%`)
    }

    if (functionCoverage < 100) {
      failures.push(`${target}: function coverage ${functionCoverage.toFixed(2)}% < 100%`)
    }

    if (branchCoverage < 100) {
      failures.push(`${target}: branch coverage ${branchCoverage.toFixed(2)}% < 100%`)
    }

    if (statementCoverage < 100) {
      failures.push(`${target}: statement coverage ${statementCoverage.toFixed(2)}% < 100%`)
    }
  }

  if (failures.length > 0) {
    console.error("Coverage gate failed:")
    for (const failure of failures) {
      console.error(`  - ${failure}`)
    }
    process.exit(1)
  }

  console.log("Coverage gate passed for all required files.")
}

await main()
