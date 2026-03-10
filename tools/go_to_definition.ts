/**
 * go_to_definition - Custom Tool for Roo-Code
 * 
 * Navigate to the definition of a symbol at a given position in a file.
 * Uses VSCode's built-in definition provider.
 */

import { parametersSchema as z, defineCustomTool } from "@roo-code/types"
import * as vscode from "vscode"
import path from "path"

interface Location {
	uri: string
	range: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
}

export default defineCustomTool({
	name: "go_to_definition",
	description:
		"Find the definition of a symbol at the specified position. " +
		"Returns the location(s) where the symbol is defined. " +
		"Use this to navigate to the source of a function, class, variable, or other symbol.",

	parameters: z.object({
		file_path: z.string().describe("Path to the file relative to workspace root"),
		line: z.number().describe("1-based line number where the symbol is located"),
		character: z.number().describe("1-based character position (column) on the line"),
	}),

	async execute({ file_path, line, character }, context) {
		// Get workspace root from context
		const workspaceRoot = context.task.cwd

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

			// Execute VSCode definition provider
			const result = await vscode.commands.executeCommand<
				vscode.Location | vscode.Location[] | vscode.LocationLink[] | undefined
			>("vscode.executeDefinitionProvider", uri, position)

			if (!result) {
				return (
					"No definition found at the specified position. " +
					"The symbol may be built-in, or no LSP server is running for this file type."
				)
			}

			// Convert result to locations array
			const locations: Location[] = []

			if (result instanceof vscode.Location) {
				locations.push(convertLocation(result))
			} else if (Array.isArray(result)) {
				for (const item of result) {
					if (item instanceof vscode.Location) {
						locations.push(convertLocation(item))
					} else {
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
					"No definition found at the specified position. " +
					"The symbol may be built-in, or no LSP server is running for this file type."
				)
			}

			// Format result
			const lines: string[] = [
				`✅ Found ${locations.length} definition${locations.length > 1 ? "s" : ""}:`,
			]

			for (let i = 0; i < locations.length; i++) {
				const loc = locations[i]
				lines.push("")
				lines.push(`**Definition ${i + 1}:**`)
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
			return `❌ Definition lookup failed: ${message}`
		}
	},
})

/**
 * Convert VSCode Location to our format
 */
function convertLocation(location: vscode.Location): Location {
	return {
		uri: location.uri.fsPath,
		range: convertRange(location.range),
	}
}

/**
 * Convert VSCode Range to 1-based LSP range
 */
function convertRange(range: vscode.Range): {
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
