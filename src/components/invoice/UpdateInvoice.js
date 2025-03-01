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
import { IconButtonError, RateOils, TablecellHeader, TablecellSelling } from "../../theme/style";
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import theme from "../../theme/theme";
import { ref, update } from "firebase/database";
import { ShowError } from "../sweetalert/sweetalert";
import dayjs from "dayjs";

const UpdateInvoice = (props) => {
    const { ticket } = props;
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const { order } = useData();
    const orders = Object.values(order || {});

    const orderList = orders.filter(item => item.TicketName === ticket.TicketName);

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
    const handlePriceChange = (value, no, uniqueRowId, ticketName, productName, date, driver, registration, volume) => {

        const price = parseFloat(value);

        setReport((prevReport) => {
            const newReport = { ...prevReport };

            if (value === "" || price === 0 || isNaN(price)) {
                // ถ้าค่าว่าง หรือ 0 ให้ลบออกจาก report
                delete newReport[uniqueRowId];
            } else {
                // บันทึกค่าตามปกติ
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
            }

            return newReport;
        });
    };


    console.log("Report : ", report);


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
                TransferAmount: 0,
                OverdueTransfer: data.Amount
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
            <TableRow>
                <TableCell sx={{ textAlign: "center" }}>{ticket.id}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{ticket.TicketName}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(parseFloat(ticket.Volume))}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(parseFloat(ticket.Amount))}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(parseFloat(ticket.TransferAmount))}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(parseFloat(ticket.OverdueTransfer))}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    {
                        !open ?
                            <IconButton color="info" size="small" onClick={handleClickOpen}><KeyboardArrowDownIcon fontSize="small" /></IconButton>
                            :
                            <IconButton color="info" size="small" onClick={handleClose}><KeyboardArrowUpIcon fontSize="small" /></IconButton>
                    }
                </TableCell>
            </TableRow>
            {
                open &&
                <TableRow>
                    <TableCell colSpan={7} sx={{ p: 1, backgroundColor: "lightgray", paddingLeft: 4, paddingRight: 4 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={9.5}>
                            <Typography variant="subtitle1" sx={{ marginTop: 1 }} fontWeight="bold" gutterBottom>
                            รายละเอียด : วันที่ส่ง : {ticket.Date} จากตั๋ว : {ticket.TicketName}
                        </Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                            <Tooltip title="พิมพ์ใบวางบิล"  placement="top">
                                    <Button
                                        color="primary"
                                        variant='contained'
                                        fullWidth
                                        sx={{
                                            flexDirection: "row",
                                            gap: 0.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        <PrintIcon sx={{ color: "white"}} />
                                        <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                            พิมพ์ใบวางบิล
                                        </Typography>
                                    </Button>
                                </Tooltip>
                                </Grid>
                            <Grid item xs={1}>
                            <Tooltip title="บันทึกข้อมูล" placement="top">
                                    <Button
                                        color="success"
                                        variant='contained'
                                        fullWidth
                                        onClick={handleSave}
                                        sx={{
                                            flexDirection: "row",
                                            gap: 0.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        <SaveIcon sx={{ color: "white" }} />
                                        <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                            บันทึก
                                        </Typography>
                                    </Button>
                            </Tooltip>
                            </Grid>
                        </Grid>
                        <TableContainer
                                    component={Paper}
                                    sx={{ marginBottom: 2,borderRadius: 2 }}
                                  >
                        <Table size="small">
                                    <TableHead>
                                            <TableRow>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 30 }}>
                                                    ลำดับ
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100 }}>
                                                    วันที่
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px" }}>
                                                    ผู้ขับ/ป้ายทะเบียน
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100 }}>
                                                    ชนิดน้ำมัน
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150 }}>
                                                    จำนวนลิตร
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100 }}>
                                                    ราคาน้ำมัน
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150 }}>
                                                    ยอดเงิน
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                    <Table size="small" sx={{ backgroundColor: "white" }}>
                                    <TableBody>
                                            {
                                                orderList
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .flatMap((row, rowIndex) =>
                                                        Object.entries(row.Product).map(([productName, Volume], index) => ({
                                                            No: row.No,
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
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 30 }}>
                                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{index + 1}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 150 }}>
                                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{report[row.uniqueRowId]?.Date || row.Date}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px' }}>
                                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{report[row.uniqueRowId]?.Driver || row.Driver} : {report[row.uniqueRowId]?.Registration || row.Registration}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 100 }}>
                                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{report[row.uniqueRowId]?.ProductName || row.ProductName}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 150 }}>
                                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                                    {new Intl.NumberFormat("en-US", {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    }).format(parseFloat(row.Volume))}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontSize: "14px", width: 100 }}>
                                                                <Paper component="form" sx={{ marginTop: -1, marginBottom: -1 }}>
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: "14px",
                                                                                padding: '1px 4px',
                                                                                textAlign: 'center',
                                                                            },
                                                                            borderRadius: 10,
                                                                        }}
                                                                        value={report[row.uniqueRowId]?.Price || row.RateOil || ""}
                                                                        onChange={(e) => {
                                                                            let newValue = e.target.value.replace(/^0+(?=\d)/, "");  // ลบเลข 0 ข้างหน้า
                                                                            if (newValue === "") newValue = "";  // ถ้าว่างให้แสดงค่าว่าง
                                                                            handlePriceChange(
                                                                                newValue,  // ใช้ค่าใหม่ที่ไม่มี 0 ข้างหน้า
                                                                                row.No,
                                                                                row.uniqueRowId,
                                                                                row.TicketName,
                                                                                row.ProductName,
                                                                                row.Date,
                                                                                row.Driver,
                                                                                row.Registration,
                                                                                row.Volume
                                                                            );
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0") { // ถ้าเป็น "0" ให้เคลียร์
                                                                                handlePriceChange(
                                                                                    "",
                                                                                    row.No,
                                                                                    row.uniqueRowId,
                                                                                    row.TicketName,
                                                                                    row.ProductName,
                                                                                    row.Date,
                                                                                    row.Driver,
                                                                                    row.Registration,
                                                                                    row.Volume
                                                                                );
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            if (e.target.value === "") { // ถ้าว่างให้ตั้งค่าเป็น "0"
                                                                                handlePriceChange(
                                                                                    "0",
                                                                                    row.No,
                                                                                    row.uniqueRowId,
                                                                                    row.TicketName,
                                                                                    row.ProductName,
                                                                                    row.Date,
                                                                                    row.Driver,
                                                                                    row.Registration,
                                                                                    row.Volume
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 150 }}>
                                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                                    {new Intl.NumberFormat("en-US", {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    }).format(report[row.uniqueRowId]?.Amount || row.Amount)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            }
                                        </TableBody>
                                    </Table>
                                    <Table size="small" sx={{ backgroundColor: "white" }}>
                                    <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ textAlign: "center", height: '20px', fontWeight: "bold",borderLeft: "1px solid white", backgroundColor: "gray",color: "white" }} colSpan={4}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    รวม
                                                </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", height: '20px', fontWeight: "bold",borderLeft: "1px solid white", width: 150, backgroundColor: "gray",color: "white" }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(parseFloat(ticket.Volume))}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", height: '20px', fontWeight: "bold",borderLeft: "1px solid white", width: 100, backgroundColor: "gray",color: "white" }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    0
                                                </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", height: '20px', fontWeight: "bold",borderLeft: "1px solid white", width: 150, backgroundColor: "gray",color: "white" }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(parseFloat(ticket.Amount))}
                                                </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                        </TableContainer>

                        <Typography variant='subtitle1' fontWeight="bold" gutterBottom>ข้อมูลการโอน</Typography>
                        <TableContainer
                                    component={Paper}
                                    sx={{ marginBottom: 2,borderRadius: 2 }}
                                  >
                        <Table size="small">
                                    <TableHead>
                                            <TableRow>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 30 }}>
                                                    ลำดับ
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100 }}>
                                                    วันที่เงินเข้า
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px" }}>
                                                    บัญชี
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150 }}>
                                                    บริษัทขนส่ง
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150 }}>
                                                    ยอดเงินเข้า
                                                </TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 200 }}>
                                                    หมายเหตุ
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                    <Table size="small" sx={{ backgroundColor: "white" }}>
                                    <TableBody>
                                            {
                                                orderList
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .flatMap((row, rowIndex) =>
                                                        Object.entries(row.Product).map(([productName, Volume], index) => ({
                                                            No: row.No,
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
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 30 }}>
                                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{index + 1}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 150 }}>
                                                            <Paper component="form" sx={{ marginTop: -1, marginBottom: -1 }}>
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: "14px",
                                                                                padding: '1px 4px',
                                                                                textAlign: 'center',
                                                                            },
                                                                            borderRadius: 10,
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px' }}>
                                                            <Paper component="form" sx={{ marginTop: -1, marginBottom: -1 }}>
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: "14px",
                                                                                padding: '1px 4px',
                                                                                textAlign: 'center',
                                                                            },
                                                                            borderRadius: 10,
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 150 }}>
                                                            <Paper component="form" sx={{ marginTop: -1, marginBottom: -1 }}>
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: "14px",
                                                                                padding: '1px 4px',
                                                                                textAlign: 'center',
                                                                            },
                                                                            borderRadius: 10,
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", height: '20px', width: 150 }}>
                                                            <Paper component="form" sx={{ marginTop: -1, marginBottom: -1 }}>
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: "14px",
                                                                                padding: '1px 4px',
                                                                                textAlign: 'center',
                                                                            },
                                                                            borderRadius: 10,
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontSize: "14px", width: 200 }}>
                                                                <Paper component="form" sx={{ marginTop: -1, marginBottom: -1 }}>
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: "14px",
                                                                                padding: '1px 4px',
                                                                                textAlign: 'center',
                                                                            },
                                                                            borderRadius: 10,
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            }
                                        </TableBody>
                                    </Table>
                                    <Table size="small" sx={{ backgroundColor: "white" }}>
                                    <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ textAlign: "center", height: '20px', fontWeight: "bold",borderLeft: "1px solid white", backgroundColor: "gray",color: "white" }} colSpan={6}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    รวม
                                                </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", height: '20px', fontWeight: "bold",borderLeft: "1px solid white", width: 350, backgroundColor: "gray",color: "white" }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                 0
                                                </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                        </TableContainer>
                    </TableCell>
                </TableRow>
            }
        </React.Fragment>
    );
};

export default UpdateInvoice;
