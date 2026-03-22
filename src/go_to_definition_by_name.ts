/**
 * go_to_definition_by_name - Custom Tool for Roo-Code
 *
 * Navigate to the definition of a symbol by its name in a file.
 * Uses VSCode's built-in document symbol provider and definition provider.
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
import type * as vscodeTypes from "vscode"

// Dynamic require for vscode - this module is provided by VSCode at runtime.
// We use a computed require to prevent esbuild from trying to resolve/bundle it.
// The vscode module is special and only exists in VSCode extension host context.
const vscodeModule = "vscode"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vscode = require(vscodeModule) as typeof vscodeTypes

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

// Type for VSCode Location
interface VscodeLocation {
	uri: { fsPath: string }
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
}

// Type for VSCode LocationLink
interface VscodeLocationLink {
	targetUri: { fsPath: string }
	targetRange: { start: { line: number; character: number }; end: { line: number; character: number } }
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
function flattenDocumentSymbols(symbols: vscodeTypes.DocumentSymbol[]): vscodeTypes.DocumentSymbol[] {
	const flattened: vscodeTypes.DocumentSymbol[] = []
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
	symbols: vscodeTypes.DocumentSymbol[] | vscodeTypes.SymbolInformation[]
): symbols is vscodeTypes.DocumentSymbol[] {
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
 * Uses two strategies:
 * 1. Search for symbol occurrences in the file text (finds imported/used symbols)
 * 2. Search in document symbols (finds defined symbols)
 * Returns array of SymbolMatch with positions
 */
async function findSymbolsByName(
	uri: vscodeTypes.Uri,
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

	// Strategy 1: Find symbol occurrences in file text
	// This finds both imported symbols and locally defined ones
	const textOccurrences = findSymbolOccurrencesInText(filePath, symbolName)

	for (const pos of textOccurrences) {
		matches.push({
			name: symbolName,
			kind: SymbolKind.Variable, // Default kind, will be determined by LSP
			position: pos,
			range: {
				start: pos,
				end: { line: pos.line, character: pos.character + symbolName.length },
			},
			detail: undefined,
		})
	}

	// Strategy 2: Also check document symbols for definitions
	// This provides better kind information for locally defined symbols
	const symbols = await vscode.commands.executeCommand<
		vscodeTypes.DocumentSymbol[] | vscodeTypes.SymbolInformation[]
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
					// Check if this position is already in our matches
					const pos = {
						line: symbol.selectionRange.start.line,
						character: symbol.selectionRange.start.character,
					}
					const exists = matches.some(
						(m) => m.position.line === pos.line && m.position.character === pos.character
					)

					if (!exists) {
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
					} else {
						// Update kind for existing match
						const existingMatch = matches.find(
							(m) => m.position.line === pos.line && m.position.character === pos.character
						)
						if (existingMatch) {
							existingMatch.kind = symbol.kind as unknown as SymbolKind
						}
					}
				}
			}
		} else {
			// Flat format (SymbolInformation[])
			for (const symbol of symbols as vscodeTypes.SymbolInformation[]) {
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

					// Check if this position is already in our matches
					const exists = matches.some(
						(m) =>
							m.position.line === position.line && m.position.character === position.character
					)

					if (!exists) {
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

// ============================================================================
// MAIN TOOL DEFINITION
// ============================================================================

export default defineCustomTool({
	name: "go_to_definition_by_name",
	description:
		"Find the definition of a symbol by its name in a file. " +
		"Returns the location(s) where the symbol is defined. " +
		"Use this to navigate to the source of a function, class, variable, or other symbol by name. " +
		"This is more reliable than go_to_definition as it doesn't require exact line/character coordinates.",

	parameters: z.object({
		file_path: z.string().describe("Path to the file relative to workspace root"),
		symbol_name: z.string().describe("Name of the symbol to find definition for"),
		symbol_kind: z
			.string()
			.optional()
			.describe(
				"Optional kind of symbol to filter by: function, class, variable, method, property, interface, enum, constant, etc."
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

			// Collect all definitions from all matching symbols
			const allLocations: Array<{ location: Location; symbolInfo: SymbolMatch }> = []

			for (const match of symbolMatches) {
				// Convert 0-based position to VSCode Position
				const position = new vscode.Position(match.position.line, match.position.character)

				// Execute VSCode definition provider
				const result = await vscode.commands.executeCommand<
					VscodeLocation | VscodeLocation[] | VscodeLocationLink[] | undefined
				>("vscode.executeDefinitionProvider", uri, position)

				if (!result) continue

				// Convert result to locations
				const isSingleLocation = (r: unknown): r is VscodeLocation =>
					!!r && typeof r === "object" && "uri" in r && !Array.isArray(r)

				const isLocationLink = (r: unknown): r is VscodeLocationLink =>
					!!r && typeof r === "object" && "targetUri" in r

				if (isSingleLocation(result)) {
					allLocations.push({
						location: convertLocation(result),
						symbolInfo: match,
					})
				} else if (Array.isArray(result)) {
					for (const item of result) {
						if (isSingleLocation(item)) {
							allLocations.push({
								location: convertLocation(item),
								symbolInfo: match,
							})
						} else if (isLocationLink(item)) {
							allLocations.push({
								location: {
									uri: item.targetUri.fsPath,
									range: convertRange(item.targetRange),
								},
								symbolInfo: match,
							})
						}
					}
				}
			}

			if (allLocations.length === 0) {
				return (
					warning ||
					`Found ${symbolMatches.length} symbol(s) but no definitions could be retrieved. ` +
						"The symbol may be built-in, or no LSP server is running for this file type."
				)
			}

			// Format result
			const lines: string[] = []

			if (warning) {
				lines.push(warning)
				lines.push("")
			}

			lines.push(
				`✅ Found ${allLocations.length} definition${allLocations.length > 1 ? "s" : ""} for symbol "${symbol_name}":`
			)

			for (let i = 0; i < allLocations.length; i++) {
				const { location, symbolInfo } = allLocations[i]
				lines.push("")
				lines.push(`**Definition ${i + 1}:**`)
				lines.push(`  Symbol: ${symbolInfo.name} (${symbolKindToString(symbolInfo.kind)})`)
				lines.push(`  Source: ${file_path}:${symbolInfo.position.line + 1}:${symbolInfo.position.character + 1}`)
				lines.push(`  Definition File: ${location.uri}`)
				lines.push(
					`  Definition Position: Line ${location.range.start.line}, Character ${location.range.start.character}`
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
			return `❌ Definition lookup failed: ${message}`
		}
	},
})

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
