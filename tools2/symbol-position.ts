/**
 * symbol-position.ts - Symbol Positioning Utilities for Roo-Code
 *
 * This module provides utilities for resolving symbol positions in source files.
 * It implements a two-stage positioning strategy:
 * 1. Use exact coordinates if provided (line/character)
 * 2. Otherwise, use VSCode's DocumentSymbol provider with heuristic scanning
 *
 * Ported from cclsp/src/lsp/operations.ts for use in roo-lsp-tools.
 *
 * NOTE: Uses dynamic require for vscode to avoid esbuild resolution issues.
 * The vscode module is provided by VSCode extension host at runtime.
 */

import * as path from "path"

// Dynamic require for vscode - this module is provided by VSCode at runtime.
// We use a computed require to prevent esbuild from trying to resolve/bundle it.
// The vscode module is special and only exists in VSCode extension host context.
const vscodeModule = "vscode"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vscode = require(vscodeModule) as typeof import("vscode")

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Parameters for resolving a symbol's position
 */
export interface ResolveSymbolPositionParams {
	/** Absolute or relative path to the file */
	filePath: string
	/** Name of the symbol to find */
	symbolName: string
	/** Optional symbol kind as string (e.g., 'class', 'function', 'method') */
	symbolKind?: string
	/** Optional 0-based line number (if provided with character, skips symbol search) */
	line?: number
	/** Optional 0-based character position (if provided with line, skips symbol search) */
	character?: number
}

/**
 * Result of symbol position resolution
 */
export interface ResolvedSymbolPosition {
	/** The resolved position in the document (0-based line and character) */
	position: { line: number; character: number }
	/** The file path of the document containing the symbol */
	uri: string
}

// Internal type for VSCode DocumentSymbol
interface VscodeDocumentSymbol {
	name: string
	detail: string
	kind: number // vscode.SymbolKind is a number enum
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	selectionRange: { start: { line: number; character: number }; end: { line: number; character: number } }
	children: VscodeDocumentSymbol[]
}

// Internal type for VSCode TextDocument
interface VscodeTextDocument {
	uri: { fsPath: string }
	lineCount: number
	lineAt(line: number): { text: string; range: { start: { line: number; character: number }; end: { line: number; character: number } } }
	getText(): string
}

// ============================================================================
// Symbol Kind Mapping
// ============================================================================

/**
 * Mapping from string representation to VSCode SymbolKind enum values.
 * Covers all standard LSP symbol kinds.
 */
const SYMBOL_KIND_MAP: Record<string, number> = {
	file: 0,           // vscode.SymbolKind.File
	module: 1,         // vscode.SymbolKind.Module
	namespace: 2,      // vscode.SymbolKind.Namespace
	package: 3,        // vscode.SymbolKind.Package
	class: 4,          // vscode.SymbolKind.Class
	method: 5,         // vscode.SymbolKind.Method
	property: 6,       // vscode.SymbolKind.Property
	field: 7,          // vscode.SymbolKind.Field
	constructor: 8,    // vscode.SymbolKind.Constructor
	enum: 9,           // vscode.SymbolKind.Enum
	interface: 10,     // vscode.SymbolKind.Interface
	function: 11,      // vscode.SymbolKind.Function
	variable: 12,      // vscode.SymbolKind.Variable
	constant: 13,      // vscode.SymbolKind.Constant
	string: 14,        // vscode.SymbolKind.String
	number: 15,        // vscode.SymbolKind.Number
	boolean: 16,       // vscode.SymbolKind.Boolean
	array: 17,         // vscode.SymbolKind.Array
	object: 18,        // vscode.SymbolKind.Object
	key: 19,           // vscode.SymbolKind.Key
	null: 20,          // vscode.SymbolKind.Null
	enum_member: 21,   // vscode.SymbolKind.EnumMember
	struct: 22,        // vscode.SymbolKind.Struct
	event: 23,         // vscode.SymbolKind.Event
	operator: 24,      // vscode.SymbolKind.Operator
	type_parameter: 25, // vscode.SymbolKind.TypeParameter
}

/**
 * Converts a string representation of a symbol kind to VSCode SymbolKind enum value.
 *
 * @param kind - String representation (e.g., 'class', 'function', 'method')
 *               Case-insensitive, supports both 'enum_member' and 'enumMember' formats
 * @returns The corresponding SymbolKind numeric value, or undefined if not found
 *
 * @example
 * ```typescript
 * const kind = stringToSymbolKind('class') // 4 (vscode.SymbolKind.Class)
 * const kind2 = stringToSymbolKind('FUNCTION') // 11 (vscode.SymbolKind.Function)
 * const kind3 = stringToSymbolKind('unknown') // undefined
 * ```
 */
export function stringToSymbolKind(kind: string): number | undefined {
	// Normalize: lowercase and convert enumMember to enum_member
	const normalizedKind = kind.toLowerCase().replace('enummember', 'enum_member')
	return SYMBOL_KIND_MAP[normalizedKind]
}

/**
 * Returns an array of all valid symbol kind strings.
 * Useful for validation and error messages.
 *
 * @returns Array of valid symbol kind strings
 */
export function getValidSymbolKinds(): string[] {
	return Object.keys(SYMBOL_KIND_MAP)
}

// ============================================================================
// Document Symbol Utilities
// ============================================================================

/**
 * Recursively flattens a hierarchical DocumentSymbol array into a flat array.
 * This allows searching through all symbols regardless of their nesting level.
 *
 * @param symbols - Array of DocumentSymbol objects (potentially with children)
 * @returns Flat array containing all symbols from the hierarchy
 *
 * @example
 * ```typescript
 * const symbols = await vscode.commands.executeCommand<VscodeDocumentSymbol[]>(
 *   'vscode.executeDocumentSymbolProvider', uri
 * )
 * const flatSymbols = flattenDocumentSymbols(symbols)
 * // Now can search all symbols linearly
 * ```
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
 * Finds symbols by name and optional kind within a DocumentSymbol array.
 * Performs both exact name matching and suffix matching (e.g., 'MyClass.method').
 *
 * @param symbols - Array of DocumentSymbol objects to search
 * @param name - Symbol name to search for
 * @param kind - Optional SymbolKind to filter by (numeric value)
 * @returns Array of matching DocumentSymbol objects
 *
 * @example
 * ```typescript
 * const matches = findSymbolsByName(symbols, 'myFunction', 11) // Function kind
 * const classMatches = findSymbolsByName(symbols, 'MyClass') // Any kind
 * ```
 */
function findSymbolsByName(
	symbols: VscodeDocumentSymbol[],
	name: string,
	kind?: number
): VscodeDocumentSymbol[] {
	const flatSymbols = flattenDocumentSymbols(symbols)

	return flatSymbols.filter(symbol => {
		// Match exact name or qualified name (e.g., 'ClassName.methodName')
		const nameMatches = symbol.name === name || symbol.name.endsWith('.' + name)
		const kindMatches = kind === undefined || symbol.kind === kind
		return nameMatches && kindMatches
	})
}

// ============================================================================
// Symbol Position Heuristics
// ============================================================================

/**
 * Performs heuristic scanning to find the exact position of a symbol within a range.
 * This is necessary because LSP servers often return approximate ranges.
 *
 * The algorithm:
 * 1. Reads the file content via the document
 * 2. Scans each line within the given range
 * 3. Uses indexOf to find the exact character position of the symbol name
 * 4. Returns the first match, or falls back to range.start
 *
 * @param document - VSCode TextDocument to search in
 * @param symbolName - Name of the symbol to find
 * @param symbolRange - Range to search within (from DocumentSymbol.range)
 * @returns Exact position of the symbol (0-based), or range.start if not found
 *
 * @example
 * ```typescript
 * const position = findSymbolPositionInFile(doc, 'myFunction', symbol.range)
 * ```
 */
function findSymbolPositionInFile(
	document: VscodeTextDocument,
	symbolName: string,
	symbolRange: { start: { line: number; character: number }; end: { line: number; character: number } }
): { line: number; character: number } {
	const startLine = symbolRange.start.line
	const endLine = symbolRange.end.line

	for (let lineNum = startLine; lineNum <= endLine && lineNum < document.lineCount; lineNum++) {
		const line = document.lineAt(lineNum)
		const lineText = line.text

		// Determine search boundaries within the line
		let searchStart = 0
		if (lineNum === startLine) {
			searchStart = symbolRange.start.character
		}

		let searchEnd = lineText.length
		if (lineNum === endLine) {
			searchEnd = symbolRange.end.character
		}

		// Search for symbol name within the boundaries
		const searchText = lineText.substring(searchStart, searchEnd)
		const symbolIndex = searchText.indexOf(symbolName)

		if (symbolIndex !== -1) {
			const actualCharacter = searchStart + symbolIndex
			return { line: lineNum, character: actualCharacter }
		}
	}

	// Fallback to range start if symbol not found
	return { line: symbolRange.start.line, character: symbolRange.start.character }
}

// ============================================================================
// Main Resolution Function
// ============================================================================

/**
 * Resolves the position of a symbol in a file using a two-stage strategy:
 *
 * 1. **Direct coordinates**: If both `line` and `character` are provided,
 *    returns those coordinates directly (fast path).
 *
 * 2. **Symbol search**: Otherwise, uses VSCode's DocumentSymbol provider
 *    to find the symbol by name, then applies heuristic scanning to find
 *    the exact position within the symbol's range.
 *
 * @param params - Resolution parameters
 * @param params.filePath - Path to the file (absolute or relative to workspace)
 * @param params.symbolName - Name of the symbol to find
 * @param params.symbolKind - Optional symbol kind filter (e.g., 'class', 'function')
 * @param params.line - Optional 0-based line number (fast path if provided with character)
 * @param params.character - Optional 0-based character position (fast path if provided with line)
 *
 * @returns Object with position and uri, or null if symbol not found
 *
 * @example
 * ```typescript
 * // Using exact coordinates (fast path)
 * const result1 = await resolveSymbolPosition({
 *   filePath: '/src/utils.ts',
 *   symbolName: 'helper',
 *   line: 10,
 *   character: 5
 * })
 *
 * // Using symbol search
 * const result2 = await resolveSymbolPosition({
 *   filePath: '/src/api.ts',
 *   symbolName: 'fetchData',
 *   symbolKind: 'function'
 * })
 *
 * if (result2) {
 *   console.log(`Found at line ${result2.position.line}`)
 * }
 * ```
 */
export async function resolveSymbolPosition(
	params: ResolveSymbolPositionParams
): Promise<ResolvedSymbolPosition | null> {
	// Get workspace root for relative path resolution
	const workspaceFolders = vscode.workspace.workspaceFolders
	const workspaceRoot = workspaceFolders && workspaceFolders.length > 0
		? workspaceFolders[0].uri.fsPath
		: process.cwd()

	// Resolve full file path
	const fullPath = path.isAbsolute(params.filePath)
		? params.filePath
		: path.join(workspaceRoot, params.filePath)

	const uri = vscode.Uri.file(fullPath)

	// Fast path: if exact coordinates are provided, use them directly
	if (params.line !== undefined && params.character !== undefined) {
		return {
			position: { line: params.line, character: params.character },
			uri: fullPath
		}
	}

	// Slow path: search for symbol using DocumentSymbol provider
	try {
		// Open the document
		const document = await vscode.workspace.openTextDocument(uri) as VscodeTextDocument
		if (!document) {
			return null
		}

		// Get document symbols from VSCode
		const symbols = await vscode.commands.executeCommand<VscodeDocumentSymbol[] | undefined>(
			'vscode.executeDocumentSymbolProvider',
			uri
		)

		if (!symbols || symbols.length === 0) {
			return null
		}

		// Convert symbol kind string to numeric value if provided
		const kind = params.symbolKind ? stringToSymbolKind(params.symbolKind) : undefined

		// Find matching symbols
		const matchingSymbols = findSymbolsByName(symbols, params.symbolName, kind)

		if (matchingSymbols.length === 0) {
			return null
		}

		// Use the first matching symbol
		const targetSymbol = matchingSymbols[0]

		// Find exact position using heuristic scanning
		const position = findSymbolPositionInFile(
			document,
			params.symbolName,
			targetSymbol.range
		)

		return { position, uri: fullPath }
	} catch (error) {
		// Log error for debugging but return null to allow caller to handle
		console.error(`[symbol-position] Error resolving symbol position: ${error}`)
		return null
	}
}

// ============================================================================
// Additional Utility Exports
// ============================================================================

/**
 * Internal type for flattened symbol with additional metadata
 */
export interface FlattenedSymbol {
	/** Symbol name */
	name: string
	/** Symbol kind (numeric vscode.SymbolKind value) */
	kind: number
	/** Symbol kind as string */
	kindName: string
	/** Selection range (where the symbol name is) */
	selectionRange: { start: { line: number; character: number }; end: { line: number; character: number } }
	/** Full range of the symbol */
	range: { start: { line: number; character: number }; end: { line: number; character: number } }
	/** Symbol detail/Documentation */
	detail: string
}

/**
 * Symbol kind numeric to string mapping
 */
const SYMBOL_KIND_NAMES: Record<number, string> = {
	0: 'file',
	1: 'module',
	2: 'namespace',
	3: 'package',
	4: 'class',
	5: 'method',
	6: 'property',
	7: 'field',
	8: 'constructor',
	9: 'enum',
	10: 'interface',
	11: 'function',
	12: 'variable',
	13: 'constant',
	14: 'string',
	15: 'number',
	16: 'boolean',
	17: 'array',
	18: 'object',
	19: 'key',
	20: 'null',
	21: 'enum_member',
	22: 'struct',
	23: 'event',
	24: 'operator',
	25: 'type_parameter',
}

/**
 * Gets all document symbols for a file, flattened for easy searching.
 *
 * @param filePath - Path to the file
 * @returns Flat array of all DocumentSymbol objects with metadata, or empty array if none found
 *
 * @example
 * ```typescript
 * const symbols = await getAllDocumentSymbols('/src/myFile.ts')
 * const classSymbols = symbols.filter(s => s.kind === 4) // Class kind
 * ```
 */
export async function getAllDocumentSymbols(filePath: string): Promise<FlattenedSymbol[]> {
	// Get workspace root for relative path resolution
	const workspaceFolders = vscode.workspace.workspaceFolders
	const workspaceRoot = workspaceFolders && workspaceFolders.length > 0
		? workspaceFolders[0].uri.fsPath
		: process.cwd()

	const fullPath = path.isAbsolute(filePath)
		? filePath
		: path.join(workspaceRoot, filePath)

	const uri = vscode.Uri.file(fullPath)

	try {
		const symbols = await vscode.commands.executeCommand<VscodeDocumentSymbol[] | undefined>(
			'vscode.executeDocumentSymbolProvider',
			uri
		)

		if (!symbols || symbols.length === 0) {
			return []
		}

		const flatSymbols = flattenDocumentSymbols(symbols)

		// Convert to FlattenedSymbol format
		return flatSymbols.map(symbol => ({
			name: symbol.name,
			kind: symbol.kind,
			kindName: SYMBOL_KIND_NAMES[symbol.kind] || 'unknown',
			selectionRange: symbol.selectionRange,
			range: symbol.range,
			detail: symbol.detail,
		}))
	} catch (error) {
		console.error(`[symbol-position] Error getting document symbols: ${error}`)
		return []
	}
}
