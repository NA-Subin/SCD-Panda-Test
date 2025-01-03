import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import theme from "../../theme/theme";
import { database } from "../../server/firebase";
import GasStationsDetail from "./gasstations/GasStationsDetail";
import DepotDetail from "./depot/DepotDetail";
import StockDetail from "./stock/StockDetail";
import InserDepots from "./InsertDepots";

const Depots = () => {
  const [openMenu, setOpenMenu] = React.useState(1);


  const [depot, setDepot] = useState(0);
  const [gasStation, setGasStation] = useState(0);
  const [stock, setStock] = useState(0);

  const getDepot = async () => {
    database.ref("/depot/oils").on("value", (snapshot) => {
      const datas = snapshot.val();
      setDepot(datas.length);
    });

    database.ref("/depot/stock").on("value", (snapshot) => {
      const datas = snapshot.val();
      setStock(datas.length);
    });

    database.ref("/depot/gasStations").on("value", (snapshot) => {
      const datas = snapshot.val();
      setGasStation(datas.length);
    });
  };

  useEffect(() => {
    getDepot();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        { openMenu === 1 ? "ปั้มน้ำมัน" : openMenu === 2 ? "คลังสต็อกน้ำมัน" : "คลังรับน้ำมัน"}
      </Typography>
      <Box display="flex" justifyContent="right" alignItems="center" marginRight={3} marginTop={-8} marginBottom={3}>
      <InserDepots show={openMenu} depot={depot} stock={stock} gasStation={gasStation}/>
      </Box>
      <Divider />
      <Grid container spacing={5} marginTop={0.5} marginBottom={2}>
        <Grid item xs={openMenu === 1 ? 10 : 1}>
          <Tooltip title="ปั้มน้ำมัน" placement="top">
            <Button
              variant="contained"
              color={openMenu === 1 ? "info" : "inherit"}
              fullWidth
              onClick={() => setOpenMenu(1)}
              sx={{ height: "10vh", fontSize: openMenu === 1 ? 40 : 16, paddingLeft: openMenu === 1 ? 0 : 3.5 }}
              startIcon={
                <LocalGasStationIcon sx={{ width: '3em', height: '3em' }} />
              }
            >
              <Badge
                badgeContent={gasStation}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 20, // ขนาดตัวเลขใน Badge
                    minWidth: 30, // ความกว้างของ Badge
                    height: 30, // ความสูงของ Badge
                    top: openMenu === 1 ? 35 : -40,
                    right: openMenu === 1 ? -30 : -5,
                    color: openMenu === 1 ? theme.palette.info.main : "white",
                    backgroundColor: openMenu === 1 ? "white" : theme.palette.info.main,
                    fontWeight: "bold",
                  },
                  fontWeight: "bold",
                }}
              >
                {openMenu === 1 ? "ปั้มน้ำมัน" : ""}
              </Badge>
            </Button>
            {
              openMenu === 1 && <Divider orientation="vertical" flexItem sx={{ border: "1px solid lightgray", marginTop: 2 }} />
            }
          </Tooltip>
        </Grid>
        <Grid item xs={openMenu === 2 ? 10 : 1}>
          <Tooltip title="คลังสต็อกน้ำมัน" placement="top">
            <Button
              variant="contained"
              color={openMenu === 2 ? "info" : "inherit"}
              fullWidth
              onClick={() => setOpenMenu(2)}
              sx={{ height: "10vh", fontSize: openMenu === 2 ? 40 : 16, paddingLeft: openMenu === 2 ? 0 : 3.5 }}
              startIcon={
                <WaterDropIcon sx={{ width: '3em', height: '3em' }} />
              }
            >
              <Badge
                badgeContent={stock}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 20, // ขนาดตัวเลขใน Badge
                    minWidth: 30, // ความกว้างของ Badge
                    height: 30, // ความสูงของ Badge
                    top: openMenu === 2 ? 35 : -40,
                    right: openMenu === 2 ? -30 : -5,
                    color: openMenu === 2 ? theme.palette.info.main : "white",
                    backgroundColor: openMenu === 2 ? "white" : theme.palette.info.main,
                    fontWeight: "bold",
                  },
                  fontWeight: "bold",
                }}
              >
                {openMenu === 2 ? "คลังสต็อกน้ำมัน" : ""}
              </Badge>
            </Button>
            {
              openMenu === 2 && <Divider orientation="vertical" flexItem sx={{ border: "1px solid lightgray", marginTop: 2 }} />
            }
          </Tooltip>
        </Grid>
        <Grid item xs={openMenu === 3 ? 10 : 1}>
          <Tooltip title="คลังรับน้ำมัน" placement="top">
            <Button
              variant="contained"
              color={openMenu === 3 ? "info" : "inherit"}
              fullWidth
              onClick={() => setOpenMenu(3)}
              sx={{ height: "10vh", fontSize: openMenu === 3 ? 40 : 16, paddingLeft: openMenu === 3 ? 0 : 3.5 }}
              startIcon={
                <OilBarrelIcon sx={{ width: '3em', height: '3em' }} />
              }
            >
              <Badge
                badgeContent={depot}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 20, // ขนาดตัวเลขใน Badge
                    minWidth: 30, // ความกว้างของ Badge
                    height: 30, // ความสูงของ Badge
                    top: openMenu === 3 ? 35 : -40,
                    right: openMenu === 3 ? -30 : -5,
                    color: openMenu === 3 ? theme.palette.info.main : "white",
                    backgroundColor: openMenu === 3 ? "white" : theme.palette.info.main,
                    fontWeight: "bold",
                  },
                  fontWeight: "bold",
                }}
              >
                {openMenu === 3 ? "คลังรับน้ำมัน" : ""}
              </Badge>
            </Button>
            {
              openMenu === 3 && <Divider orientation="vertical" flexItem sx={{ border: "1px solid lightgray", marginTop: 2 }} />
            }
          </Tooltip>
        </Grid>
      </Grid>
      {
        openMenu === 1 ?
        <GasStationsDetail gasStation={gasStation} />
        : openMenu === 2 ?
          <StockDetail stock={stock}/>
        : <DepotDetail depot={depot}/>
      }
    </Container>
  );
};

export default Depots;
