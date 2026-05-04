(function (global) {
  "use strict";

  const POINTS_PER_CORRECT = 10;
  const QUESTION_COUNT = 5;

  const difficulties = [
    {
      id: "seed",
      spiritName: "ピコ",
      gradeLabel: "小1〜2",
      label: "たし算・ひき算",
      description: "小さなたねのせいれい",
      reward: "きらきらの たね",
      operations: ["add", "subtract"],
      questionTypes: ["straight", "straight", "blank", "word"],
    },
    {
      id: "grass",
      spiritName: "モコ",
      gradeLabel: "小3",
      label: "かけ算中心",
      description: "ふわふわの花のせいれい",
      reward: "ふわふわの 花びら",
      operations: ["multiply", "multiply", "divide"],
      questionTypes: ["word", "word", "compare", "blank", "twoStep", "straight"],
    },
    {
      id: "flower",
      spiritName: "ルミ",
      gradeLabel: "小4",
      label: "大きめ計算",
      description: "光る木の葉のせいれい",
      reward: "ひかる 木の葉",
      operations: ["largeMultiply", "largeDivide", "mixed"],
      questionTypes: ["twoStep", "twoStep", "word", "compare", "blank", "straight"],
    },
  ];

  function randomInt(min, max, randomFn) {
    return Math.floor(randomFn() * (max - min + 1)) + min;
  }

  function choose(values, randomFn) {
    return values[Math.floor(randomFn() * values.length)];
  }

  function shuffle(values, randomFn) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(randomFn() * (index + 1));
      const current = result[index];
      result[index] = result[swapIndex];
      result[swapIndex] = current;
    }
    return result;
  }

  function buildChoices(answer, randomFn, traps = []) {
    if (typeof answer !== "number") {
      return shuffle(["左", "右", "おなじ"], randomFn);
    }

    const choices = new Set([answer]);
    traps.forEach((trap) => {
      if (Number.isFinite(trap) && trap >= 0) {
        choices.add(trap);
      }
    });
    let offset = 1;

    while (choices.size < 4) {
      choices.add(Math.max(0, answer + offset));
      if (choices.size < 4) {
        choices.add(Math.max(0, answer - offset));
      }
      offset += randomInt(1, Math.max(2, Math.ceil(answer / 12)), randomFn);
    }

    return shuffle(Array.from(choices).slice(0, 4), randomFn);
  }

  function withDetails(question, type, hint, explanation, hintText) {
    return {
      ...question,
      type,
      hint,
      explanation,
      hintText: hintText || `${question.text} = ?`,
    };
  }

  function makeAddQuestion(randomFn) {
    const left = randomInt(8, 60, randomFn);
    const right = randomInt(2, Math.max(2, 100 - left), randomFn);
    return withDetails({
      left,
      right,
      answer: left + right,
      text: `${left} + ${right}`,
      story: `このせいれいが 光のたねを ${left}こ もっているよ。マルップが ${right}こ 見つけたら、ぜんぶで なんこ？`,
      operation: "add",
    }, "straight", "たすときは、2つの数を あわせるよ。", `${left}こと ${right}こを あわせると ${left + right}こだよ。`);
  }

  function makeSubtractQuestion(randomFn) {
    const left = randomInt(20, 100, randomFn);
    const right = randomInt(1, left - 1, randomFn);
    return withDetails({
      left,
      right,
      answer: left - right,
      text: `${left} - ${right}`,
      story: `このせいれいが たねを ${left}こ ならべたよ。${right}こ を かごに入れたら、のこりは なんこ？`,
      operation: "subtract",
    }, "straight", "ひくときは、へった数を たしかめよう。", `${left}こから ${right}こを ひくと ${left - right}こだよ。`);
  }

  function makeMultiplyQuestion(randomFn) {
    const left = randomInt(2, 9, randomFn);
    const right = randomInt(2, 9, randomFn);
    return withDetails({
      left,
      right,
      answer: left * right,
      text: `${left} × ${right}`,
      story: `${left}こ の草むらに、たねが ${right}こずつ あるよ。ぜんぶで なんこ？`,
      operation: "multiply",
    }, "straight", "同じ数が 何グループあるか 見てみよう。", `${right}こずつが ${left}グループで ${left * right}こだよ。`);
  }

  function makeDivideQuestion(randomFn) {
    const right = randomInt(2, 9, randomFn);
    const answer = randomInt(2, 9, randomFn);
    const left = right * answer;
    return withDetails({
      left,
      right,
      answer,
      text: `${left} ÷ ${right}`,
      story: `${left}この たねを ${right}つの草むらに 同じ数ずつ わけるよ。1つに なんこ？`,
      operation: "divide",
    }, "straight", "同じ数ずつ わけるときは、1つ分を 考えよう。", `${left}こを ${right}つに わけると、1つは ${answer}こだよ。`);
  }

  function makeLargeMultiplyQuestion(randomFn) {
    const left = randomInt(10, 20, randomFn);
    const right = randomInt(2, 9, randomFn);
    return withDetails({
      left,
      right,
      answer: left * right,
      text: `${left} × ${right}`,
      story: `はなの光が ${left}こずつ、${right}列に ならんだよ。ぜんぶで なんこ？`,
      operation: "largeMultiply",
    }, "straight", "大きい数も、かけ算の形で 見ると考えやすいよ。", `${left}こずつが ${right}列で ${left * right}こだよ。`);
  }

  function makeLargeDivideQuestion(randomFn) {
    const right = randomInt(3, 9, randomFn);
    const answer = randomInt(6, 15, randomFn);
    const left = right * answer;
    return withDetails({
      left,
      right,
      answer,
      text: `${left} ÷ ${right}`,
      story: `${left}この 光を ${right}つの花に 同じ数ずつ わけるよ。1つに なんこ？`,
      operation: "largeDivide",
    }, "straight", "何をかけたら 元の数になるか 考えてみよう。", `${right} × ${answer} = ${left} だから、答えは ${answer}だよ。`);
  }

  function makeMixedQuestion(randomFn) {
    const first = randomInt(2, 9, randomFn);
    const second = randomInt(2, 9, randomFn);
    const third = randomInt(2, 5, randomFn);
    return withDetails({
      left: first,
      right: second,
      extra: third,
      answer: (first + second) * third,
      text: `(${first} + ${second}) × ${third}`,
      story: `${first}こと ${second}この 光を まとめて、${third}つの花に とどけるよ。ぜんぶで なんこ分？`,
      operation: "mixed",
    }, "straight", "かっこの中を 先に計算しよう。", `${first} + ${second} = ${first + second}、それを ${third}倍して ${(first + second) * third}だよ。`);
  }

  function makeBlankQuestion(difficulty, randomFn) {
    const operation = choose(difficulty.id === "seed" ? ["add", "subtract"] : difficulty.operations, randomFn);

    if (operation === "subtract") {
      const result = randomInt(4, 30, randomFn);
      const right = randomInt(2, 20, randomFn);
      const left = result + right;
      return withDetails({
        left,
        right,
        answer: left,
        text: `□ - ${right}`,
        story: `□に入る数を えらぼう。□ - ${right} = ${result} になるよ。`,
        operation,
      }, "blank", "ひく前の数を さがすときは、答えに ひいた数を たしてみよう。", `${result} + ${right} = ${left} だから、□は ${left}だよ。`, `□ - ${right} = ${result}`);
    }

    if (operation === "multiply" || operation === "largeMultiply") {
      const left = operation === "largeMultiply" ? randomInt(10, 14, randomFn) : randomInt(2, 9, randomFn);
      const answer = randomInt(2, 9, randomFn);
      const total = left * answer;
      return withDetails({
        left,
        right: answer,
        answer,
        text: `${left} × □`,
        story: `□に入る数を えらぼう。${left} × □ = ${total} になるよ。`,
        operation,
      }, "blank", `${left}のだんで ${total}になるところを さがそう。`, `${left} × ${answer} = ${total} だから、□は ${answer}だよ。`, `${left} × □ = ${total}`);
    }

    const left = randomInt(3, difficulty.id === "seed" ? 12 : 30, randomFn);
    const answer = randomInt(2, difficulty.id === "seed" ? 12 : 40, randomFn);
    const total = left + answer;
    return withDetails({
      left,
      right: answer,
      answer,
      text: `${left} + □`,
      story: `□に入る数を えらぼう。${left} + □ = ${total} になるよ。`,
      operation: "add",
    }, "blank", "足りない数は、ぜんぶの数から わかっている数を ひくと見つかるよ。", `${total} - ${left} = ${answer} だから、□は ${answer}だよ。`, `${left} + □ = ${total}`);
  }

  function makeWordQuestion(difficulty, randomFn) {
    const operation = choose(difficulty.id === "seed" ? ["add", "subtract"] : difficulty.operations, randomFn);

    if (operation === "subtract") {
      const left = randomInt(8, 30, randomFn);
      const right = randomInt(2, left - 2, randomFn);
      return withDetails({
        left,
        right,
        answer: left - right,
        text: `${left} - ${right}`,
        story: `おにぎりが ${left}こ あります。${right}こ たべたら、のこりは いくつですか？`,
        operation,
      }, "word", "のこりを聞かれたら、ひき算で考えよう。", `${left} - ${right} = ${left - right}。のこりは ${left - right}こだよ。`);
    }

    if (operation === "multiply" || operation === "largeMultiply") {
      const groups = operation === "largeMultiply" ? randomInt(6, 12, randomFn) : randomInt(2, 9, randomFn);
      const each = randomInt(2, 9, randomFn);
      return withDetails({
        left: groups,
        right: each,
        answer: groups * each,
        text: `${groups} × ${each}`,
        story: `花だんが ${groups}つ あります。ひとつの花だんに 花が ${each}こずつ さいています。ぜんぶで いくつですか？`,
        operation,
      }, "word", "同じ数ずつあるときは、かけ算で考えよう。", `${each}こずつが ${groups}つで ${groups * each}こだよ。`);
    }

    if (operation === "divide" || operation === "largeDivide") {
      const right = randomInt(2, 9, randomFn);
      const answer = randomInt(operation === "largeDivide" ? 6 : 2, operation === "largeDivide" ? 14 : 9, randomFn);
      const left = right * answer;
      return withDetails({
        left,
        right,
        answer,
        text: `${left} ÷ ${right}`,
        story: `クッキーが ${left}こ あります。${right}人で 同じ数ずつ わけると、ひとり いくつですか？`,
        operation,
      }, "word", "同じ数ずつ わけるときは、わり算で考えよう。", `${left} ÷ ${right} = ${answer}。ひとり ${answer}こだよ。`);
    }

    const red = randomInt(3, difficulty.id === "seed" ? 12 : 30, randomFn);
    const white = randomInt(2, difficulty.id === "seed" ? 12 : 30, randomFn);
    return withDetails({
      left: red,
      right: white,
      answer: red + white,
      text: `${red} + ${white}`,
      story: `赤いボールが ${red}こ、白いボールが ${white}こ あります。ぜんぶで いくつですか？`,
      operation: "add",
    }, "word", "ぜんぶの数を聞かれたら、たし算で考えよう。", `${red} + ${white} = ${red + white}。ぜんぶで ${red + white}こだよ。`);
  }

  function makeCompareQuestion(difficulty, randomFn) {
    const max = difficulty.id === "flower" ? 50 : 20;
    const leftA = randomInt(2, max, randomFn);
    const leftB = randomInt(2, max, randomFn);
    const rightA = randomInt(2, max, randomFn);
    const rightB = randomInt(2, max, randomFn);
    const leftTotal = leftA + leftB;
    const rightTotal = rightA + rightB;
    const answer = leftTotal === rightTotal ? "おなじ" : leftTotal > rightTotal ? "左" : "右";
    return withDetails({
      left: leftTotal,
      right: rightTotal,
      answer,
      text: `${leftA} + ${leftB} と ${rightA} + ${rightB}`,
      story: `「${leftA} + ${leftB}」と「${rightA} + ${rightB}」では、どちらが大きいですか？`,
      operation: "compare",
    }, "compare", "左右をそれぞれ計算してから、くらべよう。", `左は ${leftTotal}、右は ${rightTotal}。だから答えは「${answer}」だよ。`, "左・右・おなじ からえらぼう");
  }

  function makeTwoStepQuestion(difficulty, randomFn) {
    if (difficulty.id === "grass") {
      const first = randomInt(2, 9, randomFn);
      const second = randomInt(2, 9, randomFn);
      const third = randomInt(2, 9, randomFn);
      return withDetails({
        left: first,
        right: second,
        extra: third,
        answer: first + second + third,
        text: `${first} + ${second} + ${third}`,
        story: `たねを ${first}こ、${second}こ、${third}こ 見つけました。ぜんぶで いくつですか？`,
        operation: "twoStepAdd",
      }, "twoStep", "左からじゅんに、2回たしてみよう。", `${first} + ${second} = ${first + second}、${first + second} + ${third} = ${first + second + third}だよ。`);
    }

    const first = randomInt(18, 50, randomFn);
    const second = randomInt(4, 15, randomFn);
    const third = randomInt(2, 12, randomFn);
    return withDetails({
      left: first,
      right: second,
      extra: third,
      answer: first - second + third,
      text: `${first} - ${second} + ${third}`,
      story: `光の葉が ${first}まい あります。${second}まい とどけて、あとから ${third}まい 見つけました。今は なんまい？`,
      operation: "twoStepMixed",
    }, "twoStep", "左からじゅんに、ひいてから たそう。", `${first} - ${second} = ${first - second}、${first - second} + ${third} = ${first - second + third}だよ。`);
  }

  function buildQuestionByOperation(operation, randomFn) {
    const builders = {
      add: makeAddQuestion,
      subtract: makeSubtractQuestion,
      multiply: makeMultiplyQuestion,
      divide: makeDivideQuestion,
      largeMultiply: makeLargeMultiplyQuestion,
      largeDivide: makeLargeDivideQuestion,
      mixed: makeMixedQuestion,
    };
    return builders[operation](randomFn);
  }

  function buildQuestionByType(type, difficulty, randomFn) {
    const builders = {
      straight: () => buildQuestionByOperation(choose(difficulty.operations, randomFn), randomFn),
      blank: () => makeBlankQuestion(difficulty, randomFn),
      word: () => makeWordQuestion(difficulty, randomFn),
      compare: () => makeCompareQuestion(difficulty, randomFn),
      twoStep: () => makeTwoStepQuestion(difficulty, randomFn),
    };
    return (builders[type] || builders.straight)();
  }

  function generateQuestion(difficulty, randomFn) {
    const safeRandom = typeof randomFn === "function" ? randomFn : Math.random;
    const questionType = choose(difficulty.questionTypes || ["straight"], safeRandom);
    const question = buildQuestionByType(questionType, difficulty, safeRandom);
    const traps = [
      question.left + question.right,
      Math.abs(question.left - question.right),
      question.answer + 10,
      question.answer - 10,
    ];

    return {
      id: `${difficulty.id}-${question.type}-${question.operation}-${Date.now()}-${Math.round(safeRandom() * 10000)}`,
      ...question,
      choices: buildChoices(question.answer, safeRandom, traps),
    };
  }

  function isCorrectAnswer(question, selectedAnswer) {
    return String(selectedAnswer) === String(question.answer);
  }

  function calculatePoints(currentPoints, isCorrect) {
    return currentPoints + (isCorrect ? POINTS_PER_CORRECT : 0);
  }

  function createRound(difficultyId, randomFn) {
    const difficulty = difficulties.find((item) => item.id === difficultyId) || difficulties[0];
    return {
      difficulty,
      stage: difficulty,
      currentIndex: 0,
      earnedPoints: 0,
      correctCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      question: generateQuestion(difficulty, randomFn),
      answered: false,
      answers: [],
    };
  }

  function answerQuestion(round, selectedAnswer) {
    if (round.answered) {
      return round;
    }

    const correct = isCorrectAnswer(round.question, selectedAnswer);
    const earnedPoints = calculatePoints(round.earnedPoints, correct);
    const currentStreak = correct ? round.currentStreak + 1 : 0;

    return {
      ...round,
      answered: true,
      earnedPoints,
      correctCount: round.correctCount + (correct ? 1 : 0),
      currentStreak,
      bestStreak: Math.max(round.bestStreak, currentStreak),
      answers: round.answers.concat({
        question: round.question.text,
        selectedAnswer,
        answer: round.question.answer,
        correct,
      }),
    };
  }

  function nextQuestion(round, randomFn) {
    const nextIndex = round.currentIndex + 1;

    if (nextIndex >= QUESTION_COUNT) {
      return {
        ...round,
        currentIndex: nextIndex,
        question: null,
        answered: false,
      };
    }

    return {
      ...round,
      currentIndex: nextIndex,
      question: generateQuestion(round.difficulty, randomFn),
      answered: false,
    };
  }

  global.GameLogic = {
    POINTS_PER_CORRECT,
    QUESTION_COUNT,
    difficulties,
    stages: difficulties,
    generateQuestion,
    isCorrectAnswer,
    calculatePoints,
    createRound,
    answerQuestion,
    nextQuestion,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.GameLogic;
  }
})(typeof window !== "undefined" ? window : globalThis);
