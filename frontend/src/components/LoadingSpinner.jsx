import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from '@mui/material/Typography';

export default function LoadingSpinner({ isLoading, message }) {
  return (
    <Backdrop
      open={isLoading}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.modal + 1,
        flexDirection: "column",
      }}
    >
      <CircularProgress size={70} />
      <Typography sx={{ mt: 2 }}>{message}</Typography>
    </Backdrop>
  );
}
