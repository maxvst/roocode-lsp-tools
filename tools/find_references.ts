/**
 * find_references - Custom Tool for Roo-Code
 *
 * Find all references to a symbol at a given position in a file.
 * Uses VSCode's built-in reference provider.
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

export default defineCustomTool({
	name: "find_references",
	description:
		"Find all references to the symbol at the specified position. " +
		"Returns a list of locations where the symbol is used throughout the workspace. " +
		"Use this to understand how a function, class, or variable is used.",

	parameters: z.object({
		file_path: z.string().describe("Path to the file relative to workspace root"),
		line: z.number().describe("1-based line number where the symbol is located"),
		character: z.number().describe("1-based character position (column) on the line"),
	}),

	async execute({ file_path, line, character }, context) {
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

			// Execute VSCode reference provider
			// Use inline type to avoid namespace issues
			const result = await vscode.commands.executeCommand<
				readonly { uri: { fsPath: string }; range: { start: { line: number; character: number }; end: { line: number; character: number } } }[] | undefined
			>("vscode.executeReferenceProvider", uri, position)

			if (!result || result.length === 0) {
				return (
					"No references found at the specified position. " +
					"The symbol may not be referenced elsewhere, or no LSP server is running for this file type."
				)
			}

			// Convert result to locations
			const locations: Location[] = result.map((loc) => ({
				uri: loc.uri.fsPath,
				range: {
					start: {
						line: loc.range.start.line + 1,
						character: loc.range.start.character + 1,
					},
					end: {
						line: loc.range.end.line + 1,
						character: loc.range.end.character + 1,
					},
				},
			}))

			// Group references by file
			const byFile = new Map<string, Location[]>()
			for (const loc of locations) {
				const existing = byFile.get(loc.uri) || []
				existing.push(loc)
				byFile.set(loc.uri, existing)
			}

			// Format result
			const lines: string[] = [
				`✅ Found ${locations.length} reference${locations.length > 1 ? "s" : ""} ` +
					`in ${byFile.size} file${byFile.size > 1 ? "s" : ""}:`,
			]

			let refNum = 1
			for (const [file, fileLocations] of byFile) {
				lines.push("")
				lines.push(
					`**${file}** (${fileLocations.length} reference${fileLocations.length > 1 ? "s" : ""})`
				)

				for (const loc of fileLocations) {
					lines.push(
						`  ${refNum}. Line ${loc.range.start.line}, Character ${loc.range.start.character}`
					)
					refNum++
				}
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Reference lookup failed: ${message}`
		}
	},
})
