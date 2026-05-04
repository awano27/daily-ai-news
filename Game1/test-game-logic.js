const assert = require("assert");
const GameLogic = require("./game-logic");

assert.strictEqual(GameLogic.difficulties.length, 3);
assert.strictEqual(GameLogic.subjects.length, 2);
assert.strictEqual(GameLogic.languages.length, 7);
assert.strictEqual(GameLogic.getSubject("math").name, "算数");
assert.strictEqual(GameLogic.getSubject("japanese").name, "国語");
assert.strictEqual(GameLogic.getSubject("math", "en").name, "Math");
assert.strictEqual(GameLogic.getSubject("japanese", "es").name, "Lengua");

const seed = GameLogic.getDifficulty("seed");
const grass = GameLogic.getDifficulty("grass");
const flower = GameLogic.getDifficulty("flower");

assert.strictEqual(seed.spiritName, "ピコ");
assert.strictEqual(grass.spiritName, "モコ");
assert.strictEqual(flower.spiritName, "ルミ");
assert.strictEqual(GameLogic.getDifficulty("seed", "ko").spiritName, "피코");
assert.strictEqual(GameLogic.getDifficulty("flower", "zh").spiritName, "露米");

const seedQuestion = GameLogic.generateQuestion(seed, () => 0);
assert.strictEqual(seedQuestion.operation, "add");
assert.strictEqual(seedQuestion.answer, seedQuestion.left + seedQuestion.right);
assert.ok(seedQuestion.story.includes("せいれい"));
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

const blankQuestion = GameLogic.generateQuestion(seed, () => 0.6);
assert.strictEqual(blankQuestion.type, "blank");
assert.ok(blankQuestion.hintText.includes("□"));

const compareQuestion = GameLogic.generateQuestion(grass, "math", "en", () => 0.25);
assert.strictEqual(compareQuestion.type, "compare");
assert.ok(["Left", "Right", "Same"].includes(compareQuestion.answer));
assert.deepStrictEqual(compareQuestion.choices.slice().sort(), ["Left", "Right", "Same"].sort());

const japaneseQuestion = GameLogic.generateQuestion(seed, "japanese", "ja", () => 0);
assert.strictEqual(japaneseQuestion.subject, "japanese");
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

let round = GameLogic.createRound("seed", () => 0);
round = GameLogic.answerQuestion(round, round.question.answer);
const pointsAfterFirstAnswer = round.earnedPoints;
const streakAfterFirstAnswer = round.currentStreak;
round = GameLogic.answerQuestion(round, round.question.answer);

assert.strictEqual(pointsAfterFirstAnswer, GameLogic.POINTS_PER_CORRECT);
assert.strictEqual(round.earnedPoints, GameLogic.POINTS_PER_CORRECT);
assert.strictEqual(streakAfterFirstAnswer, 1);
assert.strictEqual(round.bestStreak, 1);

const spanishRound = GameLogic.createRound("seed", "japanese", "es", () => 0);
assert.strictEqual(spanishRound.language.id, "es");
assert.strictEqual(spanishRound.subject.name, "Lengua");
assert.strictEqual(spanishRound.question.subject, "japanese");

console.log("game logic tests passed");
