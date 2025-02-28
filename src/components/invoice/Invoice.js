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
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import InfoIcon from '@mui/icons-material/Info';
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import UpdateInvoice from "./UpdateInvoice";

const Invoice = () => {
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

  const { order } = useData();
const orders = Object.values(order || {});

const groupedOrders = orders.reduce((acc, curr) => {
    const { TicketName, Product } = curr;
  
    // ถ้ายังไม่มี TicketName นี้ ให้สร้าง object ใหม่
    if (!acc[TicketName]) {
      acc[TicketName] = {
        TicketName,
        Volume: 0,
        Amount: 0,
        TransferAmount: 0,
        OverdueTransfer: 0,
      };
    }
  
    // รวมค่า Volume จาก Product
    Object.entries(Product).forEach(([key, value]) => {
      acc[TicketName].Volume += value.Volume * 1000;
      acc[TicketName].Amount += parseFloat(value.Amount) || 0;
      acc[TicketName].TransferAmount += (value.TransferAmount || 0);
      acc[TicketName].OverdueTransfer += (value.OverdueTransfer || 0);
    });
  
    return acc;
  }, {});
  

// แปลง Object กลับเป็น Array และเพิ่ม id
const result = Object.values(groupedOrders).map((item, index) => ({
    id: index + 1, // เริ่ม id จาก 1
    ...item
  }));
  
  console.log(result);

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
        ใบวางบิล
      </Typography>
      <Divider sx={{ marginBottom: 1 }} />
      <Grid container spacing={2} sx={{ marginTop: 1, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth - 10) : (windowWidth - 235) }}>
        <Grid item xs={10}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            รายการใบวางบิล
          </Typography>
        </Grid>
        <Grid item xs={2}>
           
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
                    จำนวนลิตร
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                    ยอดเงิน
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                    ยอดโอน
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                    ค้างโอน
                  </TablecellHeader>
                  <TablecellHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  result.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow>
                      <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{row.TicketName}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(parseFloat(row.Volume))}
                        </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(parseFloat(row.Amount))}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}></TableCell>
                      <TableCell sx={{ textAlign: "center" }}></TableCell>
                      <UpdateInvoice key={row.id} ticketname={row.TicketName} />
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          {
            result.length <= 10 ? null :
              <TablePagination
                rowsPerPageOptions={[10, 25, 30]}
                component="div"
                count={result.length}
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

export default Invoice;
