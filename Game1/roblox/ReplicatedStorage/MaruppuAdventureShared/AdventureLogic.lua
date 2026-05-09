local Config = require(script.Parent:WaitForChild("AdventureConfig"))

local AdventureLogic = {}

local function copySpirit(source)
	source = source or {}
	local growth = math.max(0, tonumber(source.growth) or 0)
	return {
		met = source.met == true or growth > 0,
		growth = growth,
		level = AdventureLogic.GetSpiritGrowthLevel(growth),
	}
end

function AdventureLogic.GetSpiritGrowthLevel(growth)
	local safeGrowth = math.max(0, tonumber(growth) or 0)
	local level = 1

	for _, rule in ipairs(Config.GrowthLevels) do
		if safeGrowth >= rule.minGrowth then
			level = rule.level
		end
	end

	return level
end

function AdventureLogic.GetUnlockedMapStep(totalCorrect)
	local safeCorrect = math.max(0, tonumber(totalCorrect) or 0)
	return math.min(#Config.MapAreas - 1, math.floor(safeCorrect / Config.QUESTION_COUNT))
end

function AdventureLogic.CreateDefaultData()
	return AdventureLogic.NormalizeData(nil)
end

function AdventureLogic.NormalizeData(source)
	source = typeof(source) == "table" and source or {}
	local totalPoints = math.max(0, tonumber(source.totalPoints) or 0)
	local totalCorrect = math.max(0, tonumber(source.totalCorrect) or 0)
	local spirits = {}

	for spiritId in pairs(Config.Spirits) do
		spirits[spiritId] = copySpirit(source.spirits and source.spirits[spiritId])
	end

	return {
		totalPoints = totalPoints,
		totalCorrect = totalCorrect,
		mapStep = AdventureLogic.GetUnlockedMapStep(totalCorrect),
		bestStreak = math.max(0, tonumber(source.bestStreak) or 0),
		spirits = spirits,
	}
end

function AdventureLogic.ApplyAnswer(source, spiritId, isCorrect)
	local nextData = AdventureLogic.NormalizeData(source)
	if not isCorrect then
		return nextData
	end

	local safeSpiritId = Config.Spirits[spiritId] and spiritId or "piko"
	local spirit = nextData.spirits[safeSpiritId] or copySpirit(nil)

	nextData.totalPoints += Config.POINTS_PER_CORRECT
	nextData.totalCorrect += 1
	nextData.mapStep = AdventureLogic.GetUnlockedMapStep(nextData.totalCorrect)

	spirit.met = true
	spirit.growth += 1
	spirit.level = AdventureLogic.GetSpiritGrowthLevel(spirit.growth)
	nextData.spirits[safeSpiritId] = spirit

	return nextData
end

function AdventureLogic.IsCorrect(question, choiceIndex)
	if typeof(question) ~= "table" then
		return false
	end

	return tonumber(choiceIndex) == tonumber(question.answerIndex)
end

return AdventureLogic
