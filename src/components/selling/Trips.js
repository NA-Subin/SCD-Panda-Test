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

const Wholesale = () => {
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
            const dataTrip = [];
            for (let id in datas) {
                if (datas[id].id !== 1) {
                    dataTrip.push({ id, ...datas[id] })
                }
            }
            setTrip(dataTrip);
        });
    };

    useEffect(() => {
        getTrip();
    }, []);

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


    return (
        <React.Fragment>
            <Grid container spacing={2} sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 150) : windowWidth <= 600 ? (windowWidth - 50) : (windowWidth - 300) }}>
                <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        รายการขายน้ำมัน
                    </Typography>
                    <Divider sx={{ marginTop: 1 }} />
                </Grid>
                <Grid item xs={12}>
                    <TableContainer
                        component={Paper}
                        style={{ maxHeight: "90vh" }}
                        sx={{
                            maxWidth: "1200px",
                            overflowX: "auto", // แสดง scrollbar แนวนอน
                            marginTop: 2,
                        }}
                    >
                        <Table
                            stickyHeader
                            size="small"
                            sx={{
                                tableLayout: "fixed", // บังคับความกว้างของคอลัมน์
                            }}
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
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
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
                                        ปริมาณน้ำมัน
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                        น้ำหนักรถ
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                        น้ำหนักรวม
                                    </TablecellHeader>
                                    <TablecellHeader sx={{
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
                                    } />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    trip.map((row) => (
                                        <TripsDetail key={row.id} trips={row} windowWidth={windowWidth} />
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            
        </React.Fragment>

    );
};

export default Wholesale;
