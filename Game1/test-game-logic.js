const assert = require("assert");
const GameLogic = require("./game-logic");

assert.strictEqual(GameLogic.difficulties.length, 3);
assert.strictEqual(GameLogic.subjects.length, 2);
assert.strictEqual(GameLogic.getSubject("math").name, "算数");
assert.strictEqual(GameLogic.getSubject("japanese").name, "国語");

const seed = GameLogic.difficulties.find((item) => item.id === "seed");
const grass = GameLogic.difficulties.find((item) => item.id === "grass");
const flower = GameLogic.difficulties.find((item) => item.id === "flower");

assert.strictEqual(seed.spiritName, "ピコ");
assert.strictEqual(grass.spiritName, "モコ");
assert.strictEqual(flower.spiritName, "ルミ");

const seedQuestion = GameLogic.generateQuestion(seed, () => 0);
assert.strictEqual(seedQuestion.operation, "add");
assert.strictEqual(seedQuestion.answer, seedQuestion.left + seedQuestion.right);
assert.strictEqual(seedQuestion.story.includes("ぜんぶで なんこ"), true);
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

const compareQuestion = GameLogic.generateQuestion(grass, () => 0.45);
assert.strictEqual(compareQuestion.type, "compare");
assert.ok(["左", "右", "おなじ"].includes(compareQuestion.answer));
assert.deepStrictEqual(compareQuestion.choices.slice().sort(), ["おなじ", "右", "左"].sort());

const kanjiQuestion = GameLogic.generateQuestion(seed, "japanese", () => 0);
assert.strictEqual(kanjiQuestion.subject, "japanese");
assert.strictEqual(kanjiQuestion.type, "kanjiReading");
assert.strictEqual(kanjiQuestion.answer, "やま");
assert.ok(kanjiQuestion.choices.includes("やま"));
assert.ok(kanjiQuestion.hintText.includes("読み"));

const wordQuestion = GameLogic.generateQuestion(grass, "japanese", () => 0);
assert.strictEqual(wordQuestion.type, "synonymAntonym");
assert.strictEqual(typeof wordQuestion.answer, "string");
assert.ok(wordQuestion.choices.includes(wordQuestion.answer));

const readingQuestion = GameLogic.generateQuestion(flower, "japanese", () => 0);
assert.strictEqual(readingQuestion.type, "reading");
assert.ok(readingQuestion.story.includes("？"));

assert.strictEqual(GameLogic.isCorrectAnswer(seedQuestion, seedQuestion.answer), true);
assert.strictEqual(GameLogic.isCorrectAnswer(seedQuestion, seedQuestion.answer + 1), false);
assert.strictEqual(GameLogic.isCorrectAnswer(compareQuestion, compareQuestion.answer), true);
assert.strictEqual(GameLogic.isCorrectAnswer(compareQuestion, "ちがう"), false);
assert.strictEqual(GameLogic.isCorrectAnswer(kanjiQuestion, "やま"), true);
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

let japaneseRound = GameLogic.createRound("seed", "japanese", () => 0);
assert.strictEqual(japaneseRound.subject.id, "japanese");
assert.strictEqual(japaneseRound.question.subject, "japanese");

console.log("game logic tests passed");
