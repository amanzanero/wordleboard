// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import guesses from "../../guesses";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<typeof guesses>,
) {
  if (req.method !== "GET") {
    res.status(405);
    return;
  }
  res.status(200).json(guesses);
}
