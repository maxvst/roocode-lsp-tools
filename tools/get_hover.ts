/**
 * get_hover - Custom Tool for Roo-Code
 * 
 * Get hover information (type, documentation) for a symbol at a given position.
 * Uses VSCode's built-in hover provider.
 */

import { parametersSchema as z, defineCustomTool } from "@roo-code/types"
import * as vscode from "vscode"
import path from "path"

interface HoverResult {
	contents: string
	plainText?: string
	language?: string
	range?: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
}

export default defineCustomTool({
	name: "get_hover",
	description:
		"Get hover information (type, documentation) for the symbol at the specified position. " +
		"Returns type signatures, documentation, and other contextual information. " +
		"Use this to understand what a symbol represents without navigating away.",

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

			// Execute VSCode hover provider
			const result = await vscode.commands.executeCommand<
				vscode.Hover[] | undefined
			>("vscode.executeHoverProvider", uri, position)

			if (!result || result.length === 0) {
				return (
					"No hover information available at the specified position. " +
					"The position may not be on a symbol, or no LSP server is running for this file type."
				)
			}

			// Take the first hover (most relevant)
			const hover = result[0]
			const hoverInfo = convertHover(hover)

			if (!hoverInfo) {
				return (
					"No hover information available at the specified position. " +
					"The position may not be on a symbol, or no LSP server is running for this file type."
				)
			}

			// Format result
			const lines: string[] = ["✅ Hover information:", ""]

			// Add the content
			if (hoverInfo.language) {
				lines.push(`\`\`\`${hoverInfo.language}`)
				lines.push(hoverInfo.plainText || String(hoverInfo.contents))
				lines.push("```")
			} else {
				lines.push(hoverInfo.plainText || String(hoverInfo.contents))
			}

			// Add range info if available
			if (hoverInfo.range) {
				lines.push("")
				lines.push(
					`*Applies to: Lines ${hoverInfo.range.start.line}-${hoverInfo.range.end.line}, ` +
						`Characters ${hoverInfo.range.start.character}-${hoverInfo.range.end.character}*`
				)
			}

			return lines.join("\n")
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			return `❌ Hover lookup failed: ${message}`
		}
	},
})

/**
 * Convert VSCode Hover to our format
 */
function convertHover(hover: vscode.Hover): HoverResult | null {
	const contents = hover.contents
	let plainText = ""
	let language: string | undefined
	const formattedContents: string[] = []

	if (Array.isArray(contents)) {
		for (const item of contents) {
			const extracted = extractHoverContent(item)
			formattedContents.push(extracted.text)
			if (extracted.language && !language) {
				language = extracted.language
			}
		}
		plainText = formattedContents.join("\n\n")
	} else {
		const extracted = extractHoverContent(contents)
		plainText = extracted.text
		language = extracted.language
	}

	const result: HoverResult = {
		contents: plainText,
		plainText,
		language,
	}

	// Add range if available
	if (hover.range) {
		result.range = {
			start: {
				line: hover.range.start.line + 1,
				character: hover.range.start.character + 1,
			},
			end: {
				line: hover.range.end.line + 1,
				character: hover.range.end.character + 1,
			},
		}
	}

	return result
}

/**
 * Extract text and language from hover content
 */
function extractHoverContent(
	content: vscode.MarkdownString | vscode.MarkedString
): { text: string; language?: string } {
	// Handle MarkdownString
	if (typeof content === "object" && "value" in content) {
		return { text: (content as vscode.MarkdownString).value }
	}

	// Handle MarkedString (string or { language, value })
	if (typeof content === "string") {
		return { text: content }
	}

	// Handle code block format { language: string, value: string }
	if (typeof content === "object" && content !== null) {
		const markedStr = content as { language?: string; value?: string }
		if ("language" in markedStr && "value" in markedStr) {
			return {
				text: markedStr.value as string,
				language: markedStr.language as string,
			}
		}
	}

	return { text: String(content) }
}
