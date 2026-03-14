/**
 * go_to_supertypes_by_name - Custom Tool for Roo-Code
 *
 * Find the supertypes of a symbol by its name without requiring exact coordinates.
 * This tool abstracts the LLM from needing to know precise symbol positions.
 *
 * Algorithm:
 * 1. Get all symbols in the file via VSCode API (executeDocumentSymbolProvider)
 * 2. Find symbol(s) matching the given name (and kind if specified)
 * 3. Extract the exact position from the symbol's selectionRange
 * 4. Execute the type hierarchy supertypes provider request
 * 5. Map TypeHierarchyItem[] to Location[] format
 * 6. Return the supertype location(s)
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

// Reverse map for string to SymbolKind
const STRING_TO_SYMBOL_KIND: Record<string, number> = Object.fromEntries(
	Object.entries(SYMBOL_KIND_MAP).map(([k, v]) => [v.toLowerCase(), parseInt(k)])
)

interface Location {
	uri: string
	range: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
}

interface SymbolMatch {
	name: string
	kind: number
	kindName: string
	position: { line: number; character: number }
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	containerName?: string
}

// Type for VSCode DocumentSymbol (hierarchical)
interface VscodeDocumentSymbol {
	name: string
	detail: string
	kind: number
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	selectionRange: { start: { line: number; character: number }; end: { line: number; character: number } }
	children: VscodeDocumentSymbol[]
}

// Type for VSCode SymbolInformation (flat)
interface VscodeSymbolInformation {
	name: string
	kind: number
	containerName?: string
	location: {
		uri: { fsPath: string }
		range: { start: { line: number; character: number }; end: { line: number; character: number } }
	}
}

// Type for VSCode TypeHierarchyItem
// See: https://code.visualstudio.com/api/references/vscode-api#TypeHierarchyItem
interface VscodeTypeHierarchyItem {
	name: string
	kind: number
	uri: { fsPath: string }
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	selectionRange: { start: { line: number; character: number }; end: { line: number; character: number } }
	detail?: string
}

/**
 * Convert VSCode SymbolKind number to human-readable string
 */
function symbolKindToString(kind: number): string {
	return SYMBOL_KIND_MAP[kind] || "unknown"
}

/**
 * Convert human-readable string to VSCode SymbolKind number
 */
function stringToSymbolKind(kindStr: string): number | null {
	return STRING_TO_SYMBOL_KIND[kindStr.toLowerCase()] ?? null
}

/**
 * Get list of valid symbol kind strings
 */
function getValidSymbolKinds(): string[] {
	return [
		"file", "module", "namespace", "package", "class", "method", "property",
		"field", "constructor", "enum", "interface", "function", "variable",
		"constant", "string", "number", "boolean", "array", "object", "key",
		"null", "enum_member", "struct", "event", "operator", "type_parameter",
	]
}

/**
 * Flatten hierarchical DocumentSymbol array to a flat list
 */
function flattenDocumentSymbols(symbols: VscodeDocumentSymbol[]): VscodeDocumentSymbol[] {
	const result: VscodeDocumentSymbol[] = []
	for (const symbol of symbols) {
		result.push(symbol)
		if (symbol.children && symbol.children.length > 0) {
			result.push(...flattenDocumentSymbols(symbol.children))
		}
	}
	return result
}

/**
 * Check if the result is DocumentSymbol[] (hierarchical format)
 */
function isDocumentSymbolArray(
	symbols: (VscodeDocumentSymbol | VscodeSymbolInformation)[]
): symbols is VscodeDocumentSymbol[] {
	if (symbols.length === 0) return true
	const first = symbols[0]
	return first !== undefined && "range" in first && "selectionRange" in first && "children" in first
}

/**
 * Find symbols by name in a document symbol array
 */
function findSymbolsByName(
	symbols: (VscodeDocumentSymbol | VscodeSymbolInformation)[],
	symbolName: string,
	symbolKind?: string
): SymbolMatch[] {
	const matches: SymbolMatch[] = []
	const targetKind = symbolKind ? stringToSymbolKind(symbolKind) : null

	if (isDocumentSymbolArray(symbols)) {
		// Hierarchical format (DocumentSymbol[])
		const flatSymbols = flattenDocumentSymbols(symbols)
		for (const symbol of flatSymbols) {
			const nameMatches = symbol.name === symbolName || symbol.name.includes(symbolName)
			const kindMatches = targetKind === null || symbol.kind === targetKind

			if (nameMatches && kindMatches) {
				matches.push({
					name: symbol.name,
					kind: symbol.kind,
					kindName: symbolKindToString(symbol.kind),
					position: {
						line: symbol.selectionRange.start.line,
						character: symbol.selectionRange.start.character,
					},
					range: {
						start: symbol.selectionRange.start,
						end: symbol.selectionRange.end,
					},
				})
			}
		}
	} else {
		// Flat format (SymbolInformation[])
		for (const symbol of symbols) {
			const nameMatches = symbol.name === symbolName || symbol.name.includes(symbolName)
			const kindMatches = targetKind === null || symbol.kind === targetKind

			if (nameMatches && kindMatches) {
				matches.push({
					name: symbol.name,
					kind: symbol.kind,
					kindName: symbolKindToString(symbol.kind),
					position: {
						line: symbol.location.range.start.line,
						character: symbol.location.range.start.character,
					},
					range: {
						start: symbol.location.range.start,
						end: symbol.location.range.end,
					},
					containerName: symbol.containerName,
				})
			}
		}
	}

	return matches
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
 * Convert VSCode TypeHierarchyItem to Location format
 */
function convertTypeHierarchyItemToLocation(item: VscodeTypeHierarchyItem): Location {
	return {
		uri: item.uri.fsPath,
		range: convertRange(item.range),
	}
}

export default defineCustomTool({
	name: "go_to_supertypes_by_name",
	description:
		"Find symbol supertypes by name without coordinates. Returns supertype location(s)",

	parameters: z.object({
		file_path: z.string().describe(
			"Path (relative or absolute) to the file where the symbol is referenced or used. "
		),
		symbol_name: z.string().describe(
			"Symbol name (exact preferred)"
		),
		symbol_kind: z.string().optional().describe(
			"Optional type of symbol: " +
			"function, class, method, variable, interface, enum, " +
			"constant, property, field, constructor, struct, namespace, module"
		),
	}),

	async execute({ file_path, symbol_name, symbol_kind }, context) {
		// Validate symbol_kind if provided
		if (symbol_kind && stringToSymbolKind(symbol_kind) === null) {
			const validKinds = getValidSymbolKinds()
			return `❌ Invalid symbol kind "${symbol_kind}". Valid kinds are: ${validKinds.join(", ")}`
		}

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

			// Step 1: Get all symbols in the document
			const symbols = await vscode.commands.executeCommand<
				(VscodeDocumentSymbol | VscodeSymbolInformation)[] | undefined
			>("vscode.executeDocumentSymbolProvider", uri)

			if (!symbols || symbols.length === 0) {
				return (
					`❌ No symbols found in file: ${file_path}. ` +
					"This may indicate that no LSP server is running for this file type, " +
					"or the file is empty."
				)
			}

			// Step 2: Find symbols matching the name (and kind if specified)
			let matches = findSymbolsByName(symbols, symbol_name, symbol_kind)

			// If no matches with specified kind, try fallback without kind filter
			let fallbackWarning = ""
			if (matches.length === 0 && symbol_kind) {
				const fallbackMatches = findSymbolsByName(symbols, symbol_name)
				if (fallbackMatches.length > 0) {
					const foundKinds = [...new Set(fallbackMatches.map(m => m.kindName))]
					fallbackWarning = `⚠️ No symbols found with kind "${symbol_kind}". Found ${fallbackMatches.length} symbol(s) with name "${symbol_name}" of other kinds: ${foundKinds.join(", ")}.`
					matches = fallbackMatches
				}
			}

			if (matches.length === 0) {
				return (
					`❌ No symbol found with name "${symbol_name}"` +
					(symbol_kind ? ` and kind "${symbol_kind}"` : "") +
					` in ${file_path}. ` +
					"Please verify the symbol name and ensure it exists in the file."
				)
			}

			// Step 3 & 4: For each matching symbol, get its supertypes
			const allResults: Array<{
				symbol: SymbolMatch
				locations: Location[]
				typeNames: string[]
			}> = []

			for (const match of matches) {
				// Convert to VSCode Position (0-based)
				const position = new vscode.Position(
					match.position.line,
					match.position.character
				)

				// Execute VSCode type hierarchy supertypes provider
				const result = await vscode.commands.executeCommand<
					VscodeTypeHierarchyItem[] | undefined
				>("vscode.executeTypeHierarchySupertypes", uri, position)

				const locations: Location[] = []
				const typeNames: string[] = []

				if (result && Array.isArray(result)) {
					for (const item of result) {
						locations.push(convertTypeHierarchyItemToLocation(item))
						typeNames.push(item.name)
					}
				}

				allResults.push({ symbol: match, locations, typeNames })
			}

			// Step 5: Format and return results
			const lines: string[] = []

			// Add fallback warning if applicable
			if (fallbackWarning) {
				lines.push(fallbackWarning)
				lines.push("")
			}

			// Handle case where multiple symbols with same name were found
			if (matches.length > 1) {
				lines.push(`ℹ️ Found ${matches.length} symbol(s) with name "${symbol_name}":`)
				for (let i = 0; i < matches.length; i++) {
					const m = matches[i]
					lines.push(
						`  ${i + 1}. ${m.name} (${m.kindName})` +
						(m.containerName ? ` in ${m.containerName}` : "") +
						` at line ${m.position.line + 1}`
					)
				}
				lines.push("")
			}

			// Collect all supertypes
			const allSupertypes: Location[] = []
			const allTypeNames: string[] = []
			for (const { symbol, locations, typeNames } of allResults) {
				if (locations.length > 0) {
					allSupertypes.push(...locations)
					allTypeNames.push(...typeNames)
				}
			}

			if (allSupertypes.length === 0) {
				return (
					`❌ Found ${matches.length} symbol(s) named "${symbol_name}" but no supertypes could be retrieved. ` +
					"The symbol may not have any supertypes, may be a primitive type, " +
					"or the LSP server may not support type hierarchy for this symbol type."
				)
			}

			// Format output
			lines.push(`✅ Found ${allSupertypes.length} supertype${allSupertypes.length > 1 ? "s" : ""}:`)

			// Show unique type names summary
			const uniqueTypeNames = [...new Set(allTypeNames)]
			if (uniqueTypeNames.length > 0) {
				lines.push(`   Types: ${uniqueTypeNames.join(", ")}`)
			}

			for (let i = 0; i < allSupertypes.length; i++) {
				const loc = allSupertypes[i]
				const typeName = allTypeNames[i]
				lines.push("")
				lines.push(`**Supertype ${i + 1}:${typeName ? ` (${typeName})` : ""}**`)
				lines.push(`  File: ${loc.uri}`)
				lines.push(
					`  Position: Line ${loc.range.start.line}, Character ${loc.range.start.character}`
				)

				if (
					loc.range.start.line !== loc.range.end.line ||
					loc.range.start.character !== loc.range.end.character
				) {
					lines.push(`  Range: Lines ${loc.range.start.line}-${loc.range.end.line}`)
				}
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Supertypes lookup failed: ${message}`
		}
	},
})
