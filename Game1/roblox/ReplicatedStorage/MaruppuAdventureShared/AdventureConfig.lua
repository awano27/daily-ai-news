local AdventureConfig = {}

AdventureConfig.QUESTION_COUNT = 5
AdventureConfig.POINTS_PER_CORRECT = 10
AdventureConfig.DATASTORE_NAME = "maruppu_adventure_v1"
AdventureConfig.DATASTORE_KEY_PREFIX = "user_"

AdventureConfig.MapAreas = {
	{ id = "entrance", name = "森の入口" },
	{ id = "sparkle_path", name = "きらめき小道" },
	{ id = "flower_field", name = "花びら広場" },
	{ id = "leaf_hill", name = "光る葉の丘" },
	{ id = "sky_spring", name = "空色の泉" },
}

AdventureConfig.Spirits = {
	piko = {
		id = "piko",
		name = "ピコ",
		description = "小さなたねのせいれい",
		rewardName = "きらきらのたね",
		color = Color3.fromRGB(112, 198, 118),
		glowColor = Color3.fromRGB(255, 238, 145),
	},
}

AdventureConfig.GrowthLevels = {
	{ level = 1, minGrowth = 0, label = "めばえ" },
	{ level = 2, minGrowth = 3, label = "にこにこ" },
	{ level = 3, minGrowth = 7, label = "きらきら" },
	{ level = 4, minGrowth = 12, label = "すくすく" },
	{ level = 5, minGrowth = 18, label = "森のともだち" },
}

AdventureConfig.Messages = {
	start = "ピコと なかよしチャレンジを はじめるよ",
	correct = "やったね。ピコが うれしそうだよ",
	tryAgain = "もういちど いっしょに 考えよう",
	roundClear = "ピコと もっと なかよくなったよ",
	saveLater = "あとで また記録するね",
}

return AdventureConfig
