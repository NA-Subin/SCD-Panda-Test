import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
    MenuItem,
    Paper,
    Popover,
    Select,
    Slide,
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import InsertFinancial from "./InsertFinancial";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull } from "../../theme/DateTH";
import { buildPeriodsForYear, findCurrentPeriod } from "./Paid";

const Financial = () => {
    const [search, setSearch] = useState("");
    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(null);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            setSelectedDateStart(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            setSelectedDateEnd(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    // const { report } = useData();
    const { report } = useTripData();
    const reports = Object.values(report || {});
    // const reportDetail = reports.filter((row) => row.Status !== "ยกเลิก")

    const reportDetail = reports.filter((item) => {
        const itemDate = dayjs(item.SelectedDateInvoice, "DD/MM/YYYY");
        const registrations = item?.Registration?.includes(":")
            ? item.Registration.split(":")[1]
            : item?.Registration || "";
        const company = item?.Company?.includes(":")
            ? item.Company.split(":")[1]
            : item?.Company || "";
        const bank = item?.Bank || "";

        return (
            itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") &&
            item.Status !== "ยกเลิก" &&
            (
                registrations.toLowerCase().includes(search.toLowerCase()) ||
                company.toLowerCase().includes(search.toLowerCase()) ||
                bank.toLowerCase().includes(search.toLowerCase())
            )
        );
    });

    console.log("Report : ", reports);
    console.log("Report Detail : ", reportDetail);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangDelete = (id) => {
        ShowConfirm(
            `ต้องการลบบิลลำดับที่ ${id + 1} ใช่หรือไม่`,
            () => {
                database
                    .ref("report/invoice")
                    .child(id)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ลบข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกการลบบิลลำดับที่ ${id + 1}`);
            }
        );
    }

    return (
        // <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
        //     <Grid container>
        //         <Grid item xl={3.5} xs={12}>

        //         </Grid>
        //         <Grid item xl={6.5} xs={12}>
        //             <Typography
        //                 variant="h3"
        //                 fontWeight="bold"
        //                 textAlign="center"
        //                 gutterBottom
        //             >
        //                 บิลค่าใช้จ่าย
        //             </Typography>
        //         </Grid>
        //         <Grid item xl={2} xs={12} display="flex" justifyContent="center" alignItems="center">
        //             <Box width="200px">
        //                 <InsertFinancial />
        //             </Box>
        //         </Grid>
        //         <Grid item xl={5} xs={12}>
        //             <Box
        //                 sx={{
        //                     width: "100%", // กำหนดความกว้างของ Paper
        //                     height: "40px",
        //                     display: "flex",
        //                     alignItems: "center",
        //                     justifyContent: "center",
        //                     marginTop: { xl: -8, xs: 2 },
        //                     marginBottom: 3
        //                 }}
        //             >
        //                 <LocalizationProvider dateAdapter={AdapterDayjs}>
        //                     <DatePicker
        //                         openTo="day"
        //                         views={["year", "month", "day"]}
        //                         value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
        //                         format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
        //                         onChange={handleDateChangeDateStart}
        //                         slotProps={{
        //                             textField: {
        //                                 size: "small",
        //                                 fullWidth: true,
        //                                 inputProps: {
        //                                     value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
        //                                     readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
        //                                 },
        //                                 InputProps: {
        //                                     startAdornment: (
        //                                         <InputAdornment position="start" sx={{ marginRight: 2 }}>
        //                                             <b>วันที่ :</b>
        //                                         </InputAdornment>
        //                                     ),
        //                                     sx: {
        //                                         fontSize: "16px",
        //                                         height: "40px",
        //                                         padding: "10px",
        //                                         fontWeight: "bold",
        //                                     },
        //                                 },
        //                             },
        //                         }}
        //                     />
        //                     <DatePicker
        //                         openTo="day"
        //                         views={["year", "month", "day"]}
        //                         value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
        //                         format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
        //                         onChange={handleDateChangeDateEnd}
        //                         slotProps={{
        //                             textField: {
        //                                 size: "small",
        //                                 fullWidth: true,
        //                                 inputProps: {
        //                                     value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
        //                                     readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
        //                                 },
        //                                 InputProps: {
        //                                     startAdornment: (
        //                                         <InputAdornment position="start" sx={{ marginRight: 2 }}>
        //                                             <b>ถึงวันที่ :</b>
        //                                         </InputAdornment>
        //                                     ),
        //                                     sx: {
        //                                         fontSize: "16px",
        //                                         height: "40px",
        //                                         padding: "10px",
        //                                         fontWeight: "bold",
        //                                     },
        //                                 },
        //                             },
        //                         }}
        //                     />
        //                 </LocalizationProvider>
        //             </Box>
        //         </Grid>
        //     </Grid>
        //     <Divider sx={{ marginBottom: 1 }} />
        //     <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
        <Grid container spacing={2} width="100%" sx={{ marginTop: -1 }}>
            <Grid item xl={5.5} xs={12} >
                <Box
                    sx={{
                        width: "100%", // กำหนดความกว้างของ Paper
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: { xl: 0, xs: 1 },
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Paper sx={{ width: "100%" }}>
                            <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
                                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                onChange={handleDateChangeDateStart}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                            readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                        },
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>วันที่ :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                height: 35,
                                                "& .MuiInputBase-root": {
                                                    height: 35,
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "4px 8px",
                                                    fontSize: "0.85rem",
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    marginLeft: -1,
                                                    width: "100%"
                                                },
                                            }
                                        },
                                    },
                                }}
                            />
                        </Paper>
                        <Paper sx={{ width: "100%", marginLeft: 1 }}>
                            <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
                                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                onChange={handleDateChangeDateEnd}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                            readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                        },
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>ถึงวันที่ :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                height: 35,
                                                "& .MuiInputBase-root": {
                                                    height: 35,
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "4px 8px",
                                                    fontSize: "0.85rem",
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    marginLeft: -1,
                                                    width: "100%"
                                                },
                                            }
                                        },
                                    },
                                }}
                            />
                        </Paper>
                    </LocalizationProvider>
                </Box>
            </Grid>
            <Grid item xl={4.5} xs={12}>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ marginLeft: { xl: 0, xs: 1 }, }} >
                    {/* <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 0.5 }} gutterBottom>ค้นหา</Typography> */}
                    <Paper sx={{ width: "100%" }} >
                        <TextField
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            sx={{
                                '& .MuiInputBase-root': {
                                    height: 35, // ปรับความสูงรวม
                                },
                                '& .MuiInputBase-input': {
                                    padding: '4px 8px', // ปรับ padding ด้านใน input
                                    fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                },
                            }}
                            InputProps={{
                                sx: { height: 35 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <b>ค้นหา :</b>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Paper>
                </Box>
            </Grid>
            <Grid item xl={2} xs={12} display="flex" justifyContent="right" alignItems="center" sx={{ marginLeft: { xl: 0, xs: 1 }, }}>
                <InsertFinancial />
            </Grid>
            <Grid item xl={12} xs={12}>
                <TableContainer
                    component={Paper}
                    sx={{
                        maxWidth: "1350px",
                        height: "65vh",
                        overflowX: "auto", // แสดง scrollbar แนวนอน
                        marginLeft: { xl: 0, xs: 1 },
                    }}
                >
                    <Table
                        stickyHeader
                        size="small"
                        sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                    >
                        <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                                <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                    ลำดับ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เลขที่บิล
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    วันที่บิล
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    วันที่โอน
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                    ป้ายทะเบียน
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                    ชื่อบริษัท
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 350 }}>
                                    ชื่อบัญชี
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    ยอดก่อน Vat
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                    ยอด VAT
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                    รวม
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 400 }}>
                                    หมายเหตุ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", width: 50, position: "sticky", right: 0 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                reportDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.InvoiceID}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.SelectedDateInvoice}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.SelectedDateTransfer}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{`${row.Registration.split(":")[1]} (${row.TruckType})`}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Company.split(":")[1]}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Bank}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {row.Price?.toFixed(2)}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {row.Vat?.toFixed(2)}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {row.Total?.toFixed(2)}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Note}</TableCell>
                                        <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                                            {/* <Box display="flex" alignItems="center" justifyContent="center">
                                                    <Tooltip title="แก้ไขข้อมูล" placement="left" sx={{ marginRight: 1 }}>
                                                        <IconButton size="small" color="warning">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="ลบข้อมูล" placement="right">
                                                        <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                </Box> */}
                                            <Tooltip title="ลบข้อมูล" placement="right">
                                                <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {/* <Button variant="contained" size="small" color="error" fullWidth onClick={() => handleChangDelete(row.id)}>ลบ</Button> */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                    {
                        reportDetail.length <= 10 ? null :
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 30]}
                                component="div"
                                count={reportDetail.length}
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
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default Financial;
