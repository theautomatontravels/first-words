import { range, flatten, head, tail } from "ramda";

import {
  ADJECTIVES,
  COORDINATING_CONJUNCTIONS,
  DETERMINERS,
  INTRANSITIVE_VERBS,
  NOUNS,
  PREPOSITIONS,
  TRANSITIVE_VERBS,
  VERBS,
} from "./words.js";
import { assert, capitalize, fail, sample } from "./util.js";

class Node {
  constructor() {
    this.leaf = false;
    this.parent = null;
    this.value = null;
  }

  contextualize() {
    if (!this.value)
      fail("`Node` needs to have a value to be contextualized", this);
    flatten(Object.values(this.value)).forEach((c) => {
      c.parent = this;
      if (c.leaf) return;
      c.contextualize();
    });
    return this;
  }

  at(...path) {
    if (!path.length) return this;
    const h = head(path);
    const t = tail(path);
    if (h === "parent") return this.parent.at(...t);
    return this.value[h].at(...t);
  }

  toString() {
    fail(`'toString' not implemented for ${this.constructor.name}`);
  }
}

class Determiner extends Node {
  constructor() {
    super();
    this.leaf = true;
    this.value = sample(DETERMINERS);
  }

  #toStringAOrAn() {
    assert(this.at("parent") instanceof NounPhrase);
    const JJ = this.at("parent", "JJ");
    const N = this.at("parent", "N");
    if (
      ["a", "e", "i", "o", "u"].some((l) =>
        (JJ.toString() || N.toString()).startsWith(l)
      )
    )
      return "an";
    return "a";
  }

  #toStringSingular() {
    switch (this.value) {
      case "a":
        return this.#toStringAOrAn();
      default:
        return this.value;
    }
  }

  #toStringPlural() {
    switch (this.value) {
      case "a":
        return "";
      case "this":
        return "these";
      case "that":
        return "those";
      default:
        return this.value;
    }
  }

  toString() {
    const N = this.at("parent", "N");
    if (N.singular) return this.#toStringSingular();
    return this.#toStringPlural();
  }
}

class Noun extends Node {
  constructor() {
    super();
    this.leaf = true;
    this.singular = sample([true, false]);
    this.value = sample(NOUNS);
  }

  toString() {
    if (this.singular) return this.value.nn;
    return this.value.nns;
  }
}

class Adjective extends Node {
  constructor() {
    super();
    this.leaf = true;
    this.value = [];
  }

  add() {
    this.value.push(sample(ADJECTIVES));
  }

  toString() {
    return this.value.join(", ");
  }
}

class CoordinatingConjunction extends Node {
  constructor() {
    super();
    this.leaf = true;
    this.value = sample(COORDINATING_CONJUNCTIONS);
  }

  toString() {
    return this.value;
  }
}

class Preposition extends Node {
  constructor() {
    super();
    this.leaf = true;
    this.value = sample(PREPOSITIONS);
  }

  toString() {
    return this.value;
  }
}

class Verb extends Node {
  constructor({ negated = false, transitivity = "" } = {}) {
    super();
    this.leaf = true;
    this.negated = negated;
    this.value = sample(
      transitivity === "transitive"
        ? TRANSITIVE_VERBS
        : transitivity === "intransitive"
        ? INTRANSITIVE_VERBS
        : VERBS
    );
  }

  negate() {
    this.negated = !this.negated;
    return this;
  }

  toString() {
    const refN = this.at("parent", "parent", "NP", "N");
    if (this.at("parent", "parent").precedingAuxiliaryDo) return this.value.vb;
    if (this.negated) return this.value.vb;
    if (refN.singular) return this.value.vbz;
    return this.value.vb;
  }
}

class PrepositionalPhrase extends Node {
  constructor() {
    super();
    this.value = {
      P: new Preposition(),
      NP: new NounPhrase(),
    };
  }

  toString() {
    const { P, NP } = this.value;
    return [P, NP].join(" ");
  }
}

class NounPhrase extends Node {
  constructor({ PP } = {}) {
    super();
    this.value = {
      DT: new Determiner(),
      JJ: new Adjective(),
      N: new Noun(),
    };
    if (PP) this.value.PP = PP;
  }

  addJJ() {
    this.value.JJ.add();
    return this;
  }

  // #toStringPP() {
  //   const { DT, JJ, N, PP } = this.value;
  //   assert(PP);
  //   switch (DT.value) {
  //     case "this":
  //     case "that":
  //       return [JJ.toString(), N.toString()];
  //     default:
  //       return [DT.toString(), JJ.toString(), N.toString(), PP.toString()]
  //         .filter(Boolean)
  //         .join(" ");
  //   }
  // }

  toString() {
    const { DT, JJ, N, PP } = this.value;
    // if (PP) return this.#toStringPP();
    return [DT.toString(), JJ.toString(), N.toString(), PP?.toString()]
      .filter(Boolean)
      .join(" ");
  }
}

class VerbPhrase extends Node {
  constructor({ negated = false } = {}) {
    super();
    const transitivity = sample(["transitive", "intransitive"]);
    this.value = {
      V: new Verb({ negated, transitivity }),
    };
    if (transitivity === "transitive") this.value.NP = new NounPhrase();
  }

  toString() {
    const objectN = this.at("parent", "NP", "N");
    const { V, NP } = this.value;
    if (V.negated)
      return [objectN.singular ? "does not" : "do not", V, NP].join(" ");
    return [V, NP].filter(Boolean).join(" ");
  }
}

export class ExistentialSentence extends Node {
  constructor() {
    super();
    this.value = {
      NP: new NounPhrase(),
    };
  }

  toSentence() {
    const N = this.at("NP", "N");
    return ["There", N.singular ? "is" : "are", this.value.NP].join(" ") + ".";
  }
}

export class DeclarativeSentence extends Node {
  constructor({ precedingAuxiliaryDo = false, negated = false } = {}) {
    super();
    this.precedingAuxiliaryDo = precedingAuxiliaryDo;
    this.value = {
      NP: range(0, sample([0, 1, 2])).reduce(
        (np) => np.addJJ(),
        new NounPhrase({
          PP: sample([undefined, new PrepositionalPhrase()]),
        })
      ),
      VP: new VerbPhrase({ negated }),
    };
  }

  toString() {
    return [
      this.precedingAuxiliaryDo &&
        (this.value.NP.value.N.singular ? "does" : "do"),
      this.value.NP,
      this.value.VP,
    ]
      .filter(Boolean)
      .join(" ");
  }

  toSentence() {
    return `${capitalize(this.value.NP)} ${this.value.VP}.`;
  }
}

export class ConjunctiveSentence extends Node {
  constructor() {
    super();
    const CC = new CoordinatingConjunction();
    const instructions = this.#getDeclarativeSentenceInstructions(CC);
    this.value = {
      CC,
      LHS: new DeclarativeSentence(instructions.LHS),
      RHS: new DeclarativeSentence(instructions.RHS),
    };
  }

  #getDeclarativeSentenceInstructions(CC) {
    const LHS = {
      negated: false,
      precedingAuxiliaryDo: false,
    };
    const RHS = {
      negated: false,
    };
    switch (CC.value) {
      case "and":
      case "or":
      case "for":
        break;
      case "nor":
        LHS.negated = true;
        RHS.precedingAuxiliaryDo = true;
        break;
      case "yet":
      case "but":
        RHS.negated = true;
        break;
      // TODO This requires the past tense I think
      // case "so":
      default:
        fail(
          "Coordinating Conjunction contextualization not implemented.",
          this
        );
    }
    return {
      LHS,
      RHS,
    };
  }

  toSentence() {
    const { LHS, CC, RHS } = this.value;
    return `${capitalize(LHS)}, ${CC} ${RHS}.`;
  }
}
