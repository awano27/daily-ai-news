# Roblox版 マルップとせいれいの 森のぼうけん

このフォルダは、現在のWeb/PWA版をRoblox Studioで作り直すための初期移植セットです。
Web版をそのまま動かすものではなく、Robloxの3D空間、GUI、DataStoreに合わせた最小実装です。

## 初期版でできること

- 森の入口ロビーで遊べる。
- マルップとピコをオリジナルNPCとして置ける。
- ピコに近づく、またはHUDボタンから5問の「なかよしチャレンジ」を始められる。
- 正解時だけ `+10pt`、マップ進行、ピコの成長が増える。
- 不正解時はポイントや成長を増やさず、やさしい再挑戦メッセージを出す。
- Roblox DataStoreにプレイヤーごとの進行を保存する。

## Roblox Studioでの配置

1. Roblox Studioで新しいPlaceを作成する。
2. Game Settings > Security で `Enable Studio Access to API Services` を有効にする。
3. `roblox/StudioBootstrap.server.lua` の中身をStudioのCommand Barで1回実行する。
   - 簡単な森、5つのマップノード、マルップ、ピコ、チャレンジ台が作られます。
4. `ReplicatedStorage` に `MaruppuAdventureShared` フォルダを作る。
5. 次のModuleScriptを作成し、それぞれ同名で中身を貼り付ける。
   - `AdventureConfig` <- `roblox/ReplicatedStorage/MaruppuAdventureShared/AdventureConfig.lua`
   - `AdventureLogic` <- `roblox/ReplicatedStorage/MaruppuAdventureShared/AdventureLogic.lua`
   - `QuestionBank` <- `roblox/ReplicatedStorage/MaruppuAdventureShared/QuestionBank.lua`
6. `ServerScriptService` に Script `AdventureServer` を作り、`roblox/ServerScriptService/AdventureServer.server.lua` を貼り付ける。
7. `StarterPlayer > StarterPlayerScripts` に LocalScript `AdventureClient` を作り、`roblox/StarterPlayer/StarterPlayerScripts/AdventureClient.client.lua` を貼り付ける。
8. Play Soloで動作確認する。

## Studio上で必要なオブジェクト名

`StudioBootstrap.server.lua` を使う場合は自動で作成されます。手で作る場合は名前を合わせてください。

- `Workspace.ForestMap`
- `Workspace.ForestMap.MapNode1` から `MapNode5`
- `Workspace.MaruppuNpc`
- `Workspace.PikoNpc`
- `Workspace.PikoChallengePad`

## データ保存

DataStoreキーは `maruppu_adventure_v1_user_<UserId>` です。

保存する主な値:

- `totalPoints`
- `totalCorrect`
- `mapStep`
- `bestStreak`
- `spirits.piko.met`
- `spirits.piko.growth`

DataStoreが使えない場合でも、そのプレイ中は遊べます。画面には子供を不安にさせるエラーを出さず、StudioのOutputにだけ警告を出します。

## 次に広げる場所

- `QuestionBank.lua` にモコ、ルミ、ソラ用の問題を追加する。
- `AdventureConfig.lua` にせいれい設定とマップ設定を追加する。
- `AdventureClient.client.lua` に図鑑画面を追加する。
- `AdventureLogic.lua` の保存データに図鑑や連続ボーナスを追加する。
