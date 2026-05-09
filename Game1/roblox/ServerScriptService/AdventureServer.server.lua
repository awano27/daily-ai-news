local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("MaruppuAdventureShared")
local Config = require(Shared:WaitForChild("AdventureConfig"))
local AdventureLogic = require(Shared:WaitForChild("AdventureLogic"))
local QuestionBank = require(Shared:WaitForChild("QuestionBank"))

local store = DataStoreService:GetDataStore(Config.DATASTORE_NAME)
local playerData = {}
local activeRounds = {}

local remotes = ReplicatedStorage:FindFirstChild("MaruppuAdventureRemotes")
if not remotes then
	remotes = Instance.new("Folder")
	remotes.Name = "MaruppuAdventureRemotes"
	remotes.Parent = ReplicatedStorage
end

local function getOrCreateRemote(className, name)
	local remote = remotes:FindFirstChild(name)
	if remote then
		return remote
	end

	remote = Instance.new(className)
	remote.Name = name
	remote.Parent = remotes
	return remote
end

local startChallengeEvent = getOrCreateRemote("RemoteEvent", "StartChallenge")
local showQuestionEvent = getOrCreateRemote("RemoteEvent", "ShowQuestion")
local stateUpdatedEvent = getOrCreateRemote("RemoteEvent", "StateUpdated")
local submitAnswerFunction = getOrCreateRemote("RemoteFunction", "SubmitAnswer")

local function dataKey(player)
	return Config.DATASTORE_KEY_PREFIX .. tostring(player.UserId)
end

local function loadPlayerData(player)
	local success, stored = pcall(function()
		return store:GetAsync(dataKey(player))
	end)

	if not success then
		warn("[Maruppu] DataStore load did not complete for " .. player.Name)
	end

	playerData[player.UserId] = AdventureLogic.NormalizeData(success and stored or nil)
	return playerData[player.UserId]
end

local function savePlayerData(player)
	local data = playerData[player.UserId]
	if not data then
		return false
	end

	local success = pcall(function()
		store:SetAsync(dataKey(player), data)
	end)

	if not success then
		warn("[Maruppu] DataStore save did not complete for " .. player.Name)
	end

	return success
end

local function sendState(player)
	local data = playerData[player.UserId] or AdventureLogic.CreateDefaultData()
	stateUpdatedEvent:FireClient(player, data)
end

local function currentRound(player)
	return activeRounds[player.UserId]
end

local function sendCurrentQuestion(player)
	local round = currentRound(player)
	if not round or not round.active then
		return
	end

	local question = round.questions[round.index]
	if not question then
		return
	end

	showQuestionEvent:FireClient(
		player,
		QuestionBank.ToPublicQuestion(question),
		round.index,
		Config.QUESTION_COUNT,
		round.spiritId
	)
end

Players.PlayerAdded:Connect(function(player)
	loadPlayerData(player)
	task.defer(function()
		sendState(player)
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	savePlayerData(player)
	playerData[player.UserId] = nil
	activeRounds[player.UserId] = nil
end)

startChallengeEvent.OnServerEvent:Connect(function(player, spiritId)
	local safeSpiritId = Config.Spirits[spiritId] and spiritId or "piko"
	activeRounds[player.UserId] = QuestionBank.CreateRound(safeSpiritId)
	sendCurrentQuestion(player)
end)

submitAnswerFunction.OnServerInvoke = function(player, choiceIndex)
	local round = currentRound(player)
	if not round or not round.active then
		return {
			ok = false,
			message = "ピコが 準備しているよ",
		}
	end

	if round.locked then
		return {
			ok = false,
			message = "少しだけ まってね",
		}
	end

	round.locked = true
	local question = round.questions[round.index]
	local isCorrect = AdventureLogic.IsCorrect(question, choiceIndex)
	local data = playerData[player.UserId] or AdventureLogic.CreateDefaultData()

	if isCorrect then
		data = AdventureLogic.ApplyAnswer(data, round.spiritId, true)
		playerData[player.UserId] = data
	end

	local finished = round.index >= Config.QUESTION_COUNT
	local nextQuestion = nil
	round.index += 1

	if finished then
		round.active = false
		savePlayerData(player)
	else
		local nextRawQuestion = round.questions[round.index]
		nextQuestion = QuestionBank.ToPublicQuestion(nextRawQuestion)
	end

	round.locked = false
	sendState(player)

	return {
		ok = true,
		correct = isCorrect,
		correctAnswerIndex = question.answerIndex,
		message = isCorrect and Config.Messages.correct or Config.Messages.tryAgain,
		state = playerData[player.UserId],
		finished = finished,
		nextQuestion = nextQuestion,
		nextIndex = round.index,
		totalQuestions = Config.QUESTION_COUNT,
		spiritId = round.spiritId,
	}
end
