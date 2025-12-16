import { IconLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { CompositeLayer } from '@deck.gl/core';

import ICON_MAPPING from '../constants/icon-mapping.json';
import { insertTimelineJson, selectEnableDaySet, buildTimelineData } from '../db/sql';
import ActivityTypeIconLayer from './ActivityTypeIconLayer';
import TimelineTripsLayer from './TimelineTripsLayer';

/**
 * 読み込まれた json データを DB に格納し、
 * 指定された日付の経路情報を描画する
 */
export default class TimelineLayer extends CompositeLayer {
  static layerName = 'TimelineLayer';
  static defaultProps = {
    data: {type: "object", value: {}},
    database: {type: "object", value: null},
    currentDate: {type: "object", value: null},
    currentActivity: {type: "object", value: null},
    onChangeEnableDateSet: {type: "function", value: null},
    onChangeCurrentActivities: {type: "function", value: null},
  };

  updateState({props, oldProps}) {
    if (!props.database) return;

    let currentActivities = this.state.currentActivities ?? [];

    // タイムラインデータの更新要否
    if (oldProps.data !== props.data) {
      // 更新されたらデータベースを再構築
      insertTimelineJson(props.database, props.data);
      // データが存在する日付を更新
      const enableDateSet = selectEnableDaySet(props.database);
      props.onChangeEnableDateSet?.(enableDateSet);
    }

    // 日付に対応したデータの更新要否
    if (oldProps.data !== props.data || oldProps.currentDate?.format("YYYYMMDD") !== props.currentDate?.format("YYYYMMDD")) {
      // テーブルと日付から一日の移動経路を構築
      currentActivities = buildTimelineData(props.database, props.currentDate);
      if (currentActivities.length > 0) {
        props.onChangeCurrentActivities?.(currentActivities);
      }
    }
    this.setState({currentActivities: currentActivities});
  }

  renderLayers() {
    const currentActivities = this.state.currentActivities ?? [];

    // deck 9.2.2 ～ 9.2.4 を使う場合、pickable: false にすること [#9822]（https://github.com/visgl/deck.gl/issues/9822）
    const layers = [
      // 経路
      new PathLayer({
        id: `${this.props.id}-timelinePath`,
        data: currentActivities.filter(d => d.type !== "visit"),
        getColor: d => d.id === this.props.currentActivity?.id ? [128, 0, 192] : [0, 0, 192],
        getPath: d => d.path,
        widthMinPixels: 2,
        widthMaxPixels: 3,
        getWidth: 2,
        pickable: false,
      }),
      // 経路のアニメーション
      new TimelineTripsLayer({
        id: `${this.props.id}-trips`,
        data: currentActivities,
      }),
      // 訪問先のアイコン
      new ScatterplotLayer({
        id: `${this.props.id}-visit`,
        data: currentActivities.filter(d => d.type === "visit"),
        stroked: true,
        getPosition: d => d.position,
        radiusMinPixels: 5,
        radiusMaxPixels: 10,
        getRadius: 5,
        getFillColor: [255, 255, 255],
        getLineColor: [0, 0, 0],
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 2,
        getLineWidth: 1,
        pickable: false,
      }),
      // 移動手段のアイコン
      new ActivityTypeIconLayer({
        id: `${this.props.id}-activity-type-icon`,
        data: currentActivities.filter(d => d.type !== "visit"),
        getIcon: d => ICON_MAPPING[d.type] ? d.type : "UNKNOWN_ACTIVITY_TYPE",
        getPosition: d => {
          if (d.path.length % 2 === 1) {
            return d.path[Math.floor(d.path.length / 2)];
          }
          const i = Math.floor(d.path.length / 2) - 1;
          if (i < 0) throw new Error("activity path is empty or only one point");
          return [
            (d.path[i][0] + d.path[i + 1][0]) / 2,
            (d.path[i][1] + d.path[i + 1][1]) / 2,
          ]
        },
        iconAtlas: "icon-atlas.png",
        iconMapping: ICON_MAPPING,
      }),
      // クリックした場所へのマーカー
      new IconLayer({
        id: `${this.props.id}-marker`,
        data: this.props.currentActivity ? [this.props.currentActivity] : [],
        getColor: [255, 0, 0],
        getIcon: 'MARKER',
        getPosition: d => d.position,
        getSize: 40,
        iconAtlas: "icon-atlas.png",
        iconMapping: {MARKER: {...ICON_MAPPING.MARKER, anchorY: 128}},
        transition: {
          getPosition: {
            type: "spring",
            damping: 0.5,
          },
        },
      }),
    ];

    return layers;
  }
}
