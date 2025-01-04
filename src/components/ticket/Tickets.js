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
import PopupTickets from "./PopupTickets";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import UpdateTickets from "./TicketsDetail";
import TicketsDetail from "./TicketsDetail";

const Tickets = () => {
  const [update,setUpdate] = React.useState(true);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [ticket, setTicket] = useState([]);
  const getTicket = async () => {
    database.ref("/tickets").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataList = [];
      for (let id in datas) {
        dataList.push({ id, ...datas[id] });
      }
      setTicket(dataList);
    });
  };
  useEffect(() => {
    getTicket();
  }, []);

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
        <Grid item xs={10}>
          <Paper sx={{ height: "70vh", padding: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>รายการตั๋วน้ำมัน</Typography>
            <Divider sx={{ marginTop: 1 }} />
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
                      รหัสตั๋ว
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ชื่อตั๋ว
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ประเภทตั๋ว
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      เพิ่มตั๋วโดย
                    </TablecellHeader>
                    <TablecellHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    ticket.map((row) => (
                      <TicketsDetail key={row.id} tickets={row}/>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <PopupTickets />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Tickets;
