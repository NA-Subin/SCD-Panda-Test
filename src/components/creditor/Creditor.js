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
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
        
          // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
          useEffect(() => {
            const handleResize = () => {
              setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
            };
        
            window.addEventListener('resize', handleResize); // เพิ่ม event listener
        
            // ลบ event listener เมื่อ component ถูกทำลาย
            return () => {
              window.removeEventListener('resize', handleResize);
            };
          }, []);

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
        เจ้าหนี้น้ำมัน
      </Typography>
      <Divider sx={{ marginBottom: 1 }}/>
      <Grid container spacing={2} sx={{ marginTop: 1 ,width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth-95) : windowWidth <= 600 ? (windowWidth-10) : (windowWidth-235) }}>
        <Grid item xs={10}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
                รายชื่อเจ้าหนี้น้ำมัน
              </Typography>
        </Grid>
        <Grid item xs={2}>
        <InsertCreditor/>
        </Grid>
        <Grid item xs={12}>
        <Divider/>
        </Grid>
        <Grid item xs={12}>
              <TableContainer
                              component={Paper}
                              style={{ maxHeight: "70vh" }}
                              sx={{ marginBottom: 2}}
                          >
                              <Table stickyHeader size="small" sx={{ width: "1250px" }}>
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
                        User
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
                          <TableCell sx={{ textAlign: "center" }}>{row.User}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Credit}</TableCell>
                          <UpdateCreditor key={row.id} employee={row}/>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
        </Grid>
              </Grid>
    </Container>
  );
};

export default Creditor;
