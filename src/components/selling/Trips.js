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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HTTP } from "../../server/axios";
import Cookies from "js-cookie";
import Logo from "../../../public/logoPanda.jpg";
import InsertWholesale from "./InsertTrips";
import { database } from "../../server/firebase";

const Wholesale = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);

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
                datas[id].id !== 1 ?
                    dataTrip.push({ id, ...datas[id] })
                    : ""
            }
            setTrip(dataTrip);
        });
    };

    useEffect(() => {
        getTrip();
    }, []);


    return (
        <React.Fragment>
            <Grid container spacing={2}>
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
                            maxWidth: 1200,
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
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        สถานะ
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                        เพิ่มเที่ยววิ่งโดย
                                    </TablecellHeader>
                                    <TablecellHeader />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    trip.map((row) => (
                                        <TableRow>
                                            <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Date}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Depot}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Driver}/{row.Registration}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order1 === undefined ? "-" : row.Order1.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order2 === undefined ? "-" : row.Order2.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order3 === undefined ? "-" : row.Order3.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order4 === undefined ? "-" : row.Order4.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order5 === undefined ? "-" : row.Order5.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order6 === undefined ? "-" : row.Order6.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order7 === undefined ? "-" : row.Order7.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order8 === undefined ? "-" : row.Order8.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.WeightOil}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.WeightTruck}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{parseFloat(row.WeightOil) + parseFloat(row.WeightTruck)}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Status}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Employee}</TableCell>
                                        </TableRow>
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
