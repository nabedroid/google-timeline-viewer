import Box from '@mui/material/Box';

import { activityTypeToIcon } from './TimelineSummaryUtils';

export default function TimelineSummaryIcon({ type }) {
  const icon = activityTypeToIcon(type);
  const isVisit = type === "visit";

  return (
    <Box
      sx={{
        bgcolor: isVisit ? 'primary.main' : 'transparent', // 訪問は背景色
        border: isVisit ? 'none' : '1px solid', // 移動は枠線
        borderColor: isVisit ? 'transparent' : 'primary.main',
        color: isVisit ? 'white' : 'primary.main', // アイコン色
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>
  );
}