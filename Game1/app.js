(function () {
  "use strict";

  const LEGACY_STORAGE_KEY = "maruppu-total-points";
  const LEGACY_BUDDY_NAME_KEY = "maruppu-buddy-name";
  const LEGACY_BUDDY_COLOR_KEY = "maruppu-buddy-color";
  const LEGACY_REWARD_SHOWN_KEY = "maruppu-1000-reward-shown";
  const PROFILE_STORE_KEY = "maruppu-profile-store";
  const LANGUAGE_KEY = "maruppu-language";
  const DEFAULT_BUDDY_COLOR = "coral";
  const BUDDY_COLORS = ["coral", "mint", "sky"];
  const FOREST_AREAS = ["森の入口", "きらめき小道", "花びら広場", "光る葉の丘", "空色の泉"];
  const app = document.querySelector("#app");

  const translations = {
    ja: {
      appTitle: "マルップ ミニゲーム",
      language: "ことば",
      defaultBuddy: "マルップ",
      defaultProfile: "ともだち",
      back: "もどる",
      home: "ホームへ",
      start: "はじめる",
      profile: "プロフィール",
      export: "進みぐあいJSONを出す",
      exported: "進みぐあいJSONを作ったよ。おうちの人と保存してね。",
      profileTitle: "だれが あそぶ？",
      profileIntro: "名前を入れると、自分だけのポイントであそべるよ。",
      playerName: "あなたの名前",
      buddyName: "相棒の名前",
      createProfile: "プロフィールを作る",
      buddyIntro: "相棒を きめよう",
      buddyFor: "{name}の相棒だよ",
      buddyKind: "まあるいたねの友だち",
      buddyNamePrompt: "相棒の名前を教えて",
      buddySpeech: "「{name}と いっしょに がんばろうね」",
      useBuddy: "この子でいく",
      homeTitle: "{name}と<br />なかよししょうぶ",
      homeLead: "算数でも国語でも、せいれいと なかよくチャレンジできるよ。",
      seeds: "こ あつめたよ",
      subjectTitle: "どっちで<br />チャレンジする？",
      subjectIntro: "好きな科目をえらぼう。あとでいつでも変えられるよ。",
      chooseSpirit: "せいれいをえらぶ",
      mathSmall: "計算や文章題でチャレンジ",
      languageSmall: "漢字やことばでチャレンジ",
      stagesTitle: "どのせいれいと<br />チャレンジする？",
      stagesIntro: "{subject}のむずかしさをえらぼう。",
      clear: "クリア",
      battleStart: "なかよしチャレンジ、スタート！",
      tryAgain: "ここは ちょっとむずかしいかも。一緒に考えよう。",
      combo: "{count}れんぞく！",
      talkReady: "「せいれいの チャレンジだよ」",
      talkGood: "「なかよしムーブ、いくよ！」",
      talkCombo: "「れんぞくムーブ！きらきらだね」",
      talkTry: "「だいじょうぶ。ぼくも いっしょだよ」",
      spiritReady: "「チャレンジ、どうかな？」",
      spiritGood: "「わあ、なかよし！」",
      challengeCount: "{spirit}の {challenge}・{count}かいめ",
      next: "つぎへ",
      result: "けっかへ",
      resultLabel: "けっか",
      resultPerfect: "5つのチャレンジを クリアしたよ！",
      resultNice: "さいごまで よくがんばったね！",
      resultTalkPerfect: "{name}が とってもよろこんでるよ！",
      resultTalkNice: "{name}が となりでにこにこしているよ。",
      rewardLine: "{count}つ クリア・{reward}",
      total: "ぜんぶで {points} pt",
      closing: "またあそぼうね。",
      again: "もういちど",
      streakLabel: "連続チャレンジ",
      bestLabel: "最高きろく",
      day: "日",
      streakStart: "今日から連続チャレンジ スタート！",
      streakRecorded: "今日はもう記録できているよ。",
      streakContinue: "{days}日れんぞく！今日も来てくれてうれしいよ。",
      streakRestart: "また今日からいっしょにがんばろうね。",
      streakHot: "すごい連続だね！今日もキラキラだよ。",
      streakWarm: "今日もがんばろう！連続ボーナスが近いよ。",
      streakHomeRestart: "また今日からいっしょにはじめようね。",
      streakHome: "今日もがんばろう！",
      streakBonus: "今日の連続ボーナス！",
      specialLabel: "とくべつなおいわい",
      specialTitle: "1000ポイント<br />たまったよ！",
      specialLead: "{name}と一緒にがんばったね。おうちの人と相談して、ごほうびをもらおう！",
      progressNote: "手動でGitHubなどに保存するための進みぐあいデータです。",
      praise: ["いいね！なかよしムーブ成功", "すごい！光がせいれいに届いたよ", "やったね！せいれいがにこにこだよ", "その調子！チャレンジクリア", "ばっちり！相棒の光がきらり", "すてき！よく考えられたね"],
    },
    en: {
      appTitle: "Maruppu Forest Adventure",
      language: "Language",
      defaultBuddy: "Maruppu",
      defaultProfile: "friend",
      back: "Back",
      home: "Home",
      start: "Start",
      profile: "Profile",
      export: "Export progress JSON",
      exported: "Progress JSON is ready. Please save it with a grown-up.",
      profileTitle: "Who is playing?",
      profileIntro: "Enter a name to keep your own points.",
      playerName: "Your name",
      buddyName: "Buddy name",
      createProfile: "Create profile",
      buddyIntro: "Choose your buddy",
      buddyFor: "{name}'s buddy",
      buddyKind: "round seed friend",
      buddyNamePrompt: "Give your buddy a name",
      buddySpeech: "\"Let's do our best with {name}!\"",
      useBuddy: "Use this buddy",
      homeTitle: "{name}'s<br />forest adventure",
      homeLead: "Explore the forest, meet spirits, and help them grow with friendly challenges.",
      seeds: "collected",
      subjectTitle: "What will<br />you play?",
      subjectIntro: "Choose a subject. You can change it anytime.",
      chooseSpirit: "Choose a spirit",
      mathSmall: "Numbers and story problems",
      languageSmall: "Reading and words",
      stagesTitle: "Which spirit<br />will challenge you?",
      stagesIntro: "Choose {subject} difficulty.",
      clear: "Clear",
      battleStart: "Friendly challenge, start!",
      tryAgain: "This one is tricky. Let's think together.",
      combo: "{count} combo!",
      talkReady: "\"A spirit challenge!\"",
      talkGood: "\"Friendly move, go!\"",
      talkCombo: "\"Combo move! Sparkly!\"",
      talkTry: "\"It's okay. I'm with you.\"",
      spiritReady: "\"Ready for the challenge?\"",
      spiritGood: "\"Wow, friends!\"",
      challengeCount: "{spirit}'s {challenge} {count}",
      next: "Next",
      result: "Result",
      resultLabel: "Result",
      resultPerfect: "You cleared 5 challenges!",
      resultNice: "You kept going so well!",
      resultTalkPerfect: "{name} is so happy!",
      resultTalkNice: "{name} is smiling beside you.",
      rewardLine: "{count} clear - {reward}",
      total: "Total {points} pt",
      closing: "Let's play again.",
      again: "Play again",
      streakLabel: "Daily streak",
      bestLabel: "Best streak",
      day: "day",
      streakStart: "Daily streak starts today!",
      streakRecorded: "Today's streak is already saved.",
      streakContinue: "{days}-day streak! Happy you came back.",
      streakRestart: "Let's start again from today.",
      streakHot: "Amazing streak! Sparkly today.",
      streakWarm: "Let's keep going! Bonus is close.",
      streakHomeRestart: "Let's begin again today.",
      streakHome: "Let's do our best today!",
      streakBonus: "Today's streak bonus!",
      specialLabel: "Special celebration",
      specialTitle: "1000 points<br />saved up!",
      specialLead: "You worked hard with {name}. Talk with a grown-up about a reward!",
      progressNote: "Progress data for manual saving to GitHub or elsewhere.",
      praise: ["Nice! Friendly move", "Great! The light reached the spirit", "Yay! The spirit is smiling", "Good rhythm! Challenge clear", "Perfect! Your buddy sparkles", "Wonderful thinking!"],
    },
  };

  translations.ko = { ...translations.en, appTitle: "마룹 미니게임", language: "언어", defaultBuddy: "마룹", defaultProfile: "친구", back: "뒤로", home: "홈", start: "시작", profile: "프로필", export: "진행 JSON 내보내기", exported: "진행 JSON이 준비됐어요. 어른과 함께 저장해 주세요.", profileTitle: "누가 놀까요?", profileIntro: "이름을 넣으면 내 포인트로 놀 수 있어요.", playerName: "내 이름", buddyName: "상棒 이름", createProfile: "프로필 만들기", buddyIntro: "상棒을 골라요", buddyFor: "{name}의 상棒", buddyKind: "둥근 씨앗 친구", buddyNamePrompt: "상棒 이름을 알려줘요", useBuddy: "이 친구로 하기", homeTitle: "{name}와<br />친구 챌린지", homeLead: "수학이나 말 문제로 정령과 다정하게 챌린지해요.", seeds: "개 모았어요", subjectTitle: "무엇으로<br />챌린지할까요?", subjectIntro: "과목을 골라요. 나중에 바꿀 수 있어요.", chooseSpirit: "정령 고르기", mathSmall: "계산과 이야기 문제", languageSmall: "읽기와 낱말", stagesTitle: "어떤 정령과<br />챌린지할까요?", stagesIntro: "{subject} 난이도를 골라요.", clear: "클리어", battleStart: "친구 챌린지 시작!", tryAgain: "조금 어려울 수 있어요. 같이 생각해요.", next: "다음", result: "결과", resultLabel: "결과", resultPerfect: "챌린지 5개를 클리어했어요!", resultNice: "끝까지 정말 잘했어요!", total: "모두 {points} pt", closing: "또 놀아요.", again: "한 번 더", streakLabel: "연속 챌린지", bestLabel: "최고 기록", day: "일", streakBonus: "오늘의 연속 보너스!", specialLabel: "특별 축하", specialTitle: "1000포인트<br />모았어요!", specialLead: "{name}와 함께 열심히 했어요. 어른과 상의해서 보상을 받아요!" };
  translations.zh = { ...translations.en, appTitle: "马鲁普小游戏", language: "语言", defaultBuddy: "马鲁普", defaultProfile: "朋友", back: "返回", home: "主页", start: "开始", profile: "档案", export: "导出进度JSON", exported: "进度JSON准备好了。请和大人一起保存。", profileTitle: "谁来玩？", profileIntro: "输入名字，就能保存自己的积分。", playerName: "你的名字", buddyName: "伙伴名字", createProfile: "创建档案", buddyIntro: "选择伙伴", buddyFor: "{name}的伙伴", buddyKind: "圆圆的种子朋友", buddyNamePrompt: "给伙伴取名字", useBuddy: "选择这个伙伴", homeTitle: "{name}的<br />友好挑战", homeLead: "用数学或语文和精灵进行友好挑战。", seeds: "个已收集", subjectTitle: "选择<br />挑战科目", subjectIntro: "选择科目，之后也可以更换。", chooseSpirit: "选择精灵", mathSmall: "计算和应用题", languageSmall: "阅读和词语", stagesTitle: "和哪个精灵<br />挑战？", stagesIntro: "选择{subject}难度。", clear: "完成", battleStart: "友好挑战开始！", tryAgain: "这个有点难。一起想一想吧。", next: "下一个", result: "结果", resultLabel: "结果", resultPerfect: "完成了5个挑战！", resultNice: "坚持到最后，真棒！", total: "总计 {points} pt", closing: "下次再玩吧。", again: "再玩一次", streakLabel: "连续挑战", bestLabel: "最高记录", day: "天", streakBonus: "今天的连续奖励！", specialLabel: "特别庆祝", specialTitle: "攒到<br />1000分！", specialLead: "你和{name}一起努力了。和家人商量一下奖励吧！" };
  translations.fr = { ...translations.en, appTitle: "Mini-jeu Maruppu", language: "Langue", defaultBuddy: "Maruppu", defaultProfile: "ami", back: "Retour", home: "Accueil", start: "Commencer", profile: "Profil", export: "Exporter JSON", exported: "JSON prêt. Enregistre-le avec un adulte.", profileTitle: "Qui joue ?", profileIntro: "Entre un nom pour garder tes points.", playerName: "Ton nom", buddyName: "Nom du compagnon", createProfile: "Créer le profil", buddyIntro: "Choisis ton compagnon", buddyFor: "Compagnon de {name}", buddyKind: "ami graine tout rond", buddyNamePrompt: "Donne un nom au compagnon", useBuddy: "Choisir ce compagnon", homeTitle: "Défi amical<br />avec {name}", homeLead: "Joue avec les esprits en maths ou en mots.", seeds: "collectées", subjectTitle: "Quelle matière<br />choisir ?", subjectIntro: "Choisis une matière. Tu peux changer plus tard.", chooseSpirit: "Choisir un esprit", mathSmall: "Calculs et problèmes", languageSmall: "Lecture et mots", stagesTitle: "Quel esprit<br />choisir ?", stagesIntro: "Choisis la difficulté en {subject}.", clear: "Réussi", battleStart: "Défi amical, c'est parti !", tryAgain: "C'est un peu difficile. Réfléchissons ensemble.", next: "Suivant", result: "Résultat", resultLabel: "Résultat", resultPerfect: "Tu as réussi 5 défis !", resultNice: "Tu as très bien continué !", total: "Total {points} pt", closing: "On rejoue bientôt.", again: "Rejouer", streakLabel: "Suite de jours", bestLabel: "Record", day: "j", streakBonus: "Bonus de suite du jour !", specialLabel: "Fête spéciale", specialTitle: "1000 points<br />gagnés !", specialLead: "Tu as bien travaillé avec {name}. Parle d'une récompense avec un adulte !" };
  translations.de = { ...translations.en, appTitle: "Maruppu Minispiel", language: "Sprache", defaultBuddy: "Maruppu", defaultProfile: "Freund", back: "Zurück", home: "Start", start: "Start", profile: "Profil", export: "JSON exportieren", exported: "Fortschritts-JSON ist fertig. Bitte mit einem Erwachsenen speichern.", profileTitle: "Wer spielt?", profileIntro: "Gib einen Namen ein, um eigene Punkte zu speichern.", playerName: "Dein Name", buddyName: "Name des Partners", createProfile: "Profil erstellen", buddyIntro: "Wähle deinen Partner", buddyFor: "Partner von {name}", buddyKind: "runder Samenfreund", buddyNamePrompt: "Gib deinem Partner einen Namen", useBuddy: "Diesen Partner wählen", homeTitle: "{name}s<br />Freundschaftsduell", homeLead: "Spiele freundliche Aufgaben mit Mathe oder Sprache.", seeds: "gesammelt", subjectTitle: "Womit<br />spielen?", subjectIntro: "Wähle ein Fach. Du kannst später wechseln.", chooseSpirit: "Geist wählen", mathSmall: "Rechnen und Sachaufgaben", languageSmall: "Lesen und Wörter", stagesTitle: "Welcher Geist<br />fordert dich?", stagesIntro: "Wähle die Schwierigkeit für {subject}.", clear: "Geschafft", battleStart: "Freundschaftsduell startet!", tryAgain: "Das ist knifflig. Denken wir zusammen nach.", next: "Weiter", result: "Ergebnis", resultLabel: "Ergebnis", resultPerfect: "Du hast 5 Aufgaben geschafft!", resultNice: "Du hast toll durchgehalten!", total: "Gesamt {points} pt", closing: "Bis zum nächsten Spiel.", again: "Nochmal", streakLabel: "Tages-Serie", bestLabel: "Rekord", day: "Tag", streakBonus: "Heutiger Serienbonus!", specialLabel: "Besondere Feier", specialTitle: "1000 Punkte<br />gesammelt!", specialLead: "Du hast mit {name} toll gearbeitet. Sprich mit einem Erwachsenen über eine Belohnung!" };
  translations.es = { ...translations.en, appTitle: "Minijuego Maruppu", language: "Idioma", defaultBuddy: "Maruppu", defaultProfile: "amigo", back: "Atrás", home: "Inicio", start: "Empezar", profile: "Perfil", export: "Exportar JSON", exported: "JSON listo. Guárdalo con un adulto.", profileTitle: "¿Quién juega?", profileIntro: "Escribe un nombre para guardar tus puntos.", playerName: "Tu nombre", buddyName: "Nombre del compañero", createProfile: "Crear perfil", buddyIntro: "Elige tu compañero", buddyFor: "Compañero de {name}", buddyKind: "amigo semilla redondo", buddyNamePrompt: "Pon nombre a tu compañero", useBuddy: "Usar este compañero", homeTitle: "Reto amistoso<br />con {name}", homeLead: "Juega retos de matemáticas o lengua con los espíritus.", seeds: "reunidas", subjectTitle: "¿Qué materia<br />quieres?", subjectIntro: "Elige una materia. Puedes cambiarla después.", chooseSpirit: "Elegir espíritu", mathSmall: "Cálculos y problemas", languageSmall: "Lectura y palabras", stagesTitle: "¿Qué espíritu<br />te reta?", stagesIntro: "Elige dificultad de {subject}.", clear: "Logrado", battleStart: "¡Empieza el reto amistoso!", tryAgain: "Este es un poco difícil. Pensemos juntos.", next: "Siguiente", result: "Resultado", resultLabel: "Resultado", resultPerfect: "¡Superaste 5 retos!", resultNice: "¡Seguiste hasta el final muy bien!", total: "Total {points} pt", closing: "Juguemos otra vez.", again: "Otra vez", streakLabel: "Racha diaria", bestLabel: "Mejor racha", day: "día", streakBonus: "¡Bono de racha de hoy!", specialLabel: "Celebración especial", specialTitle: "¡1000 puntos<br />guardados!", specialLead: "Trabajaste mucho con {name}. Habla con un adulto sobre una recompensa." };

  Object.assign(translations.ja, {
    appTitle: "マルップとせいれいの 森のぼうけん",
    homeTitle: "{name}と<br />森のぼうけん",
    homeLead: "森を進んで、せいれいと出会い、少しずつ育てていこう。",
    export: "進みぐあいを見る",
    exported: "進みぐあいを表示したよ。",
    progressTitle: "進みぐあい",
    progressPlayer: "あそんでいる人",
    progressBuddy: "相棒",
    progressPoints: "ポイント",
    progressCurrentStreak: "今の連続",
    progressBestStreak: "最高きろく",
    progressLastPlayed: "最後に遊んだ日",
    progressStorage: "保存先",
    progressNote: "おうちの人が、今のがんばりを確認するための画面です。",
    noProgressDate: "まだ記録なし",
  });
  Object.assign(translations.en, {
    export: "View progress",
    exported: "Progress is shown on screen.",
    progressTitle: "Progress",
    progressPlayer: "Player",
    progressBuddy: "Buddy",
    progressPoints: "Points",
    progressCurrentStreak: "Current streak",
    progressBestStreak: "Best streak",
    progressLastPlayed: "Last played",
    progressStorage: "Storage",
    progressNote: "A simple screen for grown-ups to check current progress.",
    noProgressDate: "No record yet",
  });
  Object.assign(translations.ko, {
    export: "진행 보기",
    exported: "진행 상황을 화면에 보여줘요.",
    progressTitle: "진행 상황",
    progressPlayer: "플레이어",
    progressBuddy: "상棒",
    progressPoints: "포인트",
    progressCurrentStreak: "현재 연속",
    progressBestStreak: "최고 기록",
    progressLastPlayed: "마지막으로 논 날",
    progressStorage: "저장 위치",
    progressNote: "어른이 지금의 진행 상황을 확인하는 화면이에요.",
    noProgressDate: "아직 기록 없음",
  });
  Object.assign(translations.zh, {
    export: "查看进度",
    exported: "进度已显示在画面上。",
    progressTitle: "进度",
    progressPlayer: "玩家",
    progressBuddy: "伙伴",
    progressPoints: "积分",
    progressCurrentStreak: "当前连续",
    progressBestStreak: "最高记录",
    progressLastPlayed: "上次游玩",
    progressStorage: "保存位置",
    progressNote: "这是给家人查看当前进度的画面。",
    noProgressDate: "还没有记录",
  });
  Object.assign(translations.fr, {
    export: "Voir la progression",
    exported: "La progression est affichée.",
    progressTitle: "Progression",
    progressPlayer: "Joueur",
    progressBuddy: "Compagnon",
    progressPoints: "Points",
    progressCurrentStreak: "Suite actuelle",
    progressBestStreak: "Record",
    progressLastPlayed: "Dernière partie",
    progressStorage: "Stockage",
    progressNote: "Un écran simple pour que les adultes vérifient la progression.",
    noProgressDate: "Aucun record",
  });
  Object.assign(translations.de, {
    export: "Fortschritt ansehen",
    exported: "Der Fortschritt wird angezeigt.",
    progressTitle: "Fortschritt",
    progressPlayer: "Spieler",
    progressBuddy: "Partner",
    progressPoints: "Punkte",
    progressCurrentStreak: "Aktuelle Serie",
    progressBestStreak: "Rekord",
    progressLastPlayed: "Zuletzt gespielt",
    progressStorage: "Speicher",
    progressNote: "Eine einfache Ansicht, damit Erwachsene den Fortschritt prüfen können.",
    noProgressDate: "Noch kein Eintrag",
  });
  Object.assign(translations.es, {
    export: "Ver progreso",
    exported: "El progreso se muestra en pantalla.",
    progressTitle: "Progreso",
    progressPlayer: "Jugador",
    progressBuddy: "Compañero",
    progressPoints: "Puntos",
    progressCurrentStreak: "Racha actual",
    progressBestStreak: "Mejor racha",
    progressLastPlayed: "Última partida",
    progressStorage: "Guardado",
    progressNote: "Una pantalla simple para que un adulto revise el progreso.",
    noProgressDate: "Sin registro aún",
  });

  let activeLanguageId = loadLanguage();
  const loadedProfileStore = loadProfileStore();
  const initialProfile = getActiveProfile(loadedProfileStore);
  const state = {
    screen: initialProfile ? "home" : "profile",
    profileStore: loadedProfileStore,
    profileName: loadedProfileStore.currentProfile || "",
    totalPoints: initialProfile?.totalPoints || 0,
    selectedSubjectId: "math",
    selectedDifficultyId: "seed",
    languageId: activeLanguageId,
    buddyName: initialProfile?.companionName || t("defaultBuddy"),
    buddyColor: initialProfile?.buddyColor || DEFAULT_BUDDY_COLOR,
    rewardShown: Boolean(initialProfile?.rewardShown),
    streak: initialProfile?.streak || createEmptyStreak(),
    adventure: GameLogic.createEmptyAdventure(initialProfile?.adventure),
    lastStreakBonus: null,
    exportMessage: "",
    progressVisible: false,
    cloudStatus: window.MaruppuCloudStore?.isConfigured() ? "loading" : "local",
    round: null,
  };

  function t(key, values = {}) {
    let value = translations[activeLanguageId]?.[key] ?? translations.en[key] ?? translations.ja[key] ?? key;
    if (Array.isArray(value)) return value;
    Object.entries(values).forEach(([name, replacement]) => {
      value = value.replaceAll(`{${name}}`, replacement);
    });
    return value;
  }

  function loadLanguage() {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return GameLogic.languages.some((language) => language.id === stored) ? stored : "ja";
  }

  function setLanguage(languageId) {
    activeLanguageId = GameLogic.getLanguage(languageId).id;
    state.languageId = activeLanguageId;
    localStorage.setItem(LANGUAGE_KEY, activeLanguageId);
    document.documentElement.lang = GameLogic.getLanguage(activeLanguageId).htmlLang;
    document.title = t("appTitle");
  }

  function safeName(value, fallback) {
    const trimmed = String(value || "").trim();
    return (trimmed || fallback).slice(0, 8);
  }

  function sanitizeProfileName(value) {
    return safeName(value, t("defaultProfile"));
  }

  function sanitizeBuddyName(value) {
    return safeName(value, t("defaultBuddy"));
  }

  function createEmptyStreak() {
    return { current: 0, best: 0, lastPlayedDate: "", lastBonusDate: "" };
  }

  function todayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dayDiff(from, to) {
    if (!from || !to) return null;
    return Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000);
  }

  function streakBonusFor(days) {
    if (days >= 5) return 50;
    if (days >= 3) return 20;
    if (days >= 2) return 10;
    return 0;
  }

  function updateStreakForPlay(streak) {
    const today = todayKey();
    const safe = { ...createEmptyStreak(), ...streak };
    if (safe.lastPlayedDate === today) {
      return { ...safe, bonusPoints: 0, message: t("streakRecorded") };
    }
    const diff = dayDiff(safe.lastPlayedDate, today);
    const current = diff === 1 ? safe.current + 1 : 1;
    const best = Math.max(safe.best || 0, current);
    const bonusPoints = safe.lastBonusDate === today ? 0 : streakBonusFor(current);
    const message = current === 1 ? (diff && diff > 1 ? t("streakRestart") : t("streakStart")) : t("streakContinue", { days: current });
    return { current, best, lastPlayedDate: today, lastBonusDate: bonusPoints > 0 ? today : safe.lastBonusDate, bonusPoints, message };
  }

  function loadProfileStore() {
    const fallback = { currentProfile: "", profiles: {} };
    try {
      const parsed = JSON.parse(localStorage.getItem(PROFILE_STORE_KEY) || "null");
      if (parsed?.profiles && typeof parsed.profiles === "object") return parsed;
    } catch {
      // Ignore broken localStorage and rebuild below.
    }
    const legacyPoints = Number(localStorage.getItem(LEGACY_STORAGE_KEY) || 0);
    const legacyName = localStorage.getItem(LEGACY_BUDDY_NAME_KEY);
    if (legacyPoints || legacyName) {
      const profileName = t("defaultProfile");
      fallback.currentProfile = profileName;
      fallback.profiles[profileName] = {
        totalPoints: legacyPoints,
        companionName: sanitizeBuddyName(legacyName),
        buddyColor: localStorage.getItem(LEGACY_BUDDY_COLOR_KEY) || DEFAULT_BUDDY_COLOR,
        rewardShown: localStorage.getItem(LEGACY_REWARD_SHOWN_KEY) === "true",
        streak: createEmptyStreak(),
      };
    }
    return fallback;
  }

  function getActiveProfile(store = state?.profileStore) {
    return store?.profiles?.[store.currentProfile] || null;
  }

  function normalizeProfile(profile) {
    return {
      totalPoints: Number(profile?.totalPoints || 0),
      companionName: sanitizeBuddyName(profile?.companionName),
      buddyColor: BUDDY_COLORS.includes(profile?.buddyColor) ? profile.buddyColor : DEFAULT_BUDDY_COLOR,
      rewardShown: Boolean(profile?.rewardShown),
      streak: { ...createEmptyStreak(), ...(profile?.streak || {}) },
      adventure: GameLogic.createEmptyAdventure(profile?.adventure),
    };
  }

  function saveProfileStore() {
    localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(state.profileStore));
    if (window.MaruppuCloudStore?.isConfigured()) {
      state.cloudStatus = "saving";
      window.MaruppuCloudStore.saveProfileStore(state.profileStore).then((saved) => {
        state.cloudStatus = saved ? "synced" : "error";
        render();
      });
    }
  }

  function updateCurrentProfile(updates) {
    const name = state.profileStore.currentProfile;
    if (!name) return;
    state.profileStore.profiles[name] = normalizeProfile({ ...state.profileStore.profiles[name], ...updates });
    const profile = state.profileStore.profiles[name];
    state.profileName = name;
    state.totalPoints = profile.totalPoints;
    state.buddyName = profile.companionName;
    state.buddyColor = profile.buddyColor;
    state.rewardShown = profile.rewardShown;
    state.streak = profile.streak;
    state.adventure = profile.adventure;
    saveProfileStore();
  }

  function syncStateFromProfile() {
    const profile = normalizeProfile(getActiveProfile());
    state.profileName = state.profileStore.currentProfile;
    state.totalPoints = profile.totalPoints;
    state.buddyName = profile.companionName;
    state.buddyColor = profile.buddyColor;
    state.rewardShown = profile.rewardShown;
    state.streak = profile.streak;
    state.adventure = profile.adventure;
  }

  async function initCloudSync() {
    if (!window.MaruppuCloudStore?.isConfigured()) {
      state.cloudStatus = "local";
      render();
      return;
    }

    state.cloudStatus = "loading";
    render();
    const cloudStore = await window.MaruppuCloudStore.loadProfileStore();
    if (cloudStore?.profiles && typeof cloudStore.profiles === "object") {
      state.profileStore = cloudStore;
      syncStateFromProfile();
      state.screen = getActiveProfile() ? "home" : "profile";
      localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(state.profileStore));
      state.cloudStatus = "synced";
      render();
      return;
    }

    await window.MaruppuCloudStore.saveProfileStore(state.profileStore);
    state.cloudStatus = window.MaruppuCloudStore.status();
    render();
  }

  function createOrSelectProfile(playerName, companionName) {
    const name = sanitizeProfileName(playerName);
    state.profileStore.currentProfile = name;
    state.profileStore.profiles[name] = normalizeProfile({
      ...state.profileStore.profiles[name],
      companionName: sanitizeBuddyName(companionName),
      buddyColor: state.buddyColor,
    });
    saveProfileStore();
    syncStateFromProfile();
  }

  function saveBuddyName(name) {
    updateCurrentProfile({ companionName: sanitizeBuddyName(name) });
  }

  function saveBuddyColor(color) {
    if (!BUDDY_COLORS.includes(color)) return;
    updateCurrentProfile({ buddyColor: color });
  }

  function saveRewardShown() {
    updateCurrentProfile({ rewardShown: true });
  }

  function profileName() {
    return state.profileName || t("defaultProfile");
  }

  function buddyName() {
    return sanitizeBuddyName(state.buddyName);
  }

  function selectedSubject() {
    return GameLogic.getSubject(state.selectedSubjectId, state.languageId);
  }

  function visibleStreak() {
    const streak = { ...createEmptyStreak(), ...state.streak };
    const diff = dayDiff(streak.lastPlayedDate, todayKey());
    return diff && diff > 1 ? { ...streak, current: 0 } : streak;
  }

  function streakMessage(streak) {
    if (streak.current >= 5) return t("streakHot");
    if (streak.current >= 2) return t("streakWarm");
    if (!streak.lastPlayedDate) return t("streakHome");
    const diff = dayDiff(streak.lastPlayedDate, todayKey());
    return diff && diff > 1 ? t("streakHomeRestart") : t("streakHome");
  }

  function exportProfileProgress() {
    const profile = getActiveProfile();
    if (!profile) return;
    state.progressVisible = !state.progressVisible;
    state.exportMessage = t("exported");
    render();
  }

  function progressPanel() {
    if (!state.progressVisible) return "";
    const profile = normalizeProfile(getActiveProfile());
    const streak = visibleStreak();
    const storageLabel = state.cloudStatus === "synced" || state.cloudStatus === "saving" || state.cloudStatus === "loading"
      ? "ネットに保存中"
      : "この端末に保存中";
    const rows = [
      [t("progressPlayer"), profileName()],
      [t("progressBuddy"), profile.companionName],
      [t("progressPoints"), `${profile.totalPoints} pt`],
      ["ぼうけんの正解", `${profile.adventure.totalCorrect}`],
      ["今のエリア", FOREST_AREAS[profile.adventure.mapStep] || FOREST_AREAS[0]],
      [t("progressCurrentStreak"), `${streak.current}${t("day")}`],
      [t("progressBestStreak"), `${streak.best}${t("day")}`],
      [t("progressLastPlayed"), profile.streak.lastPlayedDate || t("noProgressDate")],
      [t("progressStorage"), storageLabel],
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");

    return `
      <section class="progress-panel">
        <h2>${t("progressTitle")}</h2>
        <p>${t("progressNote")}</p>
        <div class="progress-grid">${rows}</div>
      </section>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function backButton(label = t("back")) {
    return `<button class="text-button" data-action="back">${label}</button>`;
  }

  function languagePicker() {
    const options = GameLogic.languages
      .map((language) => `<option value="${language.id}" ${language.id === state.languageId ? "selected" : ""}>${language.label}</option>`)
      .join("");
    return `<label class="language-picker"><span>${t("language")}</span><select data-action="language">${options}</select></label>`;
  }

  function cloudStatusBadge() {
    const labels = {
      local: "この端末に保存中",
      loading: "保存を確認中",
      saving: "保存中",
      synced: "ネットに保存中",
      empty: "保存準備OK",
      error: "この端末に保存中",
    };
    const status = state.cloudStatus || "local";
    return `<span class="cloud-status ${status}">${labels[status] || labels.local}</span>`;
  }

  function screenShell(content, className = "") {
    return `<main class="app-shell ${className}"><div class="utility-row">${languagePicker()}${cloudStatusBadge()}</div>${content}</main>`;
  }

  function creatureMarkup(size = "hero", mood = "ready") {
    return `<div class="creature ${size} ${mood} buddy-${state.buddyColor}" aria-hidden="true"><span></span><i></i><b></b><em></em><strong></strong></div>`;
  }

  function spiritMarkup(mood = "ready", difficultyId = "seed") {
    return `<div class="spirit ${difficultyId} ${mood}" aria-hidden="true"><span></span><i></i><b></b><em></em><strong></strong></div>`;
  }

  function sparkleMarkup(active) {
    if (!active) return "";
    return `<div class="sparkles" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>`;
  }

  function challengeTrack(round) {
    return Array.from({ length: GameLogic.QUESTION_COUNT }, (_, index) => {
      const cleared = index < round.correctCount;
      const current = index === Math.min(round.currentIndex, GameLogic.QUESTION_COUNT - 1);
      return `<span class="${cleared ? "cleared" : ""} ${current ? "current" : ""}">${index + 1}</span>`;
    }).join("");
  }

  function renderForestMap(adventure = state.adventure) {
    const safeAdventure = GameLogic.createEmptyAdventure(adventure);
    const nodes = FOREST_AREAS.map((area, index) => {
      const unlocked = index <= safeAdventure.mapStep;
      const current = index === safeAdventure.mapStep;
      return `
        <div class="map-node ${unlocked ? "unlocked" : "locked"} ${current ? "current" : ""}">
          <span>${index + 1}</span>
          ${current ? creatureMarkup("map", "happy") : ""}
          <strong>${area}</strong>
        </div>`;
    }).join("");
    return `
      <section class="forest-map">
        <div class="map-heading">
          <span>森のぼうけん</span>
          <strong>${FOREST_AREAS[safeAdventure.mapStep] || FOREST_AREAS[0]}</strong>
        </div>
        <div class="map-path">${nodes}</div>
        <p>正解すると、マルップが森を少しずつ進むよ。</p>
      </section>`;
  }

  function renderAdventureRun(round) {
    const progress = Math.min(GameLogic.QUESTION_COUNT, round.correctCount);
    const steps = Array.from({ length: GameLogic.QUESTION_COUNT }, (_, index) => `<span class="${index < progress ? "cleared" : ""} ${index === progress ? "current" : ""}"></span>`).join("");
    return `
      <section class="adventure-run">
        <div class="run-path">${steps}<i style="--step:${progress}"></i></div>
        <p>${FOREST_AREAS[GameLogic.getUnlockedMapStep(round.adventureProgress?.totalCorrect || state.adventure.totalCorrect)] || FOREST_AREAS[0]}を ぼうけん中</p>
      </section>`;
  }

  function renderSpiritGrowthList(adventure = state.adventure) {
    const safeAdventure = GameLogic.createEmptyAdventure(adventure);
    const cards = GameLogic.difficulties.map((base) => {
      const difficulty = GameLogic.getDifficulty(base.id, state.languageId);
      const spirit = safeAdventure.spirits[base.id] || { met: false, growth: 0, level: 1 };
      const level = GameLogic.getSpiritGrowthLevel(spirit.growth);
      return `
        <article class="spirit-growth-card growth-level-${level} ${spirit.met ? "met" : "new"}">
          ${spiritMarkup(`ready growth-level-${level}`, base.id)}
          <div>
            <strong>${difficulty.spiritName}</strong>
            <span>${spirit.met ? `なかよし Lv.${level}` : "これから出会えるよ"}</span>
            <em style="--growth:${Math.min(100, spirit.growth * 14)}%"><i></i></em>
          </div>
        </article>`;
    }).join("");
    return `
      <section class="spirit-growth-list">
        <div class="section-heading"><span>せいれいの育ちぐあい</span><strong>${safeAdventure.totalCorrect}こ 正解</strong></div>
        <div class="growth-grid">${cards}</div>
      </section>`;
  }

  function renderProfile() {
    const profileNames = Object.keys(state.profileStore.profiles);
    const profileButtons = profileNames.map((name) => {
      const profile = state.profileStore.profiles[name];
      return `
        <button class="profile-card ${name === state.profileStore.currentProfile ? "selected-profile" : ""}" data-action="profile-select" data-profile="${escapeHtml(name)}">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(profile.companionName)} ${t("start")}</span>
          <em>${profile.totalPoints} pt</em>
        </button>`;
    }).join("");
    return screenShell(`
      ${backButton(t("home"))}
      <h1 class="page-title">${t("profileTitle")}</h1>
      <p class="stage-intro">${t("profileIntro")}</p>
      ${profileButtons ? `<div class="profile-list">${profileButtons}</div>` : ""}
      <section class="profile-create-panel">
        <label class="buddy-form"><span>${t("playerName")}</span><input class="buddy-name-input" data-profile-input="player" maxlength="8" autocomplete="off" /></label>
        <label class="buddy-form"><span>${t("buddyName")}</span><input class="buddy-name-input" data-profile-input="companion" maxlength="8" value="${escapeHtml(t("defaultBuddy"))}" autocomplete="off" /></label>
      </section>
      <button class="primary-button" data-action="profile-create">${t("createProfile")}</button>
    `);
  }

  function renderHome() {
    const seedCount = Math.floor(state.totalPoints / GameLogic.POINTS_PER_CORRECT);
    const name = escapeHtml(buddyName());
    const streak = visibleStreak();
    const streakClass = streak.current >= 5 ? "hot" : streak.current >= 2 ? "warm" : "";
    return screenShell(`
      <div class="top-bar"><span class="pill">${escapeHtml(profileName())}</span><span class="score-chip">${state.totalPoints} pt</span></div>
      ${renderForestMap()}
      <section class="hero-panel">
        <div class="sky-bits" aria-hidden="true"><span></span><span></span><span></span></div>
        ${creatureMarkup("hero", "happy")}
        <p class="tiny-label">${selectedSubject().homeLabel}</p>
        <h1>${t("homeTitle", { name })}</h1>
        <p class="lead">${t("homeLead")}</p>
        <div class="seed-meter"><strong>${seedCount}</strong><span>${t("seeds")}</span></div>
        <section class="streak-panel ${streakClass}">
          <div><span>${t("streakLabel")}</span><strong>${streak.current}${t("day")}</strong></div>
          <div><span>${t("bestLabel")}</span><strong>${streak.best}${t("day")}</strong></div>
          <p>${streakMessage(streak)}</p>
        </section>
      </section>
      ${renderSpiritGrowthList()}
      <button class="primary-button" data-action="starter">${t("start")}</button>
      <button class="text-button center" data-action="export">${t("export")}</button>
      ${state.exportMessage ? `<p class="export-message">${state.exportMessage}</p>` : ""}
      ${progressPanel()}
      <button class="text-button center" data-action="profile">${t("profile")}</button>
    `, "home-screen");
  }

  function renderStarter() {
    const name = escapeHtml(buddyName());
    const colorButtons = BUDDY_COLORS.map((color) => `<button class="color-choice ${color} ${state.buddyColor === color ? "selected-color" : ""}" data-action="color" data-color="${color}"></button>`).join("");
    return screenShell(`
      ${backButton()}
      <h1 class="page-title">${t("buddyIntro")}</h1>
      <p class="stage-intro">${t("buddyFor", { name: escapeHtml(profileName()) })}</p>
      <button class="starter-card selected" data-action="subject">
        ${creatureMarkup("small", "happy")}
        <span><strong>${name}</strong><small>${t("buddyKind")}</small></span>
      </button>
      <label class="buddy-form"><span>${t("buddyNamePrompt")}</span><input class="buddy-name-input" data-action="name" maxlength="8" value="${name}" autocomplete="off" /></label>
      <div class="color-picker">${colorButtons}</div>
      <div class="speech">${t("buddySpeech", { name })}</div>
      <button class="primary-button" data-action="subject">${t("useBuddy")}</button>
    `);
  }

  function renderSubject() {
    const subjectButtons = GameLogic.subjects.map((base) => {
      const subject = GameLogic.getSubject(base.id, state.languageId);
      return `
        <button class="subject-card ${subject.id} ${state.selectedSubjectId === subject.id ? "selected-subject" : ""}" data-action="subject-select" data-subject-id="${subject.id}">
          <span>${subject.name}</span><strong>${subject.actionLabel}</strong><small>${subject.id === "math" ? t("mathSmall") : t("languageSmall")}</small>
        </button>`;
    }).join("");
    return screenShell(`
      ${backButton()}
      <h1 class="page-title">${t("subjectTitle")}</h1>
      <p class="stage-intro">${t("subjectIntro")}</p>
      <div class="subject-grid">${subjectButtons}</div>
      <button class="primary-button" data-action="stages">${t("chooseSpirit")}</button>
    `);
  }

  function renderStages() {
    const stageButtons = GameLogic.difficulties.map((base, index) => {
      const difficulty = GameLogic.getDifficulty(base.id, state.languageId);
      return `
        <button class="stage-card difficulty-card ${difficulty.id}" data-action="start" data-difficulty-id="${difficulty.id}">
          <span class="stage-number">${index + 1}</span><strong>${difficulty.spiritName}</strong>
          <small>${difficulty.gradeLabel}・${difficulty.subjectLabels[state.selectedSubjectId]}</small><em>${difficulty.description}</em>
        </button>`;
    }).join("");
    return screenShell(`
      ${backButton()}
      <h1 class="page-title">${t("stagesTitle")}</h1>
      <p class="stage-intro">${t("stagesIntro", { subject: selectedSubject().name })}</p>
      <div class="stack">${stageButtons}</div>
    `);
  }

  function renderBattle() {
    const round = state.round;
    const questionNumber = Math.min(round.currentIndex + 1, GameLogic.QUESTION_COUNT);
    const lastAnswer = round.answers.at(-1);
    const feedbackClass = lastAnswer?.correct ? "good" : "try";
    const isCombo = Boolean(round.answered && lastAnswer?.correct && round.currentStreak >= 2);
    const mood = round.answered ? (lastAnswer.correct ? (isCombo ? "combo" : "jump") : "soft") : "ready";
    const praiseWords = t("praise");
    const feedbackText = round.answered
      ? lastAnswer.correct
        ? `${praiseWords[round.answers.length % praiseWords.length]}${isCombo ? ` ${t("combo", { count: round.currentStreak })}` : ""}`
        : t("tryAgain")
      : t("battleStart");
    const talkText = round.answered ? (lastAnswer.correct ? (isCombo ? t("talkCombo") : t("talkGood")) : t("talkTry")) : t("talkReady");
    const spiritMood = round.answered ? (lastAnswer.correct ? (isCombo ? "shine combo" : "shine") : "tilt") : "ready";
    const difficulty = round.difficulty;
    const spiritGrowth = (round.adventureProgress || state.adventure).spirits?.[difficulty.id] || { growth: 0, level: 1 };
    const spiritLevel = GameLogic.getSpiritGrowthLevel(spiritGrowth.growth);
    const supportText = round.answered ? round.question.explanation : round.question.hint;
    const choices = round.question.choices.map((choice) => {
      const selected = round.answered && String(choice) === String(lastAnswer?.selectedAnswer);
      const correct = round.answered && String(choice) === String(round.question.answer);
      return `<button class="answer-button ${selected ? "selected-answer" : ""} ${correct ? "correct-answer" : ""} ${correct && lastAnswer?.correct ? "win-pop" : ""}" data-action="answer" data-answer="${escapeHtml(choice)}" ${round.answered ? "disabled" : ""}>${escapeHtml(choice)}</button>`;
    }).join("");

    return screenShell(`
      ${round.answered && lastAnswer?.correct ? `<div class="screen-glow ${isCombo ? "combo-glow" : ""}" aria-hidden="true"></div>` : ""}
      <div class="top-bar">${backButton()}<span class="pill">${t("clear")} ${round.correctCount} / ${GameLogic.QUESTION_COUNT}</span><span class="score-chip">${state.totalPoints + round.earnedPoints} pt</span></div>
      <section class="challenge-track">${challengeTrack(round)}</section>
      ${renderAdventureRun(round)}
      <section class="versus-arena ${round.answered ? feedbackClass : ""}">
        <div class="side own-side"><div class="name-tag">${escapeHtml(buddyName())}</div>${creatureMarkup("duel", mood)}<div class="maruppu-talk">${talkText}</div></div>
        <div class="friend-beam ${round.answered && lastAnswer?.correct ? "active" : ""}" aria-hidden="true"></div>
        <div class="side spirit-side"><div class="name-tag">${difficulty.spiritName} Lv.${spiritLevel}</div>${spiritMarkup(`${spiritMood} growth-level-${spiritLevel}`, difficulty.id)}<div class="spirit-talk">${round.answered && lastAnswer?.correct ? t("spiritGood") : t("spiritReady")}</div></div>
        ${sparkleMarkup(round.answered && lastAnswer?.correct)}
      </section>
      <section class="battle-scene">
        <div class="question-panel">
          <p>${t("challengeCount", { spirit: difficulty.spiritName, challenge: round.subject.challengeLabel, count: questionNumber })}</p>
          <h1 class="story-question">${escapeHtml(round.question.story).replaceAll("\n", "<br />")}</h1>
          <div class="equation-hint">${escapeHtml(round.question.hintText || `${round.question.text} = ?`)}</div>
        </div>
      </section>
      <p class="feedback ${round.answered ? feedbackClass : ""}">${feedbackText}</p>
      ${supportText ? `<p class="question-support ${round.answered ? "answer-note" : ""}">${escapeHtml(supportText)}</p>` : ""}
      <div class="answer-grid">${choices}</div>
      ${round.answered ? `<button class="primary-button" data-action="next">${round.currentIndex + 1 >= GameLogic.QUESTION_COUNT ? t("result") : t("next")}</button>` : ""}
    `, `battle-screen ${round.answered && lastAnswer?.correct ? "success-screen" : ""} ${isCombo ? "combo-screen" : ""}`);
  }

  function renderResult() {
    const round = state.round;
    const name = escapeHtml(buddyName());
    const streakBonus = state.lastStreakBonus;
    return screenShell(`
      <section class="result-panel">
        <p class="tiny-label">${t("resultLabel")}</p>
        <div class="grown-seed" aria-hidden="true"><span></span></div>
        ${creatureMarkup("hero", "combo")}
        <h1>${round.correctCount === GameLogic.QUESTION_COUNT ? t("resultPerfect") : t("resultNice")}</h1>
        <p class="lead">${round.correctCount === GameLogic.QUESTION_COUNT ? t("resultTalkPerfect", { name }) : t("resultTalkNice", { name })}</p>
        <div class="reward-box"><strong>${round.earnedPoints} pt</strong><span>${t("rewardLine", { count: round.correctCount, reward: round.difficulty.reward })}</span></div>
        ${streakBonus ? `<div class="streak-result ${streakBonus.bonusPoints > 0 ? "earned" : ""}"><span>${t("streakBonus")}</span><strong>+${streakBonus.bonusPoints} pt</strong><small>${streakBonus.message}</small></div>` : ""}
        <div class="total-box">${t("total", { points: state.totalPoints })}</div>
        <p class="closing-line">${t("closing")}</p>
      </section>
      <button class="primary-button" data-action="stages">${t("again")}</button>
      ${backButton()}
      <button class="text-button center" data-action="home">${t("home")}</button>
    `);
  }

  function renderSpecialReward() {
    const name = escapeHtml(buddyName());
    const streakBonus = state.lastStreakBonus;
    return screenShell(`
      <section class="special-reward-panel">
        <div class="celebration-sparkles" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>
        ${creatureMarkup("hero", "combo")}
        <p class="tiny-label">${t("specialLabel")}</p>
        <h1>${t("specialTitle")}</h1>
        <div class="reward-total">1000 pt</div>
        ${streakBonus?.bonusPoints > 0 ? `<div class="streak-result earned"><span>${t("streakBonus")}</span><strong>+${streakBonus.bonusPoints} pt</strong><small>${streakBonus.message}</small></div>` : ""}
        <p class="lead">${t("specialLead", { name })}</p>
      </section>
      ${backButton()}
      <button class="primary-button" data-action="home">${t("home")}</button>
    `, "reward-screen");
  }

  function render() {
    const screens = { profile: renderProfile, home: renderHome, starter: renderStarter, subject: renderSubject, stages: renderStages, battle: renderBattle, result: renderResult, specialReward: renderSpecialReward };
    document.documentElement.lang = GameLogic.getLanguage(state.languageId).htmlLang;
    document.title = t("appTitle");
    app.innerHTML = screens[state.screen]();
  }

  function backScreen() {
    if (state.screen === "battle") return "stages";
    if (state.screen === "stages") return "subject";
    if (state.screen === "subject") return "starter";
    if (state.screen === "starter") return "home";
    if (state.screen === "profile") return getActiveProfile() ? "home" : "profile";
    if (state.screen === "result" || state.screen === "specialReward") return "home";
    return "home";
  }

  function setScreen(screen) {
    state.screen = screen;
    render();
  }

  function startRound(difficultyId) {
    if (!getActiveProfile()) {
      setScreen("profile");
      return;
    }
    state.selectedDifficultyId = difficultyId;
    state.lastStreakBonus = null;
    state.round = GameLogic.createRound(difficultyId, state.selectedSubjectId, state.languageId);
    state.round.adventureProgress = GameLogic.createEmptyAdventure(state.adventure);
    setScreen("battle");
  }

  function handleAnswer(answer) {
    if (!state.round || state.round.answered) return;
    state.round = GameLogic.answerQuestion(state.round, answer);
    const lastAnswer = state.round.answers.at(-1);
    state.round.adventureProgress = GameLogic.applyAdventureAnswer(state.round.adventureProgress || state.adventure, state.round.difficulty.id, Boolean(lastAnswer?.correct));
    render();
  }

  function handleNext() {
    const wasLastQuestion = state.round.currentIndex + 1 >= GameLogic.QUESTION_COUNT;
    if (wasLastQuestion) {
      const beforeTotal = state.totalPoints;
      const streakResult = updateStreakForPlay(state.streak);
      const afterTotal = beforeTotal + state.round.earnedPoints + streakResult.bonusPoints;
      const shouldShowReward = beforeTotal < 1000 && afterTotal >= 1000 && !state.rewardShown;
      state.lastStreakBonus = streakResult;
      updateCurrentProfile({
        totalPoints: afterTotal,
        streak: { current: streakResult.current, best: streakResult.best, lastPlayedDate: streakResult.lastPlayedDate, lastBonusDate: streakResult.lastBonusDate },
        adventure: state.round.adventureProgress || state.adventure,
      });
      if (shouldShowReward) {
        saveRewardShown();
        setScreen("specialReward");
      } else {
        setScreen("result");
      }
      return;
    }
    state.round = GameLogic.nextQuestion(state.round);
    render();
  }

  app.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "back") setScreen(backScreen());
    if (action === "home") setScreen("home");
    if (action === "profile") setScreen("profile");
    if (action === "export") exportProfileProgress();
    if (action === "profile-select") {
      state.profileStore.currentProfile = target.dataset.profile;
      saveProfileStore();
      syncStateFromProfile();
      setScreen("home");
    }
    if (action === "profile-create") {
      createOrSelectProfile(app.querySelector("[data-profile-input='player']")?.value, app.querySelector("[data-profile-input='companion']")?.value);
      setScreen("home");
    }
    if (action === "starter") setScreen("starter");
    if (action === "subject") setScreen("subject");
    if (action === "subject-select") {
      state.selectedSubjectId = target.dataset.subjectId || "math";
      setScreen("stages");
    }
    if (action === "stages") setScreen("stages");
    if (action === "start") startRound(target.dataset.difficultyId);
    if (action === "color") {
      saveBuddyColor(target.dataset.color);
      render();
    }
    if (action === "answer") handleAnswer(target.dataset.answer);
    if (action === "next") handleNext();
  });

  app.addEventListener("change", (event) => {
    const target = event.target.closest("[data-action='language']");
    if (!target) return;
    setLanguage(target.value);
    render();
  });

  app.addEventListener("input", (event) => {
    const target = event.target.closest("[data-action='name']");
    if (!target) return;
    saveBuddyName(target.value);
  });

  setLanguage(activeLanguageId);
  render();
  initCloudSync();
})();
