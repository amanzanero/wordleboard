export async function doEvery(ms: number, actions: (() => void)[]) {
  for (const action of actions) {
    action();
    await later(ms);
  }
}

function later(delay: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}
