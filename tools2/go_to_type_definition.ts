/**
 * go_to_type_definition - Custom Tool for Roo-Code
 *
 * Navigate to the type definition of a symbol at a given position in a file.
 * Uses VSCode's built-in type definition provider.
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

// Type for VSCode LocationLink
interface VscodeLocationLink {
	targetUri: { fsPath: string }
	targetRange: { start: { line: number; character: number }; end: { line: number; character: number } }
}

export default defineCustomTool({
	name: "go_to_type_definition",
	description:
		"Find the type definition of a symbol by name. " +
		"Uses symbol name to locate the exact position, eliminating the need for precise column coordinates. " +
		"Navigates to the type that defines the symbol's type (e.g., interface for a variable).",

	parameters: z.object({
		file_path: z.string().describe("Absolute path to the file"),
		symbol_name: z.string().describe("Name of the symbol to find type definition for"),
		symbol_kind: z.enum(getValidSymbolKinds() as [string, ...string[]]).optional()
			.describe("Optional symbol kind filter (e.g., \"class\", \"interface\", \"type\")"),
		line: z.number().optional()
			.describe("Optional line number (0-based). If provided with character, bypasses symbol search"),
		character: z.number().optional()
			.describe("Optional character offset (0-based). Required if line is provided"),
	}),

	async execute({ file_path, symbol_name, symbol_kind, line, character }, context) {
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

			// Convert to VSCode URI
			const vscodeUri = vscode.Uri.file(uri)
			const vscodePosition = new vscode.Position(position.line, position.character)

			// Execute VSCode type definition provider
			const typeDefinitions = await vscode.commands.executeCommand<
				VscodeLocation | VscodeLocation[] | VscodeLocationLink[] | undefined
			>("vscode.executeTypeDefinitionProvider", vscodeUri, vscodePosition)

			if (!typeDefinitions) {
				return (
					`❌ No type definition found for symbol "${symbol_name}". ` +
					"The symbol may be built-in, or no LSP server is running for this file type."
				)
			}

			// Convert result to locations array
			const locations: Location[] = []

			// Check if it's a single location (has uri property)
			const isSingleLocation = (r: unknown): r is VscodeLocation =>
				!!r && typeof r === 'object' && 'uri' in r && !Array.isArray(r)
			
			// Check if it's a LocationLink (has targetUri property)
			const isLocationLink = (r: unknown): r is VscodeLocationLink =>
				!!r && typeof r === 'object' && 'targetUri' in r

			if (isSingleLocation(typeDefinitions)) {
				locations.push(convertLocation(typeDefinitions))
			} else if (Array.isArray(typeDefinitions)) {
				for (const item of typeDefinitions) {
					if (isSingleLocation(item)) {
						locations.push(convertLocation(item))
					} else if (isLocationLink(item)) {
						// LocationLink
						locations.push({
							uri: item.targetUri.fsPath,
							range: convertRange(item.targetRange),
						})
					}
				}
			}

			if (locations.length === 0) {
				return (
					`❌ No type definition found for symbol "${symbol_name}". ` +
					"The symbol may be built-in, or no LSP server is running for this file type."
				)
			}

			// Format result
			const lines: string[] = [
				`✅ Found ${locations.length} type definition${locations.length > 1 ? "s" : ""} for "${symbol_name}":`,
			]

			for (let i = 0; i < locations.length; i++) {
				const loc = locations[i]
				lines.push("")
				lines.push(`**Type Definition ${i + 1}:**`)
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
			return `❌ Type definition lookup failed: ${message}`
		}
	},
})

/**
 * Convert VSCode Location to our format
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
