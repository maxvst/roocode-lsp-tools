/**
 * delete_file - Custom Tool for Roo-Code
 *
 * Delete a file from the workspace.
 * Uses VSCode's workspace filesystem API for file operations.
 *
 * NOTE: Uses dynamic require for vscode to avoid esbuild resolution issues.
 * The vscode module is provided by VSCode extension host at runtime.
 */

import { parametersSchema as z, defineCustomTool } from "@roo-code/types"

// Dynamic require for vscode - this module is provided by VSCode at runtime.
// We use a computed require to prevent esbuild from trying to resolve/bundle it.
// The vscode module is special and only exists in VSCode extension host context.
const vscodeModule = "vscode"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vscode = require(vscodeModule) as typeof import("vscode")

interface DeleteFileResult {
	status: "success" | "failed"
	message: string
}

export default defineCustomTool({
	name: "delete_file",
	description:
		"Delete a file from the workspace. " +
		"Returns the result of the delete operation. " +
		"Use this tool to remove files as part of test cleanup or file system operations.",

	parameters: z.object({
		filePath: z.string().describe("Path to the file relative to workspace root"),
	}),

	async execute({ filePath }): Promise<string> {
		// Validate filePath parameter
		if (!filePath || filePath.trim() === "") {
			return JSON.stringify({
				status: "failed",
				message: "filePath parameter is required",
			} satisfies DeleteFileResult)
		}

		// Get workspace root from VSCode workspace folders
		const workspaceFolders = vscode.workspace.workspaceFolders
		if (!workspaceFolders || workspaceFolders.length === 0) {
			return JSON.stringify({
				status: "failed",
				message: "No workspace folder found",
			} satisfies DeleteFileResult)
		}

		const workspaceRoot = workspaceFolders[0].uri
		const fileUri = vscode.Uri.joinPath(workspaceRoot, filePath)

		try {
			// Check if file exists
			await vscode.workspace.fs.stat(fileUri)

			// Delete the file
			await vscode.workspace.fs.delete(fileUri)

			return JSON.stringify({
				status: "success",
				message: `File deleted successfully: ${filePath}`,
			} satisfies DeleteFileResult)
		} catch (error) {
			if (error instanceof vscode.FileSystemError) {
				// FileNotFound error
				if (error.code === "FileNotFound" || error.name === "EntryNotFound") {
					return JSON.stringify({
						status: "failed",
						message: `File not found: ${filePath}`,
					} satisfies DeleteFileResult)
				}
				return JSON.stringify({
					status: "failed",
					message: `FileSystem error: ${error.message}`,
				} satisfies DeleteFileResult)
			}

			const message = error instanceof Error ? error.message : String(error)
			return JSON.stringify({
				status: "failed",
				message: `Error: ${message}`,
			} satisfies DeleteFileResult)
		}
	},
})
