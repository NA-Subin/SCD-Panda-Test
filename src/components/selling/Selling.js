import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import theme from "../../theme/theme";
import { RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { HTTP } from "../../server/axios";
import Cookies from "js-cookie";
import Logo from "../../../public/logoPanda.jpg";
import Wholesale from "./Trips";
import Retail from "./Retail";
import InsetTrips from "./InsertTrips";

const Selling = () => {
  const [open, setOpen] = useState(true);
  const [openTab, setOpenTab] = React.useState(true);

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        ขายน้ำมัน
      </Typography>
      <Box textAlign="right" marginTop={-8} marginBottom={4} marginRight={5}>
      <InsetTrips />
      </Box>
      <Divider sx={{ marginBottom: 2 }} />
      <Grid container spacing={3} marginTop={1}>
        <Grid item xs={12}>
        <Paper
              sx={{
                p: 2,
                height: "70vh"
              }}
            >
              <Wholesale />
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Selling;
