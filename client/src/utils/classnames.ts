export const classnames = (...args: (string | undefined)[]) => {
  return args.filter((arg) => arg !== undefined).join(" ");
};
