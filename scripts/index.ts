import { readdir } from "node:fs/promises"
import path from "node:path"
import { Project, SyntaxKind, type EnumDeclaration } from "ts-morph"

type CliOptions = {
  rootDir: string
  write: boolean
}

type EnumTransformError = {
  enumName: string
  reason: string
}

type FileTransformResult = {
  filePath: string
  converted: number
  skipped: EnumTransformError[]
}

type EnumMemberData = {
  valueText: string
  leadingComments: string[]
  trailingComments: string[]
}

type EnumDeclarationData = {
  declarationComments: string[]
  members: EnumMemberData[]
}

const DEFAULT_IGNORED_DIRS = new Set([".git", "node_modules", "dist", "build", ".next", "coverage"])

function parseArgs(argv: string[]): CliOptions {
  const write = argv.includes("--write")
  const rootArg = argv.find((arg) => !arg.startsWith("--"))
  const rootDir = path.resolve(process.cwd(), rootArg ?? ".")

  return { rootDir, write }
}

async function collectTsFiles(rootDir: string): Promise<string[]> {
  const out: string[] = []

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (DEFAULT_IGNORED_DIRS.has(entry.name)) {
          continue
        }

        await walk(path.join(currentDir, entry.name))
        continue
      }

      if (!entry.isFile()) {
        continue
      }

      if (!entry.name.endsWith(".ts") || entry.name.endsWith(".d.ts")) {
        continue
      }

      out.push(path.join(currentDir, entry.name))
    }
  }

  await walk(rootDir)

  return out
}

function collectEnumData(enumDecl: EnumDeclaration): EnumDeclarationData | { reason: string } {
  const members = enumDecl.getMembers()

  if (members.length === 0) {
    return { reason: "empty enum" }
  }

  const memberData: EnumMemberData[] = []

  for (const member of members) {
    const initializer = member.getInitializer()

    if (initializer == null) {
      return { reason: `member without initializer: ${member.getName()}` }
    }

    const kind = initializer.getKind()
    if (kind !== SyntaxKind.StringLiteral && kind !== SyntaxKind.NoSubstitutionTemplateLiteral) {
      return { reason: `non-string initializer in member ${member.getName()}` }
    }

    memberData.push({
      valueText: initializer.getText(),
      leadingComments: member.getLeadingCommentRanges().map((range) => range.getText()),
      trailingComments: member.getTrailingCommentRanges().map((range) => range.getText()),
    })
  }

  const declarationComments = enumDecl.getJsDocs().map((doc) => doc.getText())

  return {
    declarationComments,
    members: memberData,
  }
}

function emitCommentBlock(comment: string, writer: { write: (text: string) => void; newLine: () => void }): void {
  writer.write(comment)
  writer.newLine()
}

function transformEnum(enumDecl: EnumDeclaration): { converted: true } | { converted: false; reason: string } {
  if (enumDecl.hasDefaultKeyword()) {
    return { converted: false, reason: "default export enum is not supported" }
  }

  const enumData = collectEnumData(enumDecl)
  if ("reason" in enumData) {
    return { converted: false, reason: enumData.reason }
  }

  const isExported = enumDecl.isExported()
  const hasDeclare = enumDecl.hasDeclareKeyword()
  const enumName = enumDecl.getName()

  enumDecl.replaceWithText((writer) => {
    for (const declarationComment of enumData.declarationComments) {
      emitCommentBlock(declarationComment, writer)
    }

    if (isExported) {
      writer.write("export ")
    }

    if (hasDeclare) {
      writer.write("declare ")
    }

    writer.write(`type ${enumName} =`)
    writer.newLine()

    writer.indent(() => {
      for (const member of enumData.members) {
        for (const leadingComment of member.leadingComments) {
          emitCommentBlock(leadingComment, writer)
        }

        writer.write(`| ${member.valueText}`)

        if (member.trailingComments.length > 0) {
          writer.write(` ${member.trailingComments.join(" ")}`)
        }

        writer.newLine()
      }
    })
  })

  return { converted: true }
}

function transformSourceFile(filePath: string, project: Project): FileTransformResult {
  const sourceFile = project.getSourceFile(filePath)
  if (sourceFile == null) {
    return {
      filePath,
      converted: 0,
      skipped: [{ enumName: "<file>", reason: "failed to load source file" }],
    }
  }

  const enums = sourceFile.getDescendantsOfKind(SyntaxKind.EnumDeclaration)

  const result: FileTransformResult = {
    filePath,
    converted: 0,
    skipped: [],
  }

  for (const enumDecl of enums) {
    const enumName = enumDecl.getName()
    const transformResult = transformEnum(enumDecl)

    if (!transformResult.converted) {
      result.skipped.push({ enumName, reason: transformResult.reason })
      continue
    }

    result.converted += 1
  }

  return result
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const tsFiles = await collectTsFiles(options.rootDir)

  if (tsFiles.length === 0) {
    console.log(`No .ts files found under ${options.rootDir}`)
    return
  }

  const project = new Project({
    skipFileDependencyResolution: true,
  })

  project.addSourceFilesAtPaths(tsFiles)

  let totalConverted = 0
  let totalSkipped = 0

  for (const filePath of tsFiles) {
    const result = transformSourceFile(filePath, project)

    totalConverted += result.converted
    totalSkipped += result.skipped.length

    if (result.converted > 0 || result.skipped.length > 0) {
      const relativePath = path.relative(process.cwd(), filePath)
      console.log(`\\n${relativePath}`)

      if (result.converted > 0) {
        console.log(`  converted: ${result.converted}`)
      }

      for (const skipped of result.skipped) {
        console.log(`  skipped ${skipped.enumName}: ${skipped.reason}`)
      }
    }
  }

  if (options.write && totalConverted > 0) {
    await project.save()
  }

  console.log("\\nDone")
  console.log(`  root: ${options.rootDir}`)
  console.log(`  mode: ${options.write ? "write" : "dry-run (use --write to apply)"}`)
  console.log(`  converted enums: ${totalConverted}`)
  console.log(`  skipped enums: ${totalSkipped}`)
}

await main()
