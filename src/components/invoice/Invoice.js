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

  const [selectedRow, setSelectedRow] = useState(0);

  const handleRowClick = (row) => {
    setSelectedRow(row);
  };

  const { order } = useData();
const orders = Object.values(order || {});

const groupedOrders = orders.reduce((acc, curr) => {
    const { TicketName,Date ,Product, TransferAmount, TotalOverdueTransfer } = curr;
  
    // ถ้ายังไม่มี TicketName นี้ ให้สร้าง object ใหม่
    if (!acc[TicketName]) {
      acc[TicketName] = {
        TicketName,
        Date,
        TotalOverdueTransfer,
        TransferAmount,
        Volume: 0,
        Amount: 0,
        OverdueTransfer: 0,
      };
    }
  
    // รวมค่า Volume จาก Product
    Object.entries(Product).forEach(([key, value]) => {
      acc[TicketName].Volume += value.Volume * 1000;
      acc[TicketName].Amount += parseFloat(value.Amount) || 0;
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
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
        <Grid item xs={12}>
          <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", }} gutterBottom>*กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*</Typography>
          <TableContainer
            component={Paper}
            sx={{ marginBottom: 2, height: "250px" }}
          >
            <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
              <TableHead sx={{ height: "5vh" }}>
                <TableRow>
                  <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                    ลำดับ
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                    ชื่อ-สกุล
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                    จำนวนลิตร
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                    ยอดเงิน
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                    ยอดโอน
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                    ค้างโอน
                  </TablecellHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  result.map((row) => (
                    <TableRow 
                      key={row.id} 
                      onClick={() => handleRowClick(row)} 
                      sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                    >
                        <TableCell sx={{ textAlign: "center",fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                        <TableCell sx={{ textAlign: "center",fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                        <TableCell sx={{ textAlign: "center",fontWeight: selectedRow.id === row.id ? "bold" : "" }}>
                            {new Intl.NumberFormat("en-US").format(row.Volume || 0)}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center",fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount || 0)}</TableCell>
                        <TableCell sx={{ textAlign: "center",fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                        <TableCell sx={{ textAlign: "center",fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer || 0)}
                        </TableCell>
                    </TableRow>
                  ))
                }
                {/* {
                  result
                  //.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UpdateInvoice key={row.id} ticket={row} />
                  ))
                } */}
              </TableBody>
            </Table>
          </TableContainer>
          {/* {
            result.length <= 5 ? null :
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 30]}
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
          } */}
        </Grid>
        <Grid item xs={12}>
          {
            result.map((row) => (
              selectedRow && selectedRow.id === row.id ?
              <UpdateInvoice key={row.id} ticket={row} />
              : ""
            ))
          }
        </Grid>
      </Grid>
    </Container>
  );
};

export default Invoice;
