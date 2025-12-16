import { CompositeLayer } from '@deck.gl/core';
import { ScatterplotLayer, IconLayer } from '@deck.gl/layers';

/**
 * 移動経路のアイコンを枠線付きで描画する
 */
export default class ActivityTypeIconLayer extends CompositeLayer {
  static layerName = 'ActivityTypeIconLayer';

  static defaultProps = {
    // 共通
    data:{type: "array", value: []},
    getPosition: {type: "function", value: null},
    // 背景
    lineWidth: {type: "number", value: 1},
    getRadius: {type: "function", value: 18},
    stroked: {type: "boolean", value: true},
    radiusMinPixels: {type: "number", value: 10},
    radiusMaxPixels: {type: "number", value: 18},
    getFillColor: {type: "array", value: [255, 255, 255]},
    getLineColor: {type: "array", value: [0, 0, 0]},
    lineWidthMinPixels: {type: "number", value: 1},
    lineWidthMaxPixels: {type: "number", value: 2},
    filled: {type: "boolean", value: true},
    // アイコン
    getIcon: {type: "function", value: null},
    getSize: {type: "function", value: 16},
    getColor: {type: "function", value: [0, 0, 0]},
    sizeMinPixels: {type: "number", value: 16},
    sizeMaxPixels: {type: "number", value: 32},
    iconAtlas: {type: "object", value: null},
    iconMapping: {type: "object", value: {}},
  };

  renderLayers() {
    return [
      // 背景（枠線、背景色）
      new ScatterplotLayer({
        id: `${this.props.id}-background`,
        data: this.props.data,
        getPosition: this.props.getPosition,
        radiusMinPixels: this.props.radiusMinPixels,
        radiusMaxPixels: this.props.radiusMaxPixels,
        getRadius: this.props.getRadius,
        stroked: this.props.stroked,
        filled: this.props.filled,
        getFillColor: this.props.getFillColor,
        getLineColor: this.props.getLineColor,
        lineWidthMinPixels: this.props.lineWidthMinPixels,
        lineWidthMaxPixels: this.props.lineWidthMaxPixels,
        pickable: false,
      }),
      // アイコン
      new IconLayer({
        id: `${this.props.id}-foreground`,
        data: this.props.data,
        getPosition: this.props.getPosition,
        getIcon: this.props.getIcon,
        iconAtlas: this.props.iconAtlas,
        iconMapping: this.props.iconMapping,
        getSize: this.props.getSize,
        getColor: this.props.getColor,
        pickable: false,
      }),
    ];
  }
}
