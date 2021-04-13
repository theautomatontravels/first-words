const DETERMINERS = ["a", "the"];

const NOUNS = ["cat", "dog", "person", "government"];

const ADJECTIVES = ["good", "evil", "bad", "terrible"];

const VERBS = ["attack", "eat", "destroy"];

function sample(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
}

function capitalize(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

function makeNP() {
  return {
    type: "NP",
    D: sample(DETERMINERS),
    N: sample(NOUNS),
  };
}

function makeVP() {
  return {
    type: "VP",
    V: sample(VERBS) + "s",
    NP: makeNP(),
  };
}

function makeS() {
  return {
    type: "S",
    NP: makeNP(),
    VP: makeVP(),
  };
}

function toString(n) {
  switch (n.type) {
    case "S":
      return [capitalize(toString(n.NP)), toString(n.VP)].join(" ") + ".";
    case "NP":
      return [n.D, n.N].join(" ");
    case "VP":
      return [n.V, toString(n.NP)].join(" ");
    default:
      throw new Error("not impl");
  }
}

console.log(toString(makeS()));
