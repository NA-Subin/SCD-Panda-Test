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
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
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
import theme from "../../theme/theme";
import { RateOils, TablecellHeader, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import TripsDetail from "./TripsDetail";
import InsertTrips from "./InsertTrips";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const TripsSmallTruck = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [approve, setApprove] = React.useState(false);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [check, setCheck] = useState(2);

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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // const { trip } = useData();
    const { trip } = useTripData();
    const trips = Object.values(trip || {});

    //const tripDetail = trips.filter((item) => item.TruckType === "รถเล็ก" && item.StatusTrip !== "ยกเลิก" );
    const tripDetail = trips.filter((item) => {
        // const itemDateR = dayjs(item.DateReceive, "DD/MM/YYYY");
        // const itemDateD = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const itemDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        return (
            check === 2 ?
                item.TruckType === "รถเล็ก" &&
                item.StatusTrip === "กำลังจัดเที่ยววิ่ง" &&
                //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
                : check === 3 ?
                    item.TruckType === "รถเล็ก" &&
                    item.StatusTrip === "ยกเลิก" &&
                    //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                    itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
                    : check === 4 ?
                        item.TruckType === "รถเล็ก" &&
                        item.StatusTrip === "จบทริป" &&
                        //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                        itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
                        :
                        item.TruckType === "รถเล็ก" &&
                        //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                        itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
        );
    }).sort((a, b) => {
        const dateA = dayjs(a.DateReceive, "DD/MM/YYYY");
        const dateB = dayjs(b.DateReceive, "DD/MM/YYYY");

        if (dateB.isAfter(dateA)) return 1;
        if (dateB.isBefore(dateA)) return -1;

        // ถ้าวันเท่ากัน ให้เรียงตาม id มากไปน้อย
        return b.id - a.id;
    });

    console.log("Trip Detail : ", tripDetail);

    console.log("Trip : ", tripDetail);
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
            {/* <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                เที่ยววิ่งรถเล็ก
            </Typography>
            <Box textAlign="right" marginTop={-8} marginBottom={4} marginRight={5}>
                <InsertTrips />
            </Box> */}
            <Grid container spacing={2}>
                <Grid item md={4} xs={12}>

                </Grid>
                <Grid item md={6} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        เที่ยววิ่งรถเล็ก
                    </Typography>
                </Grid>
                <Grid item md={2} xs={12}>
                    <Box sx={{ textAlign: { xs: "center" }, marginTop: { xs: -2, md: 0 } }}>
                        <InsertTrips />
                    </Box>
                </Grid>
                <Grid item md={5} xs={12}>
                    <Box
                        sx={{
                            width: "100%", // กำหนดความกว้างของ Paper
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: { md: -10, xs: 2 },
                            marginBottom: 3
                        }}
                    >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={dayjs(selectedDateStart)} // แปลงสตริงกลับเป็น dayjs object
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
                                value={dayjs(selectedDateEnd)} // แปลงสตริงกลับเป็น dayjs object
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
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                <Grid container spacing={2} width="100%">
                    <Grid item xs={12}>
                        <FormGroup row sx={{ marginBottom: -2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                            <FormControlLabel control={<Checkbox checked={check === 1 ? true : false} />} onChange={() => setCheck(1)} label="ทั้งหมด" />
                            <FormControlLabel control={<Checkbox checked={check === 2 ? true : false} />} onChange={() => setCheck(2)} label="กำลังจัดเที่ยววิ่ง" />
                            <FormControlLabel control={<Checkbox checked={check === 3 ? true : false} />} onChange={() => setCheck(3)} label="ยกเลิก" />
                            <FormControlLabel control={<Checkbox checked={check === 4 ? true : false} />} onChange={() => setCheck(4)} label="จบทริป" />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='subtitle1' fontWeight="bold" sx={{ marginBottom: -2, fontSize: "12px", color: "red", textAlign: "right", marginRight: 7 }} gutterBottom>*ดูรายละเอียด/แก้ไขการจัดเที่ยววิ่ง/กดจบทริปตรงนี้*</Typography>
                        <TableContainer
                            component={Paper}
                            sx={{
                                maxWidth: "1350px",
                                overflowX: "auto", // แสดง scrollbar แนวนอน
                                marginTop: 2,
                            }}
                        >
                            <Table
                                stickyHeader
                                size="small"
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1350px" }}
                            >
                                <TableHead>
                                    <TableRow sx={{ height: "7vh" }}>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ลำดับ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            วันที่รับ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            วันที่ส่ง
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 350 }}>
                                            ชื่อ/ทะเบียนรถ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                            ลำดับที่ 1
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                            ลำดับที่ 2
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                            ลำดับที่ 3
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                            ลำดับที่ 4
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                            ลำดับที่ 5
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                            ลำดับที่ 6
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                            ลำดับที่ 7
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                            ลำดับที่ 8
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            ค่าเที่ยว
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            ปริมาณน้ำมัน
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            น้ำหนักรถ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            น้ำหนักรวม
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            สถานะ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 100, position: "sticky", right: 0 }} />
                                        {/* <TablecellHeader sx={{
                                                    textAlign: "center", fontSize: 16, width: 100, position: "sticky",
                                                    right: windowWidth <= 900 ? 0 : "200px", // ติดซ้ายสุด
                                                    zIndex: windowWidth <= 900 ? 2 : 4,
                                                }}>
                                                    สถานะ
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                                    เพิ่มเที่ยววิ่งโดย
                                                </TablecellHeader>
                                                <TablecellHeader sx={
                                                    windowWidth <= 900 ?
                                                        {
                                                            width: 200,
                                                        }
                                                        :
                                                        {
                                                            width: 200, position: "sticky",
                                                            right: 0, // ระยะที่ชิดซ้ายต่อจากเซลล์ก่อนหน้า
                                                            backgroundColor: theme.palette.panda.light, // ใส่พื้นหลังเพื่อไม่ให้โปร่งใส
                                                            zIndex: 2,
                                                        }
                                                } /> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        tripDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                            <TripsDetail key={row.id} trips={row} index={index} windowWidth={windowWidth} />
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {
                            tripDetail.length < 10 ? null :
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 30]}
                                    component="div"
                                    count={tripDetail.length}
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
            </Box>
        </Container>

    );
};

export default TripsSmallTruck;
