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
import CancelIcon from '@mui/icons-material/Cancel';
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import theme from "../../theme/theme";
import { ref, update } from "firebase/database";
import { ShowError } from "../sweetalert/sweetalert";

const UpdateInvoice = (props) => {
    const { ticketname } = props;
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const { order } = useData();
    const orders = Object.values(order || {});

    const orderList = orders.filter(item => item.TicketName === ticketname);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    
const [report, setReport] = useState({});

// ฟังก์ชันคำนวณยอดเงิน
const handlePriceChange = (event, no, uniqueRowId, ticketName, productName, date, driver, registration, volume) => {
    const price = parseFloat(event.target.value);
    if (isNaN(price)) return;
  
    setReport((prevReport) => {
      const newReport = { ...prevReport };
  
      newReport[uniqueRowId] = {
        No: no,
        TicketName: ticketName,
        ProductName: productName,
        Date: date,
        Driver: driver,
        Registration: registration,
        Price: price,
        Amount: price * volume,
      };
  
      return newReport;
    });
  };
  
  
  console.log("Report : ",report);

  
const handleSave = () => {
    Object.entries(report).forEach(([uniqueRowId, data]) => {
    // ตรวจสอบว่า data.id และ data.ProductName ไม่ใช่ null หรือ undefined
    if (data.No == null || data.ProductName == null || data.ProductName.trim() === "") {
        console.log("ไม่พบ id หรือ ProductName");
        return;
      }
  
      const path = `order/${data.No}/Product/${data.ProductName}`;
      update(ref(database, path), {
        RateOil: data.Price,
        Amount: data.Amount,
      })
      .then(() => {
        console.log("บันทึกข้อมูลเรียบร้อย ✅");
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error("Error pushing data:", error);
      });
    });
  };

    return (
        <React.Fragment>
            <IconButton color="info" size="small" onClick={handleClickOpen}><InfoIcon fontSize="small" /></IconButton>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="xl"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >ใบวางบิล</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
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
                                                วันที่
                                            </TablecellHeader>
                                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                ผู้ขับ/ป้ายทะเบียน
                                            </TablecellHeader>
                                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                ชนิดน้ำมัน
                                            </TablecellHeader>
                                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                จำนวนลิตร
                                            </TablecellHeader>
                                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                ยอดเงิน
                                            </TablecellHeader>
                                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                ราคาน้ำมัน
                                            </TablecellHeader>
                                            <TablecellHeader />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {
              orderList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .flatMap((row, rowIndex) =>
                    Object.entries(row.Product).map(([productName, Volume], index) => ({
                      No : row.No,
                      TicketName: row.TicketName,
                      RateOil: Volume.RateOil || 0,
                      Amount: Volume.Amount || 0,
                      Date: row.Date,
                      Driver: row.Driver,
                      Registration: row.Registration,
                      ProductName: productName,
                      Volume: Volume.Volume * 1000,
                      uniqueRowId: `${index}:${productName}`, // 🟢 สร้าง ID ที่ไม่ซ้ำกัน
                    }))
                  )
                .map((row, index) => (
                  <TableRow key={`${row.TicketName}-${row.ProductName}-${index}`}>
                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
  {report[row.uniqueRowId]?.Date || row.Date}
</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
  {report[row.uniqueRowId]?.Driver || row.Driver} : {report[row.uniqueRowId]?.Registration || row.Registration}
</TableCell>
<TableCell sx={{ textAlign: "center" }}>
  {report[row.uniqueRowId]?.ProductName || row.ProductName}
</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(parseFloat(row.Volume))}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Paper component="form">
                      <TextField
  size="small"
  fullWidth
  value={report[row.uniqueRowId]?.Price || row.RateOil}
  onChange={(e) => handlePriceChange(e, row.No, row.uniqueRowId, row.TicketName, row.ProductName, row.Date, row.Driver, row.Registration, row.Volume)}
  sx={{
    '& .MuiOutlinedInput-root': {
      height: '30px',
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiInputBase-input': {
      fontSize: '16px',
      fontWeight: 'bold',
      padding: '1px 4px',
      textAlign: 'center',
    },
    borderRadius: 10,
  }}
/>
                      </Paper>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
  {new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(report[row.uniqueRowId]?.Amount || row.Amount)}
</TableCell>
                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
                                </Table>
                            </TableContainer>
                            {
                                orderList.length <= 5 ? null :
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25, 30]}
                                        component="div"
                                        count={orderList.length}
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
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handleSave} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateInvoice;
