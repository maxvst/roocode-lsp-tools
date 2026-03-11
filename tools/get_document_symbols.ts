/**
 * get_document_symbols - Custom Tool for Roo-Code
 *
 * Get all symbols (classes, functions, variables) defined in a document.
 * Uses VSCode's built-in document symbol provider.
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

interface Location {
	uri: string
	range: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
}

interface SymbolInformation {
	name: string
	kind: number
	location: Location
	containerName?: string
	children?: SymbolInformation[]
}

// Type for VSCode DocumentSymbol
interface VscodeDocumentSymbol {
	name: string
	kind: number
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	children: VscodeDocumentSymbol[]
}

// Type for VSCode SymbolInformation
interface VscodeSymbolInformation {
	name: string
	kind: number
	location: { uri: { fsPath: string }; range: { start: { line: number; character: number }; end: { line: number; character: number } } }
	containerName?: string
}

// Type for VSCode Uri
interface VscodeUri {
	fsPath: string
}

/**
 * Symbol kind names (matches VSCode's SymbolKind)
 */
const SymbolKindNames: Record<number, string> = {
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

export default defineCustomTool({
	name: "get_document_symbols",
	description:
		"Get the symbol tree of a document (classes, functions, variables, etc.). " +
		"Returns a hierarchical list of all symbols defined in the document. " +
		"Use this to quickly understand the structure of a file without reading it entirely.",

	parameters: z.object({
		file_path: z.string().describe("Path to the file relative to workspace root"),
	}),

	async execute({ file_path }, context) {
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

			// Execute VSCode document symbol provider
			const result = await vscode.commands.executeCommand<
				VscodeSymbolInformation[] | VscodeDocumentSymbol[] | undefined
			>("vscode.executeDocumentSymbolProvider", uri)

			if (!result || result.length === 0) {
				return (
					"No symbols found in the document. " +
					"The file may be empty, or no LSP server is running for this file type."
				)
			}

			// Convert result
			const symbols = isDocumentSymbolArray(result)
				? result.map((sym) => convertDocumentSymbol(sym, uri))
				: result.map((sym) => convertSymbolInformation(sym))

			// Count total symbols including children
			const totalCount = countSymbols(symbols)

			// Format result
			const lines: string[] = [
				`✅ Found ${totalCount} symbol${totalCount > 1 ? "s" : ""} in document:`,
			]
			lines.push("")

			// Format symbol tree
			formatSymbolTree(symbols, lines, 0)

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Document symbol lookup failed: ${message}`
		}
	},
})

/**
 * Type guard for DocumentSymbol array
 */
function isDocumentSymbolArray(
	result: VscodeSymbolInformation[] | VscodeDocumentSymbol[]
): result is VscodeDocumentSymbol[] {
	return result.length > 0 && "children" in result[0]
}

/**
 * Convert VSCode DocumentSymbol to our format
 */
function convertDocumentSymbol(
	symbol: VscodeDocumentSymbol,
	uri: VscodeUri
): SymbolInformation {
	const location: Location = {
		uri: uri.fsPath,
		range: {
			start: {
				line: symbol.range.start.line + 1,
				character: symbol.range.start.character + 1,
			},
			end: {
				line: symbol.range.end.line + 1,
				character: symbol.range.end.character + 1,
			},
		},
	}

	return {
		name: symbol.name,
		kind: symbol.kind as number,
		location,
		children:
			symbol.children.length > 0
				? symbol.children.map((child) => convertDocumentSymbol(child, uri))
				: undefined,
	}
}

/**
 * Convert VSCode SymbolInformation to our format
 */
function convertSymbolInformation(
	symbol: VscodeSymbolInformation
): SymbolInformation {
	return {
		name: symbol.name,
		kind: symbol.kind as number,
		location: {
			uri: symbol.location.uri.fsPath,
			range: {
				start: {
					line: symbol.location.range.start.line + 1,
					character: symbol.location.range.start.character + 1,
				},
				end: {
					line: symbol.location.range.end.line + 1,
					character: symbol.location.range.end.character + 1,
				},
			},
		},
		containerName: symbol.containerName,
	}
}

/**
 * Count total symbols including children
 */
function countSymbols(symbols: SymbolInformation[]): number {
	let count = symbols.length
	for (const symbol of symbols) {
		if (symbol.children) {
			count += countSymbols(symbol.children)
		}
	}
	return count
}

/**
 * Recursively format symbol tree
 */
function formatSymbolTree(
	symbols: SymbolInformation[],
	lines: string[],
	depth: number
): void {
	const indent = "  ".repeat(depth)
	const prefix = depth === 0 ? "-" : "•"

	for (const symbol of symbols) {
		const kindName = SymbolKindNames[symbol.kind] || "Unknown"
		const location = symbol.location.range

		let line = `${indent}${prefix} **${symbol.name}** `
		line += `(${kindName}) `
		line += `[Line ${location.start.line}]`

		if (symbol.containerName) {
			line += ` in \`${symbol.containerName}\``
		}

		lines.push(line)

		// Recursively format children
		if (symbol.children && symbol.children.length > 0) {
			formatSymbolTree(symbol.children, lines, depth + 1)
		}
	}
}
