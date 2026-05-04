(function (global) {
  "use strict";

  const POINTS_PER_CORRECT = 10;
  const QUESTION_COUNT = 5;

  const subjects = [
    {
      id: "math",
      name: "算数",
      actionLabel: "算数で戦う",
      challengeLabel: "算数のチャレンジ",
      homeLabel: "さんすうの たねあつめ",
    },
    {
      id: "japanese",
      name: "国語",
      actionLabel: "国語で戦う",
      challengeLabel: "国語のチャレンジ",
      homeLabel: "ことばの たねあつめ",
    },
  ];

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
      subjectLabels: {
        math: "たし算・ひき算",
        japanese: "漢字の読み・ことば",
      },
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
      subjectLabels: {
        math: "かけ算中心",
        japanese: "反対語・文づくり",
      },
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
      subjectLabels: {
        math: "大きめ計算",
        japanese: "読解・使い分け",
      },
    },
  ];

  const japaneseQuestions = {
    seed: {
      types: ["kanjiReading", "kanjiReading", "sentence", "meaning"],
      kanjiReading: [
        ["山", "やま", ["かわ", "もり", "そら"], "形が山に見える漢字だよ。", "「山」は「やま」と読むよ。"],
        ["川", "かわ", ["やま", "うみ", "いけ"], "水が流れるところを表す漢字だよ。", "「川」は「かわ」と読むよ。"],
        ["木", "き", ["ひ", "め", "て"], "森にたくさんあるものだよ。", "「木」は「き」と読むよ。"],
        ["雨", "あめ", ["ゆき", "くも", "かぜ"], "空から水がふってくるよ。", "「雨」は「あめ」と読むよ。"],
        ["花", "はな", ["くさ", "たね", "み"], "きれいに さくものだよ。", "「花」は「はな」と読むよ。"],
      ],
      meaning: [
        ["はし", "川をわたるところ", ["ごはんを食べる道具", "走ること", "明るい空"], "文の中で何を表しているか考えよう。", "ここでは「はし」は橋、川をわたるところだよ。"],
        ["あさ", "一日のはじめのころ", ["夜のあとすぐ", "食べものの名前", "大きな音"], "時間を表すことばだよ。", "「あさ」は一日のはじめのころだよ。"],
      ],
      sentence: [
        ["今日は雨が ___ います。", "ふって", ["さいて", "はしって", "ねて"], "雨に合う動きを選ぼう。", "雨は「ふって」います、が自然だよ。"],
        ["花が きれいに ___ 。", "さいた", ["のんだ", "とんだ", "よんだ"], "花がどうなるか思い出そう。", "花は「さいた」と言うよ。"],
      ],
    },
    grass: {
      types: ["synonymAntonym", "synonymAntonym", "sentence", "kanjiReading", "reading"],
      kanjiReading: [
        ["学校", "がっこう", ["がくせい", "こうえん", "せんせい"], "べんきょうする場所だよ。", "「学校」は「がっこう」と読むよ。"],
        ["先生", "せんせい", ["せいと", "せんろ", "さき"], "教えてくれる人だよ。", "「先生」は「せんせい」と読むよ。"],
      ],
      synonymAntonym: [
        ["「大きい」の反対語はどれ？", "小さい", ["広い", "長い", "明るい"], "反対の意味になる言葉を選ぼう。", "「大きい」の反対は「小さい」だよ。"],
        ["「早い」の反対語はどれ？", "おそい", ["近い", "強い", "楽しい"], "スピードが反対になる言葉だよ。", "「早い」の反対は「おそい」だよ。"],
        ["「うれしい」と似ている言葉はどれ？", "楽しい", ["かなしい", "くらい", "重い"], "近い気もちの言葉を選ぼう。", "「うれしい」と「楽しい」は近い気もちだよ。"],
      ],
      sentence: [
        ["本を ___ 読みました。", "しずかに", ["赤く", "丸く", "高く"], "読む様子に合う言葉を選ぼう。", "本は「しずかに」読む、が自然だよ。"],
        ["友だちに ___ あいさつをしました。", "元気に", ["冷たく", "細く", "古く"], "あいさつの様子に合う言葉だよ。", "「元気に あいさつ」が自然だよ。"],
      ],
      reading: [
        ["マルップは朝、森で小さなたねを見つけました。たねは光っていて、近くの花もにこにこしていました。マルップはそっと手にのせました。", "マルップが見つけたものはどれ？", "小さなたね", ["大きな石", "赤い本", "青いかさ"], "文章のはじめを見てみよう。", "マルップは森で小さなたねを見つけたよ。"],
      ],
    },
    flower: {
      types: ["reading", "reading", "meaning", "synonymAntonym", "sentence"],
      meaning: [
        ["「あつい」の意味として、天気の話に合うのはどれ？", "気温が高い", ["本が分厚い", "味がからい", "音が小さい"], "同じ音でも意味が変わることがあるよ。", "天気の「あつい」は気温が高いことだよ。"],
        ["「かえる」を動物の意味で使う文はどれ？", "池でかえるが鳴く。", ["家にかえる。", "色をかえる。", "ページをかえる。"], "生きものが出てくる文を選ぼう。", "池で鳴く「かえる」は動物のことだよ。"],
      ],
      synonymAntonym: [
        ["「安全」の反対に近い言葉はどれ？", "きけん", ["安心", "しずか", "便利"], "安心できない様子を表す言葉だよ。", "「安全」の反対に近い言葉は「きけん」だよ。"],
        ["「美しい」と似ている言葉はどれ？", "きれい", ["むずかしい", "すばやい", "あたたかい"], "見た目をほめる言葉を選ぼう。", "「美しい」と「きれい」は近い意味だよ。"],
      ],
      sentence: [
        ["森の道を歩くと、鳥の声が ___ 聞こえました。", "やさしく", ["からく", "四角く", "古く"], "聞こえ方に合う言葉を選ぼう。", "鳥の声は「やさしく」聞こえました、が自然だよ。"],
      ],
      reading: [
        ["ルミは夕方の森を歩いていました。空が少し暗くなると、葉っぱの光が道をてらしました。ピコとモコは、その光をたよりに広場へ進みました。みんなで着くと、花がふわりと開きました。", "みんなが広場へ進むとき、何をたよりにしましたか？", "葉っぱの光", ["雨の音", "赤い橋", "大きな石"], "道をてらしたものを探そう。", "葉っぱの光が道をてらしたので、それをたよりにしたよ。"],
        ["朝の広場に、三つのたねがならんでいました。一つ目は丸く、二つ目は細長く、三つ目は星のような形でした。マルップは星の形のたねを見て、にっこりしました。", "マルップがにっこりしたのは、どんな形のたねを見たとき？", "星のような形", ["丸い形", "細長い形", "四角い形"], "最後の文を読んでみよう。", "マルップは星のような形のたねを見て、にっこりしたよ。"],
      ],
    },
  };

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
      const values = traps.length ? [answer].concat(traps) : ["左", "右", "おなじ"];
      return shuffle(Array.from(new Set(values)).slice(0, 4), randomFn);
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

  function makeJapaneseKanjiReadingQuestion(difficulty, randomFn) {
    const source = choose(japaneseQuestions[difficulty.id].kanjiReading, randomFn);
    const [kanji, answer, traps, hint, explanation] = source;
    return withDetails({
      answer,
      text: kanji,
      story: `「${kanji}」という漢字の読みはどれ？`,
      operation: "kanjiReading",
      choiceTraps: traps,
      subject: "japanese",
    }, "kanjiReading", hint, explanation, "読みを えらぼう");
  }

  function makeJapaneseMeaningQuestion(difficulty, randomFn) {
    const source = choose(japaneseQuestions[difficulty.id].meaning || japaneseQuestions.seed.meaning, randomFn);
    const [prompt, answer, traps, hint, explanation] = source;
    return withDetails({
      answer,
      text: prompt,
      story: prompt,
      operation: "meaning",
      choiceTraps: traps,
      subject: "japanese",
    }, "meaning", hint, explanation, "意味に合うものを えらぼう");
  }

  function makeJapaneseSynonymAntonymQuestion(difficulty, randomFn) {
    const source = choose(japaneseQuestions[difficulty.id].synonymAntonym || japaneseQuestions.grass.synonymAntonym, randomFn);
    const [prompt, answer, traps, hint, explanation] = source;
    return withDetails({
      answer,
      text: prompt,
      story: prompt,
      operation: "synonymAntonym",
      choiceTraps: traps,
      subject: "japanese",
    }, "synonymAntonym", hint, explanation, "ことばを えらぼう");
  }

  function makeJapaneseSentenceQuestion(difficulty, randomFn) {
    const source = choose(japaneseQuestions[difficulty.id].sentence, randomFn);
    const [prompt, answer, traps, hint, explanation] = source;
    return withDetails({
      answer,
      text: prompt,
      story: `文に合うことばを えらぼう。${prompt}`,
      operation: "sentence",
      choiceTraps: traps,
      subject: "japanese",
    }, "sentence", hint, explanation, prompt);
  }

  function makeJapaneseReadingQuestion(difficulty, randomFn) {
    const source = choose(japaneseQuestions[difficulty.id].reading || japaneseQuestions.grass.reading, randomFn);
    const [passage, prompt, answer, traps, hint, explanation] = source;
    return withDetails({
      answer,
      text: prompt,
      story: `${passage}\n\n${prompt}`,
      operation: "reading",
      choiceTraps: traps,
      subject: "japanese",
    }, "reading", hint, explanation, "文を読んで こたえよう");
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

  function buildJapaneseQuestion(difficulty, randomFn) {
    const questionType = choose(japaneseQuestions[difficulty.id].types, randomFn);
    const builders = {
      kanjiReading: () => makeJapaneseKanjiReadingQuestion(difficulty, randomFn),
      meaning: () => makeJapaneseMeaningQuestion(difficulty, randomFn),
      synonymAntonym: () => makeJapaneseSynonymAntonymQuestion(difficulty, randomFn),
      sentence: () => makeJapaneseSentenceQuestion(difficulty, randomFn),
      reading: () => makeJapaneseReadingQuestion(difficulty, randomFn),
    };
    return builders[questionType]();
  }

  function getSubject(subjectId) {
    return subjects.find((subject) => subject.id === subjectId) || subjects[0];
  }

  function generateQuestion(difficulty, subjectId, randomFn) {
    let safeSubjectId = subjectId;
    let safeRandom = randomFn;

    if (typeof subjectId === "function") {
      safeRandom = subjectId;
      safeSubjectId = "math";
    }

    safeRandom = typeof safeRandom === "function" ? safeRandom : Math.random;
    const subject = getSubject(safeSubjectId);
    if (subject.id === "japanese") {
      const question = buildJapaneseQuestion(difficulty, safeRandom);
      return {
        id: `${difficulty.id}-${subject.id}-${question.type}-${question.operation}-${Date.now()}-${Math.round(safeRandom() * 10000)}`,
        ...question,
        subject: subject.id,
        choices: buildChoices(question.answer, safeRandom, question.choiceTraps || []),
      };
    }

    const questionType = choose(difficulty.questionTypes || ["straight"], safeRandom);
    const question = buildQuestionByType(questionType, difficulty, safeRandom);
    const traps = typeof question.answer === "number"
      ? [
          question.left + question.right,
          Math.abs(question.left - question.right),
          question.answer + 10,
          question.answer - 10,
        ]
      : question.choiceTraps || [];

    return {
      id: `${difficulty.id}-${question.type}-${question.operation}-${Date.now()}-${Math.round(safeRandom() * 10000)}`,
      ...question,
      subject: subject.id,
      choices: buildChoices(question.answer, safeRandom, traps),
    };
  }

  function isCorrectAnswer(question, selectedAnswer) {
    return String(selectedAnswer) === String(question.answer);
  }

  function calculatePoints(currentPoints, isCorrect) {
    return currentPoints + (isCorrect ? POINTS_PER_CORRECT : 0);
  }

  function createRound(difficultyId, subjectId, randomFn) {
    let safeSubjectId = subjectId;
    let safeRandom = randomFn;
    if (typeof subjectId === "function") {
      safeRandom = subjectId;
      safeSubjectId = "math";
    }
    const difficulty = difficulties.find((item) => item.id === difficultyId) || difficulties[0];
    const subject = getSubject(safeSubjectId);
    return {
      difficulty,
      stage: difficulty,
      subject,
      currentIndex: 0,
      earnedPoints: 0,
      correctCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      question: generateQuestion(difficulty, subject.id, safeRandom),
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
      question: generateQuestion(round.difficulty, round.subject?.id || "math", randomFn),
      answered: false,
    };
  }

  global.GameLogic = {
    POINTS_PER_CORRECT,
    QUESTION_COUNT,
    subjects,
    difficulties,
    stages: difficulties,
    getSubject,
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
