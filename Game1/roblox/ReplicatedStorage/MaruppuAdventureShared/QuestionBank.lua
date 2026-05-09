local Config = require(script.Parent:WaitForChild("AdventureConfig"))

local QuestionBank = {}

local PikoQuestions = {
	{
		id = "piko_stones_1",
		scene = "stones",
		prompt = "ピコが 小川をわたるために 石を 4こ あつめたよ。あと 3こ 見つけたら、ぜんぶで なんこ？",
		choices = { "6", "7", "8", "9" },
		answerIndex = 2,
		hint = "4から 3つ すすんで数えよう",
	},
	{
		id = "piko_seed_1",
		scene = "seeds",
		prompt = "森のたねが 8こ あるよ。ピコが 2こ たいせつにしまったら、のこりは なんこ？",
		choices = { "5", "6", "7", "10" },
		answerIndex = 2,
		hint = "8から 2こ へらしてみよう",
	},
	{
		id = "piko_sprout_1",
		scene = "sprout",
		prompt = "小さな芽が 5こ、となりに 6こ あるよ。ぜんぶで なんこ そだっているかな？",
		choices = { "10", "11", "12", "13" },
		answerIndex = 2,
		hint = "5と 6を たしてみよう",
	},
	{
		id = "piko_gate_1",
		scene = "gate",
		prompt = "森のとびらに 9この 光が いるよ。もう 4こ 光ったら、ぜんぶで なんこ？",
		choices = { "12", "13", "14", "15" },
		answerIndex = 2,
		hint = "9から 4つ すすんで数えよう",
	},
	{
		id = "piko_fruit_1",
		scene = "fruit",
		prompt = "ピコが 木の実を 12こ 見つけたよ。5こを せいれいに分けたら、手もとに なんこ のこる？",
		choices = { "6", "7", "8", "9" },
		answerIndex = 2,
		hint = "12から 5こ へらしてみよう",
	},
	{
		id = "piko_leaf_1",
		scene = "leaves",
		prompt = "光る葉が 7まい、風で 5まい 集まったよ。ぜんぶで なんまい？",
		choices = { "11", "12", "13", "14" },
		answerIndex = 2,
		hint = "7と 5を たしてみよう",
	},
	{
		id = "piko_bridge_1",
		scene = "bridge",
		prompt = "橋に 15この 小石が ならんでいるよ。3こを となりへ 動かしたら、橋には なんこ のこる？",
		choices = { "11", "12", "13", "18" },
		answerIndex = 2,
		hint = "15から 3こ へらしてみよう",
	},
	{
		id = "piko_lamp_1",
		scene = "lanterns",
		prompt = "ランタンが 6こ 光っているよ。あと 6こ 光ったら、ぜんぶで なんこ？",
		choices = { "10", "11", "12", "13" },
		answerIndex = 3,
		hint = "6と 6を たしてみよう",
	},
}

local function cloneQuestion(question)
	local choices = {}
	for index, choice in ipairs(question.choices) do
		choices[index] = choice
	end

	return {
		id = question.id,
		scene = question.scene,
		prompt = question.prompt,
		choices = choices,
		answerIndex = question.answerIndex,
		hint = question.hint,
	}
end

local function shuffledQuestions(source)
	local list = {}
	for index, question in ipairs(source) do
		list[index] = cloneQuestion(question)
	end

	local random = Random.new()
	for index = #list, 2, -1 do
		local swapIndex = random:NextInteger(1, index)
		list[index], list[swapIndex] = list[swapIndex], list[index]
	end

	return list
end

function QuestionBank.CreateRound(spiritId)
	local safeSpiritId = Config.Spirits[spiritId] and spiritId or "piko"
	local source = PikoQuestions
	local shuffled = shuffledQuestions(source)
	local questions = {}

	for index = 1, Config.QUESTION_COUNT do
		questions[index] = shuffled[index]
	end

	return {
		spiritId = safeSpiritId,
		questions = questions,
		index = 1,
		active = true,
	}
end

function QuestionBank.ToPublicQuestion(question)
	return {
		id = question.id,
		scene = question.scene,
		prompt = question.prompt,
		choices = question.choices,
		hint = question.hint,
	}
end

return QuestionBank
