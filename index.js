import assert from "assert";
import { cond, equals, T, flatten } from "ramda";

const DETERMINERS = ["a", "the", "this", "that"];

const NOUNS = [
  { nn: "agitator", nns: "agitators" },
  { nn: "bat", nns: "bats" },
  { nn: "cat", nns: "cats" },
  { nn: "dog", nns: "cats" },
  { nn: "government", nns: "governments" },
  { nn: "person", nns: "people" },
  { nn: "reporter", nns: "reporters" },
  { nn: "trunk", nns: "trunks" },
];

const ADJECTIVES = [
  "bad",
  "capitalist",
  "communist",
  "controversial",
  "cool",
  "evil",
  "fun",
  "good",
  "terrible",
  "wild",
];

const VERBS = [
  { vb: "attack", vbz: "attacks" },
  { vb: "become", vbz: "becomes" },
  { vb: "consume", vbz: "consumes" },
  { vb: "destroy", vbz: "destroys" },
  { vb: "eat", vbz: "eats" },
  { vb: "surprise", vbz: "surprises" },
];

function fail(message) {
  throw new Error(message);
}

function range(n) {
  return Array(n)
    .fill()
    .map((_, i) => i);
}

function sample(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
}

function capitalize(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

// LEAF
function makeN() {
  const singular = sample([true, false]);
  return {
    type: "N",
    leaf: true,
    parent: null,
    singular,
    plural: !singular,
    value: sample(NOUNS),
  };
}

function makeV() {
  return {
    type: "V",
    leaf: true,
    parent: null,
    value: sample(VERBS),
  };
}

function makeJJ() {
  return {
    type: "JJ",
    leaf: true,
    parent: null,
    value: sample(ADJECTIVES),
  };
}

// NODE
function makeNP() {
  return {
    type: "NP",
    leaf: false,
    parent: null,
    value: {
      D: sample(DETERMINERS),
      JJs: [],
      N: makeN(),
    },
    addJJ() {
      this.value.JJs.push(makeJJ());
      return this;
    },
  };
}

function makeVP() {
  return {
    type: "VP",
    leaf: false,
    parent: null,
    value: {
      V: makeV(),
      NP: makeNP(),
    },
  };
}

function contextualize(n) {
  flatten(Object.values(n.value).filter((m) => typeof m === "object")).forEach(
    (m) => {
      m.parent = n;
      if (!m.leaf) contextualize(m);
    }
  );
  return n;
}

function makeS() {
  return contextualize({
    type: "S",
    leaf: false,
    value: {
      NP: range(sample([0, 1, 2])).reduce((np) => np.addJJ(), makeNP()),
      VP: makeVP(),
    },
  });
}

function toString(n) {
  switch (n.type) {
    case "S":
      return `${capitalize(toString(n.value.NP))} ${toString(n.value.VP)}.`;
    case "NP":
      const jjString = n.value.JJs.map((n) => n.value).join(", ");
      if (n.value.N.singular)
        return [n.value.D, jjString, n.value.N.value.nn]
          .filter(Boolean)
          .join(" ");
      const toDeterminerPluralString = cond([
        [equals("this"), () => "these"],
        [equals("that"), () => "those"],
        [equals("a"), () => ""],
        [equals("the"), () => "the"],
        [T, () => fail("case not handled")],
      ]);
      return [
        toDeterminerPluralString(n.value.D),
        jjString,
        n.value.N.value.nns,
      ]
        .filter(Boolean)
        .join(" ");
    case "VP":
      return `${toString(n.value.V)} ${toString(n.value.NP)}`;
    case "V":
      assert(n.parent.parent.value.NP, "Should be NP");
      return n.parent.parent.value.NP.value.N.singular
        ? n.value.vbz
        : n.value.vb;
    default:
      throw new Error("not impl");
  }
}

console.log(toString(makeS()));
