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
    },
    en: {
      seed: ["Pico", "Grade 1-2", "Add/Subtract", "Reading words", "tiny seed spirit", "sparkly seed"],
      grass: ["Moko", "Grade 3", "Multiplication", "Opposites/Sentences", "fluffy flower spirit", "fluffy petal"],
      flower: ["Lumi", "Grade 4", "Bigger numbers", "Reading/Meaning", "glowing leaf spirit", "glowing leaf"],
    },
    ko: {
      seed: ["피코", "1-2학년", "덧셈・뺄셈", "읽기・낱말", "작은 씨앗 정령", "반짝 씨앗"],
      grass: ["모코", "3학년", "곱셈 중심", "반대말・문장", "폭신한 꽃 정령", "폭신 꽃잎"],
      flower: ["루미", "4학년", "조금 큰 계산", "읽기・뜻", "빛나는 잎 정령", "빛나는 잎"],
    },
    zh: {
      seed: ["皮可", "1-2年级", "加法・减法", "认读・词语", "小小种子精灵", "闪亮种子"],
      grass: ["莫可", "3年级", "乘法为主", "反义词・句子", "软软花精灵", "软软花瓣"],
      flower: ["露米", "4年级", "稍大的数", "阅读・意思", "发光叶子精灵", "发光叶子"],
    },
    fr: {
      seed: ["Pico", "CE1-CE2", "Addition/Soustraction", "Lecture/Mots", "petit esprit graine", "graine brillante"],
      grass: ["Moko", "CE2-CM1", "Multiplication", "Contraires/Phrases", "esprit fleur tout doux", "pétale doux"],
      flower: ["Lumi", "CM1-CM2", "Grands nombres", "Lecture/Sens", "esprit feuille lumineuse", "feuille lumineuse"],
    },
    de: {
      seed: ["Pico", "Kl. 1-2", "Plus/Minus", "Lesen/Wörter", "kleiner Samen-Geist", "glitzernder Samen"],
      grass: ["Moko", "Kl. 3", "Malnehmen", "Gegenteile/Sätze", "flauschiger Blumen-Geist", "flauschiges Blütenblatt"],
      flower: ["Lumi", "Kl. 4", "Größere Zahlen", "Lesen/Bedeutung", "leuchtender Blatt-Geist", "leuchtendes Blatt"],
    },
    es: {
      seed: ["Pico", "1.º-2.º", "Sumar/Restar", "Lectura/Palabras", "pequeño espíritu semilla", "semilla brillante"],
      grass: ["Moko", "3.º", "Multiplicación", "Contrarios/Frases", "espíritu flor suave", "pétalo suave"],
      flower: ["Lumi", "4.º", "Números grandes", "Lectura/Significado", "espíritu hoja brillante", "hoja brillante"],
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
      questionTypes: ["twoStep", "word", "compare", "blank", "straight", "parentheses", "remainder", "time", "money", "unit"],
    },
  ];

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
      operations: difficultyId === "seed" ? ["add", "subtract"] : difficultyId === "grass" ? ["multiply", "multiply", "divide"] : ["largeMultiply", "largeDivide", "mixed"],
      questionTypes: difficultyId === "seed" ? ["straight", "straight", "blank", "word"] : difficultyId === "grass" ? ["word", "compare", "blank", "twoStep", "straight"] : ["twoStep", "word", "compare", "blank", "straight", "parentheses", "remainder", "time", "money", "unit"],
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
      return {
        id: `${fullDifficulty.id}-${subject.id}-${Date.now()}-${Math.round(safeRandom() * 10000)}`,
        ...source,
        subject: subject.id,
        choices: buildChoices(source.answer, safeRandom, source.choiceTraps),
      };
    }

    const type = choose(fullDifficulty.questionTypes, safeRandom);
    let question;
    if (type === "blank") {
      question = makeBlankQuestion(fullDifficulty, safeRandom);
    } else if (type === "compare") {
      question = makeCompareQuestion(fullDifficulty, safeLanguageId, safeRandom);
    } else if (type === "twoStep") {
      question = makeTwoStepQuestion(fullDifficulty, safeRandom);
    } else if (["parentheses", "remainder", "time", "money", "unit"].includes(type)) {
      question = makeSpecialMathQuestion(type, safeLanguageId, safeRandom);
    } else {
      question = makeBaseOperation(choose(fullDifficulty.operations, safeRandom), safeRandom);
      question.type = type === "word" ? "word" : "straight";
    }
    question = localizeMath(question, safeLanguageId);
    const traps = typeof question.answer === "number"
      ? [question.answer + 1, Math.max(0, question.answer - 1), question.answer + 10, Math.abs((question.left || 0) - (question.right || 0))]
      : question.choiceTraps;

    return {
      id: `${fullDifficulty.id}-${question.type}-${question.operation}-${Date.now()}-${Math.round(safeRandom() * 10000)}`,
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

  function createRound(difficultyId, subjectId, languageId, randomFn) {
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
    safeLanguageId = getLanguage(safeLanguageId).id;
    const difficulty = getDifficulty(difficultyId, safeLanguageId);
    const subject = getSubject(safeSubjectId || "math", safeLanguageId);
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
      question: generateQuestion(difficulty, subject.id, safeLanguageId, safeRandom),
      answered: false,
      answers: [],
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
    return {
      ...round,
      currentIndex: nextIndex,
      question: generateQuestion(round.difficulty, round.subject?.id || "math", round.language?.id || DEFAULT_LANGUAGE, randomFn),
      answered: false,
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
