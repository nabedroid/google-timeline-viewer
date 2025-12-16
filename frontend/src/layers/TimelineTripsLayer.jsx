import { CompositeLayer } from '@deck.gl/core';
import { TripsLayer } from '@deck.gl/geo-layers';

// 1ループに要する秒数
const loopDurationSec = 5;
// 1秒間に描画する回数（目安）
const targetFps = 60;
// 描画間隔ミリ秒
const frameIntervalMs = Math.floor(1000 / targetFps);
// 1ループに描画する回数
const totalFrames = Math.floor(loopDurationSec * targetFps);

/**
 * タイムラインの移動経路をアニメーション表示するレイヤー
 */
export default class TimelineTripsLayer extends CompositeLayer {
  static layerName = 'TimelineTripsLayer';

  static defaultProps = {
    data: { type: "array", value: [] },
    getColor: { type: "array", value: [255, 0, 0, 162] },
    fadeTrail: { type: "boolean", value: false },
    widthMinPixels: { type: "number", value: 4 },
    widthMaxPixels: { type: "number", value: 5 },
    trailLength: { type: "number", value: 7 },
  };

  initializeState() {
    super.initializeState();

    this.setState({data: [], currentTime: 0});
    // currentTime を更新し続ける
    this._intervalId = setInterval(() => {
      this.setState({
        currentTime: (this.state.currentTime + 1) % totalFrames,
      });
    }, frameIntervalMs);
  }

  updateState({ changeFlags }) {
    super.updateState({ changeFlags });

    if (changeFlags.dataChanged) {
      // 複数の経路をひとまとめにする
      const path = this.props.data?.reduce((acc, d) => {
        if (Array.isArray(d.path)) acc.push(...d.path);
        return acc;
      }, []) ?? [];
      // path の各座標に到着時間を均等に割り振る
      const timestamps = path.map(
        (_, i) => (i / (path.length - 1)) * totalFrames
      );
      // 終点の座標を微妙にずらす
      // 始点と終点が同じだと TripsLayer が正常に動かないので
      if (path.length > 0) path.at(-1)[0] += 0.0000001;

      this.setState({
        currentTime: 0,
        data: [{ path, timestamps }],
      });
    }
  }

  finalizeState() {
    super.finalizeState();
    // 更新処理を破棄
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  renderLayers() {
    return new TripsLayer({
      id: `${this.props.id}-trips`,
      data: this.state.data,
      getPath: d => d.path,
      getTimestamps: d => d.timestamps,
      currentTime: this.state.currentTime,
      getColor: this.props.getColor,
      widthMinPixels: this.props.widthMinPixels,
      widthMaxPixels: this.props.widthMaxPixels,
      fadeTrail: this.props.fadeTrail,
      trailLength: this.props.trailLength,
    });
  }
}
