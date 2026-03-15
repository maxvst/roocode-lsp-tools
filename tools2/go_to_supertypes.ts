/**
 * go_to_supertypes - Custom Tool for Roo-Code
 *
 * Navigate to the supertypes of a symbol at a given position in a file.
 * Uses VSCode's built-in type hierarchy provider.
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

// Type for VSCode TypeHierarchyItem
interface VscodeTypeHierarchyItem {
	name: string
	kind: number
	tags?: readonly number[]
	detail?: string
	uri: { fsPath: string }
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	selectionRange: { start: { line: number; character: number }; end: { line: number; character: number } }
}

// Type guard for TypeHierarchyItem array
function isTypeHierarchyItemArray(result: unknown): result is VscodeTypeHierarchyItem[] {
	if (!Array.isArray(result)) return false
	return result.every(
		(item) =>
			!!item &&
			typeof item === "object" &&
			"name" in item &&
			"kind" in item &&
			"uri" in item &&
			"range" in item &&
			"selectionRange" in item
	)
}

// SymbolKind to string mapping
function symbolKindToString(kind: number): string {
	const kindNames: Record<number, string> = {
		0: "File",
		1: "Module",
		2: "Namespace",
		3: "Package",
		4: "Class",
		5: "Method",
		6: "Property",
		7: "Field",
		8: "Constructor",
		9: "Enum",
		10: "Interface",
		11: "Function",
		12: "Variable",
		13: "Constant",
		14: "String",
		15: "Number",
		16: "Boolean",
		17: "Array",
		18: "Object",
		19: "Key",
		20: "Null",
		21: "EnumMember",
		22: "Struct",
		23: "Event",
		24: "Operator",
		25: "TypeParameter",
	}
	return kindNames[kind] || "Unknown"
}

export default defineCustomTool({
	name: "go_to_supertypes",
	description:
		"Find all supertypes (base classes, interfaces) of a symbol by name. " +
		"Uses symbol name to locate the exact position, eliminating the need for precise column coordinates. " +
		"Returns the inheritance hierarchy for the specified type.",

	parameters: z.object({
		file_path: z.string().describe("Absolute path to the file"),
		symbol_name: z.string().describe("Name of the symbol to find supertypes for"),
		symbol_kind: z.enum(getValidSymbolKinds() as [string, ...string[]]).optional()
			.describe("Optional symbol kind filter (e.g., \"class\", \"interface\")"),
		line: z.number().optional()
			.describe("Optional line number (0-based). If provided with character, bypasses symbol search"),
		character: z.number().optional()
			.describe("Optional character offset (0-based). Required if line is provided"),
		limit: z.number().optional().default(50)
			.describe("Maximum number of supertypes to return"),
	}),

	async execute({ file_path, symbol_name, symbol_kind, line, character, limit }, context) {
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

			// Execute VSCode type hierarchy supertypes provider
			// Note: This command returns TypeHierarchyItem[] or undefined
			const supertypes = await vscode.commands.executeCommand<unknown>(
				"vscode.executeTypeHierarchySupertypesProvider",
				vscodeUri,
				vscodePosition
			)

			if (!supertypes) {
				return (
					`No supertypes found for symbol "${symbol_name}". ` +
					"The type may not have any supertypes, or no LSP server is running for this file type."
				)
			}

			// Validate result is TypeHierarchyItem array
			if (!isTypeHierarchyItemArray(supertypes)) {
				return (
					`No supertypes found for symbol "${symbol_name}". ` +
					"The type may not have any supertypes, or no LSP server is running for this file type."
				)
			}

			if (supertypes.length === 0) {
				return (
					`No supertypes found for symbol "${symbol_name}". ` +
					"The type may not have any supertypes, or no LSP server is running for this file type."
				)
			}

			// Apply limit
			const effectiveLimit = limit ?? 50
			const limitedSupertypes = supertypes.slice(0, effectiveLimit)

			// Format result
			const lines: string[] = [
				`✅ Found ${supertypes.length} supertype${supertypes.length > 1 ? "s" : ""} for "${symbol_name}" (showing ${limitedSupertypes.length}):`
			]

			for (let i = 0; i < limitedSupertypes.length; i++) {
				const item = limitedSupertypes[i]
				const kindStr = symbolKindToString(item.kind)
				const startLine = item.selectionRange.start.line + 1
				const startChar = item.selectionRange.start.character + 1

				lines.push("")
				lines.push(`**Supertype ${i + 1}:**`)
				lines.push(`  Name: ${item.name}`)
				lines.push(`  Kind: ${kindStr}`)
				if (item.detail) {
					lines.push(`  Detail: ${item.detail}`)
				}
				lines.push(`  Location: ${item.uri.fsPath}:${startLine}:${startChar}`)
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Go to supertypes failed: ${message}`
		}
	},
})
