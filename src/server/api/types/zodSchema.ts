import { z } from 'zod'

export const usersNotionAccessTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  bot_id: z.string(),
  workspace_name: z.string(),
  workspace_icon: z.string(),
  workspace_id: z.string(),
  owner_id: z.string(),
  duplicated_template_id: z.string(),
  request_id: z.string(),
  userId: z.string().optional(),
})
