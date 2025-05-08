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
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InsertDeducetionIncome from "./InsertDeductionIncome";

const DeductionOfIncome = () => {

    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(false);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [driverDetail, setDriver] = React.useState([]);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));

    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateStart(formattedDate);
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateEnd(formattedDate);
        }
    };

    const { report } = useData();
    const reports = Object.values(report || {});
    // const reportDetail = reports.filter((row) => row.Status !== "ยกเลิก")

    const reportDetail = reports
        .filter((item) => {
            const itemDate = dayjs(item.SelectedDateInvoice, "DD/MM/YYYY");
            return (
                itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") &&
                item.Status !== "ยกเลิก"
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

    const formatmonth = (dateString) => {
        if (!dateString) return "ไม่พบข้อมูลวันที่"; // ถ้า undefined หรือ null ให้คืนค่าเริ่มต้น

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day); // month - 1 เพราะ JavaScript นับเดือนจาก 0-11

        const formattedDate = new Intl.DateTimeFormat("th-TH", {
            month: "long",
        }).format(date); // ดึงชื่อเดือนภาษาไทย

        return `${formattedDate}`;
    };

    const formatyear = (dateString) => {
        if (!dateString || !dateString.includes("/")) return "ไม่พบข้อมูลวันที่";

        const [day, month, year] = dateString.split("/").map(Number);
        if (!day || !month || !year) return "รูปแบบวันที่ไม่ถูกต้อง";

        return `${year}`;
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
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
            <Grid container>
                <Grid item xs={4}>

                </Grid>
                <Grid item xs={6}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        รายการหักค่าใช้จ่าย
                    </Typography>
                </Grid>
                <Grid item xs={2}>
                    <InsertDeducetionIncome />
                </Grid>
            </Grid>
            <Box
                sx={{
                    width: "100%", // กำหนดความกว้างของ Paper
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: -8,
                    marginBottom: 3,
                    width: 550
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        openTo="day"
                        views={["year", "month", "day"]}
                        value={dayjs(selectedDateStart, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                        format="DD/MM/YYYY"
                        onChange={handleDateChangeDateStart}
                        sx={{ marginRight: 2, }}
                        slotProps={{
                            textField: {
                                size: "small",
                                fullWidth: true,
                                InputProps: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                            วันที่เริ่มต้น :
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                        height: "40px",  // ความสูงของ Input
                                        padding: "10px", // Padding ภายใน Input
                                        fontWeight: "bold",
                                    },
                                },
                            },
                        }}
                    />
                    <DatePicker
                        openTo="day"
                        views={["year", "month", "day"]}
                        value={dayjs(selectedDateEnd, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                        format="DD/MM/YYYY"
                        onChange={handleDateChangeDateEnd}
                        slotProps={{
                            textField: {
                                size: "small",
                                fullWidth: true,
                                InputProps: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                            วันที่สิ้นสุด :
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                        height: "40px",  // ความสูงของ Input
                                        padding: "10px", // Padding ภายใน Input
                                        fontWeight: "bold",
                                    },
                                },
                            },
                        }}
                    />
                </LocalizationProvider>
            </Box>
            <Divider sx={{ marginBottom: 1 }} />
            <Grid container spacing={2} width="100%">
                <Grid item xs={12}>
                    <TableContainer
                        component={Paper}
                        sx={{
                            height: "65vh",
                            marginTop: 2,
                        }}
                    >
                        <Table
                            stickyHeader
                            size="small"
                            sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                        >
                            <TableHead sx={{ height: "5vh" }}>
                                <TableRow>
                                    <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                        ลำดับ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                        พนักงานขับรถ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        เลขที่
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                        ชื่อรายการที่หัก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        รายได้
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        รายหัก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                        รวม
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 50, position: "sticky", right: 0 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ textAlign: "center" }}> </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}> </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}> </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}> </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}> </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}> </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}> </TableCell>
                                    <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                                        <Button variant="contained" size="small" color="error" fullWidth
                                        //onClick={() => handleChangDelete(row.id)}
                                        >ลบ</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        {/* {
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
                        } */}
                    </TableContainer>
                </Grid>
            </Grid>
        </Container>

    );
};

export default DeductionOfIncome;
