import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { env } from '~/env.mjs'
import { prisma } from '~/server/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const code = req.query.code as string
  const session = await getSession({ req })
  try {
    if (!session) {
      res.redirect('/')
    }

    const tokens = await getNotionOAuthTokens(code)

    const user = await prisma.user.findFirst({
      where: {
        email: session?.user.email,
      },
      select: {
        notionAccessToken: true,
        id: true,
      },
    })

    if (tokens) {
      if (user?.notionAccessToken?.access_token === tokens.access_token) {
        res.status(200).redirect('/app')
      }
      if (user?.notionAccessToken?.access_token !== tokens.access_token) {
        await prisma.notionToken.create({
          data: {
            access_token: tokens.access_token,
            token_type: tokens.token_type,
            bot_id: tokens.bot_id,
            workspace_name: tokens.workspace_name,
            workspace_icon: tokens.workspace_icon,
            workspace_id: tokens.workspace_id,
            owner_id: tokens.owner.user.id,
            duplicated_template_id: tokens.duplicated_template_id,
            request_id: tokens.request_id,
            userId: user?.id,
          },
        })
        res.status(200).redirect('/app')
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getNotionOAuthTokens(
  code: string,
): Promise<NotionOAuthTokens | undefined> {
  const clientId = env.NOTION_CLIENT_ID
  const clientSecret = env.NOTION_CLIENT_SECRET
  const redirectUri = env.NOTION_REDIRECT_URI

  // encode in base 64
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`,
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  })
  return response.json() as Promise<NotionOAuthTokens>
}

interface NotionOAuthTokens {
  access_token: string
  token_type: string
  bot_id: string
  workspace_name: string
  workspace_icon: string
  workspace_id: string
  owner: {
    type: string
    user: {
      object: string
      id: string
    }
  }
  duplicated_template_id: string | null
  request_id: string
}
