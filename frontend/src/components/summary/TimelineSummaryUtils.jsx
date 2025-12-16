import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import DirectionsWalkRoundedIcon from '@mui/icons-material/DirectionsWalkRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import TrainRoundedIcon from '@mui/icons-material/TrainRounded';
import DirectionsSubwayFilledRoundedIcon from '@mui/icons-material/DirectionsSubwayFilledRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import DownhillSkiingRoundedIcon from '@mui/icons-material/DownhillSkiingRounded';
import AirplanemodeActiveRoundedIcon from '@mui/icons-material/AirplanemodeActiveRounded';
import DirectionsBoatFilledRoundedIcon from '@mui/icons-material/DirectionsBoatFilledRounded';
import DirectionsBusFilledRoundedIcon from '@mui/icons-material/DirectionsBusFilledRounded';
import TramRoundedIcon from '@mui/icons-material/TramRounded';
import DirectionsBikeRoundedIcon from '@mui/icons-material/DirectionsBikeRounded';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import LocalTaxiRoundedIcon from '@mui/icons-material/LocalTaxiRounded';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';

const ACTIVITY_TYPE_INFO = {
  visit: {text: "訪問",icon: <PlaceRoundedIcon />},
  CYCLING: {text: "自転車",icon: <DirectionsBikeRoundedIcon />},
  FLYING: {text: "飛行機",icon: <AirplanemodeActiveRoundedIcon />},
  IN_BUS: {text: "バス",icon: <DirectionsBusFilledRoundedIcon />},
  IN_FERRY: {text: "フェリー",icon: <DirectionsBoatFilledRoundedIcon />},
  IN_PASSENGER_VEHICLE: {text: "自動車（同乗）",icon: <LocalTaxiRoundedIcon />},
  IN_SUBWAY: {text: "メトロ",icon: <DirectionsSubwayFilledRoundedIcon />},
  IN_TRAIN: {text: "電車",icon: <TrainRoundedIcon />},
  IN_TRAM: {text: "路面電車",icon: <TramRoundedIcon />},
  IN_VEHICLE: {text: "自動車",icon: <DirectionsCarFilledRoundedIcon />},
  MOTORCYCLING: {text: "オートバイ",icon: <TwoWheelerRoundedIcon />},
  RUNNING: {text: "ジョギング",icon: <DirectionsRunRoundedIcon />},
  SKIING:{text: "スキー",icon: <DownhillSkiingRoundedIcon />},
  UNKNOWN_ACTIVITY_TYPE: {text: "不明",icon: <QuestionMarkRoundedIcon />},
  WALKING: {text: "徒歩",icon: <DirectionsWalkRoundedIcon />},
}

// 移動タイプを日本語に変換する
export function activityTypeToText(activityType) {
  return ACTIVITY_TYPE_INFO[activityType]?.text ?? ACTIVITY_TYPE_INFO.UNKNOWN_ACTIVITY_TYPE.text;
}

// 移動タイプをアイコンに変換する
export function activityTypeToIcon(activityType) {
  return ACTIVITY_TYPE_INFO[activityType]?.icon ?? ACTIVITY_TYPE_INFO.UNKNOWN_ACTIVITY_TYPE.icon;
}