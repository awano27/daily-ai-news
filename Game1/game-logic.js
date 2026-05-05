(function (global) {
  "use strict";

  const POINTS_PER_CORRECT = 10;
  const QUESTION_COUNT = 5;
  const DEFAULT_LANGUAGE = "ja";

  const languages = [
    { id: "ja", label: "日本語", htmlLang: "ja" },
    { id: "en", label: "English", htmlLang: "en" },
    { id: "ko", label: "한국어", htmlLang: "ko" },
    { id: "zh", label: "中文", htmlLang: "zh" },
    { id: "fr", label: "Français", htmlLang: "fr" },
    { id: "de", label: "Deutsch", htmlLang: "de" },
    { id: "es", label: "Español", htmlLang: "es" },
  ];

  const subjectText = {
    ja: {
      math: ["算数", "算数でチャレンジ", "算数のチャレンジ", "さんすうの たねあつめ"],
      japanese: ["国語", "国語でチャレンジ", "国語のチャレンジ", "ことばの たねあつめ"],
    },
    en: {
      math: ["Math", "Math Challenge", "Math Challenge", "Math seed quest"],
      japanese: ["Language", "Word Challenge", "Language Challenge", "Word seed quest"],
    },
    ko: {
      math: ["수학", "수학 챌린지", "수학 챌린지", "수학 씨앗 모으기"],
      japanese: ["국어", "말 챌린지", "국어 챌린지", "말 씨앗 모으기"],
    },
    zh: {
      math: ["数学", "数学挑战", "数学挑战", "数学种子收集"],
      japanese: ["语文", "词语挑战", "语文挑战", "词语种子收集"],
    },
    fr: {
      math: ["Maths", "Défi de maths", "Défi de maths", "quête des graines de maths"],
      japanese: ["Français", "Défi de mots", "Défi de français", "quête des graines de mots"],
    },
    de: {
      math: ["Mathe", "Mathe-Aufgabe", "Mathe-Aufgabe", "Mathe-Samen sammeln"],
      japanese: ["Sprache", "Wort-Aufgabe", "Sprach-Aufgabe", "Wort-Samen sammeln"],
    },
    es: {
      math: ["Matemáticas", "Reto de matemáticas", "Reto de matemáticas", "búsqueda de semillas de mates"],
      japanese: ["Lengua", "Reto de palabras", "Reto de lengua", "búsqueda de semillas de palabras"],
    },
  };

  const spiritText = {
    ja: {
      seed: ["ピコ", "小1〜2", "たし算・ひき算", "漢字の読み・ことば", "小さなたねのせいれい", "きらきらの たね"],
      grass: ["モコ", "小3", "かけ算中心", "反対語・文づくり", "ふわふわの花のせいれい", "ふわふわ 花びら"],
      flower: ["ルミ", "小4", "大きめ計算", "読解・意味", "光る木の葉のせいれい", "ひかる 木の葉"],
      sky: ["ソラ", "小5〜6", "小数・分数・割合", "読解・文のしくみ", "空色のしずくのせいれい", "空色の しずく"],
      moon: ["ノア", "中1", "正負の数・文字式", "文法・要点", "月あかりのせいれい", "月あかりの しずく"],
      comet: ["ミラ", "中2", "連立・一次関数", "読解・表現", "ほうき星のせいれい", "ほうき星の 羽"],
      star: ["セナ", "中3", "式・関数・図形", "読解・文法・論理", "星あかりのせいれい", "星あかりの 結晶"],
    },
    en: {
      seed: ["Pico", "Grade 1-2", "Add/Subtract", "Reading words", "tiny seed spirit", "sparkly seed"],
      grass: ["Moko", "Grade 3", "Multiplication", "Opposites/Sentences", "fluffy flower spirit", "fluffy petal"],
      flower: ["Lumi", "Grade 4", "Bigger numbers", "Reading/Meaning", "glowing leaf spirit", "glowing leaf"],
      sky: ["Sora", "Grade 5-6", "Decimals/Fractions/Percent", "Reading/Grammar", "sky-blue drop spirit", "sky-blue drop"],
      moon: ["Noa", "Grade 7", "Signed numbers/Expressions", "Grammar/Main ideas", "moonlight spirit", "moonlight drop"],
      comet: ["Mira", "Grade 8", "Systems/Linear functions", "Reading/Expression", "comet spirit", "comet feather"],
      star: ["Sena", "Grade 9", "Equations/Functions/Geometry", "Reading/Logic", "starlight spirit", "starlight crystal"],
    },
    ko: {
      seed: ["피코", "1-2학년", "덧셈・뺄셈", "읽기・낱말", "작은 씨앗 정령", "반짝 씨앗"],
      grass: ["모코", "3학년", "곱셈 중심", "반대말・문장", "폭신한 꽃 정령", "폭신 꽃잎"],
      flower: ["루미", "4학년", "조금 큰 계산", "읽기・뜻", "빛나는 잎 정령", "빛나는 잎"],
      sky: ["소라", "5-6학년", "소수・분수・비율", "읽기・문장 구조", "하늘빛 물방울 정령", "하늘빛 물방울"],
      moon: ["노아", "중1", "양수・음수・식", "문법・요점", "달빛 정령", "달빛 물방울"],
      comet: ["미라", "중2", "연립・일차함수", "읽기・표현", "혜성 정령", "혜성 깃털"],
      star: ["세나", "중3", "방정식・함수・도형", "읽기・논리", "별빛 정령", "별빛 결정"],
    },
    zh: {
      seed: ["皮可", "1-2年级", "加法・减法", "认读・词语", "小小种子精灵", "闪亮种子"],
      grass: ["莫可", "3年级", "乘法为主", "反义词・句子", "软软花精灵", "软软花瓣"],
      flower: ["露米", "4年级", "稍大的数", "阅读・意思", "发光叶子精灵", "发光叶子"],
      sky: ["索拉", "5-6年级", "小数・分数・百分比", "阅读・句子结构", "天蓝水滴精灵", "天蓝水滴"],
      moon: ["诺亚", "初一", "正负数・代数式", "语法・要点", "月光精灵", "月光水滴"],
      comet: ["米拉", "初二", "方程组・一次函数", "阅读・表达", "彗星精灵", "彗星羽毛"],
      star: ["赛娜", "初三", "方程・函数・图形", "阅读・逻辑", "星光精灵", "星光结晶"],
    },
    fr: {
      seed: ["Pico", "CE1-CE2", "Addition/Soustraction", "Lecture/Mots", "petit esprit graine", "graine brillante"],
      grass: ["Moko", "CE2-CM1", "Multiplication", "Contraires/Phrases", "esprit fleur tout doux", "pétale doux"],
      flower: ["Lumi", "CM1-CM2", "Grands nombres", "Lecture/Sens", "esprit feuille lumineuse", "feuille lumineuse"],
      sky: ["Sora", "CM2-6e", "Décimaux/Fractions/%", "Lecture/Grammaire", "esprit goutte bleu ciel", "goutte bleu ciel"],
      moon: ["Noa", "5e", "Nombres relatifs/Expressions", "Grammaire/Idées", "esprit clair de lune", "goutte de lune"],
      comet: ["Mira", "4e", "Systèmes/Fonctions", "Lecture/Expression", "esprit comète", "plume de comète"],
      star: ["Sena", "3e", "Équations/Fonctions/Géométrie", "Lecture/Logique", "esprit lumière d'étoile", "cristal d'étoile"],
    },
    de: {
      seed: ["Pico", "Kl. 1-2", "Plus/Minus", "Lesen/Wörter", "kleiner Samen-Geist", "glitzernder Samen"],
      grass: ["Moko", "Kl. 3", "Malnehmen", "Gegenteile/Sätze", "flauschiger Blumen-Geist", "flauschiges Blütenblatt"],
      flower: ["Lumi", "Kl. 4", "Größere Zahlen", "Lesen/Bedeutung", "leuchtender Blatt-Geist", "leuchtendes Blatt"],
      sky: ["Sora", "Kl. 5-6", "Dezimal/Fraction/Prozent", "Lesen/Grammatik", "himmelblauer Tropfen-Geist", "himmelblauer Tropfen"],
      moon: ["Noa", "Kl. 7", "Rationale Zahlen/Terme", "Grammatik/Kernaussagen", "Mondlicht-Geist", "Mondlicht-Tropfen"],
      comet: ["Mira", "Kl. 8", "Gleichungssysteme/Funktionen", "Lesen/Ausdruck", "Kometen-Geist", "Kometen-Feder"],
      star: ["Sena", "Kl. 9", "Gleichungen/Funktionen/Geometrie", "Lesen/Logik", "Sternlicht-Geist", "Sternlicht-Kristall"],
    },
    es: {
      seed: ["Pico", "1.º-2.º", "Sumar/Restar", "Lectura/Palabras", "pequeño espíritu semilla", "semilla brillante"],
      grass: ["Moko", "3.º", "Multiplicación", "Contrarios/Frases", "espíritu flor suave", "pétalo suave"],
      flower: ["Lumi", "4.º", "Números grandes", "Lectura/Significado", "espíritu hoja brillante", "hoja brillante"],
      sky: ["Sora", "5.º-6.º", "Decimales/Fracciones/%", "Lectura/Gramática", "espíritu gota azul cielo", "gota azul cielo"],
      moon: ["Noa", "1.º ESO", "Números con signo/Expresiones", "Gramática/Ideas", "espíritu luz de luna", "gota de luna"],
      comet: ["Mira", "2.º ESO", "Sistemas/Funciones lineales", "Lectura/Expresión", "espíritu cometa", "pluma de cometa"],
      star: ["Sena", "3.º ESO", "Ecuaciones/Funciones/Geometría", "Lectura/Lógica", "espíritu luz de estrella", "cristal estelar"],
    },
  };

  const subjects = [
    { id: "math", name: "算数", actionLabel: "算数でチャレンジ", challengeLabel: "算数のチャレンジ", homeLabel: "さんすうの たねあつめ" },
    { id: "japanese", name: "国語", actionLabel: "国語でチャレンジ", challengeLabel: "国語のチャレンジ", homeLabel: "ことばの たねあつめ" },
  ];

  const difficulties = [
    {
      id: "seed",
      spiritName: "ピコ",
      gradeLabel: "小1〜2",
      label: "たし算・ひき算",
      description: "小さなたねのせいれい",
      reward: "きらきらの たね",
      subjectLabels: { math: "たし算・ひき算", japanese: "漢字の読み・ことば" },
      operations: ["add", "subtract"],
      questionTypes: ["straight", "straight", "blank", "word"],
    },
    {
      id: "grass",
      spiritName: "モコ",
      gradeLabel: "小3",
      label: "かけ算中心",
      description: "ふわふわの花のせいれい",
      reward: "ふわふわ 花びら",
      subjectLabels: { math: "かけ算中心", japanese: "反対語・文づくり" },
      operations: ["multiply", "multiply", "divide"],
      questionTypes: ["word", "compare", "blank", "twoStep", "straight"],
    },
    {
      id: "flower",
      spiritName: "ルミ",
      gradeLabel: "小4",
      label: "大きめ計算",
      description: "光る木の葉のせいれい",
      reward: "ひかる 木の葉",
      subjectLabels: { math: "大きめ計算", japanese: "読解・意味" },
      operations: ["largeMultiply", "largeDivide", "mixed"],
      questionTypes: ["twoStep", "word", "compare", "blank", "straight", "parentheses", "remainder", "time", "money", "unit", "fraction", "area", "perimeter", "sequence", "rounding", "multiStepWord"],
    },
    {
      id: "sky",
      spiritName: "ソラ",
      gradeLabel: "小5〜6",
      label: "小数・分数・割合",
      description: "空色のしずくのせいれい",
      reward: "空色の しずく",
      subjectLabels: { math: "小数・分数・割合", japanese: "読解・文のしくみ" },
      operations: ["decimal", "fractionAdd", "percent", "average", "speed", "volume", "ratio"],
      questionTypes: ["decimal", "fractionAdd", "percent", "average", "speed", "volume", "ratio", "compare", "multiStepWord"],
    },
    {
      id: "moon",
      spiritName: "ノア",
      gradeLabel: "中1",
      label: "正負の数・文字式",
      description: "月あかりのせいれい",
      reward: "月あかりの しずく",
      subjectLabels: { math: "正負の数・文字式", japanese: "文法・要点" },
      operations: ["signedNumber", "simpleEquation", "algebraValue", "proportional"],
      questionTypes: ["signedNumber", "simpleEquation", "algebraValue", "proportional"],
    },
    {
      id: "comet",
      spiritName: "ミラ",
      gradeLabel: "中2",
      label: "連立・一次関数",
      description: "ほうき星のせいれい",
      reward: "ほうき星の 羽",
      subjectLabels: { math: "連立・一次関数", japanese: "読解・表現" },
      operations: ["simultaneous", "linearFunction", "angle", "expressionExpand"],
      questionTypes: ["simultaneous", "linearFunction", "angle", "expressionExpand", "probability", "similarity"],
    },
    {
      id: "star",
      spiritName: "セナ",
      gradeLabel: "中3",
      label: "式・関数・図形",
      description: "星あかりのせいれい",
      reward: "星あかりの 結晶",
      subjectLabels: { math: "式・関数・図形", japanese: "読解・文法・論理" },
      operations: ["linearEquation", "quadratic", "functionValue", "pythagorean"],
      questionTypes: ["linearEquation", "factorization", "quadratic", "pythagorean", "functionValue", "similarity", "probability", "squareRoot"],
    },
  ];

  const upperMathOperations = ["decimal", "fractionAdd", "percent", "average", "speed", "volume", "ratio"];
  const upperMathTypes = ["decimal", "fractionAdd", "percent", "average", "speed", "volume", "ratio", "compare", "multiStepWord"];
  const juniorHighFirstMathTypes = ["signedNumber", "simpleEquation", "algebraValue", "proportional"];
  const juniorHighSecondMathTypes = ["simultaneous", "linearFunction", "angle", "expressionExpand", "probability", "similarity"];
  const juniorHighThirdMathTypes = ["linearEquation", "factorization", "quadratic", "pythagorean", "functionValue", "similarity", "probability", "squareRoot"];
  const advancedMathTypes = ["twoStep", "word", "compare", "blank", "straight", "parentheses", "remainder", "time", "money", "unit", "fraction", "area", "perimeter", "sequence", "rounding", "multiStepWord"];
  const specialMathTypes = ["parentheses", "remainder", "time", "money", "unit", "fraction", "area", "perimeter", "sequence", "rounding", "multiStepWord", ...upperMathOperations, ...juniorHighFirstMathTypes, ...juniorHighSecondMathTypes, ...juniorHighThirdMathTypes];

  const compareWords = {
    ja: ["左", "右", "おなじ"],
    en: ["Left", "Right", "Same"],
    ko: ["왼쪽", "오른쪽", "같아요"],
    zh: ["左边", "右边", "一样"],
    fr: ["Gauche", "Droite", "Pareil"],
    de: ["Links", "Rechts", "Gleich"],
    es: ["Izquierda", "Derecha", "Igual"],
  };

  const mathText = {
    ja: {
      add: (q) => [`このせいれいが たねを ${q.left}こ もっていたよ。${q.right}こ 見つけたら、ぜんぶで なんこ？`, "2つの数を あわせてみよう。", `${q.left} + ${q.right} = ${q.answer} だよ。`],
      subtract: (q) => [`たねが ${q.left}こ あるよ。${q.right}こ かごに入れたら、のこりは なんこ？`, "へった数を ひいてみよう。", `${q.left} - ${q.right} = ${q.answer} だよ。`],
      multiply: (q) => [`草むらが ${q.left}つ あるよ。ひとつに ${q.right}こ たねがあると、ぜんぶで なんこ？`, "同じ数のまとまりは かけ算で考えよう。", `${q.right}こが ${q.left}つで ${q.answer}こ だよ。`],
      divide: (q) => [`たね ${q.left}こを ${q.right}つの草むらに 同じ数ずつ分けるよ。ひとつに なんこ？`, "同じ数ずつ分けるときは わり算だよ。", `${q.left} ÷ ${q.right} = ${q.answer} だよ。`],
      blank: (q) => [`□に入る数を えらぼう。${q.hintText}`, "式がぴったり合う数を探そう。", `□は ${q.answer} だよ。`],
      compare: (q) => [`どちらが大きいかな？ ${q.text}`, "左右を計算してから比べよう。", `答えは ${q.answer} だよ。`],
      twoStep: (q) => [`2ステップのチャレンジだよ。${q.text}`, "左から順番に計算しよう。", `答えは ${q.answer} だよ。`],
      wordHint: "お話を読んで 数をえらぼう",
      compareHint: "左・右・おなじ からえらぼう",
    },
    en: {
      add: (q) => [`The spirit has ${q.left} shining seeds. Your buddy finds ${q.right} more. How many are there in all?`, "Add the two numbers together.", `${q.left} + ${q.right} = ${q.answer}.`],
      subtract: (q) => [`The spirit lines up ${q.left} seeds. ${q.right} go into a basket. How many are left?`, "Take away the number that moved.", `${q.left} - ${q.right} = ${q.answer}.`],
      multiply: (q) => [`There are ${q.left} bushes with ${q.right} seeds each. How many seeds are there?`, "Same-size groups use multiplication.", `${q.right} in each group, ${q.left} groups: ${q.answer}.`],
      divide: (q) => [`Share ${q.left} seeds equally into ${q.right} bushes. How many in each bush?`, "Sharing equally uses division.", `${q.left} ÷ ${q.right} = ${q.answer}.`],
      blank: (q) => [`Choose the number for the blank. ${q.hintText}`, "Find the number that makes the sentence true.", `The blank is ${q.answer}.`],
      compare: (q) => [`Which is bigger: ${q.text}?`, "Work out both sides, then compare.", `The answer is ${q.answer}.`],
      twoStep: (q) => [`Solve this two-step challenge: ${q.text}`, "Go from left to right.", `The answer is ${q.answer}.`],
      wordHint: "Read the story and choose the number.",
      compareHint: "Choose Left, Right, or Same.",
    },
    ko: {
      add: (q) => [`정령이 씨앗 ${q.left}개를 가지고 있어요. 친구가 ${q.right}개를 더 찾으면 모두 몇 개일까요?`, "두 수를 더해 보세요.", `${q.left} + ${q.right} = ${q.answer}예요.`],
      subtract: (q) => [`씨앗 ${q.left}개 중 ${q.right}개를 바구니에 넣었어요. 남은 씨앗은 몇 개일까요?`, "줄어든 수를 빼 보세요.", `${q.left} - ${q.right} = ${q.answer}예요.`],
      multiply: (q) => [`풀숲 ${q.left}곳에 씨앗이 ${q.right}개씩 있어요. 모두 몇 개일까요?`, "같은 묶음은 곱셈으로 생각해요.", `${q.right}개씩 ${q.left}묶음은 ${q.answer}개예요.`],
      divide: (q) => [`씨앗 ${q.left}개를 풀숲 ${q.right}곳에 똑같이 나눠요. 한 곳에 몇 개일까요?`, "똑같이 나누면 나눗셈이에요.", `${q.left} ÷ ${q.right} = ${q.answer}예요.`],
      blank: (q) => [`빈칸에 들어갈 수를 골라요. ${q.hintText}`, "식이 맞게 되는 수를 찾아요.", `빈칸은 ${q.answer}예요.`],
      compare: (q) => [`어느 쪽이 더 클까요? ${q.text}`, "양쪽을 계산하고 비교해요.", `답은 ${q.answer}예요.`],
      twoStep: (q) => [`두 단계 챌린지예요. ${q.text}`, "왼쪽부터 차례로 계산해요.", `답은 ${q.answer}예요.`],
      wordHint: "이야기를 읽고 수를 골라요.",
      compareHint: "왼쪽, 오른쪽, 같아요 중에서 골라요.",
    },
    zh: {
      add: (q) => [`精灵有 ${q.left} 颗闪亮种子。伙伴又找到 ${q.right} 颗，一共有几颗？`, "把两个数加起来。", `${q.left} + ${q.right} = ${q.answer}。`],
      subtract: (q) => [`有 ${q.left} 颗种子，${q.right} 颗放进篮子里，还剩几颗？`, "用总数减去拿走的数。", `${q.left} - ${q.right} = ${q.answer}。`],
      multiply: (q) => [`有 ${q.left} 片草丛，每片有 ${q.right} 颗种子，一共有几颗？`, "相同的一组一组可以用乘法。", `${q.right} 颗一组，${q.left} 组是 ${q.answer} 颗。`],
      divide: (q) => [`把 ${q.left} 颗种子平均分到 ${q.right} 片草丛，每片几颗？`, "平均分可以用除法。", `${q.left} ÷ ${q.right} = ${q.answer}。`],
      blank: (q) => [`选择空格里的数。${q.hintText}`, "找出让算式成立的数。", `空格里是 ${q.answer}。`],
      compare: (q) => [`哪边更大？${q.text}`, "先算左右两边，再比较。", `答案是 ${q.answer}。`],
      twoStep: (q) => [`两步挑战：${q.text}`, "从左到右一步一步算。", `答案是 ${q.answer}。`],
      wordHint: "读一读故事，选择数字。",
      compareHint: "选择左边、右边或一样。",
    },
    fr: {
      add: (q) => [`L'esprit a ${q.left} graines brillantes. Ton compagnon en trouve ${q.right} de plus. Combien y en a-t-il ?`, "Additionne les deux nombres.", `${q.left} + ${q.right} = ${q.answer}.`],
      subtract: (q) => [`Il y a ${q.left} graines. ${q.right} vont dans le panier. Combien reste-t-il ?`, "Enlève le nombre qui part.", `${q.left} - ${q.right} = ${q.answer}.`],
      multiply: (q) => [`Il y a ${q.left} buissons avec ${q.right} graines chacun. Combien de graines ?`, "Des groupes égaux utilisent la multiplication.", `${q.right} par groupe, ${q.left} groupes : ${q.answer}.`],
      divide: (q) => [`Partage ${q.left} graines dans ${q.right} buissons. Combien dans chaque buisson ?`, "Partager également utilise la division.", `${q.left} ÷ ${q.right} = ${q.answer}.`],
      blank: (q) => [`Choisis le nombre manquant. ${q.hintText}`, "Trouve le nombre qui rend l'égalité vraie.", `Le nombre manquant est ${q.answer}.`],
      compare: (q) => [`Lequel est le plus grand : ${q.text} ?`, "Calcule les deux côtés puis compare.", `La réponse est ${q.answer}.`],
      twoStep: (q) => [`Résous ce défi en deux étapes : ${q.text}`, "Calcule de gauche à droite.", `La réponse est ${q.answer}.`],
      wordHint: "Lis l'histoire et choisis le nombre.",
      compareHint: "Choisis Gauche, Droite ou Pareil.",
    },
    de: {
      add: (q) => [`Der Geist hat ${q.left} leuchtende Samen. Dein Partner findet ${q.right} dazu. Wie viele sind es?`, "Addiere beide Zahlen.", `${q.left} + ${q.right} = ${q.answer}.`],
      subtract: (q) => [`Es gibt ${q.left} Samen. ${q.right} kommen in den Korb. Wie viele bleiben?`, "Ziehe die weggelegten Samen ab.", `${q.left} - ${q.right} = ${q.answer}.`],
      multiply: (q) => [`Es gibt ${q.left} Büsche mit je ${q.right} Samen. Wie viele Samen sind es?`, "Gleiche Gruppen rechnet man mit Malnehmen.", `${q.right} pro Gruppe, ${q.left} Gruppen: ${q.answer}.`],
      divide: (q) => [`Teile ${q.left} Samen gleich auf ${q.right} Büsche auf. Wie viele pro Busch?`, "Gleiches Teilen ist Division.", `${q.left} ÷ ${q.right} = ${q.answer}.`],
      blank: (q) => [`Wähle die Zahl für die Lücke. ${q.hintText}`, "Finde die Zahl, damit die Aufgabe stimmt.", `Die Lücke ist ${q.answer}.`],
      compare: (q) => [`Was ist größer: ${q.text}?`, "Rechne beide Seiten aus und vergleiche.", `Die Antwort ist ${q.answer}.`],
      twoStep: (q) => [`Löse diese Zwei-Schritt-Aufgabe: ${q.text}`, "Rechne von links nach rechts.", `Die Antwort ist ${q.answer}.`],
      wordHint: "Lies die Geschichte und wähle die Zahl.",
      compareHint: "Wähle Links, Rechts oder Gleich.",
    },
    es: {
      add: (q) => [`El espíritu tiene ${q.left} semillas brillantes. Tu compañero encuentra ${q.right} más. ¿Cuántas hay en total?`, "Suma los dos números.", `${q.left} + ${q.right} = ${q.answer}.`],
      subtract: (q) => [`Hay ${q.left} semillas. ${q.right} van a la cesta. ¿Cuántas quedan?`, "Quita las que se fueron.", `${q.left} - ${q.right} = ${q.answer}.`],
      multiply: (q) => [`Hay ${q.left} arbustos con ${q.right} semillas cada uno. ¿Cuántas semillas hay?`, "Los grupos iguales usan multiplicación.", `${q.right} en cada grupo, ${q.left} grupos: ${q.answer}.`],
      divide: (q) => [`Reparte ${q.left} semillas entre ${q.right} arbustos. ¿Cuántas en cada uno?`, "Repartir por igual usa división.", `${q.left} ÷ ${q.right} = ${q.answer}.`],
      blank: (q) => [`Elige el número que falta. ${q.hintText}`, "Busca el número que hace correcta la operación.", `El número que falta es ${q.answer}.`],
      compare: (q) => [`¿Cuál es mayor: ${q.text}?`, "Calcula ambos lados y compara.", `La respuesta es ${q.answer}.`],
      twoStep: (q) => [`Resuelve este reto de dos pasos: ${q.text}`, "Calcula de izquierda a derecha.", `La respuesta es ${q.answer}.`],
      wordHint: "Lee la historia y elige el número.",
      compareHint: "Elige Izquierda, Derecha o Igual.",
    },
  };

  const languageBanks = {
    ja: {
      seed: [
        q("山", "やま", ["かわ", "もり", "そら"], "山の読みをえらぼう。", "山は「やま」と読むよ。"),
        q("「大きい」の反対はどれ？", "小さい", ["広い", "長い", "明るい"], "反対の意味を探そう。", "大きいの反対は小さいだよ。"),
        q("今日は雨が ___ います。", "ふって", ["さいて", "はしって", "ねて"], "雨に合うことばをえらぼう。", "雨は「ふって」います。"),
      ],
      grass: [
        q("「うれしい」と近いことばはどれ？", "楽しい", ["かなしい", "からい", "重い"], "近い気持ちのことばを探そう。", "うれしいと楽しいは近い意味だよ。"),
        q("本を ___ 読みました。", "しずかに", ["赤く", "丸く", "高く"], "読み方に合うことばをえらぼう。", "本はしずかに読むと自然だよ。"),
        reading("マルップは森で小さなたねを見つけました。たねはきらきら光っていました。", "マルップが見つけたものは？", "小さなたね", ["大きな石", "赤い本", "青いかさ"], "最初の文を見よう。", "マルップは小さなたねを見つけたよ。"),
      ],
      flower: [
        reading("ルミは夕方の森を歩きました。葉っぱの光が道をてらしました。みんなはその光をたよりに広場へ進みました。", "道をてらしたものは？", "葉っぱの光", ["雨の音", "赤い橋", "紙の地図"], "何が光ったか探そう。", "葉っぱの光が道をてらしたよ。"),
        q("「安全」の反対に近いことばはどれ？", "きけん", ["安心", "しずか", "便利"], "安心できない様子を表すことばだよ。", "安全の反対に近いのは危険だよ。"),
        q("森の道を歩くと、鳥の声が ___ 聞こえました。", "やさしく", ["からい", "四角く", "古い"], "聞こえ方に合うことばをえらぼう。", "鳥の声はやさしく聞こえました。"),
      ],
    },
    en: {
      seed: [
        q("What does \"cat\" mean?", "a small pet animal", ["a kind of weather", "a school bag", "a big tree"], "Think about an animal that says meow.", "Cat means a small pet animal."),
        q("What is the opposite of \"big\"?", "small", ["happy", "fast", "green"], "Choose the opposite size.", "The opposite of big is small."),
        q("The bird can ___ in the sky.", "fly", ["sleep", "drink", "paint"], "Choose what a bird does in the sky.", "A bird can fly in the sky."),
      ],
      grass: [
        q("Which word is like \"happy\"?", "glad", ["cold", "slow", "empty"], "Look for a word with a close feeling.", "Happy and glad are close in meaning."),
        q("She reads the book ___.", "quietly", ["round", "blue", "yesterday"], "Choose a word that tells how she reads.", "She reads quietly sounds natural."),
        reading("Maro found a tiny seed under a leaf. The seed glowed softly. Maro put it in a safe basket.", "What did Maro find?", "a tiny seed", ["a red hat", "a loud drum", "a blue fish"], "Look at the first sentence.", "Maro found a tiny seed."),
      ],
      flower: [
        reading("Lumi walked through the forest at dusk. The leaves began to glow and showed the way. Pico and Moko followed the light to the clearing.", "What showed the way?", "the glowing leaves", ["a loud bell", "a red bridge", "a paper map"], "Find what glowed.", "The glowing leaves showed the way."),
        q("What is close to \"beautiful\"?", "pretty", ["dangerous", "empty", "tiny"], "Pick a word that praises how something looks.", "Beautiful and pretty are close in meaning."),
        q("The forest path was ___ after the rain.", "quiet", ["square", "salty", "late"], "Choose a word that can describe a path.", "Quiet fits the sentence best."),
      ],
    },
    ko: {
      seed: [
        q("\"고양이\"는 무엇일까요?", "작은 반려동물", ["날씨", "가방", "큰 나무"], "야옹 하고 우는 동물을 생각해요.", "고양이는 작은 반려동물이에요."),
        q("\"크다\"의 반대말은?", "작다", ["기쁘다", "빠르다", "초록색"], "크기가 반대인 말을 골라요.", "크다의 반대말은 작다예요."),
        q("새는 하늘을 ___ 수 있어요.", "날", ["잘", "마실", "그릴"], "새가 하늘에서 하는 일을 골라요.", "새는 하늘을 날 수 있어요."),
      ],
      grass: [
        q("\"기쁘다\"와 비슷한 말은?", "즐겁다", ["차갑다", "느리다", "비었다"], "비슷한 느낌의 말을 찾아요.", "기쁘다와 즐겁다는 비슷해요."),
        q("책을 ___ 읽었어요.", "조용히", ["둥글게", "파랗게", "어제"], "읽는 모습에 맞는 말을 골라요.", "책은 조용히 읽는다고 하면 자연스러워요."),
        reading("마로는 잎 아래에서 작은 씨앗을 찾았어요. 씨앗은 은은하게 빛났어요.", "마로가 찾은 것은?", "작은 씨앗", ["빨간 모자", "큰 북", "파란 물고기"], "첫 문장을 보세요.", "마로는 작은 씨앗을 찾았어요."),
      ],
      flower: [
        reading("루미는 저녁 숲길을 걸었어요. 잎의 빛이 길을 밝혔어요. 모두 그 빛을 따라 넓은 곳으로 갔어요.", "길을 밝힌 것은?", "잎의 빛", ["큰 종", "빨간 다리", "종이 지도"], "무엇이 빛났는지 찾아요.", "잎의 빛이 길을 밝혔어요."),
        q("\"아름답다\"와 비슷한 말은?", "예쁘다", ["위험하다", "비었다", "작다"], "보기 좋은 모습을 칭찬하는 말이에요.", "아름답다와 예쁘다는 비슷해요."),
        q("비가 온 뒤 숲길은 ___ 했어요.", "조용", ["네모", "짠맛", "늦게"], "길의 모습을 나타내는 말을 골라요.", "숲길은 조용했다고 하면 자연스러워요."),
      ],
    },
    zh: {
      seed: [
        q("“猫”是什么意思？", "小小的宠物", ["一种天气", "书包", "大树"], "想一想会喵喵叫的动物。", "猫是小小的宠物。"),
        q("“大”的反义词是？", "小", ["开心", "快", "绿色"], "选择大小相反的词。", "大的反义词是小。"),
        q("小鸟可以在天空中 ___。", "飞", ["睡觉", "喝水", "画画"], "选择小鸟在天空中做的事。", "小鸟可以在天空中飞。"),
      ],
      grass: [
        q("哪个词和“开心”意思接近？", "快乐", ["寒冷", "慢", "空"], "找意思接近的心情词。", "开心和快乐意思接近。"),
        q("她 ___ 地读书。", "安静", ["圆圆", "蓝色", "昨天"], "选择读书时的样子。", "安静地读书很自然。"),
        reading("玛罗在叶子下面发现了一颗小种子。种子轻轻发光。", "玛罗发现了什么？", "小种子", ["红帽子", "大鼓", "蓝鱼"], "看第一句话。", "玛罗发现了小种子。"),
      ],
      flower: [
        reading("露米傍晚走在森林里。叶子的光照亮了道路。大家跟着光来到广场。", "什么照亮了道路？", "叶子的光", ["响亮的铃声", "红桥", "纸地图"], "找一找什么发光了。", "叶子的光照亮了道路。"),
        q("哪个词和“美丽”意思接近？", "漂亮", ["危险", "空", "很小"], "选择夸奖样子的词。", "美丽和漂亮意思接近。"),
        q("雨后，森林小路变得很 ___。", "安静", ["方形", "咸", "迟"], "选择能形容小路的词。", "安静适合这个句子。"),
      ],
    },
    fr: {
      seed: [
        q("Que veut dire « chat » ?", "un petit animal de compagnie", ["un temps météo", "un cartable", "un grand arbre"], "Pense à l'animal qui fait miaou.", "Un chat est un petit animal de compagnie."),
        q("Quel est le contraire de « grand » ?", "petit", ["joyeux", "rapide", "vert"], "Choisis la taille opposée.", "Le contraire de grand est petit."),
        q("L'oiseau peut ___ dans le ciel.", "voler", ["dormir", "boire", "peindre"], "Choisis ce que fait un oiseau dans le ciel.", "L'oiseau peut voler dans le ciel."),
      ],
      grass: [
        q("Quel mot ressemble à « content » ?", "joyeux", ["froid", "lent", "vide"], "Cherche un mot proche.", "Content et joyeux sont proches."),
        q("Elle lit le livre ___.", "doucement", ["rond", "bleu", "hier"], "Choisis comment elle lit.", "Elle lit doucement est naturel."),
        reading("Maro trouve une petite graine sous une feuille. La graine brille doucement.", "Que trouve Maro ?", "une petite graine", ["un chapeau rouge", "un tambour", "un poisson bleu"], "Regarde la première phrase.", "Maro trouve une petite graine."),
      ],
      flower: [
        reading("Lumi marche dans la forêt le soir. Les feuilles brillent et montrent le chemin. Pico et Moko suivent la lumière.", "Qu'est-ce qui montre le chemin ?", "les feuilles brillantes", ["une cloche", "un pont rouge", "une carte"], "Cherche ce qui brille.", "Les feuilles brillantes montrent le chemin."),
        q("Quel mot ressemble à « beau » ?", "joli", ["dangereux", "vide", "minuscule"], "Choisis un mot qui décrit quelque chose de beau.", "Beau et joli sont proches."),
        q("Le chemin de forêt était ___ après la pluie.", "calme", ["carré", "salé", "tard"], "Choisis un mot qui décrit le chemin.", "Calme va bien dans la phrase."),
      ],
    },
    de: {
      seed: [
        q("Was bedeutet „Katze“?", "ein kleines Haustier", ["eine Wetterart", "eine Schultasche", "ein großer Baum"], "Denk an ein Tier, das miaut.", "Katze bedeutet ein kleines Haustier."),
        q("Was ist das Gegenteil von „groß“?", "klein", ["fröhlich", "schnell", "grün"], "Wähle die andere Größe.", "Das Gegenteil von groß ist klein."),
        q("Der Vogel kann am Himmel ___.", "fliegen", ["schlafen", "trinken", "malen"], "Wähle, was ein Vogel am Himmel tut.", "Ein Vogel kann am Himmel fliegen."),
      ],
      grass: [
        q("Welches Wort passt zu „fröhlich“?", "glücklich", ["kalt", "langsam", "leer"], "Suche ein Wort mit ähnlichem Gefühl.", "Fröhlich und glücklich sind ähnlich."),
        q("Sie liest das Buch ___.", "leise", ["rund", "blau", "gestern"], "Wähle, wie sie liest.", "Sie liest leise klingt natürlich."),
        reading("Maro findet einen kleinen Samen unter einem Blatt. Der Samen leuchtet sanft.", "Was findet Maro?", "einen kleinen Samen", ["einen roten Hut", "eine laute Trommel", "einen blauen Fisch"], "Schau auf den ersten Satz.", "Maro findet einen kleinen Samen."),
      ],
      flower: [
        reading("Lumi geht abends durch den Wald. Die Blätter beginnen zu leuchten und zeigen den Weg. Pico und Moko folgen dem Licht.", "Was zeigt den Weg?", "die leuchtenden Blätter", ["eine laute Glocke", "eine rote Brücke", "eine Karte"], "Finde, was leuchtet.", "Die leuchtenden Blätter zeigen den Weg."),
        q("Welches Wort passt zu „schön“?", "hübsch", ["gefährlich", "leer", "winzig"], "Wähle ein lobendes Wort.", "Schön und hübsch sind ähnlich."),
        q("Der Waldweg war nach dem Regen ___.", "ruhig", ["eckig", "salzig", "spät"], "Wähle ein Wort für den Weg.", "Ruhig passt gut in den Satz."),
      ],
    },
    es: {
      seed: [
        q("¿Qué significa «gato»?", "un pequeño animal de compañía", ["un tipo de clima", "una mochila", "un árbol grande"], "Piensa en el animal que dice miau.", "Gato significa un pequeño animal de compañía."),
        q("¿Cuál es el contrario de «grande»?", "pequeño", ["feliz", "rápido", "verde"], "Elige el tamaño contrario.", "El contrario de grande es pequeño."),
        q("El pájaro puede ___ en el cielo.", "volar", ["dormir", "beber", "pintar"], "Elige lo que hace un pájaro en el cielo.", "El pájaro puede volar en el cielo."),
      ],
      grass: [
        q("¿Qué palabra se parece a «feliz»?", "contento", ["frío", "lento", "vacío"], "Busca una palabra con un sentimiento parecido.", "Feliz y contento se parecen."),
        q("Ella lee el libro ___.", "en silencio", ["redondo", "azul", "ayer"], "Elige cómo lee.", "Ella lee en silencio suena natural."),
        reading("Maro encuentra una semilla pequeña bajo una hoja. La semilla brilla suavemente.", "¿Qué encuentra Maro?", "una semilla pequeña", ["un sombrero rojo", "un tambor", "un pez azul"], "Mira la primera frase.", "Maro encuentra una semilla pequeña."),
      ],
      flower: [
        reading("Lumi camina por el bosque al atardecer. Las hojas empiezan a brillar y muestran el camino. Pico y Moko siguen la luz.", "¿Qué muestra el camino?", "las hojas brillantes", ["una campana", "un puente rojo", "un mapa"], "Busca qué brilla.", "Las hojas brillantes muestran el camino."),
        q("¿Qué palabra se parece a «bonito»?", "lindo", ["peligroso", "vacío", "diminuto"], "Elige una palabra de elogio.", "Bonito y lindo se parecen."),
        q("El camino del bosque estaba ___ después de la lluvia.", "tranquilo", ["cuadrado", "salado", "tarde"], "Elige una palabra para el camino.", "Tranquilo queda bien en la frase."),
      ],
    },
  };

  const advancedLanguageQuestions = {
    ja: [
      q("言葉をならべて、自然な文になるものはどれ？", "ルミは森で光を見つけた。", ["光はルミで森を見つけた。", "森を見つけた光はルミ。", "見つけた森はルミで光。"], "主語と動きを考えよう。", "「ルミは」が主語で、「見つけた」が動きだよ。"),
      q("「森がしんとしている」の「しんとしている」に近い意味は？", "とても静か", ["とても明るい", "とても重い", "とても速い"], "音が少ない様子を表す言葉だよ。", "しんとしているは、とても静かな様子だよ。"),
      q("文の主語はどれ？「小さなたねが、朝の光でひかりました。」", "小さなたねが", ["朝の光で", "ひかりました", "小さな"], "何がひかったのかを探そう。", "ひかったのは小さなたねだよ。"),
      q("「手をかす」の意味に近いものはどれ？", "手伝う", ["手を洗う", "手を上げる", "手紙を書く"], "本当に手をわたすわけではないよ。", "手をかすは、手伝うという意味だよ。"),
      reading("ピコは広場で迷っていました。モコは道に花びらをならべました。ルミは葉っぱの光で出口をてらしました。みんなで進むと、広場の奥に新しいたねがありました。", "出口をてらしたのはだれ？", "ルミ", ["ピコ", "モコ", "新しいたね"], "光を使った人を探そう。", "ルミが葉っぱの光で出口をてらしたよ。"),
    ],
    en: [
      q("Which sentence is in the best order?", "Lumi found a light in the forest.", ["A light found forest Lumi.", "Forest found Lumi a light.", "Found Lumi forest light."], "Look for who did the action.", "Lumi is the subject, and found is the action."),
      q("What does \"silent forest\" mean?", "a very quiet forest", ["a very bright forest", "a heavy forest", "a fast forest"], "Silent is about sound.", "Silent means very quiet."),
      q("What is the subject of this sentence? \"The tiny seed glowed in the morning light.\"", "The tiny seed", ["in the morning light", "glowed", "tiny"], "Ask: what glowed?", "The tiny seed glowed."),
      q("What does \"lend a hand\" mean?", "help someone", ["wash a hand", "raise a hand", "draw a hand"], "It is an expression, not a real hand.", "Lend a hand means help someone."),
      reading("Pico was unsure in the clearing. Moko placed petals on the path. Lumi used leaf light to show the exit. Together they found a new seed.", "Who showed the exit?", "Lumi", ["Pico", "Moko", "the new seed"], "Find who used light.", "Lumi showed the exit with leaf light."),
    ],
    ko: [
      q("가장 자연스러운 문장은?", "루미는 숲에서 빛을 찾았어요.", ["빛은 루미에서 숲을 찾았어요.", "숲을 찾은 빛은 루미예요.", "찾았어요 숲은 루미 빛."], "누가 무엇을 했는지 생각해요.", "루미가 빛을 찾은 문장이 자연스러워요."),
      q("\"조용한 숲\"과 가까운 뜻은?", "소리가 거의 없는 숲", ["아주 밝은 숲", "무거운 숲", "빠른 숲"], "조용하다는 소리와 관련 있어요.", "조용한 숲은 소리가 거의 없는 숲이에요."),
      q("문장의 주어는? \"작은 씨앗이 아침 빛에 반짝였어요.\"", "작은 씨앗이", ["아침 빛에", "반짝였어요", "작은"], "무엇이 반짝였는지 찾아요.", "반짝인 것은 작은 씨앗이에요."),
      q("\"손을 빌려주다\"와 가까운 뜻은?", "도와주다", ["손을 씻다", "손을 들다", "편지를 쓰다"], "진짜 손을 주는 뜻은 아니에요.", "손을 빌려주다는 도와주다는 뜻이에요."),
      reading("피코는 넓은 곳에서 길을 헷갈렸어요. 모코는 길에 꽃잎을 놓았어요. 루미는 잎의 빛으로 출구를 비추었어요.", "출구를 비춘 것은 누구인가요?", "루미", ["피코", "모코", "꽃잎"], "빛을 쓴 친구를 찾아요.", "루미가 출구를 비추었어요."),
    ],
    zh: [
      q("哪个句子最自然？", "露米在森林里发现了光。", ["光在露米里发现森林。", "森林发现了露米的光。", "发现森林露米光。"], "想一想谁做了什么。", "露米发现了光，这个句子最自然。"),
      q("“安静的森林”意思接近哪一个？", "声音很少的森林", ["很亮的森林", "很重的森林", "很快的森林"], "安静和声音有关。", "安静的森林就是声音很少的森林。"),
      q("句子的主语是？“小种子在早晨的光里闪闪发亮。”", "小种子", ["早晨的光里", "闪闪发亮", "小"], "找一找什么在发亮。", "发亮的是小种子。"),
      q("“帮一把”意思接近哪一个？", "帮助别人", ["洗手", "举手", "写信"], "这是一个表达，不是真的给一只手。", "帮一把就是帮助别人。"),
      reading("皮可在广场里有点迷路。莫可把花瓣放在路上。露米用叶子的光照亮出口。大家一起找到了新的种子。", "谁照亮了出口？", "露米", ["皮可", "莫可", "新的种子"], "找一找谁用了光。", "露米用叶子的光照亮了出口。"),
    ],
    fr: [
      q("Quelle phrase est la plus naturelle ?", "Lumi trouve une lumière dans la forêt.", ["Une lumière trouve forêt Lumi.", "Forêt trouve Lumi une lumière.", "Trouve Lumi forêt lumière."], "Cherche qui fait l'action.", "Lumi est le sujet, et trouve est l'action."),
      q("Que veut dire « forêt silencieuse » ?", "une forêt très calme", ["une forêt très claire", "une forêt lourde", "une forêt rapide"], "Silencieuse parle du son.", "Silencieuse veut dire très calme."),
      q("Quel est le sujet ? « La petite graine brille dans la lumière du matin. »", "La petite graine", ["dans la lumière du matin", "brille", "petite"], "Demande-toi : qu'est-ce qui brille ?", "La petite graine brille."),
      q("Que veut dire « donner un coup de main » ?", "aider quelqu'un", ["laver une main", "lever la main", "dessiner une main"], "C'est une expression.", "Donner un coup de main veut dire aider."),
      reading("Pico hésite dans la clairière. Moko pose des pétales sur le chemin. Lumi montre la sortie avec la lumière des feuilles.", "Qui montre la sortie ?", "Lumi", ["Pico", "Moko", "les pétales"], "Cherche qui utilise la lumière.", "Lumi montre la sortie."),
    ],
    de: [
      q("Welcher Satz ist am natürlichsten?", "Lumi findet ein Licht im Wald.", ["Ein Licht findet Wald Lumi.", "Wald findet Lumi ein Licht.", "Findet Lumi Wald Licht."], "Suche, wer etwas tut.", "Lumi ist die Person, die etwas findet."),
      q("Was bedeutet „stiller Wald“?", "ein sehr ruhiger Wald", ["ein sehr heller Wald", "ein schwerer Wald", "ein schneller Wald"], "Still hat mit Geräuschen zu tun.", "Still bedeutet sehr ruhig."),
      q("Was ist das Subjekt? „Der kleine Samen leuchtet im Morgenlicht.」", "Der kleine Samen", ["im Morgenlicht", "leuchtet", "kleine"], "Frage: Was leuchtet?", "Der kleine Samen leuchtet."),
      q("Was bedeutet „eine Hand reichen“?", "helfen", ["eine Hand waschen", "die Hand heben", "eine Hand malen"], "Das ist eine Redewendung.", "Eine Hand reichen bedeutet helfen."),
      reading("Pico ist auf der Lichtung unsicher. Moko legt Blütenblätter auf den Weg. Lumi zeigt den Ausgang mit Blattlicht.", "Wer zeigt den Ausgang?", "Lumi", ["Pico", "Moko", "die Blütenblätter"], "Suche, wer Licht benutzt.", "Lumi zeigt den Ausgang."),
    ],
    es: [
      q("¿Qué oración está mejor ordenada?", "Lumi encontró una luz en el bosque.", ["Una luz encontró bosque Lumi.", "Bosque encontró Lumi una luz.", "Encontró Lumi bosque luz."], "Busca quién hizo la acción.", "Lumi es quien encontró la luz."),
      q("¿Qué significa «bosque silencioso»?", "un bosque muy tranquilo", ["un bosque muy brillante", "un bosque pesado", "un bosque rápido"], "Silencioso habla del sonido.", "Silencioso significa muy tranquilo."),
      q("¿Cuál es el sujeto? «La semilla pequeña brilló con la luz de la mañana.»", "La semilla pequeña", ["con la luz de la mañana", "brilló", "pequeña"], "Pregunta: ¿qué brilló?", "La semilla pequeña brilló."),
      q("¿Qué significa «echar una mano»?", "ayudar a alguien", ["lavar una mano", "levantar la mano", "dibujar una mano"], "Es una expresión.", "Echar una mano significa ayudar."),
      reading("Pico dudaba en el claro. Moko puso pétalos en el camino. Lumi mostró la salida con la luz de las hojas.", "¿Quién mostró la salida?", "Lumi", ["Pico", "Moko", "los pétalos"], "Busca quién usó la luz.", "Lumi mostró la salida."),
    ],
  };

  Object.entries(advancedLanguageQuestions).forEach(([languageId, questions]) => {
    if (languageBanks[languageId]?.flower) {
      languageBanks[languageId].flower.push(...questions);
    }
  });

  const extraLanguageQuestions = {
    ja: {
      seed: [
        q("同じなかまのことばはどれ？「りんご・みかん・ぶどう」", "くだもの", ["のりもの", "どうぶつ", "天気"], "食べもののなかまを考えよう。", "りんご・みかん・ぶどうは、くだもののなかまだよ。"),
      ],
      grass: [
        q("文に入るしるしはどれ？「ルミは言いました___ いっしょに行こう」", "「", ["。", "、", "？"], "話した言葉の始まりにつけるしるしだよ。", "会話の始まりには「を使うよ。"),
        q("「走る・歩く・泳ぐ」に共通することは？", "体を動かすこと", ["色をぬること", "音を聞くこと", "数を数えること"], "どれも体の動きだよ。", "走る・歩く・泳ぐは、体を動かすことだよ。"),
      ],
      flower: [
        reading("朝、森の道はぬれていました。夜のあいだに雨がふったからです。マルップはすべらないように、ゆっくり歩きました。", "森の道がぬれていた理由は？", "夜に雨がふったから", ["朝日が出たから", "花がさいたから", "風がやんだから"], "理由を表す文を探そう。", "夜のあいだに雨がふったので、道がぬれていたよ。"),
        q("「それ」が指すものはどれ？「ルミは光る葉を見つけました。それを道しるべにしました。」", "光る葉", ["ルミ", "森", "道"], "直前に出てきたものを見よう。", "ここでの「それ」は光る葉のことだよ。"),
      ],
    },
    en: {
      seed: [
        q("Which group do apple, orange, and grape belong to?", "fruit", ["vehicles", "animals", "weather"], "Think about things you can eat.", "Apple, orange, and grape are fruit."),
      ],
      grass: [
        q("Which mark starts spoken words? Lumi said ___ let's go together.", "\"", [".", ",", "?"], "It begins what someone says.", "Quotation marks show spoken words."),
        q("What do run, walk, and swim have in common?", "moving your body", ["painting colors", "hearing sounds", "counting numbers"], "They are all actions.", "Run, walk, and swim are body actions."),
      ],
      flower: [
        reading("In the morning, the forest path was wet. Rain had fallen during the night. Maruppu walked slowly so he would not slip.", "Why was the path wet?", "Rain had fallen at night.", ["The sun came up.", "Flowers bloomed.", "The wind stopped."], "Look for the reason sentence.", "The path was wet because rain had fallen at night."),
        q("What does \"it\" mean? Lumi found a glowing leaf. She used it as a guide.", "the glowing leaf", ["Lumi", "the forest", "the path"], "Look at the noun just before it.", "It means the glowing leaf."),
      ],
    },
  };

  Object.entries(extraLanguageQuestions).forEach(([languageId, groups]) => {
    Object.entries(groups).forEach(([difficultyId, questions]) => {
      if (languageBanks[languageId]?.[difficultyId]) {
        languageBanks[languageId][difficultyId].push(...questions);
      }
    });
  });

  const upperLanguageQuestions = {
    ja: [
      q("次の文で、つなぎ言葉としていちばん合うものは？「雨がやみました。___ みんなは森の広場へ出かけました。」", "そこで", ["しかし", "または", "けれど"], "前の出来事を受けて、次の行動に進む言葉を選ぼう。", "雨がやんだので広場へ出かける流れには「そこで」が合うよ。"),
      q("文の主語はどれ？「空色のしずくが、朝の光を受けてきらりと光りました。」", "空色のしずくが", ["朝の光を", "受けて", "光りました"], "何が光ったのかを考えよう。", "光ったのは空色のしずくだよ。"),
      q("「協力」に近い意味の言葉はどれ？", "力を合わせること", ["ひとりで休むこと", "音を小さくすること", "道をまちがえること"], "みんなで一緒にする様子を考えよう。", "協力は、力を合わせることだよ。"),
      reading("ソラは高い木の上から森を見わたしました。広場には小さな光が三つ見えました。けれど、北の道にはまだ雲がかかっています。ソラはまず明るい広場へ行き、道しるべを集めることにしました。", "ソラがまず行くことにした場所は？", "明るい広場", ["北の道", "高い木の上", "雲の中"], "「まず」に続く行動を探そう。", "ソラはまず明るい広場へ行くことにしたよ。"),
    ],
    en: [
      q("Which connector fits best? The rain stopped. ___ everyone went to the clearing.", "So", ["But", "Or", "Before"], "Choose the word that shows the next action happens because of the first sentence.", "So fits because the rain stopped and everyone went out."),
      q("What is the subject? The sky-blue drop sparkled in the morning light.", "The sky-blue drop", ["in the morning light", "sparkled", "blue"], "Ask what sparkled.", "The sky-blue drop sparkled."),
      q("What is close to \"cooperate\"?", "work together", ["rest alone", "make sounds quiet", "choose the wrong path"], "Think about doing something with others.", "Cooperate means work together."),
      reading("Sora looked over the forest from a tall tree. Three small lights were shining in the clearing. The north path was still cloudy, so Sora chose to visit the bright clearing first.", "Where did Sora choose to go first?", "the bright clearing", ["the north path", "the tall tree", "inside a cloud"], "Look for the word first.", "Sora chose the bright clearing first."),
    ],
    ko: [
      q("이어 주는 말로 알맞은 것은? 비가 그쳤어요. ___ 모두 숲의 광장으로 갔어요.", "그래서", ["하지만", "또는", "먼저"], "앞일 때문에 다음 일이 이어지는 말을 골라요.", "비가 그쳐서 광장으로 갔으니 그래서가 알맞아요."),
      q("문장의 주어는? 하늘빛 물방울이 아침 햇살을 받아 반짝였어요.", "하늘빛 물방울이", ["아침 햇살을", "받아", "반짝였어요"], "무엇이 반짝였는지 생각해요.", "반짝인 것은 하늘빛 물방울이에요."),
      q("\"협력\"과 가까운 뜻은?", "힘을 합하는 것", ["혼자 쉬는 것", "소리를 줄이는 것", "길을 잘못 드는 것"], "함께 하는 모습을 생각해요.", "협력은 힘을 합하는 것이에요."),
      reading("소라는 높은 나무 위에서 숲을 바라보았어요. 광장에는 작은 빛 세 개가 보였어요. 북쪽 길에는 아직 구름이 있었기 때문에, 소라는 먼저 밝은 광장으로 가기로 했어요.", "소라가 먼저 가기로 한 곳은?", "밝은 광장", ["북쪽 길", "높은 나무 위", "구름 속"], "먼저 무엇을 했는지 찾아요.", "소라는 밝은 광장으로 먼저 가기로 했어요."),
    ],
    zh: [
      q("哪个连接词最合适？雨停了。___ 大家去了森林广场。", "于是", ["但是", "或者", "以前"], "选择表示接着行动的词。", "雨停后大家出发，所以“于是”合适。"),
      q("句子的主语是哪一部分？天蓝水滴在早晨的光里闪了一下。", "天蓝水滴", ["早晨的光里", "闪了一下", "天蓝"], "想一想是什么在闪光。", "闪光的是天蓝水滴。"),
      q("“合作”的意思接近哪一个？", "一起出力", ["一个人休息", "把声音变小", "走错路"], "想一想大家一起做事的样子。", "合作就是一起出力。"),
      reading("索拉站在高高的树上看森林。广场里有三点小光。北边的路还有云，所以索拉决定先去明亮的广场。", "索拉决定先去哪里？", "明亮的广场", ["北边的路", "高高的树上", "云里面"], "找一找“先”后面的地点。", "索拉决定先去明亮的广场。"),
    ],
    fr: [
      q("Quel connecteur convient ? La pluie s'est arrêtée. ___ tout le monde est allé à la clairière.", "Donc", ["Mais", "Ou", "Avant"], "Choisis le mot qui montre la suite.", "Donc convient car la pluie s'arrête puis on sort."),
      q("Quel est le sujet ? La goutte bleu ciel brille dans la lumière du matin.", "La goutte bleu ciel", ["dans la lumière du matin", "brille", "bleu"], "Demande-toi ce qui brille.", "La goutte bleu ciel brille."),
      q("Quel mot est proche de « coopérer » ?", "travailler ensemble", ["se reposer seul", "baisser le son", "prendre le mauvais chemin"], "Pense à faire quelque chose avec les autres.", "Coopérer veut dire travailler ensemble."),
      reading("Sora regarde la forêt depuis un grand arbre. Trois petites lumières brillent dans la clairière. Le chemin du nord est encore couvert de nuages, alors Sora choisit d'aller d'abord à la clairière claire.", "Où Sora va-t-il d'abord ?", "la clairière claire", ["le chemin du nord", "le grand arbre", "un nuage"], "Cherche le mot d'abord.", "Sora va d'abord à la clairière claire."),
    ],
    de: [
      q("Welches Verbindungswort passt? Der Regen hörte auf. ___ gingen alle zur Lichtung.", "Deshalb", ["Aber", "Oder", "Vorher"], "Wähle ein Wort, das eine Folge zeigt.", "Deshalb passt, weil nach dem Regen alle losgehen."),
      q("Was ist das Subjekt? Der himmelblaue Tropfen funkelte im Morgenlicht.", "Der himmelblaue Tropfen", ["im Morgenlicht", "funkelte", "blau"], "Frage: Was funkelte?", "Der himmelblaue Tropfen funkelte."),
      q("Was passt zu „zusammenarbeiten“?", "gemeinsam etwas tun", ["allein ausruhen", "leiser machen", "den falschen Weg nehmen"], "Denke an Arbeit mit anderen.", "Zusammenarbeiten heißt gemeinsam etwas tun."),
      reading("Sora blickt von einem hohen Baum über den Wald. Auf der Lichtung leuchten drei kleine Lichter. Der Nordweg ist noch wolkig, deshalb geht Sora zuerst zur hellen Lichtung.", "Wohin geht Sora zuerst?", "zur hellen Lichtung", ["zum Nordweg", "auf den hohen Baum", "in eine Wolke"], "Suche das Wort zuerst.", "Sora geht zuerst zur hellen Lichtung."),
    ],
    es: [
      q("¿Qué conector queda mejor? La lluvia paró. ___ todos fueron al claro.", "Entonces", ["Pero", "O", "Antes"], "Elige la palabra que muestra la siguiente acción.", "Entonces queda bien porque la lluvia paró y todos salieron."),
      q("¿Cuál es el sujeto? La gota azul cielo brilló con la luz de la mañana.", "La gota azul cielo", ["con la luz de la mañana", "brilló", "azul"], "Pregunta qué brilló.", "La gota azul cielo brilló."),
      q("¿Qué se parece a «cooperar»?", "trabajar juntos", ["descansar solo", "bajar el sonido", "tomar el camino equivocado"], "Piensa en hacer algo con otros.", "Cooperar significa trabajar juntos."),
      reading("Sora miró el bosque desde un árbol alto. En el claro brillaban tres luces pequeñas. El camino del norte seguía con nubes, así que Sora decidió ir primero al claro luminoso.", "¿A dónde decidió ir primero Sora?", "al claro luminoso", ["al camino del norte", "al árbol alto", "a una nube"], "Busca la palabra primero.", "Sora decidió ir primero al claro luminoso."),
    ],
  };

  Object.entries(upperLanguageQuestions).forEach(([languageId, questions]) => {
    if (languageBanks[languageId]) {
      languageBanks[languageId].sky = questions;
    }
  });

  const juniorHighLanguageQuestions = {
    ja: [
      q("次の文で、筆者の考えとしていちばん合うものは？「森の道は遠回りに見えた。しかし、仲間と歩く時間が、せいれいを知る手がかりになった。」", "遠回りにも大切な意味がある", ["近道だけが大切である", "仲間と歩く必要はない", "せいれいを知る手がかりはない"], "文の後半で何が大切だと言っているか考えよう。", "仲間と歩く時間が手がかりになったので、遠回りにも意味があると読めるよ。"),
      q("「星明かりが道を照らす。」の主語はどれ？", "星明かりが", ["道を", "照らす", "星"], "何が照らすのかを考えよう。", "照らすのは星明かりだよ。"),
      q("「慎重」に近い意味はどれ？", "よく考えて気をつけること", ["急いで動くこと", "強く光ること", "声を大きくすること"], "あわてず確かめる様子を考えよう。", "慎重は、よく考えて気をつけることだよ。"),
      reading("セナは星あかりをたよりに、古い地図を読みました。地図には、泉へ向かう道が二つありました。短い道は暗く、遠い道には小さな光が続いていました。セナは、みんなが安心して進める遠い道を選びました。", "セナが遠い道を選んだ理由は？", "安心して進めるから", ["いちばん短いから", "地図がなかったから", "泉へ行きたくなかったから"], "道の様子とセナの選び方を見よう。", "遠い道には光が続いていて、みんなが安心して進めるからだよ。"),
    ],
    en: [
      q("Which idea best matches the sentence? The path looked long, but walking together helped the spirits understand the forest.", "The long path had value", ["Only short paths matter", "Friends should not walk together", "The forest had no clues"], "Look for what helped the spirits.", "Walking together helped, so the long path had value."),
      q("What is the subject? Starlight shows the hidden path.", "Starlight", ["the hidden path", "shows", "hidden"], "Ask what shows the path.", "Starlight shows the path."),
      q("What is close to \"careful\"?", "acting with thought", ["moving too fast", "shining loudly", "forgetting clues"], "Think about checking before acting.", "Careful means acting with thought."),
      reading("Sena read an old map by starlight. Two paths led to the spring. The short path was dark, but the longer path had tiny lights. Sena chose the longer path so everyone could walk calmly.", "Why did Sena choose the longer path?", "everyone could walk calmly", ["it was the shortest", "there was no map", "Sena disliked the spring"], "Look at the last sentence.", "Sena chose it so everyone could walk calmly."),
    ],
  };

  Object.entries(juniorHighLanguageQuestions).forEach(([languageId, questions]) => {
    if (languageBanks[languageId]) {
      languageBanks[languageId].star = questions;
    }
  });

  const middleSchoolLanguageQuestions = {
    ja: {
      moon: [
        q("「月の道を、ノアがしずかに歩いた。」の述語はどれ？", "歩いた", ["月の道を", "ノアが", "しずかに"], "文の最後で、何をしたかを見よう。", "何をしたかを表す「歩いた」が述語だよ。"),
        q("次の文の要点として合うものは？「森の入口には小さな光があり、その光は進む道をやさしく教えてくれた。」", "光が道を教えた", ["入口がなくなった", "道は暗くなった", "森には光がなかった"], "一番大切な動きを見つけよう。", "小さな光が進む道を教えてくれたことが要点だよ。"),
        q("「明るい」の反対に近い言葉はどれ？", "暗い", ["広い", "近い", "丸い"], "光の多さが反対になる言葉を選ぼう。", "明るいの反対に近い言葉は暗いだよ。"),
      ],
      comet: [
        q("「ミラは、みんなが安心できるように、ゆっくり道を照らした。」この文からわかるミラの気持ちは？", "みんなを思いやる気持ち", ["急いで進みたい気持ち", "一人で遊びたい気持ち", "道を隠したい気持ち"], "何のために道を照らしたか考えよう。", "みんなが安心できるようにしているので、思いやる気持ちがわかるよ。"),
        q("「しかし」と同じように、前と後ろを逆の流れでつなぐ言葉はどれ？", "けれども", ["そして", "だから", "たとえば"], "前の内容とちがう流れになる言葉を探そう。", "けれどもは、前と後ろを逆の流れでつなぐ言葉だよ。"),
        reading("ミラは森の広場で、二つの道を見つけました。一つは近いけれど石が多く、もう一つは遠いけれど花の光が続いていました。ミラは、みんなが歩きやすい花の道を選びました。", "ミラが花の道を選んだ理由は？", "みんなが歩きやすいから", ["いちばん近いから", "石が多いから", "広場に戻りたいから"], "道の特徴をくらべよう。", "遠くても花の光が続き、みんなが歩きやすいからだよ。"),
      ],
    },
    en: {
      moon: [
        q("In this sentence, which word is the predicate? Noa walked quietly on the moon path.", "walked", ["Noa", "quietly", "moon path"], "Look for what Noa did.", "The action is walked."),
        q("What is the main idea? A small light at the forest entrance gently showed the path.", "The light showed the path", ["The entrance disappeared", "The path became dark", "There was no light"], "Find the most important action.", "The small light showed the path."),
        q("Which word is close to the opposite of bright?", "dark", ["wide", "near", "round"], "Think about light.", "Dark is close to the opposite of bright."),
      ],
      comet: [
        q("Mira lit the path slowly so everyone could feel calm. What feeling does this show?", "caring for everyone", ["wanting to hurry", "wanting to play alone", "hiding the path"], "Think about why Mira lit the path.", "Mira is caring for everyone."),
        q("Which word connects ideas in a contrasting way like however?", "but", ["and", "so", "for example"], "Look for a turn in meaning.", "But shows contrast."),
        reading("Mira found two paths in the forest square. One was short but full of stones. The other was longer, but flower lights lined the way. Mira chose the flower path so everyone could walk easily.", "Why did Mira choose the flower path?", "everyone could walk easily", ["it was shortest", "it had many stones", "Mira wanted to go back"], "Compare the paths.", "The flower path was easier for everyone to walk."),
      ],
    },
  };

  Object.entries(middleSchoolLanguageQuestions).forEach(([languageId, groups]) => {
    Object.entries(groups).forEach(([difficultyId, questions]) => {
      if (languageBanks[languageId]) {
        languageBanks[languageId][difficultyId] = questions;
      }
    });
  });

  const languageSupplements = {
    ja: {
      seed: [
        q("「早い」の反対はどれ？", "おそい", ["大きい", "丸い", "青い"], "速さが反対になることばを選ぼう。", "早いの反対は、おそいだよ。"),
        q("文に入ることばはどれ？「花が きれいに ___。」", "さきました", ["走りました", "読みました", "食べました"], "花に合う動きを考えよう。", "花はきれいにさきました。"),
      ],
      grass: [
        q("「はじめに」の次に続きやすいことばは？", "つぎに", ["かなり", "からい", "青く"], "順番を表すことばを探そう。", "はじめに、つぎに、という順番で使えるよ。"),
        q("「明るい声」に合う気持ちはどれ？", "うれしい", ["ねむい", "からい", "四角い"], "声の様子から気持ちを考えよう。", "明るい声は、うれしい気持ちに合うよ。"),
      ],
      sky: [
        q("次の文で、理由を表す言葉はどれ？「雨がふったので、道がぬれていました。」", "ので", ["道", "雨", "ぬれて"], "なぜそうなったかをつなぐ言葉を探そう。", "「ので」は理由を表す言葉だよ。"),
        reading("モコは花びらを三まい集めました。ピコは小さなたねを見つけました。ソラは二人の話を聞いて、広場に行く道を選びました。", "ソラが道を選ぶ前にしたことは？", "二人の話を聞いた", ["花びらを集めた", "たねを食べた", "雨をふらせた"], "ソラの行動を順番に見よう。", "ソラは二人の話を聞いてから、道を選んだよ。"),
      ],
    },
    en: {
      seed: [
        q("What is the opposite of \"early\"?", "late", ["round", "blue", "large"], "Choose the opposite time word.", "The opposite of early is late."),
        q("The flower ___ in the sun.", "blooms", ["runs", "reads", "eats"], "Choose what a flower can do.", "A flower blooms in the sun."),
      ],
      grass: [
        q("Which word often comes after \"first\"?", "next", ["spicy", "square", "blue"], "Look for an order word.", "First and next show order."),
        q("Which feeling fits a bright voice?", "happy", ["sleepy", "salty", "square"], "Think about the feeling in the voice.", "A bright voice can sound happy."),
      ],
      sky: [
        q("Which word shows a reason? The path was wet because it rained.", "because", ["path", "wet", "rained"], "Find the word that tells why.", "Because shows a reason."),
        reading("Moko gathered three petals. Pico found a tiny seed. Sora listened to them and chose the path to the clearing.", "What did Sora do before choosing the path?", "listened to them", ["gathered petals", "ate a seed", "made rain"], "Follow Sora's actions in order.", "Sora listened before choosing the path."),
      ],
    },
    ko: {
      seed: [
        q("\"빠른\"의 반대말은?", "느린", ["큰", "동그란", "파란"], "속도가 반대인 말을 골라요.", "빠른의 반대말은 느린이에요."),
        q("꽃이 햇빛을 받아 ___어요.", "피었", ["달렸", "읽었", "먹었"], "꽃에 어울리는 말을 골라요.", "꽃은 햇빛을 받아 피었어요."),
      ],
      grass: [
        q("\"먼저\" 다음에 어울리는 말은?", "다음에", ["매운", "네모난", "파랗게"], "순서를 나타내는 말을 찾아요.", "먼저, 다음에로 순서를 말할 수 있어요."),
        q("\"밝은 목소리\"에 어울리는 마음은?", "기쁜", ["졸린", "짠", "네모난"], "목소리 느낌을 생각해요.", "밝은 목소리는 기쁜 마음에 어울려요."),
      ],
      sky: [
        q("이유를 나타내는 말은? 비가 왔기 때문에 길이 젖었어요.", "때문에", ["길", "비", "젖었어요"], "왜 그런지 이어 주는 말을 찾아요.", "때문에는 이유를 나타내요."),
        reading("모코는 꽃잎 세 장을 모았어요. 피코는 작은 씨앗을 찾았어요. 소라는 두 친구의 이야기를 듣고 광장으로 가는 길을 골랐어요.", "소라는 길을 고르기 전에 무엇을 했나요?", "두 친구의 이야기를 들었어요", ["꽃잎을 모았어요", "씨앗을 먹었어요", "비를 내렸어요"], "소라의 행동 순서를 봐요.", "소라는 이야기를 듣고 나서 길을 골랐어요."),
      ],
    },
    zh: {
      seed: [
        q("“快”的反义词是哪个？", "慢", ["大", "圆", "蓝"], "选择速度相反的词。", "快的反义词是慢。"),
        q("花在阳光下 ___。", "开放", ["跑步", "读书", "吃饭"], "选择适合花的动作。", "花会在阳光下开放。"),
      ],
      grass: [
        q("“首先”后面常接哪个词？", "然后", ["很辣", "方形", "蓝色"], "找表示顺序的词。", "首先、然后可以表示顺序。"),
        q("“明亮的声音”适合哪种心情？", "开心", ["困", "咸", "方形"], "想一想声音里的心情。", "明亮的声音适合开心的心情。"),
      ],
      sky: [
        q("哪个词表示原因？因为下雨了，所以路湿了。", "因为", ["路", "湿了", "下雨"], "找说明为什么的词。", "因为表示原因。"),
        reading("莫可收集了三片花瓣。皮可发现了一颗小种子。索拉听了他们的话，选择了去广场的路。", "索拉选择路之前做了什么？", "听了他们的话", ["收集花瓣", "吃了种子", "让雨落下"], "按顺序看索拉的行动。", "索拉先听了他们的话，然后选择了路。"),
      ],
    },
    fr: {
      seed: [
        q("Quel est le contraire de « tôt » ?", "tard", ["grand", "rond", "bleu"], "Choisis le mot de temps contraire.", "Le contraire de tôt est tard."),
        q("La fleur ___ au soleil.", "fleurit", ["court", "lit", "mange"], "Choisis ce que fait une fleur.", "La fleur fleurit au soleil."),
      ],
      grass: [
        q("Quel mot vient souvent après « d'abord » ?", "ensuite", ["épicé", "carré", "bleu"], "Cherche un mot d'ordre.", "D'abord puis ensuite montrent l'ordre."),
        q("Quelle émotion va avec une voix claire ?", "joyeuse", ["fatiguée", "salée", "carrée"], "Pense au sentiment de la voix.", "Une voix claire peut être joyeuse."),
      ],
      sky: [
        q("Quel mot montre la raison ? Le chemin est mouillé parce qu'il a plu.", "parce que", ["chemin", "mouillé", "plu"], "Trouve le mot qui dit pourquoi.", "Parce que montre une raison."),
        reading("Moko ramasse trois pétales. Pico trouve une petite graine. Sora les écoute et choisit le chemin vers la clairière.", "Que fait Sora avant de choisir le chemin ?", "il les écoute", ["il ramasse des pétales", "il mange une graine", "il fait pleuvoir"], "Suis les actions de Sora.", "Sora écoute avant de choisir."),
      ],
    },
    de: {
      seed: [
        q("Was ist das Gegenteil von „früh“?", "spät", ["groß", "rund", "blau"], "Wähle das Gegenteil in der Zeit.", "Das Gegenteil von früh ist spät."),
        q("Die Blume ___ in der Sonne.", "blüht", ["rennt", "liest", "isst"], "Wähle, was eine Blume tut.", "Eine Blume blüht in der Sonne."),
      ],
      grass: [
        q("Welches Wort passt oft nach „zuerst“?", "danach", ["scharf", "eckig", "blau"], "Suche ein Wort für Reihenfolge.", "Zuerst und danach zeigen eine Reihenfolge."),
        q("Welches Gefühl passt zu einer hellen Stimme?", "fröhlich", ["müde", "salzig", "eckig"], "Denke an die Stimmung der Stimme.", "Eine helle Stimme kann fröhlich klingen."),
      ],
      sky: [
        q("Welches Wort zeigt den Grund? Der Weg war nass, weil es geregnet hat.", "weil", ["Weg", "nass", "geregnet"], "Finde das Wort für warum.", "Weil zeigt einen Grund."),
        reading("Moko sammelt drei Blütenblätter. Pico findet einen kleinen Samen. Sora hört ihnen zu und wählt den Weg zur Lichtung.", "Was macht Sora vor dem Wählen des Weges?", "hört ihnen zu", ["sammelt Blütenblätter", "isst einen Samen", "macht Regen"], "Folge Soras Handlungen.", "Sora hört zu, bevor er wählt."),
      ],
    },
    es: {
      seed: [
        q("¿Cuál es el contrario de «temprano»?", "tarde", ["grande", "redondo", "azul"], "Elige la palabra de tiempo opuesta.", "El contrario de temprano es tarde."),
        q("La flor ___ con el sol.", "florece", ["corre", "lee", "come"], "Elige lo que hace una flor.", "La flor florece con el sol."),
      ],
      grass: [
        q("¿Qué palabra suele ir después de «primero»?", "después", ["picante", "cuadrado", "azul"], "Busca una palabra de orden.", "Primero y después muestran orden."),
        q("¿Qué emoción va con una voz luminosa?", "alegre", ["cansada", "salada", "cuadrada"], "Piensa en cómo suena la voz.", "Una voz luminosa puede sonar alegre."),
      ],
      sky: [
        q("¿Qué palabra muestra una razón? El camino estaba mojado porque llovió.", "porque", ["camino", "mojado", "llovió"], "Busca la palabra que dice por qué.", "Porque muestra una razón."),
        reading("Moko recoge tres pétalos. Pico encuentra una semilla pequeña. Sora los escucha y elige el camino al claro.", "¿Qué hace Sora antes de elegir el camino?", "los escucha", ["recoge pétalos", "come una semilla", "hace llover"], "Sigue las acciones de Sora.", "Sora escucha antes de elegir."),
      ],
    },
  };

  Object.entries(languageSupplements).forEach(([languageId, groups]) => {
    Object.entries(groups).forEach(([difficultyId, questions]) => {
      if (languageBanks[languageId]?.[difficultyId]) {
        languageBanks[languageId][difficultyId].push(...questions);
      }
    });
  });

  function q(story, answer, traps, hint, explanation) {
    return { story, text: story, answer, choiceTraps: traps, hint, explanation, hintText: hint, type: "language", operation: "language", subject: "japanese" };
  }

  function reading(passage, prompt, answer, traps, hint, explanation) {
    return { story: `${passage}\n\n${prompt}`, text: prompt, answer, choiceTraps: traps, hint, explanation, hintText: prompt, type: "reading", operation: "reading", subject: "japanese" };
  }

  function choose(list, randomFn) {
    return list[Math.min(list.length - 1, Math.floor(randomFn() * list.length))];
  }

  function shuffle(list, randomFn) {
    return list
      .map((value) => ({ value, sort: randomFn() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item) => item.value);
  }

  function normalizeSignaturePart(value) {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 96);
  }

  function getQuestionSignature(question) {
    const subject = normalizeSignaturePart(question?.subject || "math");
    const type = normalizeSignaturePart(question?.type || question?.operation || "question");
    const operation = normalizeSignaturePart(question?.operation || type);
    const text = normalizeSignaturePart(question?.text || question?.hintText || question?.story || "");
    const answer = normalizeSignaturePart(question?.answer);
    return `${subject}:${type}:${operation}:${text}:${answer}`;
  }

  function makeAttemptRandom(randomFn, attempt) {
    if (attempt <= 0) return randomFn;
    let callIndex = 0;
    return () => {
      const base = Number(randomFn());
      const safeBase = Number.isFinite(base) ? base : Math.random();
      callIndex += 1;
      return (safeBase + attempt * 0.137 + callIndex * 0.073) % 1;
    };
  }

  function buildChoices(answer, randomFn, traps = []) {
    const values = [answer, ...traps].filter((value, index, list) => list.findIndex((item) => String(item) === String(value)) === index);
    if (typeof answer === "number") {
      let offset = 1;
      while (values.length < 4) {
        values.push(answer + offset);
        offset += 1;
      }
    }
    return shuffle(values.slice(0, 4), randomFn);
  }

  function getLanguage(languageId) {
    return languages.find((language) => language.id === languageId) || languages[0];
  }

  function getSubject(subjectId, languageId = DEFAULT_LANGUAGE) {
    const base = subjects.find((subject) => subject.id === subjectId) || subjects[0];
    const translated = subjectText[languageId]?.[base.id] || subjectText.en[base.id] || subjectText.ja[base.id];
    return { ...base, name: translated[0], actionLabel: translated[1], challengeLabel: translated[2], homeLabel: translated[3] };
  }

  function getDifficulty(difficultyId, languageId = DEFAULT_LANGUAGE) {
    const base = difficulties.find((item) => item.id === difficultyId) || { id: difficultyId };
    const translated = spiritText[languageId]?.[difficultyId] || spiritText.en[difficultyId] || spiritText.ja[difficultyId];
    return {
      ...base,
      id: difficultyId,
      spiritName: translated[0],
      gradeLabel: translated[1],
      label: translated[2],
      description: translated[4],
      reward: translated[5],
      subjectLabels: { math: translated[2], japanese: translated[3] },
      operations: difficultyId === "seed" ? ["add", "subtract"] : difficultyId === "grass" ? ["multiply", "multiply", "divide"] : difficultyId === "sky" ? upperMathOperations : difficultyId === "moon" ? ["signedNumber", "simpleEquation", "algebraValue", "proportional"] : difficultyId === "comet" ? ["simultaneous", "linearFunction", "angle", "expressionExpand"] : difficultyId === "star" ? ["linearEquation", "quadratic", "functionValue", "pythagorean"] : ["largeMultiply", "largeDivide", "mixed"],
      questionTypes: difficultyId === "seed" ? ["straight", "straight", "blank", "word"] : difficultyId === "grass" ? ["word", "compare", "blank", "twoStep", "straight"] : difficultyId === "sky" ? upperMathTypes : difficultyId === "moon" ? juniorHighFirstMathTypes : difficultyId === "comet" ? juniorHighSecondMathTypes : difficultyId === "star" ? juniorHighThirdMathTypes : advancedMathTypes,
    };
  }

  function makeBaseOperation(operation, randomFn) {
    if (operation === "add") {
      const left = 2 + Math.floor(randomFn() * 18);
      const right = 1 + Math.floor(randomFn() * 12);
      return { left, right, answer: left + right, text: `${left} + ${right}`, operation: "add", type: "straight" };
    }
    if (operation === "subtract") {
      const answer = 1 + Math.floor(randomFn() * 18);
      const right = 1 + Math.floor(randomFn() * 12);
      const left = answer + right;
      return { left, right, answer, text: `${left} - ${right}`, operation: "subtract", type: "straight" };
    }
    if (operation === "multiply") {
      const left = 2 + Math.floor(randomFn() * 8);
      const right = 2 + Math.floor(randomFn() * 8);
      return { left, right, answer: left * right, text: `${left} × ${right}`, operation: "multiply", type: "straight" };
    }
    if (operation === "divide") {
      const right = 2 + Math.floor(randomFn() * 8);
      const answer = 2 + Math.floor(randomFn() * 8);
      const left = right * answer;
      return { left, right, answer, text: `${left} ÷ ${right}`, operation: "divide", type: "straight" };
    }
    if (operation === "largeMultiply") {
      const left = 11 + Math.floor(randomFn() * 20);
      const right = 2 + Math.floor(randomFn() * 8);
      return { left, right, answer: left * right, text: `${left} × ${right}`, operation: "multiply", type: "straight" };
    }
    if (operation === "largeDivide") {
      const right = 3 + Math.floor(randomFn() * 9);
      const answer = 6 + Math.floor(randomFn() * 18);
      const left = right * answer;
      return { left, right, answer, text: `${left} ÷ ${right}`, operation: "divide", type: "straight" };
    }
    const a = 8 + Math.floor(randomFn() * 20);
    const b = 2 + Math.floor(randomFn() * 9);
    const c = 1 + Math.floor(randomFn() * 9);
    return { left: a, right: b, answer: a - b + c, text: `${a} - ${b} + ${c}`, operation: "mixed", type: "twoStep" };
  }

  function makeBlankQuestion(difficulty, randomFn) {
    const operation = choose(difficulty.operations, randomFn);
    const qn = makeBaseOperation(operation, randomFn);
    if (qn.operation === "add" || qn.operation === "multiply") {
      qn.answer = qn.right;
      qn.hintText = `${qn.left} ${qn.operation === "add" ? "+" : "×"} □ = ${qn.left + (qn.operation === "add" ? qn.right : 0) || qn.left * qn.right}`;
      if (qn.operation === "multiply") qn.hintText = `${qn.left} × □ = ${qn.left * qn.answer}`;
    } else if (qn.operation === "subtract") {
      qn.answer = qn.right;
      qn.hintText = `${qn.left} - □ = ${qn.left - qn.right}`;
    } else {
      qn.answer = qn.right;
      qn.hintText = `${qn.left} ÷ □ = ${qn.left / qn.right}`;
    }
    qn.type = "blank";
    qn.text = qn.hintText;
    return qn;
  }

  function makeCompareQuestion(difficulty, languageId, randomFn) {
    const q1 = makeBaseOperation(choose(difficulty.operations, randomFn), randomFn);
    const q2 = makeBaseOperation(choose(difficulty.operations, randomFn), randomFn);
    const words = compareWords[languageId] || compareWords.en;
    const answer = q1.answer === q2.answer ? words[2] : q1.answer > q2.answer ? words[0] : words[1];
    return {
      left: q1.answer,
      right: q2.answer,
      answer,
      text: `${q1.text} / ${q2.text}`,
      operation: "compare",
      type: "compare",
      choiceTraps: words,
      hintText: (mathText[languageId] || mathText.en).compareHint,
    };
  }

  function makeTwoStepQuestion(difficulty, randomFn) {
    const qn = makeBaseOperation(difficulty.id === "seed" ? "add" : "mixed", randomFn);
    qn.type = "twoStep";
    return qn;
  }

  function padMinute(value) {
    return String(value).padStart(2, "0");
  }

  function timeAnswer(hour, minute, languageId) {
    if (languageId === "ja") return `${hour}時${minute}分`;
    if (languageId === "ko") return `${hour}시 ${minute}분`;
    if (languageId === "zh") return `${hour}点${minute}分`;
    return `${hour}:${padMinute(minute)}`;
  }

  function localSet(languageId, values) {
    return values[languageId] || values.en;
  }

  function makeSpecialMathQuestion(type, languageId, randomFn) {
    const lang = getLanguage(languageId).id;
    if (type === "signedNumber") {
      const first = 3 + Math.floor(randomFn() * 10);
      const second = 2 + Math.floor(randomFn() * 9);
      const useMinus = randomFn() < 0.5;
      const answer = useMinus ? first - second * 2 : -first + second;
      const text = useMinus ? `${first} - ${second * 2}` : `-${first} + ${second}`;
      const story = localSet(lang, {
        ja: `ノアが月の石をならべているよ。${text} を計算すると、光の数はいくつ？`,
        en: `Noa lines up moon stones. What is ${text}?`,
      });
      const hint = localSet(lang, {
        ja: "正の数と負の数の向きを考えよう。",
        en: "Think about positive and negative directions.",
      });
      return { left: first, right: second, answer, text, operation: "signedNumber", type, story, hint, explanation: `${text} = ${answer}.`, hintText: text, choiceTraps: [answer + 1, answer - 1, -answer] };
    }

    if (type === "simpleEquation") {
      const answer = 2 + Math.floor(randomFn() * 9);
      const constant = 2 + Math.floor(randomFn() * 8);
      const total = answer + constant;
      const story = localSet(lang, {
        ja: `ノアが月のとびらに「x + ${constant} = ${total}」と書かれた式を見つけたよ。xはいくつ？`,
        en: `Noa found x + ${constant} = ${total} on a moon gate. What is x?`,
      });
      const hint = localSet(lang, {
        ja: `${total}から${constant}をひくと x がわかるよ。`,
        en: `Subtract ${constant} from ${total}.`,
      });
      return { left: total, right: constant, answer, text: `x + ${constant} = ${total}`, operation: "simpleEquation", type, story, hint, explanation: `${total} - ${constant} = ${answer}.`, hintText: `x + ${constant} = ${total}`, choiceTraps: [answer + 1, Math.max(0, answer - 1), total + constant] };
    }

    if (type === "algebraValue") {
      const coefficient = 2 + Math.floor(randomFn() * 5);
      const constant = 1 + Math.floor(randomFn() * 6);
      const x = 2 + Math.floor(randomFn() * 7);
      const answer = coefficient * x + constant;
      const story = localSet(lang, {
        ja: `ノアの月あかりは ${coefficient}x + ${constant} で強くなるよ。x = ${x} のとき、いくつになる？`,
        en: `Noa's moonlight follows ${coefficient}x + ${constant}. When x = ${x}, what is it?`,
      });
      const hint = localSet(lang, {
        ja: `xに${x}を入れて、かけ算から計算しよう。`,
        en: `Put ${x} in for x, then multiply first.`,
      });
      return { left: coefficient, right: x, answer, text: `${coefficient}x + ${constant}, x = ${x}`, operation: "algebraValue", type, story, hint, explanation: `${coefficient} × ${x} + ${constant} = ${answer}.`, hintText: `${coefficient}x + ${constant}`, choiceTraps: [answer + coefficient, Math.max(0, answer - coefficient), coefficient + x + constant] };
    }

    if (type === "proportional") {
      const rate = 2 + Math.floor(randomFn() * 5);
      const x = 3 + Math.floor(randomFn() * 6);
      const answer = rate * x;
      const story = localSet(lang, {
        ja: `月の道では x が1ふえると光が ${rate}こ ふえるよ。x = ${x} のとき、光は何こ？`,
        en: `On the moon path, light is y = ${rate}x. When x = ${x}, what is y?`,
      });
      const hint = localSet(lang, {
        ja: `${rate} × ${x} を計算しよう。`,
        en: `Calculate ${rate} × ${x}.`,
      });
      return { left: rate, right: x, answer, text: `y = ${rate}x, x = ${x}`, operation: "proportional", type, story, hint, explanation: `${rate} × ${x} = ${answer}.`, hintText: `y = ${rate}x`, choiceTraps: [answer + rate, Math.max(0, answer - rate), rate + x] };
    }

    if (type === "simultaneous") {
      const x = 2 + Math.floor(randomFn() * 7);
      const y = 1 + Math.floor(randomFn() * 6);
      const sum = x + y;
      const diff = x - y;
      const story = localSet(lang, {
        ja: `ミラがほうき星のメモを見つけたよ。x + y = ${sum}、x - y = ${diff} のとき、xはいくつ？`,
        en: `Mira found a comet note: x + y = ${sum}, x - y = ${diff}. What is x?`,
      });
      const hint = localSet(lang, {
        ja: `2つの式をたすと 2x がわかるよ。`,
        en: `Add the two equations to find 2x.`,
      });
      return { left: sum, right: diff, answer: x, text: `x + y = ${sum}, x - y = ${diff}`, operation: "simultaneous", type, story, hint, explanation: `${sum} + ${diff} = ${x * 2}, so x = ${x}.`, hintText: `x + y = ${sum} / x - y = ${diff}`, choiceTraps: [y, sum, diff] };
    }

    if (type === "linearFunction") {
      const slope = 1 + Math.floor(randomFn() * 5);
      const intercept = Math.floor(randomFn() * 6);
      const x = 2 + Math.floor(randomFn() * 6);
      const answer = slope * x + intercept;
      const story = localSet(lang, {
        ja: `ミラのほうき星は y = ${slope}x + ${intercept} の道を進むよ。x = ${x} のとき y はいくつ？`,
        en: `Mira's comet follows y = ${slope}x + ${intercept}. When x = ${x}, what is y?`,
      });
      const hint = localSet(lang, {
        ja: `xに${x}を入れて計算しよう。`,
        en: `Put ${x} in for x and calculate.`,
      });
      return { left: slope, right: x, answer, text: `y = ${slope}x + ${intercept}, x = ${x}`, operation: "linearFunction", type, story, hint, explanation: `${slope} × ${x} + ${intercept} = ${answer}.`, hintText: `y = ${slope}x + ${intercept}`, choiceTraps: [answer + slope, Math.max(0, answer - slope), slope + x + intercept] };
    }

    if (type === "angle") {
      const known = 35 + Math.floor(randomFn() * 50);
      const answer = 180 - known;
      const story = localSet(lang, {
        ja: `ミラがまっすぐな星の橋を見つけたよ。片方の角が ${known}° のとき、となりの角は何度？`,
        en: `Mira found a straight star bridge. If one angle is ${known}°, what is the next angle?`,
      });
      const hint = localSet(lang, {
        ja: `一直線の角は合わせて180°だよ。`,
        en: `Angles on a straight line add to 180°.`,
      });
      return { left: 180, right: known, answer, text: `180 - ${known}`, operation: "angle", type, story, hint, explanation: `180 - ${known} = ${answer}.`, hintText: `180° - ${known}°`, choiceTraps: [known, answer + 10, Math.max(0, answer - 10)] };
    }

    if (type === "expressionExpand") {
      const multiplier = 2 + Math.floor(randomFn() * 5);
      const constant = 1 + Math.floor(randomFn() * 7);
      const answer = `${multiplier}x + ${multiplier * constant}`;
      const story = localSet(lang, {
        ja: `ミラの星の羽に ${multiplier}(x + ${constant}) と書いてあるよ。広げるとどれ？`,
        en: `Mira's comet feather shows ${multiplier}(x + ${constant}). Which expanded form matches?`,
      });
      const hint = localSet(lang, {
        ja: `${multiplier}を x と ${constant} の両方にかけよう。`,
        en: `Multiply both x and ${constant} by ${multiplier}.`,
      });
      return { left: multiplier, right: constant, answer, text: `${multiplier}(x + ${constant})`, operation: "expressionExpand", type, story, hint, explanation: `${multiplier} × x と ${multiplier} × ${constant} で ${answer}.`, hintText: `${multiplier}(x + ${constant})`, choiceTraps: [`${multiplier}x + ${constant}`, `x + ${multiplier * constant}`, `${multiplier + constant}x`] };
    }

    if (type === "linearEquation") {
      const coefficient = 2 + Math.floor(randomFn() * 5);
      const answer = 2 + Math.floor(randomFn() * 9);
      const constant = 1 + Math.floor(randomFn() * 8);
      const total = coefficient * answer + constant;
      const story = localSet(lang, {
        ja: `セナが星の門を開く式を見つけたよ。${coefficient}x + ${constant} = ${total} のとき、xはいくつ？`,
        en: `Sena found a gate equation: ${coefficient}x + ${constant} = ${total}. What is x?`,
      });
      const hint = localSet(lang, {
        ja: `まず ${constant} をひいてから、${coefficient}でわろう。`,
        en: `Subtract ${constant} first, then divide by ${coefficient}.`,
      });
      return { left: coefficient, right: constant, answer, text: `${coefficient}x + ${constant} = ${total}`, operation: "linearEquation", type, story, hint, explanation: `${total} - ${constant} = ${total - constant}, ${total - constant} ÷ ${coefficient} = ${answer}.`, hintText: `${coefficient}x + ${constant} = ${total}`, choiceTraps: [answer + 1, Math.max(0, answer - 1), answer + coefficient] };
    }

    if (type === "factorization") {
      const first = 1 + Math.floor(randomFn() * 6);
      const second = 1 + Math.floor(randomFn() * 6);
      const sum = first + second;
      const product = first * second;
      const answer = `(x + ${first})(x + ${second})`;
      const story = localSet(lang, {
        ja: `星のかけらをならべる式だよ。x² + ${sum}x + ${product} を因数分解するとどれ？`,
        en: `Factor this starlight expression: x² + ${sum}x + ${product}.`,
      });
      const hint = localSet(lang, {
        ja: `たして ${sum}、かけて ${product} になる2つの数を探そう。`,
        en: `Find two numbers that add to ${sum} and multiply to ${product}.`,
      });
      return { left: sum, right: product, answer, text: `x² + ${sum}x + ${product}`, operation: "factorization", type, story, hint, explanation: `${first} + ${second} = ${sum}, ${first} × ${second} = ${product}.`, hintText: `x² + ${sum}x + ${product}`, choiceTraps: [`(x + ${sum})(x + 1)`, `(x + ${product})(x + 1)`, `(x - ${first})(x - ${second})`, `(x + ${first + 1})(x + ${second + 1})`] };
    }

    if (type === "quadratic") {
      const answer = 3 + Math.floor(randomFn() * 8);
      const square = answer * answer;
      const story = localSet(lang, {
        ja: `セナの星あかりが x² = ${square} と光ったよ。正の数の x はいくつ？`,
        en: `Sena's starlight shows x² = ${square}. What positive number is x?`,
      });
      const hint = localSet(lang, {
        ja: `同じ数を2回かけて ${square} になる数を探そう。`,
        en: `Find the number that times itself equals ${square}.`,
      });
      return { left: square, right: answer, answer, text: `x² = ${square}`, operation: "quadratic", type, story, hint, explanation: `${answer} × ${answer} = ${square}.`, hintText: `x² = ${square}`, choiceTraps: [answer + 1, Math.max(1, answer - 1), square] };
    }

    if (type === "pythagorean") {
      const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]];
      const triple = triples[Math.floor(randomFn() * triples.length)];
      const [a, b, answer] = triple;
      const story = localSet(lang, {
        ja: `直角に曲がる星の橋があるよ。短い道が ${a}m と ${b}m のとき、ななめの道は何m？`,
        en: `A right-triangle star bridge has sides ${a} m and ${b} m. How long is the diagonal?`,
      });
      const hint = localSet(lang, {
        ja: `直角三角形では a² + b² = c² を使えるよ。`,
        en: `Use a² + b² = c² for a right triangle.`,
      });
      return { left: a, right: b, answer, text: `${a}² + ${b}² = ?²`, operation: "pythagorean", type, story, hint, explanation: `${a}² + ${b}² = ${answer}², so ${answer}m.`, hintText: `${a}² + ${b}² = ?²`, choiceTraps: [answer + 1, answer - 1, a + b] };
    }

    if (type === "functionValue") {
      const slope = 2 + Math.floor(randomFn() * 5);
      const intercept = 1 + Math.floor(randomFn() * 6);
      const x = 1 + Math.floor(randomFn() * 6);
      const answer = slope * x + intercept;
      const story = localSet(lang, {
        ja: `星の道は y = ${slope}x + ${intercept} で光るよ。x = ${x} のとき、yはいくつ？`,
        en: `The star path follows y = ${slope}x + ${intercept}. When x = ${x}, what is y?`,
      });
      const hint = localSet(lang, {
        ja: `xに ${x} を入れて計算しよう。`,
        en: `Put ${x} in for x and calculate.`,
      });
      return { left: slope, right: x, answer, text: `y = ${slope}x + ${intercept}, x = ${x}`, operation: "functionValue", type, story, hint, explanation: `${slope} × ${x} + ${intercept} = ${answer}.`, hintText: `y = ${slope}x + ${intercept}`, choiceTraps: [answer + slope, Math.max(0, answer - slope), slope + x + intercept] };
    }

    if (type === "similarity") {
      const small = 3 + Math.floor(randomFn() * 6);
      const scale = 2 + Math.floor(randomFn() * 4);
      const answer = small * scale;
      const story = localSet(lang, {
        ja: `小さな星のしるしを ${scale}倍にして、大きな道しるべを作るよ。もとの辺が ${small}cm なら、大きい辺は何cm？`,
        en: `A small star mark is enlarged ${scale} times. If one side is ${small} cm, how long is the larger side?`,
      });
      const hint = localSet(lang, {
        ja: `${scale}倍なので、${small}に${scale}をかけよう。`,
        en: `It is ${scale} times larger, so multiply ${small} by ${scale}.`,
      });
      return { left: small, right: scale, answer, text: `${small} × ${scale}`, operation: "similarity", type, story, hint, explanation: `${small} × ${scale} = ${answer}.`, hintText: `${scale}倍`, choiceTraps: [answer + scale, Math.max(1, answer - scale), small + scale] };
    }

    if (type === "probability") {
      const blue = 2 + Math.floor(randomFn() * 5);
      const yellow = 2 + Math.floor(randomFn() * 5);
      const total = blue + yellow;
      const answer = `${blue}/${total}`;
      const story = localSet(lang, {
        ja: `ふくろに青い星 ${blue}こ、黄色い星 ${yellow}こがあるよ。青い星を1こ選ぶ確率は？`,
        en: `A bag has ${blue} blue stars and ${yellow} yellow stars. What is the chance of choosing a blue star?`,
      });
      const hint = localSet(lang, {
        ja: `青い星の数を、ぜんぶの星の数でわろう。`,
        en: `Put blue stars over all stars.`,
      });
      return { left: blue, right: total, answer, text: `${blue}/${total}`, operation: "probability", type, story, hint, explanation: `blue ${blue}, total ${total}, so ${answer}.`, hintText: `${blue} / ${total}`, choiceTraps: [`${yellow}/${total}`, `${blue}/${yellow}`, `${total}/${blue}`, `${blue + 1}/${total + 1}`] };
    }

    if (type === "squareRoot") {
      const answer = 4 + Math.floor(randomFn() * 9);
      const square = answer * answer;
      const story = localSet(lang, {
        ja: `星の結晶に √${square} と書いてあるよ。これはいくつ？`,
        en: `A star crystal shows √${square}. What number is it?`,
      });
      const hint = localSet(lang, {
        ja: `同じ数を2回かけて ${square} になる数を探そう。`,
        en: `Find the number that times itself equals ${square}.`,
      });
      return { left: square, right: answer, answer, text: `√${square}`, operation: "squareRoot", type, story, hint, explanation: `${answer} × ${answer} = ${square}, so √${square} = ${answer}.`, hintText: `√${square}`, choiceTraps: [answer + 1, answer - 1, square] };
    }

    if (type === "parentheses") {
      const left = 3 + Math.floor(randomFn() * 12);
      const right = 2 + Math.floor(randomFn() * 9);
      const multiplier = 2 + Math.floor(randomFn() * 5);
      const answer = (left + right) * multiplier;
      const story = localSet(lang, {
        ja: `光るたねを (${left} + ${right}) こずつまとめて、${multiplier}つのかごに入れるよ。ぜんぶでなんこ？`,
        en: `Put (${left} + ${right}) glowing seeds into each of ${multiplier} baskets. How many seeds in all?`,
        ko: `빛나는 씨앗을 (${left} + ${right})개씩 ${multiplier}개의 바구니에 넣어요. 모두 몇 개일까요?`,
        zh: `每个篮子放 (${left} + ${right}) 颗发光种子，一共有 ${multiplier} 个篮子。共有几颗？`,
        fr: `On met (${left} + ${right}) graines lumineuses dans chacun des ${multiplier} paniers. Combien en tout ?`,
        de: `In jeden von ${multiplier} Körben kommen (${left} + ${right}) leuchtende Samen. Wie viele sind es?`,
        es: `Ponemos (${left} + ${right}) semillas brillantes en cada una de ${multiplier} cestas. ¿Cuántas hay en total?`,
      });
      const hint = localSet(lang, {
        ja: "かっこの中を先に計算しよう。",
        en: "Work out the parentheses first.",
        ko: "괄호 안을 먼저 계산해요.",
        zh: "先算括号里的数。",
        fr: "Calcule d'abord ce qui est entre parenthèses.",
        de: "Rechne zuerst die Klammer aus.",
        es: "Calcula primero lo que está entre paréntesis.",
      });
      return { left, right: multiplier, answer, text: `(${left} + ${right}) × ${multiplier}`, operation: "parentheses", type, story, hint, explanation: `${left} + ${right} = ${left + right}, ${left + right} × ${multiplier} = ${answer}.`, hintText: `(${left} + ${right}) × ${multiplier}` };
    }

    if (type === "remainder") {
      const divisor = 3 + Math.floor(randomFn() * 5);
      const quotient = 3 + Math.floor(randomFn() * 8);
      const remainder = 1 + Math.floor(randomFn() * (divisor - 1));
      const total = divisor * quotient + remainder;
      const answer = `${quotient} R ${remainder}`;
      const story = localSet(lang, {
        ja: `たね ${total}こを ${divisor}こずつ分けるよ。何組できて、あまりはいくつ？`,
        en: `Share ${total} seeds in groups of ${divisor}. How many groups and how many left over?`,
        ko: `씨앗 ${total}개를 ${divisor}개씩 나눠요. 몇 묶음이고 몇 개가 남을까요?`,
        zh: `把 ${total} 颗种子每 ${divisor} 颗分一组。能分几组，还剩几颗？`,
        fr: `Range ${total} graines par groupes de ${divisor}. Combien de groupes et combien restent ?`,
        de: `Teile ${total} Samen in Gruppen zu ${divisor}. Wie viele Gruppen und wie viele bleiben übrig?`,
        es: `Reparte ${total} semillas en grupos de ${divisor}. ¿Cuántos grupos y cuántas sobran?`,
      });
      const hint = localSet(lang, {
        ja: "同じ数ずつ分けて、残った数も見よう。",
        en: "Make equal groups, then check what is left.",
        ko: "같은 묶음을 만들고 남은 수를 봐요.",
        zh: "先分成相同的组，再看剩下多少。",
        fr: "Fais des groupes égaux puis regarde ce qui reste.",
        de: "Bilde gleiche Gruppen und schau, was übrig bleibt.",
        es: "Haz grupos iguales y mira lo que sobra.",
      });
      return { left: total, right: divisor, answer, text: `${total} ÷ ${divisor}`, operation: "remainder", type, story, hint, explanation: `${divisor} × ${quotient} = ${divisor * quotient}, ${remainder} left over.`, hintText: `${total} ÷ ${divisor}`, choiceTraps: [`${quotient + 1} R ${remainder}`, `${quotient} R ${Math.max(0, remainder - 1)}`, `${quotient - 1} R ${remainder + divisor}`] };
    }

    if (type === "time") {
      const startHour = 1 + Math.floor(randomFn() * 9);
      const startMinute = [0, 10, 20, 30, 40][Math.floor(randomFn() * 5)];
      const addMinutes = [20, 30, 40, 50, 60, 70][Math.floor(randomFn() * 6)];
      const totalMinutes = startHour * 60 + startMinute + addMinutes;
      const answerHour = Math.floor(totalMinutes / 60);
      const answerMinute = totalMinutes % 60;
      const answer = timeAnswer(answerHour, answerMinute, lang);
      const story = localSet(lang, {
        ja: `${startHour}時${startMinute}分から ${addMinutes}分あと、森のチャレンジが始まるよ。何時何分かな？`,
        en: `The forest challenge starts ${addMinutes} minutes after ${startHour}:${padMinute(startMinute)}. What time is that?`,
        ko: `${startHour}시 ${startMinute}분에서 ${addMinutes}분 뒤에 숲 챌린지가 시작돼요. 몇 시 몇 분일까요?`,
        zh: `森林挑战在 ${startHour}点${startMinute}分 的 ${addMinutes} 分钟后开始。那是几点几分？`,
        fr: `Le défi commence ${addMinutes} minutes après ${startHour}:${padMinute(startMinute)}. Quelle heure est-il ?`,
        de: `Die Aufgabe beginnt ${addMinutes} Minuten nach ${startHour}:${padMinute(startMinute)}. Wie spät ist es dann?`,
        es: `El reto empieza ${addMinutes} minutos después de las ${startHour}:${padMinute(startMinute)}. ¿Qué hora es?`,
      });
      const hint = localSet(lang, {
        ja: "60分で1時間になるよ。",
        en: "60 minutes make 1 hour.",
        ko: "60분은 1시간이에요.",
        zh: "60分钟是1小时。",
        fr: "60 minutes font 1 heure.",
        de: "60 Minuten sind 1 Stunde.",
        es: "60 minutos hacen 1 hora.",
      });
      return { left: startHour, right: addMinutes, answer, text: `${startHour}:${padMinute(startMinute)} + ${addMinutes} min`, operation: "time", type, story, hint, explanation: `${startHour}:${padMinute(startMinute)} + ${addMinutes} min = ${answer}.`, hintText: `${startHour}:${padMinute(startMinute)} + ${addMinutes} min`, choiceTraps: [timeAnswer(answerHour, (answerMinute + 10) % 60, lang), timeAnswer(Math.max(1, answerHour - 1), answerMinute, lang), timeAnswer(answerHour + 1, answerMinute, lang)] };
    }

    if (type === "money") {
      const first = (2 + Math.floor(randomFn() * 8)) * 30;
      const second = (2 + Math.floor(randomFn() * 7)) * 20;
      const answer = first + second;
      const story = localSet(lang, {
        ja: `${first}円の木の実と ${second}円の葉っぱシールをえらんだよ。あわせて何円？`,
        en: `A forest nut costs ${first} yen and a leaf sticker costs ${second} yen. How much together?`,
        ko: `숲 열매는 ${first}엔, 잎 스티커는 ${second}엔이에요. 모두 얼마일까요?`,
        zh: `森林果实 ${first} 日元，叶子贴纸 ${second} 日元。一共多少日元？`,
        fr: `Une noix de forêt coûte ${first} yens et un autocollant feuille coûte ${second} yens. Combien en tout ?`,
        de: `Eine Waldnuss kostet ${first} Yen und ein Blatt-Aufkleber ${second} Yen. Wie viel zusammen?`,
        es: `Una nuez del bosque cuesta ${first} yenes y una pegatina de hoja cuesta ${second} yenes. ¿Cuánto es en total?`,
      });
      const hint = localSet(lang, {
        ja: "2つのねだんをたそう。",
        en: "Add the two prices.",
        ko: "두 가격을 더해요.",
        zh: "把两个价钱加起来。",
        fr: "Additionne les deux prix.",
        de: "Addiere beide Preise.",
        es: "Suma los dos precios.",
      });
      return { left: first, right: second, answer, text: `${first} + ${second}`, operation: "money", type, story, hint, explanation: `${first} + ${second} = ${answer}.`, hintText: `${first} + ${second}` };
    }

    if (type === "fraction") {
      const denominator = [2, 3, 4][Math.floor(randomFn() * 3)];
      const answer = 2 + Math.floor(randomFn() * 8);
      const total = denominator * answer;
      const story = localSet(lang, {
        ja: `たね ${total}こ の ${denominator}分の1 を、ルミが光らせたよ。光ったたねは何こ？`,
        en: `Lumi lights up 1/${denominator} of ${total} seeds. How many seeds glow?`,
        ko: `루미가 씨앗 ${total}개 중 1/${denominator}을 빛나게 했어요. 몇 개가 빛날까요?`,
        zh: `露米点亮了 ${total} 颗种子的 1/${denominator}。有几颗发光？`,
        fr: `Lumi illumine 1/${denominator} de ${total} graines. Combien brillent ?`,
        de: `Lumi lässt 1/${denominator} von ${total} Samen leuchten. Wie viele leuchten?`,
        es: `Lumi ilumina 1/${denominator} de ${total} semillas. ¿Cuántas brillan?`,
      });
      const hint = localSet(lang, {
        ja: `${denominator}つに同じ数ずつ分けよう。`,
        en: `Split ${total} into ${denominator} equal groups.`,
        ko: `${denominator}묶음으로 똑같이 나눠요.`,
        zh: `平均分成 ${denominator} 份。`,
        fr: `Partage ${total} en ${denominator} groupes égaux.`,
        de: `Teile ${total} in ${denominator} gleiche Gruppen.`,
        es: `Divide ${total} en ${denominator} grupos iguales.`,
      });
      return { left: total, right: denominator, answer, text: `1/${denominator} of ${total}`, operation: "fraction", type, story, hint, explanation: `${total} ÷ ${denominator} = ${answer}.`, hintText: `1/${denominator} × ${total}` };
    }

    if (type === "area" || type === "perimeter") {
      const width = 3 + Math.floor(randomFn() * 9);
      const height = 2 + Math.floor(randomFn() * 7);
      const isArea = type === "area";
      const answer = isArea ? width * height : (width + height) * 2;
      const story = localSet(lang, {
        ja: isArea
          ? `横 ${width}マス、たて ${height}マス の花だんがあるよ。広さは何マス？`
          : `横 ${width}マス、たて ${height}マス の花だんのまわりを歩くよ。まわりは何マス？`,
        en: isArea
          ? `A flower bed is ${width} squares wide and ${height} squares tall. What is its area?`
          : `A flower bed is ${width} squares wide and ${height} squares tall. What is the distance around it?`,
        ko: isArea
          ? `가로 ${width}칸, 세로 ${height}칸 꽃밭이 있어요. 넓이는 몇 칸일까요?`
          : `가로 ${width}칸, 세로 ${height}칸 꽃밭의 둘레는 몇 칸일까요?`,
        zh: isArea
          ? `花坛横 ${width} 格，竖 ${height} 格。面积是多少格？`
          : `花坛横 ${width} 格，竖 ${height} 格。周长是多少格？`,
        fr: isArea
          ? `Un parterre mesure ${width} cases par ${height} cases. Quelle est son aire ?`
          : `Un parterre mesure ${width} cases par ${height} cases. Quel est son tour ?`,
        de: isArea
          ? `Ein Beet ist ${width} Felder breit und ${height} Felder hoch. Wie groß ist die Fläche?`
          : `Ein Beet ist ${width} Felder breit und ${height} Felder hoch. Wie lang ist der Rand?`,
        es: isArea
          ? `Un jardín mide ${width} cuadros de ancho y ${height} de alto. ¿Cuál es el área?`
          : `Un jardín mide ${width} cuadros de ancho y ${height} de alto. ¿Cuánto mide el borde?`,
      });
      const hint = localSet(lang, {
        ja: isArea ? "広さは、横とたてをかけよう。" : "まわりは、横とたてを2つずつ足そう。",
        en: isArea ? "Area uses width times height." : "Perimeter adds both widths and both heights.",
        ko: isArea ? "넓이는 가로와 세로를 곱해요." : "둘레는 가로 2번, 세로 2번을 더해요.",
        zh: isArea ? "面积用横乘竖。" : "周长把两条横边和两条竖边加起来。",
        fr: isArea ? "L'aire utilise largeur fois hauteur." : "Le tour ajoute deux largeurs et deux hauteurs.",
        de: isArea ? "Fläche ist Breite mal Höhe." : "Der Rand addiert beide Breiten und beide Höhen.",
        es: isArea ? "Área es ancho por alto." : "El borde suma dos anchos y dos altos.",
      });
      return { left: width, right: height, answer, text: isArea ? `${width} × ${height}` : `(${width} + ${height}) × 2`, operation: type, type, story, hint, explanation: isArea ? `${width} × ${height} = ${answer}.` : `(${width} + ${height}) × 2 = ${answer}.`, hintText: isArea ? `${width} × ${height}` : `(${width} + ${height}) × 2` };
    }

    if (type === "sequence") {
      const start = 2 + Math.floor(randomFn() * 10);
      const step = 2 + Math.floor(randomFn() * 8);
      const answer = start + step * 4;
      const story = localSet(lang, {
        ja: `光る葉っぱが ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □ の順にならんでいるよ。次は？`,
        en: `The glowing leaves are in this pattern: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □. What comes next?`,
        ko: `빛나는 잎이 ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □ 순서로 있어요. 다음은?`,
        zh: `发光叶子按 ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □ 排列。下一个是？`,
        fr: `Les feuilles brillantes suivent : ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □. Quel est le suivant ?`,
        de: `Die leuchtenden Blätter folgen: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □. Was kommt als Nächstes?`,
        es: `Las hojas brillantes siguen: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □. ¿Qué sigue?`,
      });
      const hint = localSet(lang, {
        ja: "どれだけずつ増えているか見よう。",
        en: "Look at how much the numbers grow each time.",
        ko: "얼마씩 늘어나는지 봐요.",
        zh: "看看每次增加多少。",
        fr: "Regarde de combien ça augmente.",
        de: "Schau, um wie viel es jedes Mal wächst.",
        es: "Mira cuánto aumenta cada vez.",
      });
      return { left: start, right: step, answer, text: `${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □`, operation: "sequence", type, story, hint, explanation: `+${step}, +${step}, +${step}, so ${start + step * 3} + ${step} = ${answer}.`, hintText: `+${step}` };
    }

    if (type === "rounding") {
      const number = 100 + Math.floor(randomFn() * 780);
      const answer = Math.round(number / 10) * 10;
      const story = localSet(lang, {
        ja: `${number} を、いちばん近い10のまとまりにするといくつ？`,
        en: `Round ${number} to the nearest ten.`,
        ko: `${number}을 가장 가까운 10의 자리로 어림하면?`,
        zh: `把 ${number} 四舍五入到最接近的十位是多少？`,
        fr: `Arrondis ${number} à la dizaine la plus proche.`,
        de: `Runde ${number} auf den nächsten Zehner.`,
        es: `Redondea ${number} a la decena más cercana.`,
      });
      const hint = localSet(lang, {
        ja: "一の位が5以上なら上に、4以下なら下にしよう。",
        en: "If the ones digit is 5 or more, round up.",
        ko: "일의 자리가 5 이상이면 올려요.",
        zh: "个位是5以上就进一。",
        fr: "Si l'unité est 5 ou plus, on monte.",
        de: "Ist die Einerstelle 5 oder mehr, runde auf.",
        es: "Si la unidad es 5 o más, sube.",
      });
      return { left: number, right: 10, answer, text: `${number} ≈ ?`, operation: "rounding", type, story, hint, explanation: `${number} rounds to ${answer}.`, hintText: `${number} ≈ ?` };
    }

    if (type === "multiStepWord") {
      const groups = 2 + Math.floor(randomFn() * 5);
      const each = 3 + Math.floor(randomFn() * 7);
      const extra = 4 + Math.floor(randomFn() * 12);
      const give = 2 + Math.floor(randomFn() * 6);
      const answer = groups * each + extra - give;
      const story = localSet(lang, {
        ja: `${groups}つの草むらに、たねが ${each}こずつあるよ。あとで ${extra}こ見つけて、${give}こをピコにわけたら、のこりは何こ？`,
        en: `There are ${groups} bushes with ${each} seeds each. You find ${extra} more, then share ${give} with Pico. How many are left?`,
        ko: `풀숲 ${groups}곳에 씨앗이 ${each}개씩 있어요. ${extra}개를 더 찾고, ${give}개를 피코에게 나누면 몇 개 남을까요?`,
        zh: `有 ${groups} 片草丛，每片有 ${each} 颗种子。又找到 ${extra} 颗，分给皮可 ${give} 颗，还剩几颗？`,
        fr: `Il y a ${groups} buissons avec ${each} graines chacun. Tu en trouves ${extra} de plus, puis tu en donnes ${give} à Pico. Combien restent ?`,
        de: `Es gibt ${groups} Büsche mit je ${each} Samen. Du findest ${extra} dazu und gibst ${give} an Pico. Wie viele bleiben?`,
        es: `Hay ${groups} arbustos con ${each} semillas cada uno. Encuentras ${extra} más y das ${give} a Pico. ¿Cuántas quedan?`,
      });
      const hint = localSet(lang, {
        ja: "かけ算、たし算、ひき算の順で考えよう。",
        en: "Use multiply, then add, then subtract.",
        ko: "곱셈, 덧셈, 뺄셈 순서로 생각해요.",
        zh: "按乘法、加法、减法的顺序想。",
        fr: "Multiplie, puis ajoute, puis enlève.",
        de: "Erst malnehmen, dann addieren, dann abziehen.",
        es: "Multiplica, suma y luego resta.",
      });
      return { left: groups, right: each, answer, text: `${groups} × ${each} + ${extra} - ${give}`, operation: "multiStepWord", type, story, hint, explanation: `${groups} × ${each} = ${groups * each}, +${extra}, -${give} = ${answer}.`, hintText: `${groups} × ${each} + ${extra} - ${give}` };
    }

    if (type === "decimal") {
      const leftTenths = 12 + Math.floor(randomFn() * 78);
      const rightTenths = 5 + Math.floor(randomFn() * 44);
      const left = Number((leftTenths / 10).toFixed(1));
      const right = Number((rightTenths / 10).toFixed(1));
      const answer = Number((left + right).toFixed(1));
      const story = localSet(lang, {
        ja: `ソラのしずくが ${left}L、あとから ${right}L 集まったよ。あわせて何L？`,
        en: `Sora gathered ${left} L of sky drops, then ${right} L more. How many liters in all?`,
      });
      const hint = localSet(lang, {
        ja: "小数点の位置をそろえて、たし算しよう。",
        en: "Line up the decimal points, then add.",
      });
      return { left, right, answer, text: `${left} + ${right}`, operation: "decimal", type, story, hint, explanation: `${left} + ${right} = ${answer}.`, hintText: `${left} + ${right}`, choiceTraps: [Number((answer + 0.1).toFixed(1)), Number((answer - 0.1).toFixed(1)), Number((leftTenths + rightTenths).toFixed(0))] };
    }

    if (type === "fractionAdd") {
      const denominator = 4 + Math.floor(randomFn() * 8);
      const first = 1 + Math.floor(randomFn() * Math.min(5, denominator - 1));
      const second = 1 + Math.floor(randomFn() * Math.min(4, denominator - first));
      const sum = first + second;
      const answer = sum === denominator ? "1" : `${sum}/${denominator}`;
      const story = localSet(lang, {
        ja: `光るリボンを ${first}/${denominator} 本分、あとで ${second}/${denominator} 本分 つないだよ。あわせると？`,
        en: `You connect ${first}/${denominator} of a glowing ribbon and then ${second}/${denominator} more. How much is that?`,
      });
      const hint = localSet(lang, {
        ja: "分母が同じときは、上の数をたそう。",
        en: "When denominators match, add the top numbers.",
      });
      const lowerTrap = `${Math.max(1, sum - 1)}/${denominator}`;
      const higherTrap = sum >= denominator ? `${Math.max(1, denominator - 2)}/${denominator}` : `${sum + 1}/${denominator}`;
      return { left: first, right: second, answer, text: `${first}/${denominator} + ${second}/${denominator}`, operation: "fractionAdd", type, story, hint, explanation: `${first}/${denominator} + ${second}/${denominator} = ${answer}.`, hintText: `${first}/${denominator} + ${second}/${denominator}`, choiceTraps: [lowerTrap, higherTrap, `${sum}/${denominator + 1}`, `${first}/${denominator}`] };
    }

    if (type === "percent") {
      const base = [120, 160, 200, 240, 300, 400][Math.floor(randomFn() * 6)];
      const rate = [10, 20, 25, 30, 50][Math.floor(randomFn() * 5)];
      const answer = base * rate / 100;
      const story = localSet(lang, {
        ja: `${base}この光のつぶのうち、${rate}% が青く光ったよ。青く光ったのは何こ？`,
        en: `${rate}% of ${base} light drops glow blue. How many glow blue?`,
      });
      const hint = localSet(lang, {
        ja: `${rate}% は 100このうち ${rate}こ という意味だよ。`,
        en: `${rate}% means ${rate} out of 100.`,
      });
      return { left: base, right: rate, answer, text: `${base} × ${rate}%`, operation: "percent", type, story, hint, explanation: `${base} × ${rate} ÷ 100 = ${answer}.`, hintText: `${base} × ${rate}%`, choiceTraps: [answer + 10, Math.max(0, answer - 10), base + rate] };
    }

    if (type === "average") {
      const base = 12 + Math.floor(randomFn() * 20);
      const step = 2 + Math.floor(randomFn() * 8);
      const values = [base, base + step, base + step * 2];
      const answer = base + step;
      const story = localSet(lang, {
        ja: `3日で集めたしずくは ${values[0]}こ、${values[1]}こ、${values[2]}こ だよ。1日あたりの平均は何こ？`,
        en: `Sora gathered ${values[0]}, ${values[1]}, and ${values[2]} drops over 3 days. What is the average per day?`,
      });
      const hint = localSet(lang, {
        ja: "全部をたして、日数の3でわろう。",
        en: "Add them all, then divide by 3.",
      });
      return { left: values[0], right: values[2], answer, text: `(${values.join(" + ")}) ÷ 3`, operation: "average", type, story, hint, explanation: `${values.join(" + ")} = ${answer * 3}, ${answer * 3} ÷ 3 = ${answer}.`, hintText: `(${values.join(" + ")}) ÷ 3` };
    }

    if (type === "speed") {
      const speed = [6, 8, 12, 15, 18][Math.floor(randomFn() * 5)];
      const hours = 2 + Math.floor(randomFn() * 4);
      const answer = speed * hours;
      const story = localSet(lang, {
        ja: `ソラは1時間に ${speed}km 進む雲の道を、${hours}時間 進んだよ。何km進んだ？`,
        en: `Sora travels ${speed} km each hour on a cloud path for ${hours} hours. How far is that?`,
      });
      const hint = localSet(lang, {
        ja: "1時間あたりの道のりに、時間をかけよう。",
        en: "Multiply the distance per hour by the hours.",
      });
      return { left: speed, right: hours, answer, text: `${speed} × ${hours}`, operation: "speed", type, story, hint, explanation: `${speed} × ${hours} = ${answer}.`, hintText: `${speed} km/h × ${hours} h` };
    }

    if (type === "volume") {
      const width = 3 + Math.floor(randomFn() * 6);
      const height = 2 + Math.floor(randomFn() * 5);
      const depth = 2 + Math.floor(randomFn() * 4);
      const answer = width * height * depth;
      const story = localSet(lang, {
        ja: `横 ${width}cm、たて ${height}cm、高さ ${depth}cm のしずく箱があるよ。体積は何cm³？`,
        en: `A drop box is ${width} cm wide, ${height} cm deep, and ${depth} cm tall. What is its volume?`,
      });
      const hint = localSet(lang, {
        ja: "直方体の体積は、横×たて×高さで考えよう。",
        en: "For a rectangular box, multiply width, depth, and height.",
      });
      return { left: width, right: height, answer, text: `${width} × ${height} × ${depth}`, operation: "volume", type, story, hint, explanation: `${width} × ${height} × ${depth} = ${answer}.`, hintText: `${width} × ${height} × ${depth}` };
    }

    if (type === "ratio") {
      const blue = 2 + Math.floor(randomFn() * 5);
      const yellow = 1 + Math.floor(randomFn() * 4);
      const multiplier = 3 + Math.floor(randomFn() * 7);
      const total = (blue + yellow) * multiplier;
      const answer = blue * multiplier;
      const story = localSet(lang, {
        ja: `青い光と黄色い光を ${blue}:${yellow} の割合で、ぜんぶで ${total}こ 並べるよ。青い光は何こ？`,
        en: `Blue and yellow lights are in a ${blue}:${yellow} ratio. There are ${total} lights in all. How many are blue?`,
      });
      const hint = localSet(lang, {
        ja: `割合の合計は ${blue + yellow}。ぜんぶを同じまとまりに分けよう。`,
        en: `The total ratio parts are ${blue + yellow}. Find one part first.`,
      });
      return { left: blue, right: yellow, answer, text: `${blue}:${yellow}, total ${total}`, operation: "ratio", type, story, hint, explanation: `${total} ÷ ${blue + yellow} = ${multiplier}, ${blue} × ${multiplier} = ${answer}.`, hintText: `${blue}:${yellow}, total ${total}` };
    }

    const meters = 2 + Math.floor(randomFn() * 8);
    const answer = meters;
    const centimeters = meters * 100;
    const story = localSet(lang, {
      ja: `${centimeters}cm のつるは、何mかな？`,
      en: `A vine is ${centimeters} cm long. How many meters is that?`,
      ko: `${centimeters}cm 덩굴은 몇 m일까요?`,
      zh: `${centimeters}cm 的藤蔓是多少米？`,
      fr: `Une liane mesure ${centimeters} cm. Combien de mètres ?`,
      de: `Eine Ranke ist ${centimeters} cm lang. Wie viele Meter sind das?`,
      es: `Una enredadera mide ${centimeters} cm. ¿Cuántos metros son?`,
    });
    const hint = localSet(lang, {
      ja: "100cmで1mだよ。",
      en: "100 cm is 1 meter.",
      ko: "100cm는 1m예요.",
      zh: "100cm 是 1米。",
      fr: "100 cm font 1 mètre.",
      de: "100 cm sind 1 Meter.",
      es: "100 cm es 1 metro.",
    });
    return { left: centimeters, right: 100, answer, text: `${centimeters} cm = ? m`, operation: "unit", type: "unit", story, hint, explanation: `${centimeters} ÷ 100 = ${answer}.`, hintText: `${centimeters} cm = ? m` };
  }

  function localizeMath(question, languageId) {
    if (question.story && question.hint && question.explanation) {
      return question;
    }
    const locale = mathText[languageId] || mathText.en;
    const key = question.type === "blank" ? "blank" : question.type === "compare" ? "compare" : question.type === "twoStep" ? "twoStep" : question.operation;
    const formatter = locale[key];
    if (!formatter) {
      return question;
    }
    const [story, hint, explanation] = formatter(question);
    return {
      ...question,
      story,
      hint,
      explanation,
      hintText: question.type === "compare" ? locale.compareHint : question.hintText || question.text,
      choiceTraps: question.choiceTraps,
    };
  }

  function adventureFrameMath(question, difficulty, languageId) {
    if (languageId !== "ja") return question;
    const spiritName = getDifficulty(difficulty.id, languageId).spiritName;
    const explain = question.explanation || `答えは ${question.answer} だよ。`;
    const text = question.hintText || question.text;
    const frames = {
      add: () => [
        `${spiritName}が小川をわたるために、平たい石を ${question.left}こ 見つけたよ。あと ${question.right}こ 集めると、石はぜんぶでなんこ？`,
        "石を全部あわせると、川をわたる道ができるよ。",
        `${question.left} + ${question.right} = ${question.answer}。${spiritName}が一歩進めるね。`,
      ],
      subtract: () => [
        `${spiritName}が木の実を ${question.left}こ 集めたよ。森の小鳥に ${question.right}こ わけると、のこりはなんこ？`,
        "わけた分をひくと、手もとに残る数がわかるよ。",
        `${question.left} - ${question.right} = ${question.answer}。小鳥も${spiritName}もにこにこだよ。`,
      ],
      multiply: () => [
        `${spiritName}が花のランタンをならべたいみたい。${question.left}列に ${question.right}こずつ 置くと、ランタンはぜんぶでなんこ？`,
        "同じ数ずつならぶときは、かけ算で考えよう。",
        `${question.left} × ${question.right} = ${question.answer}。森の道が明るくなるよ。`,
      ],
      divide: () => [
        `${spiritName}が光るたね ${question.left}こを、${question.right}つの草むらに同じ数ずつまくよ。ひとつの草むらに何こずつ？`,
        "同じ数ずつ分けるときは、わり算で考えよう。",
        `${question.left} ÷ ${question.right} = ${question.answer}。草むらが元気になるよ。`,
      ],
      blank: () => [
        `${spiritName}の前に森のとびらがあるよ。とびらには「${text}」と書いてあるね。□に入る数はどれ？`,
        "式がぴったり合う数を選ぶと、とびらがそっと開くよ。",
        `${explain} 森のとびらが明るく光ったよ。`,
      ],
      compare: () => [
        `${spiritName}が分かれ道でまよっているよ。${question.text} では、光が強い道はどっち？`,
        "左と右をそれぞれ計算して、明るいほうを選ぼう。",
        `${explain} ${spiritName}が明るい道を見つけたよ。`,
      ],
      twoStep: () => [
        `${spiritName}と森の木を元気にしよう。${question.text} を順番に考えると、光のしずくは何こになる？`,
        "一つずつ順番に進めると、木に光が集まるよ。",
        `${explain} 木の葉がきらっと育ったよ。`,
      ],
      word: () => [
        `${spiritName}が森のお願いを見つけたよ。${question.story || text}`,
        "お話の中の数を見つけて、せいれいを助けよう。",
        `${explain} ${spiritName}とのなかよしが少しふえたよ。`,
      ],
      straight: () => [
        `${spiritName}が森を進むための数チャレンジを出してくれたよ。${question.story || text}`,
        "式の数をよく見て、次の一歩を選ぼう。",
        `${explain} 森の道が少し先まで見えたよ。`,
      ],
    };
    const key = question.type === "straight" ? question.operation : frames[question.type] ? question.type : question.operation;
    const formatter = frames[key] || frames.straight;
    const [story, hint, explanation] = formatter();
    return { ...question, story, hint, explanation };
  }

  function adventureFrameLanguage(question, difficulty, languageId) {
    if (languageId !== "ja") return question;
    const spiritName = getDifficulty(difficulty.id, languageId).spiritName;
    return {
      ...question,
      story: `${spiritName}が「ことばのたね」を見つけたよ。\n${question.story}\n答えると、森の道が少し明るくなるよ。`,
      hint: `${question.hint} ${spiritName}といっしょに、ゆっくり読んでみよう。`,
      explanation: `${question.explanation} ことばのたねがきらっと光ったよ。`,
    };
  }

  function generateQuestion(difficulty, subjectId, languageId, randomFn) {
    let safeSubjectId = subjectId;
    let safeLanguageId = languageId;
    let safeRandom = randomFn;
    if (typeof subjectId === "function") {
      safeRandom = subjectId;
      safeSubjectId = "math";
      safeLanguageId = DEFAULT_LANGUAGE;
    } else if (typeof languageId === "function") {
      safeRandom = languageId;
      safeLanguageId = DEFAULT_LANGUAGE;
    }
    safeRandom = typeof safeRandom === "function" ? safeRandom : Math.random;
    safeLanguageId = getLanguage(safeLanguageId).id;
    const fullDifficulty = getDifficulty(difficulty.id || difficulty, safeLanguageId);
    const subject = getSubject(safeSubjectId || "math", safeLanguageId);

    if (subject.id === "japanese") {
      const bank = languageBanks[safeLanguageId] || languageBanks.en;
      const source = choose(bank[fullDifficulty.id] || bank.seed, safeRandom);
      const question = adventureFrameLanguage({
        id: `${fullDifficulty.id}-${subject.id}-${Date.now()}-${Math.round(safeRandom() * 10000)}`,
        ...source,
        subject: subject.id,
        choices: buildChoices(source.answer, safeRandom, source.choiceTraps),
      }, fullDifficulty, safeLanguageId);
      return { ...question, signature: getQuestionSignature(question) };
    }

    const type = choose(fullDifficulty.questionTypes, safeRandom);
    let question;
    if (type === "blank") {
      question = makeBlankQuestion(fullDifficulty, safeRandom);
    } else if (type === "compare") {
      question = makeCompareQuestion(fullDifficulty, safeLanguageId, safeRandom);
    } else if (type === "twoStep") {
      question = makeTwoStepQuestion(fullDifficulty, safeRandom);
    } else if (specialMathTypes.includes(type)) {
      question = makeSpecialMathQuestion(type, safeLanguageId, safeRandom);
    } else {
      question = makeBaseOperation(choose(fullDifficulty.operations, safeRandom), safeRandom);
      question.type = type === "word" ? "word" : "straight";
    }
    question = adventureFrameMath(localizeMath(question, safeLanguageId), fullDifficulty, safeLanguageId);
    const traps = typeof question.answer === "number"
      ? [question.answer + 1, Math.max(0, question.answer - 1), question.answer + 10, Math.abs((question.left || 0) - (question.right || 0))]
      : question.choiceTraps;

    const builtQuestion = {
      id: `${fullDifficulty.id}-${question.type}-${question.operation}-${Date.now()}-${Math.round(safeRandom() * 10000)}`,
      ...question,
      subject: subject.id,
      choices: buildChoices(question.answer, safeRandom, traps),
    };
    return { ...builtQuestion, signature: getQuestionSignature(builtQuestion) };
  }

  function generateQuestionAvoiding(difficulty, subjectId, languageId, randomFn, usedSignatures = []) {
    const safeRandom = typeof randomFn === "function" ? randomFn : Math.random;
    const used = new Set((usedSignatures || []).map(String));
    let fallback = null;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const question = generateQuestion(difficulty, subjectId, languageId, makeAttemptRandom(safeRandom, attempt));
      fallback = question;
      if (!used.has(question.signature)) return question;
    }
    return fallback || generateQuestion(difficulty, subjectId, languageId, safeRandom);
  }

  function isCorrectAnswer(question, selectedAnswer) {
    return String(selectedAnswer) === String(question.answer);
  }

  function calculatePoints(currentPoints, isCorrect) {
    return currentPoints + (isCorrect ? POINTS_PER_CORRECT : 0);
  }

  function getSpiritGrowthLevel(growth) {
    const safeGrowth = Math.max(0, Number(growth || 0));
    if (safeGrowth >= 18) return 5;
    if (safeGrowth >= 12) return 4;
    if (safeGrowth >= 7) return 3;
    if (safeGrowth >= 3) return 2;
    return 1;
  }

  function getUnlockedMapStep(totalCorrect) {
    return Math.min(4, Math.floor(Math.max(0, Number(totalCorrect || 0)) / QUESTION_COUNT));
  }

  function createEmptyAdventure(source = {}) {
    const totalCorrect = Math.max(0, Number(source?.totalCorrect || 0));
    const spirits = {};
    difficulties.forEach((difficulty) => {
      const stored = source?.spirits?.[difficulty.id] || {};
      const growth = Math.max(0, Number(stored.growth || 0));
      spirits[difficulty.id] = {
        met: Boolean(stored.met || growth > 0),
        growth,
        level: getSpiritGrowthLevel(growth),
      };
    });
    return {
      totalCorrect,
      mapStep: getUnlockedMapStep(totalCorrect),
      spirits,
      recentQuestionSignatures: Array.isArray(source?.recentQuestionSignatures) ? source.recentQuestionSignatures.map(String).slice(-20) : [],
    };
  }

  function applyAdventureAnswer(adventure, difficultyId, isCorrect) {
    const next = createEmptyAdventure(adventure);
    if (!isCorrect) return next;
    const spiritId = difficulties.some((difficulty) => difficulty.id === difficultyId) ? difficultyId : "seed";
    const spirit = next.spirits[spiritId] || { met: false, growth: 0, level: 1 };
    const growth = spirit.growth + 1;
    next.totalCorrect += 1;
    next.mapStep = getUnlockedMapStep(next.totalCorrect);
    next.spirits[spiritId] = {
      met: true,
      growth,
      level: getSpiritGrowthLevel(growth),
    };
    return next;
  }

  function createRound(difficultyId, subjectId, languageId, randomFn, recentQuestionSignatures) {
    let safeSubjectId = subjectId;
    let safeLanguageId = languageId;
    let safeRandom = randomFn;
    let safeRecentQuestionSignatures = Array.isArray(recentQuestionSignatures) ? recentQuestionSignatures : [];
    if (typeof subjectId === "function") {
      safeRandom = subjectId;
      safeSubjectId = "math";
      safeLanguageId = DEFAULT_LANGUAGE;
    } else if (typeof languageId === "function") {
      safeRandom = languageId;
      safeLanguageId = DEFAULT_LANGUAGE;
    } else if (Array.isArray(randomFn)) {
      safeRecentQuestionSignatures = randomFn;
      safeRandom = undefined;
    }
    safeLanguageId = getLanguage(safeLanguageId).id;
    const difficulty = getDifficulty(difficultyId, safeLanguageId);
    const subject = getSubject(safeSubjectId || "math", safeLanguageId);
    const firstQuestion = generateQuestionAvoiding(difficulty, subject.id, safeLanguageId, safeRandom, safeRecentQuestionSignatures);
    return {
      difficulty,
      stage: difficulty,
      subject,
      language: getLanguage(safeLanguageId),
      currentIndex: 0,
      earnedPoints: 0,
      correctCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      question: firstQuestion,
      answered: false,
      answers: [],
      usedQuestionSignatures: [...safeRecentQuestionSignatures.map(String), firstQuestion.signature],
    };
  }

  function answerQuestion(round, selectedAnswer) {
    if (round.answered) return round;
    const correct = isCorrectAnswer(round.question, selectedAnswer);
    const currentStreak = correct ? round.currentStreak + 1 : 0;
    return {
      ...round,
      answered: true,
      earnedPoints: calculatePoints(round.earnedPoints, correct),
      correctCount: round.correctCount + (correct ? 1 : 0),
      currentStreak,
      bestStreak: Math.max(round.bestStreak, currentStreak),
      answers: round.answers.concat({
        question: round.question.text,
        signature: round.question.signature || getQuestionSignature(round.question),
        selectedAnswer,
        answer: round.question.answer,
        correct,
      }),
    };
  }

  function nextQuestion(round, randomFn) {
    const nextIndex = round.currentIndex + 1;
    if (nextIndex >= QUESTION_COUNT) {
      return { ...round, currentIndex: nextIndex, question: null, answered: false };
    }
    const usedQuestionSignatures = round.usedQuestionSignatures || round.answers.map((answer) => answer.signature).filter(Boolean);
    const question = generateQuestionAvoiding(round.difficulty, round.subject?.id || "math", round.language?.id || DEFAULT_LANGUAGE, randomFn, usedQuestionSignatures);
    return {
      ...round,
      currentIndex: nextIndex,
      question,
      answered: false,
      usedQuestionSignatures: usedQuestionSignatures.concat(question.signature),
    };
  }

  global.GameLogic = {
    POINTS_PER_CORRECT,
    QUESTION_COUNT,
    languages,
    subjects,
    difficulties,
    stages: difficulties,
    getLanguage,
    getSubject,
    getDifficulty,
    generateQuestion,
    generateQuestionAvoiding,
    getQuestionSignature,
    isCorrectAnswer,
    calculatePoints,
    createEmptyAdventure,
    applyAdventureAnswer,
    getSpiritGrowthLevel,
    getUnlockedMapStep,
    createRound,
    answerQuestion,
    nextQuestion,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.GameLogic;
  }
})(typeof window !== "undefined" ? window : globalThis);
