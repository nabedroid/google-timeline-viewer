import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';

import { getPlaceDetails } from '../../api/places';

import TimelineSummaryIcon from './TimelineSummaryIcon';
import TimelineSummaryListItemText from './TimelineSummaryListItemText';
import TimelineSummaryHeader from './TimelineSummaryHeader';

export default function TimelineSummary({ data, onClick }) {
  const [places, setPlaces] = React.useState({});

  // Places Detail から place id に紐づく名前と住所を places detail から順次取得する
  React.useEffect(() => {
    let isMount = true;

    async function fetchPlaces() {
      // places api から placeid に紐づく情報を取得する
      const visitItems = data.filter((d) => d.type === "visit" && d.placeId);

      for (const item of visitItems) {
        if (places[item.placeId]) continue;
        if (!isMount) return;

        try {
          const res = await getPlaceDetails(item.placeId);
          if (isMount) {
            setPlaces((prev) => ({ ...prev, [item.placeId]: res }));
          } else {
            console.log("placeDetails canceled");
            return;
          }
        } catch (err) {
          if (!isMount) console.error("placeDetails failed:", err);
        }
      }
    }
    fetchPlaces();
    return () => isMount = false;
  }, [data]);

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <TimelineSummaryHeader data={data} />
      <Divider sx={{ my: 1 }} />
      <List sx={{ width: '100%' }}>
        {data.map((d, index) => (
          <ListItem key={index} dense sx={{ minWidth: 0 }} onClick={() => onClick?.(d)}>
            <ListItemIcon>
              <TimelineSummaryIcon type={d.type} />
            </ListItemIcon>
            <TimelineSummaryListItemText data={d} placeInfo={places[d.placeId]} />
          </ListItem>
        ))}
      </List>
    </>
  );
}
