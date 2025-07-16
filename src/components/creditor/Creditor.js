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
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconButtonError, RateOils, TablecellGray, TablecellHeader, TablecellSelling } from "../../theme/style";
import { database } from "../../server/firebase";
import InsertCreditor from "./InsertCreditor";
import UpdateCreditor from "./UpdateCreditor";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const Creditor = () => {
  const [update, setUpdate] = React.useState(true);
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

  //const { creditors } = useData();
  const { creditors } = useBasicData();
  const creditor = Object.values(creditors || {});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      <Divider sx={{ marginBottom: 1 }} />
      <Grid container spacing={2} sx={{ marginTop: 1, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth - 10) : (windowWidth - 235) }}>
        <Grid item xs={10}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            รายชื่อเจ้าหนี้น้ำมัน
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <InsertCreditor creditor={creditor.length}/>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <TableContainer
            component={Paper}
            style={{ maxHeight: "70vh" }}
            sx={{ marginBottom: 2 }}
          >
            <Table stickyHeader size="small" sx={{ width: "1250px" }}>
              <TableHead sx={{ height: "7vh" }}>
                <TableRow>
                  <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                    ลำดับ
                  </TablecellSelling>
                  <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                    ชื่อ-สกุล
                  </TablecellSelling>
                  <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                    เลขประจำตัวผู้เสียภาษี
                  </TablecellSelling>
                  <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                    เบอร์โทร
                  </TablecellSelling>
                  <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                    User
                  </TablecellSelling>
                  <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                    ระยะเครดิต
                  </TablecellSelling>
                  <TablecellSelling />
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  creditor.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow>
                      <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{row.IDCard}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{row.Phone}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{row.User}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{row.Credit}</TableCell>
                      <UpdateCreditor key={row.id} employee={row} />
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          {
            creditor.length <= 10 ? null :
              <TablePagination
                rowsPerPageOptions={[10, 25, 30]}
                component="div"
                count={creditor.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                labelDisplayedRows={({ from, to, count }) =>
                  `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                }
                sx={{
                  overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  '& .MuiTablePagination-toolbar': {
                    backgroundColor: "lightgray",
                    height: "20px", // กำหนดความสูงของ toolbar
                    alignItems: "center",
                    paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                    overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                    fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                  },
                  '& .MuiTablePagination-select': {
                    paddingY: 0,
                    fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                  },
                  '& .MuiTablePagination-actions': {
                    '& button': {
                      paddingY: 0,
                      fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                    },
                  },
                  '& .MuiTablePagination-displayedRows': {
                    fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                  },
                  '& .MuiTablePagination-selectLabel': {
                    fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                  }
                }}
              />
          }
        </Grid>
      </Grid>
    </Container>
  );
};

export default Creditor;
