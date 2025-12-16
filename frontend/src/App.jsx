import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DeckGL } from '@deck.gl/react';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import dayjs from 'dayjs';

import LoadingSpinner from './components/LoadingSpinner';
import TimelineSummary from './components/summary/TimelineSummary';
import { initializeDatabase } from './db/sql';
import TimelineLayer from './layers/TimelineLayer';
import { getViewState } from './utils';

function App() {
  // View設定
  const [viewState, setViewState] = React.useState({longitude: 139.7, latitude: 35.6, zoom: 12, transitionDuration: 1000});
  // ロード中フラグ
  const [isLoading, setIsLoading] = React.useState(false);
  // 読み込んだ生データ（json）
  const [data, setData] = React.useState({});
  // 選択した日付に対応したタイムラインデータ
  const [currentActivities, setCurrentActivities] = React.useState([]);
  // タイムラインサマリーで選択されたリストアイテム
  const [currentActivity, setCurrentActivity] = React.useState(null);
  // タイムラインが存在するカレンダー日付
  const [enableDateSet, setEnableDateSet] = React.useState(new Set());
  // カレンダーで選択した日付
  const [currentDate, setCurrentDate] = React.useState(dayjs(new Date()));
  // メモリ内に展開したデータベース
  const [db, setDb] = React.useState(null);

  // データベースの作成
  React.useEffect(() => {
    let db;
    setIsLoading(true);
    const fetchDb = async () => {
      try {
        db = await initializeDatabase();
        setDb(db);
      } catch (err) {
        console.log("データベースの初期化に失敗しました", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDb();

    return () => { 
      db?.close();
    }
  }, []);

  // タイムラインファイル読み込み
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const loadJson = async () => {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        setData(json);
      } catch (err) {
        console.error("JSON のパースに失敗しました:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadJson();
  }

  // タイムラインサマリーのリストアイテムをクリックした際の処理
  const handleChangeSummaryItem = item => {
    setCurrentActivity(item);
    if (!item) return;
    const newViewState = getViewState(item);
    setViewState(newViewState);
  }

  const handleChangeCurrentActivities = activities => {
    setCurrentActivities(prev => prev === activities ? prev : activities);
    setCurrentActivity(null);
    const newViewState = getViewState(activities);
    setViewState(newViewState);
  }

  const layers = [
    new TimelineLayer({
      id: "timeline",
      data: data,
      database: db,
      currentDate: currentDate,
      currentActivity: currentActivity,
      onChangeEnableDateSet: setEnableDateSet, // 有効な日付更新イベント
      onChangeCurrentActivities: handleChangeCurrentActivities, // 日付に紐づくtimelineデータ更新イベント
    }),
  ];

  return (
    <Grid container sx={{height: "100%"}}>
      <Grid size={3} sx={{ height: "100%" }}>
        <Box sx={{height: "100%", p: 2, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden"}}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={currentDate}
              onChange={setCurrentDate}
              shouldDisableDate={date => !enableDateSet.has(date.format("YYYYMMDD"))}
              slotProps={{
                day: ({ day }) => {
                  const enabled = enableDateSet.has(day.format("YYYYMMDD"));
                  return {
                    sx: (theme) => ({
                      fontWeight: enabled ? 'bold' : 'normal',
                      color: enabled ? theme.palette.primary.main : undefined,
                    })
                  };
                }
              }}
            />
          </LocalizationProvider>
          <Box>
            <Button variant="contained" component="label" fullWidth>
              JSON ファイル読み込み
              <input hidden type="file" accept="application/json" onChange={handleFileChange} />
            </Button>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <TimelineSummary data={currentActivities} onClick={handleChangeSummaryItem}/>
          </Box>
        </Box>
      </Grid>
      <Grid size={9} sx={{ height: "100%", position: "relative" }}>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
          <DeckGL initialViewState={viewState} controller layers={layers} >
            {/* defaultCenter、defaultZoom は警告回避のダミーデータ */}
            <Map mapId={import.meta.env.VITE_GOOGLE_MAP_ID} defaultCenter={{ lat: 1, lng: 1 }} defaultZoom={1} />
          </DeckGL>
        </APIProvider>
      </Grid>
      <LoadingSpinner isLoading={isLoading} message="loading..." />
    </Grid>
  );
}

export default App;
