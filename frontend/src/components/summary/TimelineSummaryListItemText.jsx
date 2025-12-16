import ListItemText from '@mui/material/ListItemText';
import dayjs from 'dayjs';

import {activityTypeToText} from './TimelineSummaryUtils';
import {formatDuration, formatDistance} from '../../utils';

export default function TimelineSummaryListItemText({ data, placeInfo }) {
  const startTime = dayjs(data.startTime).format("H:mm");
  const endTime = dayjs(data.endTime).format("H:mm");
  const fromStartToEnd = `${startTime}～${endTime}`;

  if (data.type === "visit") {
    // 訪問先のテキスト
    const title = placeInfo?.displayName ?? data.placeId;
    const address = placeInfo?.formattedAddress ?? "住所情報なし";

    return (
      <ListItemText
        slotProps={{
          primary: {
            noWrap: true,
            sx: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
          },
        }}
        primary={title}
        secondary={
          <>
            {address}
            <br />
            {fromStartToEnd}
          </>
        }
      />
    );
  }
  // 移動のテキスト
  const duration = formatDuration((data.endTime - data.startTime) / 1000);
  const distance = formatDistance(data.distanceMeters);

  return (
    <ListItemText
      slotProps={{
        primary: {
          noWrap: true,
          sx: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
        },
      }}
      primary={activityTypeToText(data.type)}
      secondary={
        <>
          {distance} {duration}
          <br />
          {fromStartToEnd}
        </>
      }
    />
  );
}