// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import solutions from "../../../solutions";
import guesses from "../../../guesses";
import { GuessStatus } from "../../../components/boardState";

type Data = {
  results: GuessStatus[];
  failureMessage?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "POST") {
    res
      .status(405)
      .json({ results: [], failureMessage: "Only POST requests allowed" });
    return;
  }
  const { day } = req.query;
  if (typeof day !== "string") {
    res.status(400).json({ results: [], failureMessage: "Invalid day passed" });
    return;
  }
  const dayNumber = parseInt(day);
  if (isNaN(dayNumber) || dayNumber < 0 || dayNumber > solutions.length) {
    res.status(400).json({ results: [], failureMessage: "Invalid day passed" });
    return;
  }

  const guess = req.body.guess;
  if (typeof guess !== "string" || guess.length !== 5) {
    res.status(400).json({ results: [], failureMessage: "Invalid guess" });
    return;
  }

  // valid 5 letter guess now
  if (!guesses[guess]) {
    res.status(200).json({ results: [], failureMessage: "not a word" });
  } else {
    const init: Data["results"] = [];
    const results = guess.split("").reduce((acc, letter, i) => {
      if (letter === solutions[dayNumber][i]) {
        return [...acc, GuessStatus.IN_LOCATION];
      } else if (solutions[dayNumber].indexOf(letter) > -1) {
        return [...acc, GuessStatus.IN_WORD];
      } else {
        return [...acc, GuessStatus.INVALID];
      }
    }, init);
    res.status(200).json({ results });
  }
}
