/**
 * find_references - Custom Tool for Roo-Code
 *
 * Find all references to a symbol at a specific position in a file.
 * This tool uses VSCode's reference provider to find all usages.
 *
 * Algorithm:
 * 1. Open the document via VSCode API
 * 2. Execute the reference provider at the given position
 * 3. Return all reference locations with optional truncation
 *
 * NOTE: Uses dynamic require for vscode to avoid esbuild resolution issues.
 * The vscode module is provided by VSCode extension host at runtime.
 */

import { parametersSchema as z, defineCustomTool } from "@roo-code/types"
import path from "path"

// Hardcoded limit to prevent context overflow
const DEFAULT_LIMIT = 100

// Dynamic require for vscode - this module is provided by VSCode at runtime.
// We use a computed require to prevent esbuild from trying to resolve/bundle it.
// The vscode module is special and only exists in VSCode extension host context.
const vscodeModule = "vscode"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vscode = require(vscodeModule) as typeof import("vscode")

// VSCode SymbolKind enum values for reference
// See: https://code.visualstudio.com/api/references/vscode-api#SymbolKind
const SYMBOL_KIND_MAP: Record<number, string> = {
	1: "file",
	2: "module",
	3: "namespace",
	4: "package",
	5: "class",
	6: "method",
	7: "property",
	8: "field",
	9: "constructor",
	10: "enum",
	11: "interface",
	12: "function",
	13: "variable",
	14: "constant",
	15: "string",
	16: "number",
	17: "boolean",
	18: "array",
	19: "object",
	20: "key",
	21: "null",
	22: "enum_member",
	23: "struct",
	24: "event",
	25: "operator",
	26: "type_parameter",
}

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

/**
 * Convert VSCode SymbolKind number to human-readable string
 */
function symbolKindToString(kind: number): string {
	return SYMBOL_KIND_MAP[kind] || "unknown"
}

/**
 * Convert VSCode Location to our format (1-based lines)
 */
function convertLocation(location: VscodeLocation): Location {
	return {
		uri: location.uri.fsPath,
		range: convertRange(location.range),
	}
}

/**
 * Convert VSCode Range to 1-based LSP range
 */
function convertRange(range: { start: { line: number; character: number }; end: { line: number; character: number } }): {
	start: { line: number; character: number }
	end: { line: number; character: number }
} {
	return {
		start: {
			line: range.start.line + 1,
			character: range.start.character + 1,
		},
		end: {
			line: range.end.line + 1,
			character: range.end.character + 1,
		},
	}
}

export default defineCustomTool({
	name: "find_references",
	description:
		"Find all references to a symbol at the specified position. Returns a list of locations where the symbol is used.",

	parameters: z.object({
		file_path: z.string().describe(
			"The path of the file to search for references in."
		),
		line: z.number().describe(
			"The line number where the symbol is located (0-based)."
		),
		character: z.number().describe(
			"The character position in the line (0-based)."
		),
		include_declaration: z.boolean().optional().describe(
			"Include the symbol's declaration in the results (default: true)."
		),
		limit: z.number().optional().describe(
			"Maximum number of results to return (default: 100)."
		),
	}),

	async execute({ file_path, line, character, include_declaration = true, limit }, context) {
		// Get workspace root from VSCode workspace folders
		const workspaceFolders = vscode.workspace.workspaceFolders
		const workspaceRoot = workspaceFolders && workspaceFolders.length > 0
			? workspaceFolders[0].uri.fsPath
			: process.cwd()

		// Resolve full file path
		const fullPath = path.isAbsolute(file_path)
			? file_path
			: path.join(workspaceRoot, file_path)

		// Convert to VSCode URI
		const uri = vscode.Uri.file(fullPath)

		try {
			// Open the document first to ensure it's loaded
			const document = await vscode.workspace.openTextDocument(uri)
			if (!document) {
				return `❌ Could not open file: ${file_path}`
			}

			// Create VSCode Position (0-based)
			const position = new vscode.Position(line, character)

			// Execute VSCode reference provider
			const result = await vscode.commands.executeCommand<
				VscodeLocation[] | undefined
			>("vscode.executeReferenceProvider", uri, position)

			if (!result || result.length === 0) {
				return `❌ No references found at line ${line + 1}, character ${character + 1} in ${file_path}`
			}

			// Convert all locations
			const allReferences = result.map(convertLocation)

			// Apply limit to prevent context overflow
			const effectiveLimit = limit ?? DEFAULT_LIMIT
			const truncated = allReferences.length > effectiveLimit
			const displayResults = truncated ? allReferences.slice(0, effectiveLimit) : allReferences

			// Build output
			const lines: string[] = []

			// Add truncation warning if applicable
			if (truncated) {
				lines.push(`⚠️ Warning: Output truncated. Showing ${effectiveLimit} of ${allReferences.length} results to prevent context overflow.`)
				lines.push("")
			}

			// Add summary
			const declarationNote = include_declaration ? " (including declaration)" : ""
			lines.push(`✅ Found ${allReferences.length} reference${allReferences.length > 1 ? "s" : ""}${declarationNote}:`)

			// Format each reference
			for (let i = 0; i < displayResults.length; i++) {
				const ref = displayResults[i]
				lines.push("")
				lines.push(`**Reference ${i + 1}:**`)
				lines.push(`  File: ${ref.uri}`)
				lines.push(
					`  Position: Line ${ref.range.start.line}, Character ${ref.range.start.character}`
				)

				if (
					ref.range.start.line !== ref.range.end.line ||
					ref.range.start.character !== ref.range.end.character
				) {
					lines.push(`  Range: Lines ${ref.range.start.line}-${ref.range.end.line}`)
				}
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Reference lookup failed: ${message}`
		}
	},
})
