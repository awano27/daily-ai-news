(function () {
  "use strict";

  const LEGACY_STORAGE_KEY = "maruppu-total-points";
  const LEGACY_BUDDY_NAME_KEY = "maruppu-buddy-name";
  const LEGACY_BUDDY_COLOR_KEY = "maruppu-buddy-color";
  const LEGACY_REWARD_SHOWN_KEY = "maruppu-1000-reward-shown";
  const PROFILE_STORE_KEY = "maruppu-profile-store";
  const DEFAULT_BUDDY_NAME = "マルップ";
  const DEFAULT_PROFILE_NAME = "ともだち";
  const DEFAULT_BUDDY_COLOR = "coral";
  const BUDDY_COLORS = ["coral", "mint", "sky"];
  const app = document.querySelector("#app");
  const loadedProfileStore = loadProfileStore();
  const initialProfile = getActiveProfile(loadedProfileStore);

  const state = {
    screen: initialProfile ? "home" : "profile",
    profileStore: loadedProfileStore,
    profileName: loadedProfileStore.currentProfile || "",
    totalPoints: initialProfile?.totalPoints || 0,
    selectedStarter: "maruppu",
    selectedSubjectId: "math",
    selectedDifficultyId: "seed",
    buddyName: initialProfile?.companionName || DEFAULT_BUDDY_NAME,
    buddyColor: initialProfile?.buddyColor || DEFAULT_BUDDY_COLOR,
    rewardShown: Boolean(initialProfile?.rewardShown),
    streak: initialProfile?.streak || createEmptyStreak(),
    lastStreakBonus: null,
    exportMessage: "",
    round: null,
  };

  const praiseWords = [
    "いいね！ なかよしムーブ せいこう",
    "すごい！ 光が せいれいに とどいたよ",
    "やったね！ せいれいが にこにこだよ",
    "そのちょうし！ チャレンジ クリア",
    "ばっちり！ 相棒の光が きらり",
    "すてき！ しょうぶが もりあがったよ",
    "ぴったり！ せいれいと なかよし",
    "いいリズム！ つぎも いこう",
  ];

  function loadLegacyPoints() {
    const storedValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const points = Number(storedValue);
    return Number.isFinite(points) && points >= 0 ? points : 0;
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function daysBetween(dateKey, nextDateKey) {
    if (!dateKey || !nextDateKey) {
      return null;
    }

    const current = new Date(`${dateKey}T00:00:00`);
    const next = new Date(`${nextDateKey}T00:00:00`);
    const diff = Math.round((next - current) / 86400000);
    return Number.isFinite(diff) ? diff : null;
  }

  function createEmptyStreak() {
    return {
      current: 0,
      best: 0,
      lastPlayedDate: "",
      lastBonusDate: "",
    };
  }

  function normalizeStreak(value) {
    const streak = value && typeof value === "object" ? value : {};
    const current = Number(streak.current);
    const best = Number(streak.best);
    return {
      current: Number.isFinite(current) && current >= 0 ? Math.floor(current) : 0,
      best: Number.isFinite(best) && best >= 0 ? Math.floor(best) : 0,
      lastPlayedDate: typeof streak.lastPlayedDate === "string" ? streak.lastPlayedDate : "",
      lastBonusDate: typeof streak.lastBonusDate === "string" ? streak.lastBonusDate : "",
    };
  }

  function visibleStreak(streak = state.streak, dateKey = todayKey()) {
    const safeStreak = normalizeStreak(streak);
    const gap = daysBetween(safeStreak.lastPlayedDate, dateKey);
    if (gap === null) {
      return { ...safeStreak, current: 0 };
    }
    if (gap > 1) {
      return { ...safeStreak, current: 0 };
    }
    return safeStreak;
  }

  function streakBonusFor(days) {
    if (days >= 5) {
      return 50;
    }
    if (days >= 3) {
      return 20;
    }
    if (days >= 2) {
      return 10;
    }
    return 0;
  }

  function updateStreakForPlay(streak, dateKey = todayKey()) {
    const safeStreak = normalizeStreak(streak);
    const gap = daysBetween(safeStreak.lastPlayedDate, dateKey);
    let current = 1;
    let message = "今日から 連続チャレンジ スタート！";

    if (gap === 0) {
      current = Math.max(1, safeStreak.current);
      message = "今日はもう 記録できているよ。";
    } else if (gap === 1) {
      current = safeStreak.current + 1;
      message = `${current}日れんぞく！ 今日も来てくれてうれしいよ。`;
    } else if (safeStreak.lastPlayedDate) {
      current = 1;
      message = "また今日から いっしょに がんばろうね。";
    }

    const best = Math.max(safeStreak.best, current);
    const bonusPoints = safeStreak.lastBonusDate === dateKey ? 0 : streakBonusFor(current);
    return {
      current,
      best,
      lastPlayedDate: dateKey,
      lastBonusDate: bonusPoints > 0 ? dateKey : safeStreak.lastBonusDate,
      bonusPoints,
      message,
      isNewDay: gap !== 0,
    };
  }

  function sanitizeProfileName(value) {
    const trimmedValue = String(value || "").trim();
    return trimmedValue ? trimmedValue.slice(0, 8) : DEFAULT_PROFILE_NAME;
  }

  function sanitizeBuddyName(value) {
    const trimmedValue = String(value || "").trim();
    return trimmedValue ? trimmedValue.slice(0, 8) : DEFAULT_BUDDY_NAME;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readJson(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || "null");
    } catch (_) {
      return null;
    }
  }

  function normalizeProfileStore(value) {
    const profiles = value && typeof value.profiles === "object" && value.profiles ? value.profiles : {};
    const normalizedProfiles = {};
    Object.entries(profiles).forEach(([rawName, rawProfile]) => {
      const profileName = sanitizeProfileName(rawName);
      const profile = rawProfile && typeof rawProfile === "object" ? rawProfile : {};
      const totalPoints = Number(profile.totalPoints);
      const buddyColor = BUDDY_COLORS.includes(profile.buddyColor) ? profile.buddyColor : DEFAULT_BUDDY_COLOR;
      normalizedProfiles[profileName] = {
        totalPoints: Number.isFinite(totalPoints) && totalPoints >= 0 ? totalPoints : 0,
        companionName: sanitizeBuddyName(profile.companionName),
        buddyColor,
        rewardShown: Boolean(profile.rewardShown),
        streak: normalizeStreak(profile.streak),
      };
    });

    const currentProfile = normalizedProfiles[value?.currentProfile] ? value.currentProfile : Object.keys(normalizedProfiles)[0] || "";
    return { currentProfile, profiles: normalizedProfiles };
  }

  function loadProfileStore() {
    const storedValue = normalizeProfileStore(readJson(PROFILE_STORE_KEY));
    if (storedValue.currentProfile) {
      return storedValue;
    }

    const legacyPoints = loadLegacyPoints();
    const legacyBuddyName = window.localStorage.getItem(LEGACY_BUDDY_NAME_KEY);
    const legacyBuddyColor = window.localStorage.getItem(LEGACY_BUDDY_COLOR_KEY);
    const legacyRewardShown = window.localStorage.getItem(LEGACY_REWARD_SHOWN_KEY) === "1";
    if (legacyPoints > 0 || legacyBuddyName || legacyBuddyColor || legacyRewardShown) {
      return {
        currentProfile: DEFAULT_PROFILE_NAME,
        profiles: {
          [DEFAULT_PROFILE_NAME]: {
            totalPoints: legacyPoints,
            companionName: sanitizeBuddyName(legacyBuddyName),
            buddyColor: BUDDY_COLORS.includes(legacyBuddyColor) ? legacyBuddyColor : DEFAULT_BUDDY_COLOR,
            rewardShown: legacyRewardShown,
            streak: createEmptyStreak(),
          },
        },
      };
    }

    return { currentProfile: "", profiles: {} };
  }

  function saveProfileStore() {
    window.localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(state.profileStore));
  }

  function getActiveProfile(store = state.profileStore) {
    return store.profiles[store.currentProfile] || null;
  }

  function syncStateFromProfile() {
    const profile = getActiveProfile();
    state.profileName = state.profileStore.currentProfile || "";
    state.totalPoints = profile?.totalPoints || 0;
    state.buddyName = profile?.companionName || DEFAULT_BUDDY_NAME;
    state.buddyColor = profile?.buddyColor || DEFAULT_BUDDY_COLOR;
    state.rewardShown = Boolean(profile?.rewardShown);
    state.streak = normalizeStreak(profile?.streak);
  }

  function updateCurrentProfile(updates) {
    const profileName = state.profileStore.currentProfile;
    if (!profileName || !state.profileStore.profiles[profileName]) {
      return;
    }

    state.profileStore.profiles[profileName] = {
      ...state.profileStore.profiles[profileName],
      ...updates,
    };
    saveProfileStore();
    syncStateFromProfile();
  }

  function createOrSelectProfile(profileNameValue, companionNameValue) {
    const profileName = sanitizeProfileName(profileNameValue);
    const existingProfile = state.profileStore.profiles[profileName];
    state.profileStore.currentProfile = profileName;
    state.profileStore.profiles[profileName] = existingProfile || {
      totalPoints: 0,
      companionName: sanitizeBuddyName(companionNameValue),
      buddyColor: state.buddyColor || DEFAULT_BUDDY_COLOR,
      rewardShown: false,
      streak: createEmptyStreak(),
    };
    if (existingProfile && companionNameValue) {
      state.profileStore.profiles[profileName].companionName = sanitizeBuddyName(companionNameValue);
    }
    saveProfileStore();
    syncStateFromProfile();
  }

  function saveBuddyName(name) {
    updateCurrentProfile({ companionName: sanitizeBuddyName(name) });
  }

  function saveBuddyColor(color) {
    updateCurrentProfile({ buddyColor: BUDDY_COLORS.includes(color) ? color : DEFAULT_BUDDY_COLOR });
  }

  function saveRewardShown() {
    updateCurrentProfile({ rewardShown: true });
  }

  function buddyName() {
    return escapeHtml(state.buddyName || DEFAULT_BUDDY_NAME);
  }

  function profileName() {
    return escapeHtml(state.profileName || DEFAULT_PROFILE_NAME);
  }

  function selectedSubject() {
    return GameLogic.getSubject(state.selectedSubjectId);
  }

  function streakMessage(streak = visibleStreak()) {
    if (streak.current >= 5) {
      return "すごい連続だね！ 今日もキラキラだよ。";
    }
    if (streak.current >= 2) {
      return "今日もがんばろう！ 連続ボーナスが近いよ。";
    }
    if (state.streak.lastPlayedDate && streak.current === 0) {
      return "また今日から いっしょに はじめようね。";
    }
    return "今日もがんばろう！";
  }

  function exportProfileProgress() {
    const profile = getActiveProfile();
    if (!profile) {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      currentProfile: state.profileName,
      profile: {
        ...profile,
        streak: normalizeStreak(profile.streak),
      },
      note: "手動でGitHubなどに保存するための進捗データです。",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `maruppu-progress-${state.profileName || "profile"}-${todayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    state.exportMessage = "進捗JSONを作ったよ。おうちの人と保存してね。";
    render();
  }

  function setScreen(screen) {
    state.screen = getActiveProfile() || screen === "profile" ? screen : "profile";
    render();
  }

  function backScreen() {
    const routes = {
      profile: getActiveProfile() ? "home" : "profile",
      starter: "home",
      subject: "starter",
      stages: "subject",
      battle: "stages",
      result: "stages",
      specialReward: "home",
    };
    return routes[state.screen] || "home";
  }

  function backButton(label = "もどる") {
    if (state.screen === "home" || (state.screen === "profile" && !getActiveProfile())) {
      return "";
    }

    return `<button class="text-button back-button" data-action="back">${label}</button>`;
  }

  function screenShell(content, modifier) {
    return `
      <section class="app-shell ${modifier || ""}">
        ${content}
      </section>
    `;
  }

  function creatureMarkup(sizeClass, mood) {
    return `
      <div class="creature buddy-${state.buddyColor} ${sizeClass || ""} ${mood || ""}" aria-hidden="true">
        <span></span>
        <i></i>
        <b></b>
        <em></em>
        <strong></strong>
      </div>
    `;
  }

  function spiritMarkup(mood, difficultyId) {
    return `
      <div class="spirit ${difficultyId || "seed"} ${mood || ""}" aria-hidden="true">
        <span></span>
        <i></i>
        <b></b>
        <em></em>
        <strong></strong>
      </div>
    `;
  }

  function sparkleMarkup(active) {
    if (!active) {
      return "";
    }

    return `
      <div class="sparkles" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    `;
  }

  function adventurePath(round, mood) {
    const currentStep = Math.min(round.correctCount, GameLogic.QUESTION_COUNT - 1);
    return Array.from({ length: GameLogic.QUESTION_COUNT }, (_, index) => {
      const found = index < round.correctCount;
      const current = index === currentStep;
      const mark = found ? "たね" : "草";
      return `
        <div class="path-step ${found ? "found" : ""} ${current ? "current" : ""}">
          <span class="step-mark">${mark}</span>
          ${current ? creatureMarkup("path", mood) : ""}
        </div>
      `;
    }).join("");
  }

  function challengeTrack(round) {
    return Array.from({ length: GameLogic.QUESTION_COUNT }, (_, index) => {
      const cleared = index < round.correctCount;
      const current = index === Math.min(round.currentIndex, GameLogic.QUESTION_COUNT - 1);
      return `<span class="${cleared ? "cleared" : ""} ${current ? "current" : ""}">${index + 1}</span>`;
    }).join("");
  }

  function renderProfile() {
    const profileNames = Object.keys(state.profileStore.profiles);
    const hasProfiles = profileNames.length > 0;
    const profileButtons = profileNames
      .map((name) => {
        const profile = state.profileStore.profiles[name];
        const selected = name === state.profileStore.currentProfile;
        return `
          <button class="profile-card ${selected ? "selected-profile" : ""}" data-action="profile-select" data-profile="${escapeHtml(name)}">
            <strong>${escapeHtml(name)}</strong>
            <span>${escapeHtml(profile.companionName)}と あそぶ</span>
            <em>${profile.totalPoints} pt</em>
          </button>
        `;
      })
      .join("");

    return screenShell(`
      ${backButton("ホームへ")}
      <h1 class="page-title">だれが あそぶ？</h1>
      <p class="stage-intro">名前を入れると、自分だけのポイントで あそべるよ。</p>
      ${hasProfiles ? `<div class="profile-list">${profileButtons}</div>` : ""}
      <section class="profile-create-panel">
        <label class="buddy-form">
          <span>あなたの名前</span>
          <input class="buddy-name-input" data-profile-input="player" maxlength="8" autocomplete="off" />
        </label>
        <label class="buddy-form">
          <span>相棒の名前</span>
          <input class="buddy-name-input" data-profile-input="companion" maxlength="8" value="${escapeHtml(DEFAULT_BUDDY_NAME)}" autocomplete="off" />
        </label>
      </section>
      <button class="primary-button" data-action="profile-create">プロフィールを作る</button>
    `);
  }

  function renderHome() {
    const seedCount = Math.floor(state.totalPoints / GameLogic.POINTS_PER_CORRECT);
    const name = buddyName();
    const streak = visibleStreak();
    const streakClass = streak.current >= 5 ? "hot" : streak.current >= 2 ? "warm" : "";
    return screenShell(`
      <div class="top-bar">
        <span class="pill">${profileName()}</span>
        <span class="score-chip">${state.totalPoints} pt</span>
      </div>
      <section class="hero-panel">
        <div class="sky-bits" aria-hidden="true"><span></span><span></span><span></span></div>
        ${creatureMarkup("hero", "happy")}
        <p class="tiny-label">${selectedSubject().homeLabel}</p>
        <h1>${name}と<br />なかよししょうぶ</h1>
        <p class="lead">算数でも 国語でも、せいれいと なかよく チャレンジできるよ。</p>
        <div class="seed-meter" aria-label="あつめたたね">
          <strong>${seedCount}</strong>
          <span>こ あつめたよ</span>
        </div>
        <section class="streak-panel ${streakClass}" aria-label="連続プレイ">
          <div>
            <span>連続チャレンジ</span>
            <strong>${streak.current}日</strong>
          </div>
          <div>
            <span>最高きろく</span>
            <strong>${streak.best}日</strong>
          </div>
          <p>${streakMessage(streak)}</p>
        </section>
      </section>
      <button class="primary-button" data-action="starter">はじめる</button>
      <button class="text-button center" data-action="export">進捗JSONを出す</button>
      ${state.exportMessage ? `<p class="export-message">${state.exportMessage}</p>` : ""}
      <button class="text-button center" data-action="profile">プロフィール</button>
    `, "home-screen");
  }

  function renderStarter() {
    const name = buddyName();
    const colorButtons = BUDDY_COLORS
      .map((color) => `
        <button class="color-choice ${color} ${state.buddyColor === color ? "selected-color" : ""}" data-action="color" data-color="${color}" aria-label="${color}をえらぶ"></button>
      `)
      .join("");

    return screenShell(`
      ${backButton()}
      <h1 class="page-title">相棒を きめよう</h1>
      <p class="stage-intro">${profileName()}の相棒だよ。</p>
      <button class="starter-card selected" data-action="subject" aria-label="マルップをえらぶ">
        ${creatureMarkup("small", "happy")}
        <span>
          <strong>${name}</strong>
          <small>まあるい たねの友だち</small>
        </span>
      </button>
      <label class="buddy-form">
        <span>あなたの相棒の名前を教えて</span>
        <input class="buddy-name-input" data-action="name" maxlength="8" value="${name}" autocomplete="off" />
      </label>
      <div class="color-picker" aria-label="相棒の色">
        ${colorButtons}
      </div>
      <div class="speech">「${name}と いっしょに がんばろうね」</div>
      <button class="primary-button" data-action="subject">この子で いく</button>
    `);
  }

  function renderSubject() {
    const subjectButtons = GameLogic.subjects
      .map((subject) => `
        <button class="subject-card ${subject.id} ${state.selectedSubjectId === subject.id ? "selected-subject" : ""}" data-action="subject-select" data-subject-id="${subject.id}">
          <span>${subject.name}</span>
          <strong>${subject.actionLabel}</strong>
          <small>${subject.id === "math" ? "計算や文章題で しょうぶ" : "漢字やことばで しょうぶ"}</small>
        </button>
      `)
      .join("");

    return screenShell(`
      ${backButton()}
      <h1 class="page-title">どっちで<br />しょうぶする？</h1>
      <p class="stage-intro">好きな科目をえらぼう。あとで いつでも かえられるよ。</p>
      <div class="subject-grid">${subjectButtons}</div>
      <button class="primary-button" data-action="stages">せいれいを えらぶ</button>
    `);
  }

  function renderStages() {
    const stageButtons = GameLogic.difficulties
      .map((difficulty, index) => `
        <button class="stage-card difficulty-card ${difficulty.id}" data-action="start" data-difficulty-id="${difficulty.id}">
          <span class="stage-number">${index + 1}</span>
          <strong>${difficulty.spiritName}</strong>
          <small>${difficulty.gradeLabel}・${difficulty.subjectLabels?.[state.selectedSubjectId] || difficulty.label}</small>
          <em>${difficulty.description}</em>
        </button>
      `)
      .join("");

    return screenShell(`
      ${backButton()}
      <h1 class="page-title">どのせいれいと<br />しょうぶする？</h1>
      <p class="stage-intro">${selectedSubject().name}のむずかしさを えらぼう。</p>
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
    const feedbackText = round.answered
      ? lastAnswer.correct
        ? `${praiseWords[round.answers.length % praiseWords.length]}${isCombo ? ` ${round.currentStreak}れんぞく！` : ""}`
        : "ここは ちょっと むずかしいかも。いっしょに 考えよう"
      : "なかよく しょうぶ、スタート";
    const talkText = round.answered
      ? lastAnswer.correct
        ? isCombo
          ? "「れんぞくムーブ！ きらきらだね」"
          : "「なかよしムーブ、いくよ！」"
        : "「だいじょうぶ。ぼくも いっしょだよ」"
      : "「せいれいの チャレンジだよ」";
    const spiritMood = round.answered ? (lastAnswer.correct ? (isCombo ? "shine combo" : "shine") : "tilt") : "ready";
    const difficulty = round.difficulty;
    const supportText = round.answered ? round.question.explanation : round.question.hint;
    const choices = round.question.choices
      .map((choice) => {
        const selected = round.answered && String(choice) === String(lastAnswer?.selectedAnswer);
        const correct = round.answered && String(choice) === String(round.question.answer);
        const answerClass = correct && lastAnswer?.correct ? "win-pop" : "";
        return `
          <button class="answer-button ${selected ? "selected-answer" : ""} ${correct ? "correct-answer" : ""} ${answerClass}" data-action="answer" data-answer="${choice}" ${round.answered ? "disabled" : ""}>
            ${choice}
          </button>
        `;
      })
      .join("");

    return screenShell(`
      ${round.answered && lastAnswer?.correct ? `<div class="screen-glow ${isCombo ? "combo-glow" : ""}" aria-hidden="true"></div>` : ""}
      <div class="top-bar">
        ${backButton()}
        <span class="pill">クリア ${round.correctCount} / ${GameLogic.QUESTION_COUNT}</span>
        <span class="score-chip">${state.totalPoints + round.earnedPoints} pt</span>
      </div>
      <section class="challenge-track" aria-label="なかよししょうぶの進み具合">
        ${challengeTrack(round)}
      </section>
      <section class="versus-arena ${round.answered ? feedbackClass : ""}">
        <div class="side own-side">
          <div class="name-tag">${buddyName()}</div>
          ${creatureMarkup("duel", mood)}
          <div class="maruppu-talk">${talkText}</div>
        </div>
        <div class="friend-beam ${round.answered && lastAnswer?.correct ? "active" : ""}" aria-hidden="true"></div>
        <div class="side spirit-side">
          <div class="name-tag">${difficulty.spiritName}</div>
          ${spiritMarkup(spiritMood, difficulty.id)}
          <div class="spirit-talk">${round.answered && lastAnswer?.correct ? "「わあ、なかよし！」" : "「チャレンジ、どうかな？」"}</div>
        </div>
        ${sparkleMarkup(round.answered && lastAnswer?.correct)}
      </section>
      <section class="battle-scene">
        <div class="question-panel">
          <p>${difficulty.spiritName}の ${round.subject.challengeLabel}・${questionNumber}かいめ</p>
          <h1 class="story-question">${round.question.story}</h1>
          <div class="equation-hint">${round.question.hintText || `${round.question.text} = ?`}</div>
        </div>
      </section>
      <p class="feedback ${round.answered ? feedbackClass : ""}">${feedbackText}</p>
      ${supportText ? `<p class="question-support ${round.answered ? "answer-note" : ""}">${supportText}</p>` : ""}
      <div class="answer-grid">${choices}</div>
      ${
        round.answered
          ? `<button class="primary-button" data-action="next">${round.currentIndex + 1 >= GameLogic.QUESTION_COUNT ? "けっかへ" : "つぎへ"}</button>`
          : ""
      }
    `, `battle-screen ${round.answered && lastAnswer?.correct ? "success-screen" : ""} ${isCombo ? "combo-screen" : ""}`);
  }

  function renderResult() {
    const round = state.round;
    const name = buddyName();
    const streakBonus = state.lastStreakBonus;
    const message = round.correctCount === GameLogic.QUESTION_COUNT
      ? "5つのたねを みつけたよ！"
      : "さいごまで よくがんばったね！";
    const resultTalk = round.correctCount === GameLogic.QUESTION_COUNT
      ? `${name}が とっても よろこんでるよ！`
      : `${name}が となりで にこにこしているよ。`;
    return screenShell(`
      <section class="result-panel">
        <p class="tiny-label">けっか</p>
        <div class="grown-seed" aria-hidden="true"><span></span></div>
        ${creatureMarkup("hero", "combo")}
        <h1>${message}</h1>
        <p class="lead">${resultTalk}</p>
        <div class="reward-box">
          <strong>${round.earnedPoints} pt</strong>
          <span>${round.correctCount}つ クリア・${round.difficulty.reward}</span>
        </div>
        ${
          streakBonus
            ? `<div class="streak-result ${streakBonus.bonusPoints > 0 ? "earned" : ""}">
                <span>今日の連続ボーナス！</span>
                <strong>+${streakBonus.bonusPoints} pt</strong>
                <small>${streakBonus.message}</small>
              </div>`
            : ""
        }
        <div class="total-box">ぜんぶで ${state.totalPoints} pt</div>
        <p class="closing-line">また あそぼうね。</p>
      </section>
      <button class="primary-button" data-action="stages">もういちど</button>
      ${backButton()}
      <button class="text-button center" data-action="home">ホームへ</button>
    `);
  }

  function renderSpecialReward() {
    const name = buddyName();
    const streakBonus = state.lastStreakBonus;
    return screenShell(`
      <section class="special-reward-panel">
        <div class="celebration-sparkles" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        ${creatureMarkup("hero", "combo")}
        <p class="tiny-label">とくべつな おいわい</p>
        <h1>1000ポイント<br />たまったよ！</h1>
        <div class="reward-total">1000 pt</div>
        ${
          streakBonus?.bonusPoints > 0
            ? `<div class="streak-result earned">
                <span>今日の連続ボーナス！</span>
                <strong>+${streakBonus.bonusPoints} pt</strong>
                <small>${streakBonus.message}</small>
              </div>`
            : ""
        }
        <p class="lead">${name}と一緒にがんばったね。おうちの人と相談して、ごほうびをもらおう！</p>
      </section>
      ${backButton()}
      <button class="primary-button" data-action="home">ホームへ</button>
    `, "reward-screen");
  }

  function render() {
    const screens = {
      profile: renderProfile,
      home: renderHome,
      starter: renderStarter,
      subject: renderSubject,
      stages: renderStages,
      battle: renderBattle,
      result: renderResult,
      specialReward: renderSpecialReward,
    };
    app.innerHTML = screens[state.screen]();
  }

  function startRound(difficultyId) {
    if (!getActiveProfile()) {
      setScreen("profile");
      return;
    }
    state.selectedDifficultyId = difficultyId;
    state.lastStreakBonus = null;
    state.round = GameLogic.createRound(difficultyId, state.selectedSubjectId);
    setScreen("battle");
  }

  function handleAnswer(answer) {
    if (!state.round || state.round.answered) {
      return;
    }
    state.round = GameLogic.answerQuestion(state.round, answer);
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
        streak: {
          current: streakResult.current,
          best: streakResult.best,
          lastPlayedDate: streakResult.lastPlayedDate,
          lastBonusDate: streakResult.lastBonusDate,
        },
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
    if (!target) {
      return;
    }

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
      const playerInput = app.querySelector("[data-profile-input='player']");
      const companionInput = app.querySelector("[data-profile-input='companion']");
      createOrSelectProfile(playerInput?.value, companionInput?.value);
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

  app.addEventListener("input", (event) => {
    const target = event.target.closest("[data-action='name']");
    if (!target) {
      return;
    }

    saveBuddyName(target.value);
  });

  render();
})();
