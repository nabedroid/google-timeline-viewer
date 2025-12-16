/**
 * 経路から viewState を計算する
 */
export function getViewState(activity) {
  return Array.isArray(activity)
    ? _getViewStateFromActivities(activity)
    : _getViewStateFromActivity(activity);
}

function _getViewStateFromActivity(activity) {
  // 対象が経路か訪問地か判定
  if (activity.type === "visit") {
    // 訪問地の場合
    // 訪問地の座標と最大倍率ズームを返す
    return {
      longitude: activity.position[0],
      latitude: activity.position[1],
      zoom: 16,
      transitionDuration: 1000,
    }
  }
  // 経路の場合は経路の真ん中辺りの線上を返す
  const i = Math.floor(activity.path.length / 2);
  let centerLon = activity.path.length % 2 === 1 ? activity.path[i][0] : (activity.path[i - 1][0] + activity.path[i][0]) / 2;
  let centerLat = activity.path.length % 2 === 1 ? activity.path[i][1] : (activity.path[i - 1][1] + activity.path[i][1]) / 2;
  // zoom を計算する
  const initialViewState = _getViewStateFromPath(activity.path);

  return {
    longitude: centerLon,
    latitude: centerLat,
    zoom: initialViewState.zoom,
    transitionDuration: initialViewState.transitionDuration,
  };
}

function _getViewStateFromActivities(activities) {
  // 訪問地の座標、経路の座標をまとめる
  const path = activities.reduce((acc, activity) => {
    if (activity.type === "visit") {
      acc.push(activity.position);
    } else {
      for (const position of activity.path) {
        acc.push(position);
      }
    }
    return acc;
  }, []);

  return _getViewStateFromPath(path);
}

function _getViewStateFromPath(path) {
  const lons = [];
  const lats = [];
  for (const position of path) {
    lons.push(position[0]);
    lats.push(position[1]);
  }
  // 最大、最小の緯度・経度を取得する
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  // 座標全てが収まるよう余裕を持たせて倍率を計算する
  const maxDiff = Math.max(maxLon - minLon, maxLat - maxLat);
  const zoom = maxDiff === 0 ? 16 : Math.floor(8 - Math.log2(maxDiff));

  return {
    longitude: (minLon + maxLon) / 2,
    latitude: (minLat + maxLat) / 2,
    zoom: zoom,
    transitionDuration: 1000,
  };
}

// 所要時間を h時間 m分のフォーマットに変換する
// 1時間未満の場合は時間を省略、1分未満の場合は分も省略する
export function formatDuration(durationSeconds) {
  // ミリ秒は切り捨て
  const sec = Math.floor(durationSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) return `${h}時間 ${m}分`;
  if (m > 0) return `${m}分`;
  return `${s}秒`;
}

// 移動距離を 9999km、9999m のフォーマットに変換する
export function formatDistance(distanceMeters) {
  return distanceMeters >= 1000
    ? `${Math.floor(distanceMeters / 1000)} km`
    : `${Math.floor(distanceMeters)} m`;
}
