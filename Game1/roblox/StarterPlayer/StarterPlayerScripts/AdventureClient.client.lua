local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("MaruppuAdventureRemotes")
local startChallengeEvent = remotes:WaitForChild("StartChallenge")
local showQuestionEvent = remotes:WaitForChild("ShowQuestion")
local stateUpdatedEvent = remotes:WaitForChild("StateUpdated")
local submitAnswerFunction = remotes:WaitForChild("SubmitAnswer")

local gui = Instance.new("ScreenGui")
gui.Name = "MaruppuAdventureGui"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")

local hud = Instance.new("Frame")
hud.Name = "Hud"
hud.AnchorPoint = Vector2.new(0.5, 0)
hud.Position = UDim2.fromScale(0.5, 0.02)
hud.Size = UDim2.fromScale(0.9, 0.17)
hud.BackgroundColor3 = Color3.fromRGB(255, 251, 232)
hud.BorderSizePixel = 0
hud.Parent = gui

local hudCorner = Instance.new("UICorner")
hudCorner.CornerRadius = UDim.new(0, 18)
hudCorner.Parent = hud

local hudText = Instance.new("TextLabel")
hudText.Name = "HudText"
hudText.Position = UDim2.fromScale(0.05, 0.08)
hudText.Size = UDim2.fromScale(0.58, 0.84)
hudText.BackgroundTransparency = 1
hudText.Font = Enum.Font.GothamBold
hudText.TextColor3 = Color3.fromRGB(54, 88, 55)
hudText.TextScaled = true
hudText.TextXAlignment = Enum.TextXAlignment.Left
hudText.Parent = hud

local startButton = Instance.new("TextButton")
startButton.Name = "StartPiko"
startButton.Position = UDim2.fromScale(0.67, 0.18)
startButton.Size = UDim2.fromScale(0.28, 0.64)
startButton.BackgroundColor3 = Color3.fromRGB(103, 191, 115)
startButton.Font = Enum.Font.GothamBold
startButton.Text = "ピコと\nあそぶ"
startButton.TextColor3 = Color3.fromRGB(255, 255, 255)
startButton.TextScaled = true
startButton.Parent = hud

local startCorner = Instance.new("UICorner")
startCorner.CornerRadius = UDim.new(0, 16)
startCorner.Parent = startButton

local questionPanel = Instance.new("Frame")
questionPanel.Name = "QuestionPanel"
questionPanel.AnchorPoint = Vector2.new(0.5, 0.5)
questionPanel.Position = UDim2.fromScale(0.5, 0.57)
questionPanel.Size = UDim2.fromScale(0.9, 0.72)
questionPanel.BackgroundColor3 = Color3.fromRGB(255, 253, 240)
questionPanel.BorderSizePixel = 0
questionPanel.Visible = false
questionPanel.Parent = gui

local panelCorner = Instance.new("UICorner")
panelCorner.CornerRadius = UDim.new(0, 22)
panelCorner.Parent = questionPanel

local promptLabel = Instance.new("TextLabel")
promptLabel.Name = "Prompt"
promptLabel.Position = UDim2.fromScale(0.07, 0.08)
promptLabel.Size = UDim2.fromScale(0.86, 0.27)
promptLabel.BackgroundTransparency = 1
promptLabel.Font = Enum.Font.GothamBold
promptLabel.TextColor3 = Color3.fromRGB(62, 72, 50)
promptLabel.TextScaled = true
promptLabel.TextWrapped = true
promptLabel.Parent = questionPanel

local feedbackLabel = Instance.new("TextLabel")
feedbackLabel.Name = "Feedback"
feedbackLabel.Position = UDim2.fromScale(0.07, 0.36)
feedbackLabel.Size = UDim2.fromScale(0.86, 0.1)
feedbackLabel.BackgroundTransparency = 1
feedbackLabel.Font = Enum.Font.GothamBold
feedbackLabel.TextColor3 = Color3.fromRGB(58, 133, 72)
feedbackLabel.TextScaled = true
feedbackLabel.Parent = questionPanel

local choiceButtons = {}
for index = 1, 4 do
	local button = Instance.new("TextButton")
	button.Name = "Choice" .. index
	local row = math.floor((index - 1) / 2)
	local column = (index - 1) % 2
	button.Position = UDim2.fromScale(0.07 + column * 0.45, 0.5 + row * 0.22)
	button.Size = UDim2.fromScale(0.4, 0.16)
	button.BackgroundColor3 = Color3.fromRGB(255, 241, 173)
	button.Font = Enum.Font.GothamBold
	button.TextColor3 = Color3.fromRGB(77, 67, 41)
	button.TextScaled = true
	button.Parent = questionPanel

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 16)
	corner.Parent = button

	choiceButtons[index] = button
end

local currentQuestion = nil
local currentIndex = 1
local totalQuestions = 5
local answering = false
local currentState = nil

local function levelText(state)
	local piko = state and state.spirits and state.spirits.piko
	local level = piko and piko.level or 1
	local growth = piko and piko.growth or 0
	return "ピコ Lv." .. tostring(level) .. "  育ち " .. tostring(growth)
end

local function updateHud(state)
	currentState = state
	local areaStep = (state and state.mapStep or 0) + 1
	hudText.Text = "森のぼうけん\n" .. tostring(state and state.totalPoints or 0) .. " pt  エリア " .. tostring(areaStep) .. "/5\n" .. levelText(state)
end

local function updateWorld(state)
	local forestMap = workspace:FindFirstChild("ForestMap")
	if forestMap then
		for index = 1, 5 do
			local node = forestMap:FindFirstChild("MapNode" .. index)
			if node and node:IsA("BasePart") then
				local unlocked = index <= ((state and state.mapStep or 0) + 1)
				node.Color = unlocked and Color3.fromRGB(125, 219, 132) or Color3.fromRGB(174, 181, 159)
				node.Material = unlocked and Enum.Material.Neon or Enum.Material.SmoothPlastic
			end
		end
	end

	local piko = workspace:FindFirstChild("PikoNpc")
	local pikoState = state and state.spirits and state.spirits.piko
	if piko and piko:IsA("BasePart") then
		local level = pikoState and pikoState.level or 1
		piko.Size = Vector3.new(2.2, 2.2, 2.2) * (1 + (level - 1) * 0.08)
		piko.Color = Color3.fromRGB(112, 198, 118)
	end
end

local function flashPanel(color)
	local tweenUp = TweenService:Create(questionPanel, TweenInfo.new(0.12), { BackgroundColor3 = color })
	local tweenDown = TweenService:Create(questionPanel, TweenInfo.new(0.25), { BackgroundColor3 = Color3.fromRGB(255, 253, 240) })
	tweenUp:Play()
	tweenUp.Completed:Wait()
	tweenDown:Play()
end

local function showQuestion(question, index, total)
	currentQuestion = question
	currentIndex = index
	totalQuestions = total
	answering = false
	questionPanel.Visible = true
	promptLabel.Text = "森ミッション " .. tostring(index) .. "/" .. tostring(total) .. "\n" .. question.prompt
	feedbackLabel.Text = "ピコを 手つだう こたえを えらぼう"

	for choiceIndex, button in ipairs(choiceButtons) do
		button.Text = question.choices[choiceIndex] or ""
		button.BackgroundColor3 = Color3.fromRGB(255, 241, 173)
		button.AutoButtonColor = true
	end
end

local function showRoundFinished(result)
	questionPanel.Visible = true
	promptLabel.Text = "チャレンジ クリア"
	feedbackLabel.Text = "ピコと もっと なかよくなったよ"
	for _, button in ipairs(choiceButtons) do
		button.Visible = false
	end
	task.delay(2.2, function()
		for _, button in ipairs(choiceButtons) do
			button.Visible = true
		end
		questionPanel.Visible = false
	end)
	updateHud(result.state or currentState)
	updateWorld(result.state or currentState)
end

for choiceIndex, button in ipairs(choiceButtons) do
	button.MouseButton1Click:Connect(function()
		if answering or not currentQuestion then
			return
		end

		answering = true
		local result = submitAnswerFunction:InvokeServer(choiceIndex)
		if not result or not result.ok then
			feedbackLabel.Text = result and result.message or "少しだけ まってね"
			answering = false
			return
		end

		if result.correct then
			button.BackgroundColor3 = Color3.fromRGB(130, 220, 132)
			feedbackLabel.Text = result.message
			task.spawn(flashPanel, Color3.fromRGB(235, 255, 194))
		else
			button.BackgroundColor3 = Color3.fromRGB(255, 226, 166)
			feedbackLabel.Text = result.message
		end

		updateHud(result.state or currentState)
		updateWorld(result.state or currentState)

		task.wait(1)
		if result.finished then
			showRoundFinished(result)
			return
		end

		showQuestion(result.nextQuestion, result.nextIndex, result.totalQuestions)
	end)
end

startButton.MouseButton1Click:Connect(function()
	startChallengeEvent:FireServer("piko")
end)

local function connectPikoPrompt()
	local piko = workspace:FindFirstChild("PikoNpc")
	if not piko then
		return
	end

	local prompt = piko:FindFirstChild("PikoChallengePrompt")
	if not prompt or not prompt:IsA("ProximityPrompt") then
		return
	end

	prompt.Triggered:Connect(function()
		startChallengeEvent:FireServer("piko")
	end)
end

stateUpdatedEvent.OnClientEvent:Connect(function(state)
	updateHud(state)
	updateWorld(state)
end)

showQuestionEvent.OnClientEvent:Connect(function(question, index, total)
	showQuestion(question, index, total)
end)

updateHud(currentState)
task.defer(connectPikoPrompt)
