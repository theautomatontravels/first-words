import * as net from "net";

const SOCKET_PORT = 2020;

function xfTag(taggedText) {
  return taggedText
    .trimRight()
    .split(" ")
    .map((s) => {
      const [value, pos] = s.split("_");
      return {
        pos,
        value,
      };
    });
}

function tag(text) {
  return new Promise((resolve, reject) => {
    const s = new net.Socket()
      .on("connect", () => {
        s.write(text.replace(/\s*$/, "\n"));
      })
      .on("error", reject)
      .on("data", (d) => resolve(xfTag(d.toString())))
      .connect(SOCKET_PORT);
  });
}

(async () => {
  Promise.all(
    [
      "one sentence",
      "two sentence",
      "This is a sentence, and it has a comma. There is another sentence after it too.",
    ].map(tag)
  ).then(console.log);
})();
