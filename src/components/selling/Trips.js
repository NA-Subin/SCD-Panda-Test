import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
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
import { RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import TripsDetail from "./TripsDetail";
import InsertTrips from "./InsertTrips";

const Trips = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [approve, setApprove] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [trip, setTrip] = useState([]);

    const getTrip = async () => {
        database.ref("/trip").on("value", (snapshot) => {
            const datas = snapshot.val();
            if (datas === null || datas === undefined) {
                setTrip([]);
            } else {
                const dataTrip = [];
                for (let id in datas) {
                    dataTrip.push({ id, ...datas[id] })
                }
                setTrip(dataTrip);
            }
        });
    };

    useEffect(() => {
        getTrip();
    }, []);

    console.log("Trip : ",trip);
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
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                เที่ยววิ่งรถ
            </Typography>
            <Box textAlign="right" marginTop={-8} marginBottom={4} marginRight={5}>
                <InsertTrips />
            </Box>
            <Divider sx={{ marginBottom: 2 }} />
                        <Grid container spacing={2} width="100%">
                            <Grid item xs={12}>
                                <Typography variant='subtitle1' fontWeight="bold" sx={{ marginBottom: -2, fontSize: "12px", color: "red",textAlign: "right", marginRight: 7 }} gutterBottom>*ดูรายละเอียดและแก้ไขการจัดเที่ยววิ่งรถตรงนี้*</Typography>
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        maxWidth: "1200px",
                                        overflowX: "auto", // แสดง scrollbar แนวนอน
                                        marginTop: 2,
                                    }}
                                >
                                    <Table
                                        stickyHeader
                                        size="small"
                                        sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                    >
                                        <TableHead>
                                            <TableRow sx={{ height: "7vh" }}>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                    ลำดับ
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                    วันที่
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                                    คลังรับน้ำมัน
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 350 }}>
                                                    ชื่อ/ทะเบียนรถ
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                                    ลำดับที่ 1
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                                    ลำดับที่ 2
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                                    ลำดับที่ 3
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                                    ลำดับที่ 4
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                                    ลำดับที่ 5
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                                    ลำดับที่ 6
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                                    ลำดับที่ 7
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                                    ลำดับที่ 8
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                    ค่าเที่ยว
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                    ปริมาณน้ำมัน
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                    น้ำหนักรถ
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                    น้ำหนักรวม
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                    สถานะ
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 70, position: "sticky", right: 0 }}/>
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
                                                trip.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                                    <TripsDetail key={row.id} trips={row} windowWidth={windowWidth} />
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {
                                    trip.length < 10 ? null :
                                        <TablePagination
                                            rowsPerPageOptions={[10, 25, 30]}
                                            component="div"
                                            count={trip.length}
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

export default Trips;
