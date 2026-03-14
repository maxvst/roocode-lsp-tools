/**
 * subtypes - Custom Tool for Roo-Code
 *
 * Find all subtypes of a type at a specific position (type hierarchy).
 * This tool uses VSCode's type hierarchy subtypes provider.
 *
 * Algorithm:
 * 1. Open the document via VSCode API
 * 2. Prepare type hierarchy at the given position
 * 3. Get subtypes for the hierarchy item
 * 4. Return all subtype locations with optional truncation
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

interface TypeHierarchyItem {
	name: string
	kind: number
	kindName: string
	uri: string
	range: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
	selectionRange: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
}

// Type for VSCode TypeHierarchyItem
interface VscodeTypeHierarchyItem {
	name: string
	kind: number
	uri: { fsPath: string }
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	selectionRange: { start: { line: number; character: number }; end: { line: number; character: number } }
}

/**
 * Convert VSCode SymbolKind number to human-readable string
 */
function symbolKindToString(kind: number): string {
	return SYMBOL_KIND_MAP[kind] || "unknown"
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

/**
 * Convert VSCode TypeHierarchyItem to our format
 */
function convertTypeHierarchyItem(item: VscodeTypeHierarchyItem): TypeHierarchyItem {
	return {
		name: item.name,
		kind: item.kind,
		kindName: symbolKindToString(item.kind),
		uri: item.uri.fsPath,
		range: convertRange(item.range),
		selectionRange: convertRange(item.selectionRange),
	}
}

export default defineCustomTool({
	name: "subtypes",
	description:
		"Find all subtypes of the type at the specified position (type hierarchy). Shows which types extend or implement this type.",

	parameters: z.object({
		file_path: z.string().describe(
			"The path of the file containing the type."
		),
		line: z.number().describe(
			"The line number where the type is located (0-based)."
		),
		character: z.number().describe(
			"The character position in the line (0-based)."
		),
		limit: z.number().optional().describe(
			"Maximum number of results to return (default: 100)."
		),
	}),

	async execute({ file_path, line, character, limit }, context) {
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

			// Prepare type hierarchy first
			const hierarchyItems = await vscode.commands.executeCommand<
				VscodeTypeHierarchyItem[] | undefined
			>("vscode.prepareTypeHierarchy", uri, position)

			if (!hierarchyItems || hierarchyItems.length === 0) {
				return `❌ No type hierarchy found at line ${line + 1}, character ${character + 1} in ${file_path}. The symbol may not be a class, interface, or type.`
			}

			// Get subtypes for each hierarchy item
			const allSubtypes: TypeHierarchyItem[] = []

			for (const item of hierarchyItems) {
				const subtypes = await vscode.commands.executeCommand<
					VscodeTypeHierarchyItem[] | undefined
				>("vscode.typeHierarchySubtypes", item)

				if (subtypes) {
					allSubtypes.push(...subtypes.map(convertTypeHierarchyItem))
				}
			}

			if (allSubtypes.length === 0) {
				return `❌ No subtypes found for the type at line ${line + 1}, character ${character + 1} in ${file_path}`
			}

			// Apply limit to prevent context overflow
			const effectiveLimit = limit ?? DEFAULT_LIMIT
			const truncated = allSubtypes.length > effectiveLimit
			const displayResults = truncated ? allSubtypes.slice(0, effectiveLimit) : allSubtypes

			// Build output
			const lines: string[] = []

			// Add truncation warning if applicable
			if (truncated) {
				lines.push(`⚠️ Warning: Output truncated. Showing ${effectiveLimit} of ${allSubtypes.length} results to prevent context overflow.`)
				lines.push("")
			}

			// Add summary
			lines.push(`✅ Found ${allSubtypes.length} subtype${allSubtypes.length > 1 ? "s" : ""}:`)

			// Format each subtype
			for (let i = 0; i < displayResults.length; i++) {
				const subtype = displayResults[i]
				lines.push("")
				lines.push(`**Subtype ${i + 1}:**`)
				lines.push(`  Name: ${subtype.name} (${subtype.kindName})`)
				lines.push(`  File: ${subtype.uri}`)
				lines.push(`  Position: Line ${subtype.selectionRange.start.line}, Character ${subtype.selectionRange.start.character}`)

				if (
					subtype.range.start.line !== subtype.range.end.line ||
					subtype.range.start.character !== subtype.range.end.character
				) {
					lines.push(`  Range: Lines ${subtype.range.start.line}-${subtype.range.end.line}`)
				}
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Subtypes lookup failed: ${message}`
		}
	},
})
