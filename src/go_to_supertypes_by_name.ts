/**
 * go_to_supertypes_by_name - Custom Tool for Roo-Code
 *
 * Find the supertypes (parent types) of a symbol by its name in a file.
 * Uses VSCode's built-in document symbol provider and type hierarchy provider.
 *
 * This tool solves the "LLM hallucination" problem by allowing the AI
 * to specify a symbol name instead of exact coordinates.
 *
 * NOTE: Uses dynamic require for vscode to avoid esbuild resolution issues.
 * The vscode module is provided by VSCode extension host at runtime.
 */

import { parametersSchema as z, defineCustomTool } from "@roo-code/types"
import path from "path"
import { readFileSync } from "fs"

// Dynamic require for vscode - this module is provided by VSCode at runtime.
// We use a computed require to prevent esbuild from trying to resolve/bundle it.
// The vscode module is special and only exists in VSCode extension host context.
const vscodeModule = "vscode"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vscode = require(vscodeModule) as typeof import("vscode")

// ============================================================================
// INTERFACES
// ============================================================================

interface Location {
	uri: string
	range: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
}

interface SymbolMatch {
	name: string
	kind: SymbolKind
	position: { line: number; character: number }
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	detail?: string
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
	parents?: VscodeTypeHierarchyItem[]  // Supertypes
	children?: VscodeTypeHierarchyItem[] // Subtypes
}

// ============================================================================
// SYMBOL KIND ENUM (adapted from cclsp)
// ============================================================================

/**
 * SymbolKind enum matching LSP and VSCode values
 * @see https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#symbolKind
 */
enum SymbolKind {
	File = 1,
	Module = 2,
	Namespace = 3,
	Package = 4,
	Class = 5,
	Method = 6,
	Property = 7,
	Field = 8,
	Constructor = 9,
	Enum = 10,
	Interface = 11,
	Function = 12,
	Variable = 13,
	Constant = 14,
	String = 15,
	Number = 16,
	Boolean = 17,
	Array = 18,
	Object = 19,
	Key = 20,
	Null = 21,
	EnumMember = 22,
	Struct = 23,
	Event = 24,
	Operator = 25,
	TypeParameter = 26,
}

// ============================================================================
// HELPER FUNCTIONS (adapted from cclsp)
// ============================================================================

/**
 * Convert SymbolKind number to human-readable string
 */
function symbolKindToString(kind: SymbolKind): string {
	const kindMap: Record<SymbolKind, string> = {
		[SymbolKind.File]: "file",
		[SymbolKind.Module]: "module",
		[SymbolKind.Namespace]: "namespace",
		[SymbolKind.Package]: "package",
		[SymbolKind.Class]: "class",
		[SymbolKind.Method]: "method",
		[SymbolKind.Property]: "property",
		[SymbolKind.Field]: "field",
		[SymbolKind.Constructor]: "constructor",
		[SymbolKind.Enum]: "enum",
		[SymbolKind.Interface]: "interface",
		[SymbolKind.Function]: "function",
		[SymbolKind.Variable]: "variable",
		[SymbolKind.Constant]: "constant",
		[SymbolKind.String]: "string",
		[SymbolKind.Number]: "number",
		[SymbolKind.Boolean]: "boolean",
		[SymbolKind.Array]: "array",
		[SymbolKind.Object]: "object",
		[SymbolKind.Key]: "key",
		[SymbolKind.Null]: "null",
		[SymbolKind.EnumMember]: "enum_member",
		[SymbolKind.Struct]: "struct",
		[SymbolKind.Event]: "event",
		[SymbolKind.Operator]: "operator",
		[SymbolKind.TypeParameter]: "type_parameter",
	}
	return kindMap[kind] || "unknown"
}

/**
 * Convert human-readable string to SymbolKind number
 */
function stringToSymbolKind(kindStr: string): SymbolKind | null {
	const kindMap: Record<string, SymbolKind> = {
		file: SymbolKind.File,
		module: SymbolKind.Module,
		namespace: SymbolKind.Namespace,
		package: SymbolKind.Package,
		class: SymbolKind.Class,
		method: SymbolKind.Method,
		property: SymbolKind.Property,
		field: SymbolKind.Field,
		constructor: SymbolKind.Constructor,
		enum: SymbolKind.Enum,
		interface: SymbolKind.Interface,
		function: SymbolKind.Function,
		variable: SymbolKind.Variable,
		constant: SymbolKind.Constant,
		string: SymbolKind.String,
		number: SymbolKind.Number,
		boolean: SymbolKind.Boolean,
		array: SymbolKind.Array,
		object: SymbolKind.Object,
		key: SymbolKind.Key,
		null: SymbolKind.Null,
		enum_member: SymbolKind.EnumMember,
		struct: SymbolKind.Struct,
		event: SymbolKind.Event,
		operator: SymbolKind.Operator,
		type_parameter: SymbolKind.TypeParameter,
	}
	return kindMap[kindStr.toLowerCase()] || null
}

/**
 * Get list of valid symbol kinds for error messages
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
 * Flatten hierarchical DocumentSymbol[] to a flat array
 * This recursively extracts all nested symbols
 */
function flattenDocumentSymbols(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
	const flattened: vscode.DocumentSymbol[] = []
	for (const symbol of symbols) {
		flattened.push(symbol)
		if (symbol.children && symbol.children.length > 0) {
			flattened.push(...flattenDocumentSymbols(symbol.children))
		}
	}
	return flattened
}

/**
 * Find the exact position of a symbol name within its range
 * This is needed for SymbolInformation which only provides the range,
 * not the exact position of the symbol name
 */
function findSymbolPositionInFile(
	filePath: string,
	symbolName: string,
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
): { line: number; character: number } {
	try {
		const fileContent = readFileSync(filePath, "utf-8")
		const lines = fileContent.split("\n")

		const startLine = range.start.line
		const endLine = range.end.line

		for (let lineNum = startLine; lineNum <= endLine && lineNum < lines.length; lineNum++) {
			const line = lines[lineNum]
			if (!line) continue

			let searchStart = 0
			if (lineNum === startLine) {
				searchStart = range.start.character
			}

			let searchEnd = line.length
			if (lineNum === endLine) {
				searchEnd = range.end.character
			}

			const searchText = line.substring(searchStart, searchEnd)
			const symbolIndex = searchText.indexOf(symbolName)

			if (symbolIndex !== -1) {
				const actualCharacter = searchStart + symbolIndex
				return { line: lineNum, character: actualCharacter }
			}
		}

		// Fallback to range start if not found
		return range.start
	} catch {
		// Fallback to range start on error
		return range.start
	}
}

/**
 * Check if the symbols array is DocumentSymbol[] (hierarchical) or SymbolInformation[] (flat)
 */
function isDocumentSymbolArray(
	symbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[]
): symbols is vscode.DocumentSymbol[] {
	if (symbols.length === 0) return true
	const firstSymbol = symbols[0]
	if (!firstSymbol) return true
	// DocumentSymbol has 'range' and 'selectionRange' properties
	// SymbolInformation has 'location' property
	return "range" in firstSymbol && "selectionRange" in firstSymbol
}

/**
 * Find all occurrences of a symbol name in a document's text
 * This approach finds both defined and imported/used symbols
 * Returns array of positions where the symbol name appears
 */
function findSymbolOccurrencesInText(
	filePath: string,
	symbolName: string
): { line: number; character: number }[] {
	const positions: { line: number; character: number }[] = []

	try {
		const fileContent = readFileSync(filePath, "utf-8")
		const lines = fileContent.split("\n")

		// Create a regex to match the symbol as a word boundary
		// This helps avoid partial matches like "myFunc" matching "myFunction"
		const symbolRegex = new RegExp(`\\b${escapeRegExp(symbolName)}\\b`, "g")

		for (let lineNum = 0; lineNum < lines.length; lineNum++) {
			const line = lines[lineNum]
			if (!line) continue

			let match: RegExpExecArray | null
			while ((match = symbolRegex.exec(line)) !== null) {
				positions.push({
					line: lineNum,
					character: match.index,
				})
			}
		}
	} catch {
		// Return empty array on error
	}

	return positions
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Find symbols by name in a document
 * For Type Hierarchy, we ONLY use document symbols (definitions)
 * because prepareTypeHierarchy only works on symbol definitions, not usages
 * Returns array of SymbolMatch with positions
 */
async function findSymbolsByName(
	uri: vscode.Uri,
	filePath: string,
	symbolName: string,
	symbolKind?: string
): Promise<{ matches: SymbolMatch[]; warning?: string }> {
	let validationWarning: string | undefined
	let effectiveSymbolKind = symbolKind

	// Validate symbol_kind if provided
	if (symbolKind && stringToSymbolKind(symbolKind) === null) {
		const validKinds = getValidSymbolKinds()
		validationWarning = `⚠️ Invalid symbol kind "${symbolKind}". Valid kinds are: ${validKinds.join(", ")}. Searching all symbol types instead.`
		effectiveSymbolKind = undefined
	}

	const matches: SymbolMatch[] = []

	// For Type Hierarchy, we ONLY use document symbols (definitions)
	// prepareTypeHierarchy only works on symbol definitions, not usages
	const symbols = await vscode.commands.executeCommand<
		vscode.DocumentSymbol[] | vscode.SymbolInformation[]
	>("vscode.executeDocumentSymbolProvider", uri)

	if (symbols && symbols.length > 0) {
		if (isDocumentSymbolArray(symbols)) {
			// Hierarchical format (DocumentSymbol[])
			const flatSymbols = flattenDocumentSymbols(symbols)

			for (const symbol of flatSymbols) {
				const nameMatches = symbol.name === symbolName
				const kindMatches =
					!effectiveSymbolKind ||
					symbolKindToString(symbol.kind as unknown as SymbolKind) === effectiveSymbolKind.toLowerCase()

				if (nameMatches && kindMatches) {
					const pos = {
						line: symbol.selectionRange.start.line,
						character: symbol.selectionRange.start.character,
					}
					
					matches.push({
						name: symbol.name,
						kind: symbol.kind as unknown as SymbolKind,
						position: pos,
						range: {
							start: {
								line: symbol.range.start.line,
								character: symbol.range.start.character,
							},
							end: {
								line: symbol.range.end.line,
								character: symbol.range.end.character,
							},
						},
						detail: symbol.detail,
					})
				}
			}
		} else {
			// Flat format (SymbolInformation[])
			for (const symbol of symbols) {
				const nameMatches = symbol.name === symbolName
				const kindMatches =
					!effectiveSymbolKind ||
					symbolKindToString(symbol.kind as unknown as SymbolKind) === effectiveSymbolKind.toLowerCase()

				if (nameMatches && kindMatches) {
					const range = {
						start: {
							line: symbol.location.range.start.line,
							character: symbol.location.range.start.character,
						},
						end: {
							line: symbol.location.range.end.line,
							character: symbol.location.range.end.character,
						},
					}

					const position = findSymbolPositionInFile(filePath, symbol.name, range)

					matches.push({
						name: symbol.name,
						kind: symbol.kind as unknown as SymbolKind,
						position: position,
						range: range,
						detail: undefined,
					})
				}
			}
		}
	}

	// Filter by kind if specified
	if (effectiveSymbolKind && matches.length > 0) {
		const kindFiltered = matches.filter(
			(m) => symbolKindToString(m.kind) === effectiveSymbolKind.toLowerCase()
		)

		if (kindFiltered.length === 0) {
			// Fallback: use all matches but add warning
			const foundKinds = [...new Set(matches.map((m) => symbolKindToString(m.kind)))]
			const fallbackWarning = `⚠️ No symbols found with kind "${effectiveSymbolKind}". Found ${matches.length} symbol(s) with name "${symbolName}" of other kinds: ${foundKinds.join(", ")}.`
			return { matches, warning: [validationWarning, fallbackWarning].filter(Boolean).join(" ") }
		}

		return { matches: kindFiltered, warning: validationWarning }
	}

	return { matches, warning: validationWarning }
}

/**
 * Type guard for TypeHierarchyItem array
 */
function isTypeHierarchyItemArray(result: unknown): result is VscodeTypeHierarchyItem[] {
	return Array.isArray(result) && result.every(item => 
		item !== null &&
		typeof item === "object" &&
		"name" in item &&
		"kind" in item &&
		"uri" in item &&
		"range" in item
	)
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

/**
 * Convert VSCode Range to 1-based LSP range
 */
function convertRange(range: {
	start: { line: number; character: number }
	end: { line: number; character: number }
}): {
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

// ============================================================================
// MAIN TOOL DEFINITION
// ============================================================================

export default defineCustomTool({
	name: "go_to_supertypes_by_name",
	description:
		"Find the supertypes (parent types) of a symbol by its name in a file. " +
		"Returns the location(s) where the parent types (base classes, implemented interfaces) are defined. " +
		"Use this to navigate to the source of a class's base class or an interface's parent interface. " +
		"This is more reliable than go_to_supertypes as it doesn't require exact line/character coordinates.",

	parameters: z.object({
		file_path: z.string().describe("Path to the file relative to workspace root"),
		symbol_name: z.string().describe("Name of the symbol to find supertypes for"),
		symbol_kind: z.string().optional().describe(
			"Optional kind of symbol to filter by: class, interface, etc."
		),
	}),

	async execute({ file_path, symbol_name, symbol_kind }, context) {
		// Get workspace root from VSCode workspace folders
		const workspaceFolders = vscode.workspace.workspaceFolders
		const workspaceRoot =
			workspaceFolders && workspaceFolders.length > 0
				? workspaceFolders[0].uri.fsPath
				: process.cwd()

		// Resolve full file path
		const fullPath = path.isAbsolute(file_path) ? file_path : path.join(workspaceRoot, file_path)

		// Convert to VSCode URI
		const uri = vscode.Uri.file(fullPath)

		try {
			// Open the document first to ensure it's loaded
			const document = await vscode.workspace.openTextDocument(uri)
			if (!document) {
				return `❌ Could not open file: ${file_path}`
			}

			// Find symbols by name
			const { matches: symbolMatches, warning } = await findSymbolsByName(
				uri,
				fullPath,
				symbol_name,
				symbol_kind
			)

			if (symbolMatches.length === 0) {
				const kindInfo = symbol_kind ? ` and kind "${symbol_kind}"` : ""
				return (
					warning ||
					`No symbols found with name "${symbol_name}"${kindInfo} in ${file_path}. ` +
						"Please verify the symbol name and ensure the LSP server is running for this file type."
				)
			}

			// Collect all supertypes from all matching symbols
			const allResults: Array<{
				symbol: SymbolMatch
				supertypes: Array<{ location: Location; item: VscodeTypeHierarchyItem }>
			}> = []

			for (const match of symbolMatches) {
				// Convert 0-based position to VSCode Position
				const position = new vscode.Position(match.position.line, match.position.character)

				// Step 1: Prepare Type Hierarchy - get TypeHierarchyItem for the symbol
				// This is the CORRECT VS Code API approach (two-step process)
				const preparedItems = await vscode.commands.executeCommand<
					VscodeTypeHierarchyItem[] | undefined
				>("vscode.prepareTypeHierarchy", uri, position)

				const supertypes: Array<{ location: Location; item: VscodeTypeHierarchyItem }> = []

				if (preparedItems && preparedItems.length > 0) {
					// Step 2: Get supertypes for the prepared TypeHierarchyItem
					// Use the first prepared item (usually there's only one)
					const firstItem = preparedItems[0]
					
					const result = await vscode.commands.executeCommand<
						VscodeTypeHierarchyItem[] | undefined
					>("vscode.provideSupertypes", firstItem)

					if (result && Array.isArray(result)) {
						for (const item of result) {
							supertypes.push({
								location: convertTypeHierarchyItemToLocation(item),
								item: item,
							})
						}
					}
				}

				allResults.push({ symbol: match, supertypes })
			}

			// Flatten all supertypes
			const allSupertypes: Array<{ location: Location; item: VscodeTypeHierarchyItem; symbol: SymbolMatch }> = []
			for (const { symbol, supertypes } of allResults) {
				for (const { location, item } of supertypes) {
					allSupertypes.push({ location, item, symbol })
				}
			}

			if (allSupertypes.length === 0) {
				return (
					warning ||
					`Found ${symbolMatches.length} symbol(s) but no supertypes could be retrieved. ` +
						"The symbol may not have any supertypes (primitive type, class without inheritance), " +
						"or the LSP server may not support type hierarchy for this symbol type."
				)
			}

			// Format result
			const lines: string[] = []

			if (warning) {
				lines.push(warning)
				lines.push("")
			}

			lines.push(
				`✅ Found ${allSupertypes.length} supertype${allSupertypes.length > 1 ? "s" : ""} for symbol "${symbol_name}":`
			)

			for (let i = 0; i < allSupertypes.length; i++) {
				const { location, item, symbol } = allSupertypes[i]
				lines.push("")
				lines.push(`**Supertype ${i + 1}:**`)
				lines.push(`  Symbol: ${symbol.name} (${symbolKindToString(symbol.kind)})`)
				lines.push(`  Source: ${file_path}:${symbol.position.line + 1}:${symbol.position.character + 1}`)
				lines.push(`  Supertype Name: ${item.name}`)
				lines.push(`  Supertype File: ${location.uri}`)
				lines.push(
					`  Supertype Position: Line ${location.range.start.line}, Character ${location.range.start.character}`
				)

				if (
					location.range.start.line !== location.range.end.line ||
					location.range.start.character !== location.range.end.character
				) {
					lines.push(`  Range: Lines ${location.range.start.line}-${location.range.end.line}`)
				}
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Supertypes lookup failed: ${message}`
		}
	},
})
