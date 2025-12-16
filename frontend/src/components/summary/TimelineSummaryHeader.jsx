import Box from '@mui/material/Box';
import TimelineSummaryIcon from './TimelineSummaryIcon';
import Typography from '@mui/material/Typography';
import {formatDuration, formatDistance} from '../../utils';

export default function TimelineSummaryHeader({ data }) {

  // 移動手段ごとの出現回数、移動距離、移動時間を合算
  const summaries = {};
  for (const activity of data) {
    if (!summaries[activity.type]) {
      summaries[activity.type] = {type: activity.type, count: 0, distance: 0, duration: 0};
    }
    summaries[activity.type].count++;
    if (activity.type !== 'visit') {
      summaries[activity.type].duration += activity.duration;
      summaries[activity.type].distance += activity.distanceMeters;
    }
  }

  // 移動距離 top3 を取り出す
  const top3summaries = Object.values(summaries).sort((a, b) => b.distance - a.distance).slice(0, 3);

  return (
    <Box
      sx={{display: 'flex', justifyContent: 'center', gap: 0.7, maxWidth: '100%', overflow: 'hidden'}}>
      {top3summaries.map((summary, i) => (
        <Box key={i} sx={{display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0}}>
          <Box sx={{flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <TimelineSummaryIcon type={summary.type} />
          </Box>
          <Box sx={{minWidth: 0, display: 'flex', flexDirection: 'column'}}>
            {summary.type === 'visit' ? (
              <Typography variant="caption" noWrap>
                訪問回数 {summary.count} 回
              </Typography>
            ) : (
              <>
                <Typography variant="caption" noWrap>
                  {formatDistance(summary.distance)}
                </Typography>
                <Typography variant="caption" noWrap>
                  {formatDuration(summary.duration / 1000)}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
