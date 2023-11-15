import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { authOptionsWrapper } from "~/server/auth";

export default async function authWrapper(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, authOptionsWrapper(req, res));
}
