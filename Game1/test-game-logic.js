const assert = require("assert");
const GameLogic = require("./game-logic");

assert.strictEqual(GameLogic.difficulties.length, 3);

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

assert.strictEqual(GameLogic.isCorrectAnswer(seedQuestion, seedQuestion.answer), true);
assert.strictEqual(GameLogic.isCorrectAnswer(seedQuestion, seedQuestion.answer + 1), false);
assert.strictEqual(GameLogic.isCorrectAnswer(compareQuestion, compareQuestion.answer), true);
assert.strictEqual(GameLogic.isCorrectAnswer(compareQuestion, "ちがう"), false);
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

console.log("game logic tests passed");
