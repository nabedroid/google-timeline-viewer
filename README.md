# 概要
Google Map のタイムラインを表示する React アプリケーション。
実際に動作させているサンプルは下記の Pages を参照。

https://nabedroid.github.io/google-timeline-viewer/

# 使い方
ローカルで使用する場合は下記の手順で実行する。

1. リポジトリを clone する
1. プロジェクトのルートディレクトリに`.env`を作成する
1. VITE_GOOGLE_API_KEY と VITE_GOOGLE_MAP_ID に自分の GOOGLE_API_KEY と MAP_ID を設定する
1. ターミナルを開く
1. docker compose up frontend を実行する
1. ブラウザで http://localhost:3000/google-timeline-viewer/ を開く
1. `json ファイル読み込み`ボタンをクリック
1. タイムラインの json ファイルを選択
1. カレンダーから有効な日付を選択

## タイムラインの json ファイルの取得方法
Android 端末で以下の手順を実行する。
パソコンからは取得できない。
Apple 端末は知らない。

1. 設定アプリ を開く
1. 位置情報 > 位置情報サービス > タイムライン をタップ
1. アカウントを選択
1. タイムラインをエクスポート をタップ
1. 続行ボタン をタップ
1. 好きな保存場所を選択
1. 保存ボタン をタップ

# Timeline.json の仕様
エクスポートされる Timeline.json の仕様一覧。
手元のデータから推論しているので抜けがあるかも。

| 項目名 | 型 | 必須 | フォーマット | 説明 |
|-------|------|----------|--------|-------------|
| semanticSegments | Array | 〇 | - | 移動経路や訪問先の履歴 |
| &emsp; startTime | String | 〇 | YYYY-MM-DDThh:mm:ss.sss+00:00 | セグメント開始時間 |
| &emsp; endTime | String | 〇 | YYYY-MM-DDThh:mm:ss.sss+00:00 | セグメント終了時間 |
| &emsp; startTimeTimezoneUtcOffsetMinutes | int | - | - | 開始時間の UTC オフセット（分） |
| &emsp; endTimeTimezoneUtcOffsetMinutes | int | - | - | 終了時間の UTC オフセット（分） |
| &emsp; visit | dict | ※1 | - | 訪問先情報 |
| &emsp;&emsp; hierarchyLevel | int | 〇 | 0, 1 | 0:直接滞在, 1:周辺施設 |
| &emsp;&emsp; probability | float | 〇 | 0.0〜1.0 | 滞在場所の推定確率 |
| &emsp;&emsp; topCandidate | dict | 〇 | - | 最有力の候補地情報 |
| &emsp;&emsp;&emsp; placeId | String | 〇 | - | Google Maps 施設 ID |
| &emsp;&emsp;&emsp; semanticType | String | 〇 | - | カテゴリ (HOME, WORK, UNKNOWN 等) |
| &emsp;&emsp;&emsp; probability | float | 〇 | 0.0〜1.0 | 候補の確率 |
| &emsp;&emsp;&emsp; placeLocation | dict | 〇 | - | 位置情報 |
| &emsp;&emsp;&emsp;&emsp; latLng | String | 〇 | "35.1234567°, 139.1234567°" | 緯度経度 (E7 形式) |
| &emsp;&emsp;&emsp; isTimelessVisit | bool | - | true/false | 滞在時間の有無 |
| &emsp; activity | dict | ※1 | - | 移動手段情報 |
| &emsp;&emsp; start | dict | 〇 | - | 開始地点 |
| &emsp;&emsp;&emsp; latLng | String | 〇 | "35.1234567°, 139.1234567°" | 緯度経度（E7 形式） |
| &emsp;&emsp; end | dict | 〇 | - | 終了地点 |
| &emsp;&emsp;&emsp; latLng | String | 〇 | "35.1234567°, 139.1234567°" | 緯度経度（E7 形式） |
| &emsp;&emsp; distanceMeters | float | 〇 | - | 移動距離 (m) |
| &emsp;&emsp; probability | float | - | 0.0〜1.0 | 移動情報の信頼度 |
| &emsp;&emsp; topCandidate | dict | 〇 | - | 移動手段 |
| &emsp;&emsp;&emsp; type | String | 〇 | - | 移動手段 (WALKING, IN_TRAIN, etc) |
| &emsp;&emsp;&emsp; probability | float | 〇 | 0.0〜1.0 | 移動手段推定の確率 |
| &emsp;&emsp; parking | dict | - | - | 停車情報 |
| &emsp;&emsp;&emsp; location | dict | 〇 | - | 停車位置情報 |
| &emsp;&emsp;&emsp;&emsp; latLng | String | 〇 | "35.1234567°, 139.1234567°" | 緯度経度（E7 形式） |
| &emsp;&emsp;&emsp; startTime | String | 〇 | YYYY-MM-DDThh:mm:ss.sss+00:00 | 停車開始時間 |
| &emsp; timelinePath | Array | ※1 | - | 移動経路 |
| &emsp;&emsp; point | String | 〇 | "35.1234567°, 139.1234567°" | 緯度経度 (E7 形式) |
| &emsp;&emsp; time | String | 〇 | YYYY-MM-DDThh:mm:ss.sss+00:00 | 移動時間 |
| &emsp; timelineMemory | dict | ※1 | - | 旅行先情報 |
| &emsp;&emsp; trip | dict | ※2 | - | 旅行先情報 |
| &emsp;&emsp;&emsp; destinations | Array | 〇 | - | 訪問先のリスト |
| &emsp;&emsp;&emsp;&emsp; identifier | dict | 〇 | - | 訪問先の施設情報 |
| &emsp;&emsp;&emsp;&emsp;&emsp; placeId | String | 〇 | - | Google Maps 施設 ID |
| &emsp;&emsp;&emsp; distanceFromOriginKms | int | 〇 | - | 起点からの距離 (km) |
| &emsp;&emsp; note | dict | ※2 | - | メモ情報 |
| &emsp;&emsp;&emsp; note | String | 〇 | - | メモ内容 |
| rawSignals | Array | 〇 | - | 位置情報の特定元 |
| &emsp; position | dict | 〇 | - | 位置情報 |
| &emsp;&emsp; LatLng | String | 〇 | "35.1234567°, 139.1234567°" | 緯度経度 (E7 形式) |
| &emsp;&emsp; accuracyMeters | int | 〇 | - | 位置精度 (m) |
| &emsp;&emsp; altitudeMeters | float | 〇 | - | 海抜高度 (m) |
| &emsp;&emsp; source | String | 〇 | - | 取得元 (GPS, WIFI, CELL, UNKNOWN) |
| &emsp;&emsp; timestamp | String | 〇 | YYYY-MM-DDThh:mm:ss.sss+00:00 | 取得時間 |
| &emsp;&emsp; speedMetersPerSecond | float | 〇 | - | 移動速度 (m/s) |
| &emsp; wifiScan | dict | 〇 | - | WiFi 位置情報のログ |
| &emsp;&emsp; deliveryTime | String | 〇 | YYYY-MM-DDThh:mm:ss.sss+00:00 | Wi-Fi スキャン配信時間 |
| &emsp;&emsp; devicesRecords | Array | - | - | 使用した基地局 |
| &emsp;&emsp;&emsp; mac | int | 〇 | - | Wi-Fi AP の MAC アドレス |
| &emsp;&emsp;&emsp; rawRssi | int | 〇 | - | 信号強度 (dBm) |
| &emsp; activityRecord | dict | 〇 | - | 位置の状態 |
| &emsp;&emsp; probableActivities | Array | 〇 | - | 状態一覧（推定確率の高い順にソート） |
| &emsp;&emsp;&emsp; type | String | 〇 | - | 推定ユーザー状態 (STILL, WALKING, UNKNOWN, etc) |
| &emsp;&emsp;&emsp; confidence | float | 〇 | 0.0〜1.0 | 推定確率 |
| &emsp;&emsp; timestamp | String | 〇 | YYYY-MM-DDThh:mm:ss.sss+00:00 | センサー取得時間 |
| userLocationProfile | dict | 〇 | - | ユーザーが保存または登録した地点、および移動傾向 |
| &emsp; persona | dict | 〇 | - | 移動傾向 |
| &emsp;&emsp; travelModeAffinities | Array | 〇 | - | 移動傾向一覧 |
| &emsp;&emsp;&emsp; mode | String | 〇 | - | 移動手段 (WALKING, CYCLING, etc) |
| &emsp;&emsp;&emsp; affinity | float | 〇 | 0.0〜1.0 | 移動傾向の比率 |
| &emsp; frequentPlaces | Array | 〇 | - | よく行く場所 |
| &emsp;&emsp; placeId | String | 〇 | - | Google Maps 施設 ID |
| &emsp;&emsp;　placeLocation | String | 〇 | "35.1234567°, 139.1234567°" | 緯度経度 (E7 形式) |
| &emsp;&emsp;　label | String | - | - | ラベル (HOME, etc) |


※1 visit/activity/timelinePath/timelineMemory のいずれか必須

※2 trip/note のいずれか必須

今回のアプリで使った semanticSegments の activity/timelinePath/visit について、詳しく説明する。

## activity
- 移動に関する情報
- 移動を移動手段ごとに区切って出力される
- activity と visit は時系列上で交互に出力される
  - activity の開始時間は、直前の visit の終了時間と一致する
  - activity の終了時間は、次の visit の開始時間と一致する
- activity が連続して出力されることもある
  - 電車→徒歩など、移動手段が切り替わった場合
- 開始地点・終了地点の精度は高くない
  - 移動手段切り替え時に、終了地点と次の開始地点が一致しないことがある

## timelinePath
- 移動経路を表す座標の配列
- 2時間おきに時間内に移動した座標とともに出力される
- 座標の記録間隔は一定ではない（10分や4分など）
- その2時間の間に移動が一切なければ、timelinePath 自体が出力されない
- GPS のブレなど、微細な移動も含めて記録される
- Google マップのタイムライン表示では、activity の時間範囲に対応する座標のみが使用されている

## visit
- 訪問（滞在）した場所の情報
- visit と activity は時系列上で交互に出力される
  - visit の開始時間は、直前の activity の終了時間と一致する
  - visit の終了時間は、次の activity の開始時間と一致する
- 同一の開始時間・終了時間を持つ visit が複数出力されることがある
  - hierarchyLevel が異なる
  - 建物 → 店舗のような入れ子構造を表す

```text
visit       : [ visit ]            [ visit ]     [    visit    ]
activity    :         [ act ][ act ]       [ act ]             [ act ]
timelinePath: [       ●●●][●●●●●●●●  ][     ●●●●●]            [ ●●●●●    ]
```

# 参考
- [Google マップ タイムラインを管理する](https://support.google.com/maps/answer/6258979?hl=ja&co=GENIE.Platform%3DAndroid)
- [GoogleタイムラインからエクスポートしたデータをPCで可視化する](https://note.com/abay_ksg/n/nd8f918e824d2)