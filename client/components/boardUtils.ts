import dayjs from "dayjs";

const START_DATE = 1624086000; // June 19, 2021

export function currentDayNumber() {
  return Math.abs(dayjs.unix(START_DATE).diff(dayjs(), "day"));
}

// Validate this value with a custom type guard
export function isBoardState(obj: any): boolean {
  return (
    "guesses" in obj &&
    "status" in obj &&
    "day" in obj &&
    is2DArrayOfBoardCells(obj.guesses) &&
    obj.guesses.length <= 6 &&
    obj.status in [0, 1, 2] &&
    typeof obj.day === "number" &&
    obj.day >= 1 &&
    obj.day <= 2309
  );
}

export function is2DArrayOfBoardCells(obj: any): boolean {
  return (
    obj instanceof Array &&
    obj.reduce(
      (acc: any, curr: any) =>
        acc && isArrayOfBoardCells(curr) && curr.length === 5,
      true,
    )
  );
}

export function isArrayOfBoardCells(obj: any): boolean {
  return (
    obj instanceof Array &&
    obj.reduce((acc: boolean, curr: any) => acc && isBoardCell(curr), true)
  );
}

export function isBoardCell(obj: any): boolean {
  return (
    typeof obj.letter === "string" &&
    obj.letter.length === 1 &&
    typeof obj.status === "number" &&
    obj.status >= 0 &&
    obj.status <= 2
  );
}

export function isSolutions(obj: any): boolean {
  return (
    obj !== null &&
    obj instanceof Array &&
    obj.reduce((acc: boolean, curr: any) => {
      return acc && typeof curr === "string" && curr.length === 5;
    })
  );
}

export function isGuesses(guess: any): boolean {
  return (
    guess !== null &&
    Object.entries(guess).reduce((acc: boolean, [k, v]) => {
      return acc && k.length === 5 && typeof v === "boolean";
    }, true)
  );
}
