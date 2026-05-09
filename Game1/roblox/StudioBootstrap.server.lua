local Workspace = game:GetService("Workspace")

local function makePart(name, size, position, color, material)
	local part = Instance.new("Part")
	part.Name = name
	part.Size = size
	part.Position = position
	part.Anchored = true
	part.Color = color
	part.Material = material or Enum.Material.SmoothPlastic
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent = Workspace
	return part
end

local oldMap = Workspace:FindFirstChild("ForestMap")
if oldMap then
	oldMap:Destroy()
end

local forestMap = Instance.new("Folder")
forestMap.Name = "ForestMap"
forestMap.Parent = Workspace

local ground = makePart(
	"ForestGround",
	Vector3.new(80, 1, 80),
	Vector3.new(0, -0.5, 0),
	Color3.fromRGB(116, 179, 112),
	Enum.Material.Grass
)
ground.Parent = forestMap

for index = 1, 5 do
	local node = makePart(
		"MapNode" .. index,
		Vector3.new(5, 0.5, 5),
		Vector3.new(-24 + (index - 1) * 12, 0.2, -10 + math.sin(index) * 4),
		index == 1 and Color3.fromRGB(125, 219, 132) or Color3.fromRGB(174, 181, 159),
		index == 1 and Enum.Material.Neon or Enum.Material.SmoothPlastic
	)
	node.Shape = Enum.PartType.Cylinder
	node.Parent = forestMap
end

local maruppu = Workspace:FindFirstChild("MaruppuNpc")
if maruppu then
	maruppu:Destroy()
end
maruppu = makePart(
	"MaruppuNpc",
	Vector3.new(2.6, 2.6, 2.6),
	Vector3.new(-8, 2, 8),
	Color3.fromRGB(255, 151, 130),
	Enum.Material.SmoothPlastic
)
maruppu.Shape = Enum.PartType.Ball

local piko = Workspace:FindFirstChild("PikoNpc")
if piko then
	piko:Destroy()
end
piko = makePart(
	"PikoNpc",
	Vector3.new(2.2, 2.2, 2.2),
	Vector3.new(8, 2, 8),
	Color3.fromRGB(112, 198, 118),
	Enum.Material.SmoothPlastic
)
piko.Shape = Enum.PartType.Ball

local prompt = Instance.new("ProximityPrompt")
prompt.Name = "PikoChallengePrompt"
prompt.ActionText = "チャレンジ"
prompt.ObjectText = "ピコ"
prompt.HoldDuration = 0
prompt.MaxActivationDistance = 10
prompt.RequiresLineOfSight = false
prompt.Parent = piko

local pad = Workspace:FindFirstChild("PikoChallengePad")
if pad then
	pad:Destroy()
end
pad = makePart(
	"PikoChallengePad",
	Vector3.new(9, 0.5, 9),
	Vector3.new(8, 0.3, 2),
	Color3.fromRGB(255, 226, 123),
	Enum.Material.Neon
)
pad.Shape = Enum.PartType.Cylinder

print("Maruppu Roblox starter scene was created.")
