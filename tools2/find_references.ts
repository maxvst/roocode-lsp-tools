/**
 * find_references - Custom Tool for Roo-Code
 *
 * Find all references to a symbol by name in a file.
 * Uses VSCode's built-in reference provider with symbol name resolution.
 *
 * NOTE: Uses dynamic require for vscode to avoid esbuild resolution issues.
 * The vscode module is provided by VSCode extension host at runtime.
 */

import { parametersSchema as z, defineCustomTool } from "@roo-code/types"
import { resolveSymbolPosition, getValidSymbolKinds } from './symbol-position'

// Dynamic require for vscode - this module is provided by VSCode at runtime.
// We use a computed require to prevent esbuild from trying to resolve/bundle it.
// The vscode module is special and only exists in VSCode extension host context.
const vscodeModule = "vscode"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vscode = require(vscodeModule) as typeof import("vscode")

interface Location {
	uri: string
	range: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
}

// Type for VSCode Location
interface VscodeLocation {
	uri: { fsPath: string }
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
}

export default defineCustomTool({
	name: "find_references",
	description:
		"Find all references to a symbol by name. " +
		"Uses symbol name to locate the exact position, eliminating the need for precise column coordinates. " +
		"Returns a list of locations where the symbol is referenced across the codebase.",

	parameters: z.object({
		file_path: z.string().describe("Absolute path to the file"),
		symbol_name: z.string().describe("Name of the symbol to find references for"),
		symbol_kind: z.enum(getValidSymbolKinds() as [string, ...string[]]).optional()
			.describe("Optional symbol kind filter (e.g., \"class\", \"function\", \"method\")"),
		line: z.number().optional()
			.describe("Optional line number (0-based). If provided with character, bypasses symbol search"),
		character: z.number().optional()
			.describe("Optional character offset (0-based). Required if line is provided"),
		include_declaration: z.boolean().optional().default(true)
			.describe("Whether to include the symbol declaration in the results"),
		limit: z.number().optional().default(100)
			.describe("Maximum number of references to return"),
	}),

	async execute({ file_path, symbol_name, symbol_kind, line, character, include_declaration, limit }, context) {
		// Validation: if line is provided, character must also be provided
		if (line !== undefined && character === undefined) {
			return "❌ Error: character parameter is required when line is provided"
		}

		try {
			// Use resolveSymbolPosition to determine the position
			const result = await resolveSymbolPosition({
				filePath: file_path,
				symbolName: symbol_name,
				symbolKind: symbol_kind,
				line,
				character,
			})

			if (!result) {
				return `❌ Symbol "${symbol_name}" not found in ${file_path}`
			}

			const { position, uri } = result

			// Convert to VSCode URI and Position
			const vscodeUri = vscode.Uri.file(uri)
			const vscodePosition = new vscode.Position(position.line, position.character)

			// Execute VSCode reference provider
			const references = await vscode.commands.executeCommand<VscodeLocation[] | undefined>(
				"vscode.executeReferenceProvider",
				vscodeUri,
				vscodePosition
			)

			if (!references || references.length === 0) {
				return `No references found for symbol "${symbol_name}"`
			}

			// Convert result to locations
			const locations: Location[] = references.map((loc) => ({
				uri: loc.uri.fsPath,
				range: {
					start: {
						line: loc.range.start.line + 1,
						character: loc.range.start.character + 1,
					},
					end: {
						line: loc.range.end.line + 1,
						character: loc.range.end.character + 1,
					},
				},
			}))

			// Filter declaration if needed
			let filteredReferences = locations
			if (!include_declaration) {
				const declarationRange = new vscode.Range(
					vscodePosition,
					vscodePosition
				)
				filteredReferences = locations.filter((loc) => {
					const locUri = vscode.Uri.file(loc.uri)
					const locRange = new vscode.Range(
						new vscode.Position(loc.range.start.line - 1, loc.range.start.character - 1),
						new vscode.Position(loc.range.end.line - 1, loc.range.end.character - 1)
					)
					return locUri.toString() !== vscodeUri.toString() || !locRange.contains(declarationRange)
				})
			}

			// Apply limit
			const effectiveLimit = limit ?? 100
			const limitedReferences = filteredReferences.slice(0, effectiveLimit)

			// Group references by file
			const byFile = new Map<string, Location[]>()
			for (const loc of limitedReferences) {
				const existing = byFile.get(loc.uri) || []
				existing.push(loc)
				byFile.set(loc.uri, existing)
			}

			// Format result
			const lines: string[] = [
				`✅ Found ${filteredReferences.length} reference${filteredReferences.length !== 1 ? "s" : ""} ` +
					`(showing ${limitedReferences.length}) in ${byFile.size} file${byFile.size !== 1 ? "s" : ""}:`,
			]

			let refNum = 1
			for (const [file, fileLocations] of byFile) {
				lines.push("")
				lines.push(
					`**${file}** (${fileLocations.length} reference${fileLocations.length !== 1 ? "s" : ""})`
				)

				for (const loc of fileLocations) {
					lines.push(
						`  ${refNum}. Line ${loc.range.start.line}, Character ${loc.range.start.character}`
					)
					refNum++
				}
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Reference lookup failed: ${message}`
		}
	},
})
