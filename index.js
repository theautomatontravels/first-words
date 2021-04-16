import { range } from "ramda";

import { sample } from "./util.js";
import {
  DeclarativeSentence,
  ConjunctiveSentence,
  ExistentialSentence,
} from "./sentence.js";

function randomSentence() {
  const Sentence = sample([
    ConjunctiveSentence,
    DeclarativeSentence,
    ExistentialSentence,
  ]);
  return new Sentence().contextualize().toSentence();
}

function randomInt(low, high) {
  const d = high + 1 - low;
  const n = Math.floor(d * Math.random());
  return n + low;
}

console.log(
  range(0, randomInt(3, 6))
    .map(() => randomSentence())
    .join(" ")
);
