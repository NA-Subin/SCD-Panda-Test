import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
    ShowConfirm,
    ShowError,
    ShowInfo,
    ShowSuccess,
    ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/th';
import { database } from "../../server/firebase";
import { TablecellHeader } from "../../theme/style";

const Driver = () => {
    const [truck, setTruck] = React.useState("0:0:0");
    const branches = [
        "( สาขาที่  00001)/",
        "( สาขาที่  00002)/",
        "( สาขาที่  00003)/",
        "(สำนักงานใหญ่)/"
    ];

    const navigate = useNavigate();

    const [driver, setDriver] = useState([]);
    const [trip, setTrip] = useState([]);
    const [order, setOrder] = useState([]);
    const [tripNew, setTripNew] = useState([]);
    const [orderNew, setOrderNew] = useState([]);

    const getTrip = async () => {
        database.ref("/truck/registration").on("value", (snapshot) => {
            const datas = snapshot.val();
            if (datas === null || datas === undefined) {
                setDriver([]);
            } else {
                const dataDriver = [];
                for (let id in datas) {
                    if (datas[id].Driver !== "ไม่มี") {
                        dataDriver.push({ id, ...datas[id] })
                    }
                }
                setDriver(dataDriver);
            }
        });

        database.ref("/trip").on("value", (snapshot) => {
            const datas = snapshot.val();
            if (datas === null || datas === undefined) {
                setTrip([]);
            } else {
                const dataTrip = [];
                for (let id in datas) {
                    if (datas[id].Status !== "จบทริป") {
                        dataTrip.push({ id, ...datas[id] })
                    }
                }
                setTrip(dataTrip);
            }
        });

        database.ref("/order").on("value", (snapshot) => {
            const datas = snapshot.val();
            if (datas === null || datas === undefined) {
                setOrder([]);
            } else {
                const dataOrder = [];
                for (let id in datas) {
                    dataOrder.push({ id, ...datas[id] })
                }
                setOrder(dataOrder);
            }
        });
    };

    useEffect(() => {
        getTrip();
    }, []);

    useEffect(() => {
        const check = trip.find((item) => item.Driver === truck.split(":")[0]) || {};
        const checkOrder = order.filter((item) => item.Trip === (check.id - 1))

        const tripNewData = Object.keys(check)
            .filter(key => key.startsWith("Order")) // เอาเฉพาะ Order1, Order2, Order3
            .reduce((acc, key, index) => {
                acc[index] = { Name: check[key], No: index };
                return acc;
            }, {});

        setTripNew(tripNewData);
        setOrderNew(checkOrder);
    }, [trip, order]); // อัปเดตเมื่อ orderNew เปลี่ยน

    const handleChangeDriver = (e) => {
        const trucks = e.target.value;
        setTruck(e.target.value);
        const check = trip.find((item) => item.Driver === trucks.split(":")[0]) || {};
        const checkOrder = order.filter((item) => item.Trip === (check.id - 1))

        const tripNew = Object.keys(check)
            .filter(key => key.startsWith("Order")) // เอาเฉพาะ Order1, Order2, Order3
            .reduce((acc, key, index) => {
                acc[index] = { Name: check[key], No: index };
                return acc;
            }, {});

        setTripNew(tripNew);
        setOrderNew(checkOrder);
    }

    const handleSaveStatus = (no, ticketname) => {
        database
            .ref("order/")
            .child(no)
            .update({
                Status: "จัดส่งสำเร็จ"
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    const handleBack = () => {
        navigate("/choose");
    }

    console.log("Trip : ", trip);
    console.log("Truck : ", truck.split(":")[1]);
    console.log("TripNew : ", Object.keys(tripNew).length);

    return (
        <Container sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: { xs: "lg", sm: "lg", md: "lg" } }}>
            <Paper
                sx={{
                    borderRadius: 5,
                    boxShadow: "1px 1px 2px 2px rgba(0, 0, 0, 0.5)",
                }}
            >
                <Box
                    height={50}
                    sx={{
                        backgroundColor: theme.palette.panda.main,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                />
                <Box sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    marginTop: { xs: -2, sm: -3, md: -4 },
                    marginBottom: { xs: -1, sm: -2, md: -3 },
                }}>
                    <Box textAlign="right" marginTop={-6.5} marginBottom={4} sx={{ marginRight: { xs: -2, sm: -3, md: -4 } }}>
                        {
                            //    isMobile ?
                            //        <>
                            //            <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }}><ReplyAllIcon fontSize="small" /></Button>
                            //</Box>        </>

                            //        :
                            //        <>
                            <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<ReplyAllIcon fontSize="small" />} onClick={handleBack}>กลับหน้าแรก</Button>
                            //        </>

                        }
                    </Box>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        color={theme.palette.panda.main}
                        gutterBottom
                    >
                        ยินดีต้อนรับเข้าสู่หน้าพนักงานขับรถ
                    </Typography>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        marginTop={-1}
                    >
                        <img src={Logo} width="150" />
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            marginLeft={-4.7}
                            marginTop={3.7}
                        >
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.error.main}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                S
                            </Typography>
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.warning.light}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                C
                            </Typography>
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.info.dark}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                D
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={1} md={2} lg={3} />
                    <Grid item xs={10} md={8} lg={6} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ชื่อพนักงานขับรถ/ทะเบียนรถ</Typography>
                        <FormControl variant="standard" sx={{ m: 1, width: "100%" }}>
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                value={truck}
                                onChange={handleChangeDriver}
                                fullWidth
                            >
                                <MenuItem value={"0:0:0"}>กรุณาเลือกรถบรรทุก</MenuItem>
                                {
                                    driver.map((row) => (
                                        <MenuItem value={`${row.Driver}:${row.RegHead}:${row.RegTail}`}>{`${row.Driver}:${row.RegHead}:${row.RegTail}`}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={1} md={2} lg={3} />
                    <Grid item xs={0.5} md={1} lg={1.5} />
                    <Grid item xs={11} md={10} lg={9}>
                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "right" }} gutterBottom>*กดปุ่มจัดส่งแล้วเมื่อถึงจุดส่ง*</Typography>
                        <TableContainer
                            component={Paper}
                        >
                            <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                <TableHead sx={{ height: "5vh" }}>
                                    <TableRow>
                                        <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                            ชื่อลูกค้า
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            สินค้า
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ปริมาณ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        Object.entries(tripNew).map(([key, value], index) => (
                                            orderNew.map((row) => {
                                                // หาค่าที่ต้อง split
                                                let modifiedTicketName = row.TicketName;

                                                branches.forEach(branch => {
                                                    if (row.TicketName.includes(branch)) {
                                                        modifiedTicketName = row.TicketName.split(branch).pop().trim(); // เอาค่าหลังจาก branch และตัดช่องว่างออก
                                                    }
                                                });

                                                return modifiedTicketName === value.Name && (
                                                    Object.entries(row.Product).map(([key, volume]) => (
                                                        key !== "P" &&
                                                        <TableRow key={key}>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {value.No + 1}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {row.TicketName}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {key}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {volume.Volume * 1000}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {
                                                                    row.Status === "จัดส่งสำเร็จ" ?
                                                                        <Typography variant="subtitle2" fontWeight="bold" color="success" gutterBottom>จัดส่งสำเร็จ</Typography>
                                                                        :
                                                                        <Button variant="contained" size="small" color="primary" onClick={() => handleSaveStatus(row.No, row.TicketName)}>จัดส่งแล้ว</Button>
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )
                                            })))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    <Grid item xs={0.5} md={1} lg={1.5} />
                </Grid>
                {
                    Object.keys(tripNew).length === 0 ?
                        <Grid container spacing={2} marginTop={3} marginBottom={3}>
                            <Grid item xs={3.5}></Grid>
                            <Grid item xs={5}>
                                <Paper sx={{ p: 5, backgroundColor: "lightgray" }}>
                                    <Typography variant="h6" textAlign="center" fontWeight="bold" gutterBottom>ไม่มีเที่ยววิ่ง</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={3.5}></Grid>
                        </Grid>
                        :
                        <Grid container paddingLeft={10} paddingRight={10} marginTop={3} marginBottom={3}>
                            <Grid item xs={5.5} />
                            <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
                                <Box sx={{ width: "3px", height: "100px", backgroundColor: "black" }} />
                            </Grid>
                            <Grid item xs={5.5} />
                            {Object.entries(tripNew).map(([key, value], index) => (
                                orderNew.map((row) => {
                                    // หาค่าที่ต้อง split
                                    let modifiedTicketName = row.TicketName;

                                    branches.forEach(branch => {
                                        if (row.TicketName.includes(branch)) {
                                            modifiedTicketName = row.TicketName.split(branch).pop().trim(); // เอาค่าหลังจาก branch และตัดช่องว่างออก
                                        }
                                    });

                                    return modifiedTicketName === value.Name && (
                                        <React.Fragment key={key}>
                                            {index % 2 === 0 ? (
                                                // แสดงข้อมูลฝั่งซ้าย
                                                <>
                                                    <Grid item xs={5.5}>
                                                        <Paper sx={{ p: 2, borderRight: row.Status === undefined ? "15px solid " + theme.palette.warning.main : "15px solid " + theme.palette.success.main }}>
                                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{`สินค้าลำดับที่ ${value.No + 1}`}</Typography>
                                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{row.TicketName}</Typography>
                                                            {
                                                                Object.entries(row.Product).map(([key, value]) => (
                                                                    key !== "P" &&
                                                                    <Box key={key}>
                                                                        <Typography variant="subtitle1" fontWeight="bold">ประเภทน้ำมัน: {key}</Typography>
                                                                        <Typography variant="subtitle2">ปริมาณ: {value.Volume * 1000} ลิตร</Typography>
                                                                    </Box>
                                                                ))
                                                            }
                                                            <Typography variant="subtitle2" fontWeight="bold" textAlign="right" marginBottom={-2} color={row.Status === undefined ? "warning" : "success"} gutterBottom>{row.Status === undefined ? "กำลังจัดส่ง" : row.Status}</Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
                                                        <Box sx={{ width: "50px", height: "5px", backgroundColor: "black" }} />
                                                        <Box sx={{ width: "5px", height: "100%", backgroundColor: "black" }} />
                                                        <Box sx={{ width: "50px", height: "5px", backgroundColor: "white" }} />
                                                    </Grid>
                                                    <Grid item xs={5.5} />
                                                </>
                                            ) : (
                                                // แสดงข้อมูลฝั่งขวา
                                                <>
                                                    <Grid item xs={5.5} />
                                                    <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
                                                        <Box sx={{ width: "50px", height: "5px", backgroundColor: "white" }} />
                                                        <Box sx={{ width: "5px", height: "100%", backgroundColor: "black" }} />
                                                        <Box sx={{ width: "50px", height: "5px", backgroundColor: "black" }} />
                                                    </Grid>
                                                    <Grid item xs={5.5}>
                                                        <Paper sx={{ p: 2, borderLeft: row.Status === undefined ? "15px solid " + theme.palette.warning.main : "15px solid " + theme.palette.success.main }}>
                                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{`สินค้าลำดับที่ ${value.No + 1}`}</Typography>
                                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{row.TicketName}</Typography>
                                                            {
                                                                Object.entries(row.Product).map(([key, value]) => (
                                                                    key !== "P" &&
                                                                    <Box key={key}>
                                                                        <Typography variant="subtitle1" fontWeight="bold">ประเภทน้ำมัน: {key}</Typography>
                                                                        <Typography variant="subtitle2">ปริมาณ: {value.Volume * 1000} ลิตร</Typography>
                                                                    </Box>
                                                                ))
                                                            }
                                                            <Typography variant="subtitle2" fontWeight="bold" textAlign="right" marginBottom={-2} color={row.Status === undefined ? "warning" : "success"} gutterBottom>{row.Status === undefined ? "กำลังจัดส่ง" : row.Status}</Typography>
                                                        </Paper>
                                                    </Grid>
                                                </>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ))}
                            <Grid item xs={5.5} />
                            <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
                                <Box sx={{ width: "3px", height: "100px", backgroundColor: "black" }} />
                            </Grid>
                            <Grid item xs={5.5} />
                        </Grid>
                }
                <Box
                    height={50}
                    sx={{
                        backgroundColor: theme.palette.panda.light,
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                    }}
                />
            </Paper>
        </Container>
    );
};

export default Driver;
