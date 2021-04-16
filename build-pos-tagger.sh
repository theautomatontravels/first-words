# These were the steps I used to build the standford-pos-tagger with the given
# model they recommend. These build steps came from their documentation.
cp stanford-postagger.jar stanford-postagger-withModel.jar
mkdir -p edu/stanford/nlp/models/pos-tagger/english-left3words
cp models/english-left3words-distsim.tagger edu/stanford/nlp/models/pos-tagger/english-left3words
jar -uf stanford-postagger-withModel.jar edu/stanford/nlp/models/pos-tagger/english-left3words/english-left3words-distsim.tagger
