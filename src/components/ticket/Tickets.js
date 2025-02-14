import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { IconButtonError, TablecellHeader } from "../../theme/style";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";

const Tickets = () => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(1);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        ตั๋วน้ำมัน
      </Typography>
      <Divider />
      <Grid container spacing={2} marginTop={1}>
        <Grid item xs={4}>
          <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 &&  "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(1)}>ตั๋วขายส่ง</Button>
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 &&  "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(2)}>ตั๋วขายย่อย</Button>
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" color={open === 3 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 3 &&  "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(3)}>ตั๋วปั้ม</Button>
        </Grid>
        <Grid item xs={4} sx={{ marginTop: -3 }}>
          {
            open === 1 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
          }
        </Grid>
        <Grid item xs={4} sx={{ marginTop: -3 }}>
          {
            open === 2 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
          }
        </Grid>
        <Grid item xs={4} sx={{ marginTop: -3 }}>
          {
            open === 3 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
          }
        </Grid>
      </Grid>
    </Container>
  );
};

export default Tickets;
