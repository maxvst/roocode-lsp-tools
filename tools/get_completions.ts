/**
 * get_completions - Custom Tool for Roo-Code
 *
 * Get code completion suggestions at a given position in a file.
 * Uses VSCode's built-in completion provider.
 *
 * NOTE: Uses dynamic require for vscode to avoid esbuild resolution issues.
 * The vscode module is provided by VSCode extension host at runtime.
 */

import { parametersSchema as z, defineCustomTool } from "@roo-code/types"
import path from "path"

// Dynamic require for vscode - this module is provided by VSCode at runtime.
// We use a computed require to prevent esbuild from trying to resolve/bundle it.
// The vscode module is special and only exists in VSCode extension host context.
const vscodeModule = "vscode"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vscode = require(vscodeModule) as typeof import("vscode")

interface CompletionItem {
	label: string
	kind?: number
	detail?: string
	documentation?: string
	insertText?: string
	deprecated: boolean
	sortText?: string
}

interface CompletionResult {
	isIncomplete: boolean
	items: CompletionItem[]
}

// Type for VSCode CompletionItem
interface VscodeCompletionItem {
	label: string | { label: string }
	kind?: number
	detail?: string
	documentation?: string | { value: string }
	insertText?: string | { value: string }
	tags?: number[]
	sortText?: string
}

// Type for VSCode CompletionList
interface VscodeCompletionList {
	items: VscodeCompletionItem[]
	isIncomplete: boolean
}

/**
 * Completion item kind names (matches VSCode's CompletionItemKind)
 */
const CompletionItemKindNames: Record<number, string> = {
	0: "Text",
	1: "Method",
	2: "Function",
	3: "Constructor",
	4: "Field",
	5: "Variable",
	6: "Class",
	7: "Interface",
	8: "Module",
	9: "Property",
	10: "Unit",
	11: "Value",
	12: "Enum",
	13: "Keyword",
	14: "Snippet",
	15: "Color",
	16: "File",
	17: "Reference",
	18: "Folder",
	19: "EnumMember",
	20: "Constant",
	21: "Struct",
	22: "Event",
	23: "Operator",
	24: "TypeParameter",
	25: "User",
	26: "Issue",
}

// VSCode CompletionItemTag.Deprecated = 1
const CompletionItemTagDeprecated = 1

export default defineCustomTool({
	name: "get_completions",
	description:
		"Get code completion suggestions at the specified position. " +
		"Returns a list of autocomplete items with their types and documentation. " +
		"Use this to discover available methods, properties, and variables in context.",

	parameters: z.object({
		file_path: z.string().describe("Path to the file relative to workspace root"),
		line: z.number().describe("1-based line number where completions are requested"),
		character: z.number().describe("1-based character position (column) on the line"),
		trigger_character: z.string().optional().describe("Optional trigger character that initiated the completion (e.g., '.' for member access)"),
	}),

	async execute({ file_path, line, character, trigger_character }, context) {
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

		// Convert 1-based position to 0-based for VSCode
		const position = new vscode.Position(
			Math.max(0, line - 1),
			Math.max(0, character - 1)
		)

		try {
			// Open the document first to ensure it's loaded
			const document = await vscode.workspace.openTextDocument(uri)
			if (!document) {
				return `❌ Could not open file: ${file_path}`
			}

			// Execute VSCode completion provider
			const result = await vscode.commands.executeCommand<
				VscodeCompletionList | VscodeCompletionItem[] | undefined
			>("vscode.executeCompletionItemProvider", uri, position, trigger_character)

			if (!result) {
				return (
					"No completion suggestions available at the specified position. " +
					"The position may not have any completions, or no LSP server is running for this file type."
				)
			}

			// Convert result
			const completionResult = convertCompletionResult(result)

			if (completionResult.items.length === 0) {
				return (
					"No completion suggestions available at the specified position. " +
					"The position may not have any completions, or no LSP server is running for this file type."
				)
			}

			// Format result
			const lines: string[] = [
				`✅ Found ${completionResult.items.length} completion suggestion${completionResult.items.length > 1 ? "s" : ""}:`,
			]

			if (completionResult.isIncomplete) {
				lines.push("*Note: This is a partial list. More completions may be available.*")
			}

			lines.push("")

			// Group by kind
			const byKind = new Map<string, CompletionItem[]>()
			for (const item of completionResult.items) {
				const kindName = item.kind
					? CompletionItemKindNames[item.kind] || "Unknown"
					: "Other"
				const existing = byKind.get(kindName) || []
				existing.push(item)
				byKind.set(kindName, existing)
			}

			// Display grouped
			for (const [kind, items] of byKind) {
				lines.push(`**${kind}** (${items.length})`)

				for (const item of items.slice(0, 10)) {
					// Limit to 10 per group
					let line = `  - \`${item.label}\``

					if (item.detail) {
						line += ` - ${item.detail}`
					}

					if (item.deprecated) {
						line += " ⚠️ *deprecated*"
					}

					lines.push(line)

					if (item.documentation) {
						const doc = item.documentation.split("\n")[0].substring(0, 100)
						lines.push(`    > ${doc}${doc.length >= 100 ? "..." : ""}`)
					}
				}

				if (items.length > 10) {
					lines.push(`  - ... and ${items.length - 10} more`)
				}

				lines.push("")
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Completion lookup failed: ${message}`
		}
	},
})

/**
 * Convert VSCode completion result to our format
 */
function convertCompletionResult(
	result: VscodeCompletionList | VscodeCompletionItem[]
): CompletionResult {
	const items = Array.isArray(result) ? result : result.items
	const isIncomplete = !Array.isArray(result) && result.isIncomplete

	const convertedItems: CompletionItem[] = items.map((item) => ({
		label:
			typeof item.label === "string" ? item.label : item.label.label,
		kind: item.kind,
		detail: item.detail,
		documentation: extractDocumentation(item.documentation),
		insertText:
			typeof item.insertText === "string"
				? item.insertText
				: item.insertText?.value,
		deprecated: item.tags?.includes(CompletionItemTagDeprecated) ?? false,
		sortText: item.sortText,
	}))

	return {
		isIncomplete: isIncomplete ?? false,
		items: convertedItems,
	}
}

/**
 * Extract documentation from VSCode documentation type
 */
function extractDocumentation(
	documentation: string | { value: string } | undefined
): string | undefined {
	if (!documentation) {
		return undefined
	}

	if (typeof documentation === "string") {
		return documentation
	}

	return documentation.value
}
