import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
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
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { HTTP } from "../../server/axios";
import Cookies from "js-cookie";
import Logo from "../../../public/logoPanda.jpg";
import { database } from "../../server/firebase";
import InsertCreditor from "./InsertCreditor";
import UpdateCreditor from "./UpdateCreditor";

const Creditor = () => {
  const [update,setUpdate] = React.useState(true);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openTab, setOpenTab] = React.useState(true);

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  const [creditor, setCreditor] = useState([]);

  const getCreditor = async () => {
    database.ref("/employee/creditors").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataCreditor = [];
      for (let id in datas) {
        dataCreditor.push({ id, ...datas[id] });
      }
      setCreditor(dataCreditor);
    });
  };

  useEffect(() => {
    getCreditor()
  }, []);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        เจ้าหนี้การค้า
      </Typography>
      <Box textAlign="right" marginTop={-8} marginBottom={4} marginRight={5}>
        <InsertCreditor/>
      </Box>
      <Divider sx={{ marginBottom: 1 }}/>
      <Grid container spacing={3} p={5}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                รายชื่อเจ้าหนี้การค้า
              </Typography>
              <Divider sx={{ marginBottom: 1 }} />
              <TableContainer
                component={Paper}
                style={{ maxHeight: "90vh" }}
                sx={{ marginTop: 2 }}
              >
                <Table stickyHeader size="small">
                  <TableHead sx={{ height: "7vh" }}>
                    <TableRow>
                      <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                        ลำดับ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ชื่อ-สกุล
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        เลขประจำตัวผู้เสียภาษี
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        เบอร์โทร
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ประเภทเจ้าหนี้
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ระยะเครดิต
                      </TablecellHeader>
                      <TablecellHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {
                      creditor.map((row) => (
                        <TableRow>
                          <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.IDCard}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Phone}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Type}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Credit}</TableCell>
                          <UpdateCreditor key={row.id} employee={row}/>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              </Grid>
    </Container>
  );
};

export default Creditor;
