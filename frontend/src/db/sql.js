import initSqlJs from "sql.js";
import TimelinePathTable from "./TimelinePathTable";
import ActivityTable from "./ActivityTable";
import VisitTable from "./VisitTable";
import dayjs from "dayjs";

/**
 * データベースを構築し、インスタンスを取得する
 */
export async function initializeDatabase() {
  const SQL = await initSqlJs({ locateFile: () => `${import.meta.env.BASE_URL}sql-wasm.wasm` });
  const db = new SQL.Database();
  const tables = [
    new ActivityTable(db),
    new TimelinePathTable(db),
    new VisitTable(db),
  ]
  tables.forEach(t => t.create());
  return db;
}

/**
 * タイムラインデータを DB に挿入する
 */
export function insertTimelineJson(db, timelineJson) {
  if (!db) return;

  const activities = [];
  const visits = [];
  const timelinePaths = [];

  // Timeline の緯度経度文字列を数値に変換する
  const str2LatLon = strLatLon => strLatLon.replace(/°/g, "").split(", ").map(Number);
  // Timeline の日付文字列を unix タイムに変換する
  const str2ms = time => dayjs(time).valueOf();

  const activityTable = new ActivityTable(db);
  const timelinePathTable = new TimelinePathTable(db);
  const visitTable = new VisitTable(db);

  // 全テーブルのレコードを削除する
  [activityTable, timelinePathTable, visitTable].forEach(t => t.delete());

  // 経路情報の semanticSegment の全データを走査する
  for (const semanticSegment of timelineJson?.semanticSegments ?? []) {
    const commonInfo = [
      str2ms(semanticSegment.startTime),
      str2ms(semanticSegment.endTime),
      semanticSegment.startTimeTimezoneUtcOffsetMinutes ?? null,
      semanticSegment.endTimeTimezoneUtcOffsetMinutes ?? null,
    ];
    if (semanticSegment.activity) {
      activities.push([
        ...commonInfo,
        ...str2LatLon(semanticSegment.activity.start.latLng),
        ...str2LatLon(semanticSegment.activity.end.latLng),
        semanticSegment.activity.distanceMeters,
        semanticSegment.activity.probability ?? null,
        semanticSegment.activity.topCandidate.type,
        semanticSegment.activity.topCandidate.probability,
        ...semanticSegment.activity.parking ? str2LatLon(semanticSegment.activity.parking.location.latLng) : [null, null],
        semanticSegment.activity.parking ? str2ms(semanticSegment.activity.parking.startTime) : null,
      ]);
    } else if (semanticSegment.visit) {
      visits.push([
        ...commonInfo,
        semanticSegment.visit.hierarchyLevel,
        semanticSegment.visit.probability,
        semanticSegment.visit.topCandidate.placeId,
        semanticSegment.visit.topCandidate.semanticType,
        semanticSegment.visit.topCandidate.probability,
        ...str2LatLon(semanticSegment.visit.topCandidate.placeLocation.latLng),
        semanticSegment.visit.topCandidate.isTimelessVisit ?? null,
      ]);
    } else if (semanticSegment.timelinePath) {
      for (const point of semanticSegment.timelinePath) {
        timelinePaths.push([
          ...commonInfo,
          str2ms(point.time),
          ...str2LatLon(point.point),
        ]);
      }
    }
  }
  activityTable.insert(activities);
  timelinePathTable.insert(timelinePaths);
  visitTable.insert(visits);
}

/**
 * 経路情報が存在する日付一覧を取得する
 * 日付は format（デフォルトは YYYYMMDD）で指定したフォーマットに変換する
 */
export function selectEnableDaySet(db, format="YYYYMMDD") {
  const days = new Set();
  const activityTable = new ActivityTable(db);
  const activities = activityTable.select();

  for (const activity of activities) {
    const day = dayjs(activity.start_time).format(format);
    days.add(day);
  }

  return days;
}

/**
 * 日付に対応する移動情報一覧を取得する
 * @return [{
 *   id: 一意となるID（レコードの ID ではない）
 *   startTime: 開始時間（unix time）
 *   endTime: 終了時間（unix time）
 *   type: 移動手段のキー名（WAKING 等）または訪問のキー名
 *   position: 訪問先の座標 [lon, lat] ※1
 *   path: 移動経路の座標一覧 [[lon, lat], ...] ※2
 *   placeId: 訪問先の google place id ※1
 *   distanceMeters: 移動距離（メートル） ※2
 *   duration: 移動時間（ミリ秒） ※2
 * }]
 * ※1 訪問の場合のみ設定、移動の場合は null
 * ※2 移動の場合のみ設定、訪問の場合は null
 */
export function buildTimelineData(db, day) {
  const timelines = [];

  if (!db || !day) return timelines;

  const activityTable = new ActivityTable(db);
  const timelinePathTable = new TimelinePathTable(db);
  const visitTable = new VisitTable(db);

  // 当該日の移動情報をすべて取得（開始時間が当該日、終了時間が翌日以降でも対象）
  const activities = activityTable.select({
    start_time_from: day.startOf("day").valueOf(),
    start_time_to: day.endOf("day").valueOf(),
  });

  // visit: start, end, lat, lon, placeid, duration
  // path: start, end, type(walking), path { time, lat, lon }, duration
  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    // 移動開始地点
    const startVisits = visitTable.select({ end_time: activity.start_time });
    if (startVisits.length > 0) {
      // 滞在先から出発した場合
      const startVisit = startVisits[0];
      // 滞在場所追加
      timelines.push({
        id: startVisit.start_time,
        startTime: startVisit.start_time,
        endTime: startVisit.end_time,
        type: "visit",
        position: [startVisit.top_candidate_lon, startVisit.top_candidate_lat],
        path: [],
        placeId: startVisit.top_candidate_place_id,
        distanceMeters: null,
        duration: startVisit.end_time - startVisit.start_time,
      });
    }
    // 経路追加（開始地点）
    // 滞在先から出発した場合は位置補正
    const startPoint = startVisits.length > 0
        ? [startVisits[0].top_candidate_lon, startVisits[0].top_candidate_lat]
        : [activity.start_lon, activity.start_lat];
    timelines.push({
      id: activity.start_time,
      startTime: activity.start_time,
      endTime: activity.end_time,
      type: activity.top_candidate_type,
      position: null,
      path: [startPoint],
      placeId: null,
      distanceMeters: activity.distance_meters,
      duration: activity.end_time - activity.start_time,
    });
    // 経路追加（通過地点）
    const waypoints = timelinePathTable.select({
      time_from: activity.start_time,
      time_to: activity.end_time,
    });
    for (const waypoint of waypoints) {
      timelines.at(-1).path.push([waypoint.point_lon, waypoint.point_lat]);
    }
    // 経路追加（最終地点）
    const endVisits = visitTable.select({ start_time: activity.end_time });
    if (endVisits.length > 0) {
      // 最終地点が滞在先の場合
      // 最終地点を滞在先の位置に補正する
      timelines.at(-1).path.push([endVisits[0].top_candidate_lon, endVisits[0].top_candidate_lat]);
      // 当該日の最終行動の場合は滞在先も追加する
      if (i === activities.length - 1) {
        timelines.push({
          id: endVisits[0].start_time,
          startTime: endVisits[0].start_time,
          endTime: endVisits[0].end_time,
          type: "visit",
          position: [endVisits[0].top_candidate_lon, endVisits[0].top_candidate_lat],
          path: [],
          placeId: endVisits[0].top_candidate_place_id,
          duration: endVisits[0].end_time - endVisits[0].start_time,
        });
      }
    } else {
      // 最終地点で移動手段を切り替えた場合
      // 最終地点を次の移動手段の位置に補正する（仕様上確実にあるのでエラーチェックはしない）
      const nextActivitity = activityTable.select({ start_time: activity.end_time })[0];
      timelines.at(-1).path.push([nextActivitity.start_lon, nextActivitity.start_lat]);
    }
  }
  return timelines;
}