/**
 * outgoing_calls - Custom Tool for Roo-Code
 *
 * Find all outgoing calls from a symbol at a specific position (call hierarchy).
 * This tool uses VSCode's call hierarchy outgoing calls provider.
 *
 * Algorithm:
 * 1. Open the document via VSCode API
 * 2. Prepare call hierarchy at the given position
 * 3. Get outgoing calls for the hierarchy item
 * 4. Return all call locations with optional truncation
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

interface CallHierarchyItem {
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

interface OutgoingCall {
	to: CallHierarchyItem
	fromRanges: Array<{
		start: { line: number; character: number }
		end: { line: number; character: number }
	}>
}

// Type for VSCode CallHierarchyItem
interface VscodeCallHierarchyItem {
	name: string
	kind: number
	uri: { fsPath: string }
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	selectionRange: { start: { line: number; character: number }; end: { line: number; character: number } }
}

// Type for VSCode CallHierarchyOutgoingCall
interface VscodeCallHierarchyOutgoingCall {
	to: VscodeCallHierarchyItem
	fromRanges: Array<{ start: { line: number; character: number }; end: { line: number; character: number } }>
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
 * Convert VSCode CallHierarchyItem to our format
 */
function convertCallHierarchyItem(item: VscodeCallHierarchyItem): CallHierarchyItem {
	return {
		name: item.name,
		kind: item.kind,
		kindName: symbolKindToString(item.kind),
		uri: item.uri.fsPath,
		range: convertRange(item.range),
		selectionRange: convertRange(item.selectionRange),
	}
}

/**
 * Convert VSCode CallHierarchyOutgoingCall to our format
 */
function convertOutgoingCall(call: VscodeCallHierarchyOutgoingCall): OutgoingCall {
	return {
		to: convertCallHierarchyItem(call.to),
		fromRanges: call.fromRanges.map(convertRange),
	}
}

export default defineCustomTool({
	name: "outgoing_calls",
	description:
		"Find all outgoing calls from the symbol at the specified position (call hierarchy). Shows which functions/methods this symbol calls.",

	parameters: z.object({
		file_path: z.string().describe(
			"The path of the file containing the symbol."
		),
		line: z.number().describe(
			"The line number where the symbol is located (0-based)."
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

			// Prepare call hierarchy first
			const hierarchyItems = await vscode.commands.executeCommand<
				VscodeCallHierarchyItem[] | undefined
			>("vscode.prepareCallHierarchy", uri, position)

			if (!hierarchyItems || hierarchyItems.length === 0) {
				return `❌ No call hierarchy found at line ${line + 1}, character ${character + 1} in ${file_path}. The symbol may not be a callable function or method.`
			}

			// Get outgoing calls for each hierarchy item
			const allOutgoingCalls: OutgoingCall[] = []

			for (const item of hierarchyItems) {
				const outgoingCalls = await vscode.commands.executeCommand<
					VscodeCallHierarchyOutgoingCall[] | undefined
				>("vscode.callHierarchyOutgoingCalls", item)

				if (outgoingCalls) {
					allOutgoingCalls.push(...outgoingCalls.map(convertOutgoingCall))
				}
			}

			if (allOutgoingCalls.length === 0) {
				return `❌ No outgoing calls found for the symbol at line ${line + 1}, character ${character + 1} in ${file_path}`
			}

			// Apply limit to prevent context overflow
			const effectiveLimit = limit ?? DEFAULT_LIMIT
			const truncated = allOutgoingCalls.length > effectiveLimit
			const displayResults = truncated ? allOutgoingCalls.slice(0, effectiveLimit) : allOutgoingCalls

			// Build output
			const lines: string[] = []

			// Add truncation warning if applicable
			if (truncated) {
				lines.push(`⚠️ Warning: Output truncated. Showing ${effectiveLimit} of ${allOutgoingCalls.length} results to prevent context overflow.`)
				lines.push("")
			}

			// Add summary
			lines.push(`✅ Found ${allOutgoingCalls.length} outgoing call${allOutgoingCalls.length > 1 ? "s" : ""}:`)

			// Format each outgoing call
			for (let i = 0; i < displayResults.length; i++) {
				const call = displayResults[i]
				lines.push("")
				lines.push(`**Outgoing Call ${i + 1}:**`)
				lines.push(`  To: ${call.to.name} (${call.to.kindName})`)
				lines.push(`  File: ${call.to.uri}`)
				lines.push(`  Position: Line ${call.to.selectionRange.start.line}, Character ${call.to.selectionRange.start.character}`)

				if (call.fromRanges.length > 0) {
					lines.push(`  Call sites:`)
					for (const range of call.fromRanges) {
						lines.push(`    - Line ${range.start.line}, Character ${range.start.character}`)
					}
				}
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Outgoing calls lookup failed: ${message}`
		}
	},
})
