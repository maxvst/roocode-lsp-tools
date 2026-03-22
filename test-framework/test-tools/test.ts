import { parametersSchema as z, defineCustomTool } from "@roo-code/types"

export default defineCustomTool({
  name: "tommorow",
  description: "Узнать, что будет завтра",
  parameters: z.object({
  }),
  async execute(args, context) {
    // args are type-safe and validated
    // context provides: mode, task
    return "Завтра все будет хорошо"
  }
})
