const assert = require("assert");
const GameLogic = require("./game-logic");

assert.strictEqual(GameLogic.difficulties.length, 7);
assert.strictEqual(GameLogic.subjects.length, 2);
assert.strictEqual(GameLogic.languages.length, 7);
assert.strictEqual(GameLogic.getSubject("math").name, "算数");
assert.strictEqual(GameLogic.getSubject("japanese").name, "国語");
assert.strictEqual(GameLogic.getSubject("math", "en").name, "Math");
assert.strictEqual(GameLogic.getSubject("japanese", "es").name, "Lengua");

const seed = GameLogic.getDifficulty("seed");
const grass = GameLogic.getDifficulty("grass");
const flower = GameLogic.getDifficulty("flower");
const sky = GameLogic.getDifficulty("sky");
const moon = GameLogic.getDifficulty("moon");
const comet = GameLogic.getDifficulty("comet");
const star = GameLogic.getDifficulty("star");

assert.strictEqual(seed.spiritName, "ピコ");
assert.strictEqual(grass.spiritName, "モコ");
assert.strictEqual(flower.spiritName, "ルミ");
assert.strictEqual(sky.spiritName, "ソラ");
assert.strictEqual(GameLogic.getDifficulty("seed", "ko").spiritName, "피코");
assert.strictEqual(GameLogic.getDifficulty("flower", "zh").spiritName, "露米");
assert.strictEqual(GameLogic.getDifficulty("sky", "en").spiritName, "Sora");
assert.strictEqual(moon.id, "moon");
assert.strictEqual(comet.id, "comet");
assert.strictEqual(star.id, "star");
assert.strictEqual(GameLogic.getDifficulty("moon", "en").gradeLabel, "Grade 7");
assert.strictEqual(GameLogic.getDifficulty("comet", "en").gradeLabel, "Grade 8");
assert.strictEqual(GameLogic.getDifficulty("star", "en").spiritName, "Sena");

const seedQuestion = GameLogic.generateQuestion(seed, () => 0);
assert.strictEqual(seedQuestion.operation, "add");
assert.strictEqual(seedQuestion.answer, seedQuestion.left + seedQuestion.right);
assert.ok(seedQuestion.signature.startsWith("math:"));
assert.strictEqual(GameLogic.getQuestionSignature(seedQuestion), seedQuestion.signature);
assert.ok(seedQuestion.story.includes("小川"));
assert.ok(seedQuestion.explanation.includes("一歩進める"));
assert.ok(seedQuestion.choices.includes(seedQuestion.answer));
assert.ok(seedQuestion.hint);
assert.ok(seedQuestion.explanation);
assert.ok(seedQuestion.hintText);

const grassQuestion = GameLogic.generateQuestion(grass, () => 0);
assert.strictEqual(grassQuestion.type, "word");
assert.strictEqual(typeof grassQuestion.answer, "number");
assert.ok(grassQuestion.story.length > 0);

const flowerQuestion = GameLogic.generateQuestion(flower, () => 0);
assert.strictEqual(flowerQuestion.type, "twoStep");
assert.strictEqual(typeof flowerQuestion.answer, "number");

const parenthesesQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.32);
assert.strictEqual(parenthesesQuestion.type, "parentheses");
assert.strictEqual(typeof parenthesesQuestion.answer, "number");
assert.ok(parenthesesQuestion.text.includes("("));

const remainderQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.39);
assert.strictEqual(remainderQuestion.type, "remainder");
assert.strictEqual(typeof remainderQuestion.answer, "string");
assert.ok(remainderQuestion.answer.includes("R"));

const timeQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.45);
assert.strictEqual(timeQuestion.type, "time");
assert.strictEqual(typeof timeQuestion.answer, "string");
assert.ok(timeQuestion.answer.includes(":"));

const moneyQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.51);
assert.strictEqual(moneyQuestion.type, "money");
assert.strictEqual(typeof moneyQuestion.answer, "number");

const unitQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.57);
assert.strictEqual(unitQuestion.type, "unit");
assert.strictEqual(typeof unitQuestion.answer, "number");

const fractionQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.64);
assert.strictEqual(fractionQuestion.type, "fraction");
assert.strictEqual(typeof fractionQuestion.answer, "number");
assert.ok(fractionQuestion.text.includes("1/"));

const areaQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.7);
assert.strictEqual(areaQuestion.type, "area");
assert.strictEqual(typeof areaQuestion.answer, "number");

const perimeterQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.76);
assert.strictEqual(perimeterQuestion.type, "perimeter");
assert.strictEqual(typeof perimeterQuestion.answer, "number");

const sequenceQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.82);
assert.strictEqual(sequenceQuestion.type, "sequence");
assert.strictEqual(typeof sequenceQuestion.answer, "number");

const roundingQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.89);
assert.strictEqual(roundingQuestion.type, "rounding");
assert.strictEqual(typeof roundingQuestion.answer, "number");

const multiStepWordQuestion = GameLogic.generateQuestion(flower, "math", "en", () => 0.95);
assert.strictEqual(multiStepWordQuestion.type, "multiStepWord");
assert.strictEqual(typeof multiStepWordQuestion.answer, "number");

const upperMathSamples = [
  [0, "decimal", "number"],
  [0.12, "fractionAdd", "string"],
  [0.23, "percent", "number"],
  [0.34, "average", "number"],
  [0.45, "speed", "number"],
  [0.56, "volume", "number"],
  [0.67, "ratio", "number"],
];
upperMathSamples.forEach(([randomValue, expectedType, answerType]) => {
  const question = GameLogic.generateQuestion(sky, "math", "en", () => randomValue);
  assert.strictEqual(question.type, expectedType);
  assert.strictEqual(typeof question.answer, answerType);
  assert.strictEqual(question.choices.length, 4);
  assert.ok(question.choices.includes(question.answer));
  assert.ok(question.hint);
  assert.ok(question.explanation);
});

const juniorHighMathSamples = [
  [moon, 0, "signedNumber", "number"],
  [moon, 0.26, "simpleEquation", "number"],
  [moon, 0.51, "algebraValue", "number"],
  [moon, 0.76, "proportional", "number"],
  [comet, 0, "simultaneous", "number"],
  [comet, 0.17, "linearFunction", "number"],
  [comet, 0.34, "angle", "number"],
  [comet, 0.51, "expressionExpand", "string"],
  [comet, 0.68, "probability", "string"],
  [comet, 0.85, "similarity", "number"],
  [star, 0, "linearEquation", "number"],
  [star, 0.13, "factorization", "string"],
  [star, 0.26, "quadratic", "number"],
  [star, 0.39, "pythagorean", "number"],
  [star, 0.51, "functionValue", "number"],
  [star, 0.64, "similarity", "number"],
  [star, 0.76, "probability", "string"],
  [star, 0.89, "squareRoot", "number"],
];
juniorHighMathSamples.forEach(([difficulty, randomValue, expectedType, answerType]) => {
  const question = GameLogic.generateQuestion(difficulty, "math", "en", () => randomValue);
  assert.strictEqual(question.type, expectedType);
  assert.strictEqual(typeof question.answer, answerType);
  assert.strictEqual(question.choices.length, 4);
  assert.ok(question.choices.includes(question.answer));
  assert.ok(question.signature.startsWith(`math:${expectedType}:`));
  assert.ok(question.hint);
  assert.ok(question.explanation);
});

const skyLanguageQuestion = GameLogic.generateQuestion(sky, "japanese", "ja", () => 0);
assert.strictEqual(skyLanguageQuestion.subject, "japanese");
assert.ok(skyLanguageQuestion.story.includes("つなぎ言葉"));
assert.ok(skyLanguageQuestion.choices.includes(skyLanguageQuestion.answer));

const starLanguageQuestion = GameLogic.generateQuestion(star, "japanese", "ja", () => 0);
assert.strictEqual(starLanguageQuestion.subject, "japanese");
assert.ok(starLanguageQuestion.signature.startsWith("japanese:"));
assert.ok(starLanguageQuestion.choices.includes(starLanguageQuestion.answer));

const moonLanguageQuestion = GameLogic.generateQuestion(moon, "japanese", "ja", () => 0);
assert.strictEqual(moonLanguageQuestion.subject, "japanese");
assert.ok(moonLanguageQuestion.choices.includes(moonLanguageQuestion.answer));

const cometLanguageQuestion = GameLogic.generateQuestion(comet, "japanese", "ja", () => 0);
assert.strictEqual(cometLanguageQuestion.subject, "japanese");
assert.ok(cometLanguageQuestion.choices.includes(cometLanguageQuestion.answer));

const blankQuestion = GameLogic.generateQuestion(seed, () => 0.6);
assert.strictEqual(blankQuestion.type, "blank");
assert.ok(blankQuestion.hintText.includes("□"));

const compareQuestion = GameLogic.generateQuestion(grass, "math", "en", () => 0.25);
assert.strictEqual(compareQuestion.type, "compare");
assert.ok(["Left", "Right", "Same"].includes(compareQuestion.answer));
assert.deepStrictEqual(compareQuestion.choices.slice().sort(), ["Left", "Right", "Same"].sort());

const japaneseQuestion = GameLogic.generateQuestion(seed, "japanese", "ja", () => 0);
assert.strictEqual(japaneseQuestion.subject, "japanese");
assert.ok(japaneseQuestion.signature.startsWith("japanese:"));
assert.ok(japaneseQuestion.story.includes("ことばのたね"));
assert.ok(japaneseQuestion.choices.includes(japaneseQuestion.answer));
assert.ok(japaneseQuestion.hintText);

const englishLanguageQuestion = GameLogic.generateQuestion(seed, "japanese", "en", () => 0);
assert.strictEqual(englishLanguageQuestion.subject, "japanese");
assert.ok(englishLanguageQuestion.story.includes("cat"));
assert.ok(englishLanguageQuestion.choices.includes(englishLanguageQuestion.answer));

const koreanMathQuestion = GameLogic.generateQuestion(seed, "math", "ko", () => 0);
assert.ok(koreanMathQuestion.story.includes("정령"));

assert.strictEqual(GameLogic.isCorrectAnswer(seedQuestion, seedQuestion.answer), true);
assert.strictEqual(GameLogic.isCorrectAnswer(seedQuestion, seedQuestion.answer + 1), false);
assert.strictEqual(GameLogic.isCorrectAnswer(compareQuestion, compareQuestion.answer), true);
assert.strictEqual(GameLogic.isCorrectAnswer(compareQuestion, "Wrong"), false);
assert.strictEqual(GameLogic.calculatePoints(20, true), 30);
assert.strictEqual(GameLogic.calculatePoints(20, false), 20);
assert.strictEqual(GameLogic.getSpiritGrowthLevel(0), 1);
assert.strictEqual(GameLogic.getSpiritGrowthLevel(3), 2);
assert.strictEqual(GameLogic.getSpiritGrowthLevel(7), 3);
assert.strictEqual(GameLogic.getSpiritGrowthLevel(12), 4);
assert.strictEqual(GameLogic.getSpiritGrowthLevel(18), 5);
assert.strictEqual(GameLogic.getUnlockedMapStep(0), 0);
assert.strictEqual(GameLogic.getUnlockedMapStep(5), 1);
assert.strictEqual(GameLogic.getUnlockedMapStep(99), 4);

const emptyAdventure = GameLogic.createEmptyAdventure();
assert.strictEqual(emptyAdventure.totalCorrect, 0);
assert.strictEqual(emptyAdventure.mapStep, 0);
assert.deepStrictEqual(emptyAdventure.recentQuestionSignatures, []);
assert.strictEqual(emptyAdventure.spirits.seed.met, false);
assert.strictEqual(emptyAdventure.spirits.sky.level, 1);
assert.strictEqual(emptyAdventure.spirits.moon.level, 1);
assert.strictEqual(emptyAdventure.spirits.comet.level, 1);
assert.strictEqual(emptyAdventure.spirits.star.level, 1);

const adventureWithRecent = GameLogic.createEmptyAdventure({ recentQuestionSignatures: Array.from({ length: 25 }, (_, index) => `q${index}`) });
assert.strictEqual(adventureWithRecent.recentQuestionSignatures.length, 20);
assert.strictEqual(adventureWithRecent.recentQuestionSignatures[0], "q5");

const afterWrongAdventure = GameLogic.applyAdventureAnswer(emptyAdventure, "seed", false);
assert.strictEqual(afterWrongAdventure.totalCorrect, 0);
assert.strictEqual(afterWrongAdventure.spirits.seed.growth, 0);

let afterCorrectAdventure = emptyAdventure;
for (let index = 0; index < 7; index += 1) {
  afterCorrectAdventure = GameLogic.applyAdventureAnswer(afterCorrectAdventure, "seed", true);
}
assert.strictEqual(afterCorrectAdventure.totalCorrect, 7);
assert.strictEqual(afterCorrectAdventure.mapStep, 1);
assert.strictEqual(afterCorrectAdventure.spirits.seed.met, true);
assert.strictEqual(afterCorrectAdventure.spirits.seed.growth, 7);
assert.strictEqual(afterCorrectAdventure.spirits.seed.level, 3);

const legacyAdventure = GameLogic.createEmptyAdventure({ spirits: { seed: { met: true, growth: 18 } } });
assert.strictEqual(legacyAdventure.spirits.seed.level, 5);
assert.strictEqual(legacyAdventure.spirits.seed.growth, 18);

let round = GameLogic.createRound("seed", () => 0);
assert.strictEqual(round.usedQuestionSignatures.length, 1);
const firstRoundSignature = round.question.signature;
round = GameLogic.answerQuestion(round, round.question.answer);
const pointsAfterFirstAnswer = round.earnedPoints;
const streakAfterFirstAnswer = round.currentStreak;
round = GameLogic.answerQuestion(round, round.question.answer);

assert.strictEqual(pointsAfterFirstAnswer, GameLogic.POINTS_PER_CORRECT);
assert.strictEqual(round.earnedPoints, GameLogic.POINTS_PER_CORRECT);
assert.strictEqual(streakAfterFirstAnswer, 1);
assert.strictEqual(round.bestStreak, 1);

const nextAvoidingRound = GameLogic.nextQuestion(round, () => 0);
assert.notStrictEqual(nextAvoidingRound.question.signature, firstRoundSignature);
assert.ok(nextAvoidingRound.usedQuestionSignatures.includes(firstRoundSignature));
assert.ok(nextAvoidingRound.usedQuestionSignatures.includes(nextAvoidingRound.question.signature));

const avoidedQuestion = GameLogic.generateQuestionAvoiding(seed, "math", "en", () => 0, [firstRoundSignature]);
assert.notStrictEqual(avoidedQuestion.signature, firstRoundSignature);

const exhaustedQuestion = GameLogic.generateQuestionAvoiding(seed, "math", "en", () => 0, Array.from({ length: 100 }, (_, index) => `used-${index}`));
assert.ok(exhaustedQuestion.signature);

const spanishRound = GameLogic.createRound("seed", "japanese", "es", () => 0);
assert.strictEqual(spanishRound.language.id, "es");
assert.strictEqual(spanishRound.subject.name, "Lengua");
assert.strictEqual(spanishRound.question.subject, "japanese");
assert.ok(spanishRound.question.signature);

console.log("game logic tests passed");
