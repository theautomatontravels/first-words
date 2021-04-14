import { cond, equals, T, range, flatten } from 'ramda'

const DETERMINERS = ["a", "the", 'this', 'that'];

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

const ADJECTIVES = ["good", "evil", "bad", "terrible"];

// const VERBS = ["attack", "eat", "destroy"];
const VERBS = [
  { vb: "attack", vbz: "attacks" },
  { vb: "become", vbz: "becomes" },
  { vb: "consume", vbz: "consumes" },
  { vb: "destroy", vbz: "destroys" },
  { vb: "eat", vbz: "eats" },
  { vb: "surprise", vbz: "surprises" },
];

function fail(message) {
  throw new Error(message)
}

function sample(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
}

function capitalize(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

function makeN() {
  return {
    type: "N",
    leaf: true,
    parent: null,
    singular: sample([true, false]),
    value: sample(NOUNS),
  };
}

function makeJJ() {
  return {
    type: 'JJ',
    leaf: true,
    parent: null,
    value: sample(ADJECTIVES)
  }
}

function makeV() {
  return {
    type: "V",
    parent: null,
    leaf: true,
    value: sample(VERBS),
  };
}

function makeNP() {
  return {
    type: "NP",
    parent: null,
    value: {
      D: sample(DETERMINERS),
      JJs: [],
      N: makeN(),
    },
    addJJ() {
      this.value.JJs.push(makeJJ())
      return this
    }
  };
}

function makeVP() {
  return {
    type: "VP",
    parent: null,
    value: {
      V: makeV(),
      NP: makeNP(),
    },
  };
}

function contextualize(n) {
  flatten(Object.values(n.value)).filter(m => typeof m === 'object').forEach(m => {
    m.parent = n
    if (!m.leaf) contextualize(m)
  })
  return n
}

function makeS() {
  return contextualize({
    type: "S",
    value: {
      NP: range(0, sample([0, 1, 2])).reduce(np => np.addJJ(), makeNP()),
      VP: makeVP(),
    },
  });
}

function toString(n) {
  switch (n.type) {
    case "S":
      return (
        [capitalize(toString(n.value.NP)), toString(n.value.VP)].join(" ") + "."
      );
    case "NP":
      const jjString = n.value.JJs.map(n => n.value).join(', ')
      if (n.value.N.singular) return [n.value.D, jjString, n.value.N.value.nn].filter(Boolean).join(" ");
      const toDeterminerString = cond([
        [equals('a'), () => ''],
        [equals('the'), () => 'the'],
        [equals('this'), () => 'these'],
        [equals('that'), () => 'those'],
        [T, () => fail('determiner not implemented')]
      ])
      return [toDeterminerString(n.value.D), jjString, n.value.N.value.nns].filter(Boolean).join(' ');
    case "VP":
      if (n.parent.value.NP.value.N.singular)
        return [n.value.V.value.vbz, toString(n.value.NP)].join(" ");
      return [n.value.V.value.vb, toString(n.value.NP)].join(" ");
    default:
      throw new Error("not impl");
  }
}

console.log(toString(makeS()));
