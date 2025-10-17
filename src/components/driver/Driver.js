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
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/th';
import { database } from "../../server/firebase";
import { TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellSelling, TableCellPWD } from "../../theme/style";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const Driver = () => {
    const [truck, setTruck] = React.useState("0:0:0");
    const branches = [
        "( สาขาที่  00001)/",
        "( สาขาที่  00002)/",
        "( สาขาที่  00003)/",
        "(สำนักงานใหญ่)/"
    ];

    const navigate = useNavigate();
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

    // const [driver, setDriver] = useState([]);
    // const [trip, setTrip] = useState([]);
    // const [order, setOrder] = useState([]);
    const [tripNew, setTripNew] = useState([]);
    const [orderNew, setOrderNew] = useState([]);
    // const [depot, setDepot] = useState([]);
    const [depotNew, setDepotNew] = useState([]);
    const [showTrip, setShowTrip] = useState(true);
    const [check, setCheck] = useState({});

    // const getTrip = async () => {
    //     database.ref("/truck/registration").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         if (datas === null || datas === undefined) {
    //             setDriver([]);
    //         } else {
    //             const dataDriver = [];
    //             for (let id in datas) {
    //                 if (datas[id].Driver !== "ไม่มี") {
    //                     dataDriver.push({ id, ...datas[id] })
    //                 }
    //             }
    //             setDriver(dataDriver);
    //         }
    //     });

    //     database.ref("/trip").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         if (datas === null || datas === undefined) {
    //             setTrip([]);
    //         } else {
    //             const dataTrip = [];
    //             for (let id in datas) {
    //                 if (datas[id].StatusTrips === "กำลังจัดเที่ยววิ่ง" || (datas[id].StatusTrips === "จบทริป" && datas[id].DateEnd === dayjs(new Date).format("DD/MM/YYYY"))) {
    //                     dataTrip.push({ id, ...datas[id] })
    //                 }
    //             }
    //             setTrip(dataTrip);
    //         }
    //     });

    //     database.ref("/order").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         if (datas === null || datas === undefined) {
    //             setOrder([]);
    //         } else {
    //             const dataOrder = [];
    //             for (let id in datas) {
    //                 dataOrder.push({ id, ...datas[id] })
    //             }
    //             setOrder(dataOrder);
    //         }
    //     });

    //     database.ref("/depot/oils").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         if (datas === null || datas === undefined) {
    //             setDepot([]);
    //         } else {
    //             const dataDepot = [];
    //             for (let id in datas) {
    //                 dataDepot.push({ id, ...datas[id] })
    //             }
    //             setDepot(dataDepot);
    //         }
    //     });
    // };

    // useEffect(() => {
    //     getTrip();
    // }, []);

    // const { reghead, trip, order, depots } = useData();
    const { reghead, depots } = useBasicData();
    const { trip, order } = useTripData();

    const drivers = Object.values(reghead || {});
    // const trips = Object.values(trip || {});
    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/06/2025", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });
    // const orders = Object.values(order || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/06/2025", "DD/MM/YYYY"), 'day');
    });
    const depot = Object.values(depots || {});

    // กรองตามเงื่อนไขที่ต้องการหลังจาก data มาแล้ว
    const driver = drivers.filter(d => d.Driver !== "0:ไม่มี");

    const today = dayjs(new Date()).format("DD/MM/YYYY");
    const tripDetail = trips.filter(t =>
        t.StatusTrip === "กำลังจัดเที่ยววิ่ง"
        ||
        (t.StatusTrip === "จบทริป" && t.DateEnd === today)
    );

    useEffect(() => {
        console.log("driver and truck : ", truck);
        const check = tripDetail.find((item) => Number(item.Driver.split(":")[0]) === Number(truck.split(":")[0])) || {};
        console.log("check : ", check);
        const checkOrder = orders.filter((item) => item.Trip === (check.id - 1))
        console.log("checkOrder : ", checkOrder);

        const depotZone = typeof check.Depot === "string" ? check.Depot.split(":")[1] : null;
        const checkDepot = depot.find((item) => item.Zone === depotZone) || {};

        console.log("check : ", check);

        const tripNewData = Object.keys(check)
            .filter(key => key.startsWith("Order")) // เอาเฉพาะ Order1, Order2, Order3
            .reduce((acc, key, index) => {
                acc[index] = { Name: check[key], No: index };
                return acc;
            }, {});

        setCheck(check);
        setTripNew(tripNewData);
        setOrderNew(checkOrder);
        setDepotNew(checkDepot);

        if (
            checkOrder.length > 0 &&
            checkOrder.every(item => item.Status === "จัดส่งสำเร็จ")
        ) {
            database
                .ref("trip/")
                .child(check.id - 1)
                .update({
                    StatusTrips: "จบทริป",
                    DateEnd: dayjs(new Date).format("DD/MM/YYYY")
                })
                .then(() => {
                    console.log("Data pushed successfully");
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        }

    }, [truck]); // อัปเดตเมื่อ orderNew เปลี่ยน

    const handleChangeDriver = (e) => {
        const trucks = e.target.value;
        console.log("trucks : ", trucks);
        setTruck(e.target.value);
        const check = tripDetail.find((item) => Number(item.Driver.split(":")[0]) === Number(trucks.split(":")[0])) || {};
        console.log("check : ", check);
        const checkOrder = orders.filter((item) => item.Trip === (check.id - 1))
        console.log("checkOrder : ", checkOrder);

        const depotZone = typeof check.Depot === "string" ? check.Depot.split(":")[1] : null;
        const checkDepot = depot.find((item) => item.Zone === depotZone) || {};

        console.log("depotZone : ", depotZone);
        console.log("checkDepot : ", checkDepot);

        const tripNew = Object.keys(check)
            .filter(key => key.startsWith("Order")) // เอาเฉพาะ Order1, Order2, Order3
            .reduce((acc, key, index) => {
                acc[index] = { Name: check[key], No: index, Depot: check.Depot };
                return acc;
            }, {});

        setCheck(check);
        setTripNew(tripNew);
        setOrderNew(checkOrder);
        setDepotNew(checkDepot);

        if (
            checkOrder.length > 0 &&
            checkOrder.every(item => item.Status === "จัดส่งสำเร็จ")
        ) {
            database
                .ref("trip/")
                .child(check.id - 1)
                .update({
                    StatusTrips: "จบทริป",
                    DateEnd: dayjs(new Date).format("DD/MM/YYYY")
                })
                .then(() => {
                    console.log("Data pushed successfully");
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        }
    }

    const handleSaveStatus = (no) => {
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

    const formatAddress = (address) => {
        // แยกข้อมูลจาก address โดยใช้ , หรือ เว้นวรรคเป็นตัวแบ่ง
        const parts = address.split(/,|\s+/).filter(Boolean);

        if (parts.length < 5) return "-";

        const [houseNo, moo, subdistrict, district, province, postalCode] = parts;

        return `${houseNo} หมู่ ${moo} ต.${subdistrict} อ.${district} จ.${province} ${postalCode}`;
    };

    console.log("Trip : ", tripDetail);
    console.log("Truck : ", truck.split(":")[1]);
    console.log("TripNew : ", tripNew);
    console.log("TripNew length : ", Object.keys(tripNew).length);
    console.log("DepotNew : ", depotNew);
    console.log("OrderNew : ", orderNew);
    console.log("check : ", check);

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
                    <Box
                        display="flex"
                        justifyContent="left"
                        alignItems="center"
                        marginTop={-3}
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
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            textAlign="center"
                            color={theme.palette.panda.main}
                            sx={{ marginTop: 5, marginLeft: 1 }}
                            gutterBottom
                        >
                            ยินดีต้อนรับเข้าสู่หน้าพนักงานขับรถ
                        </Typography>
                    </Box>
                    <Divider />
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={0.5} lg={1} />
                    <Grid item xs={11} lg={10} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ชื่อพนักงานขับรถ/ทะเบียนรถ</Typography>
                        <FormControl variant="standard" sx={{ m: 1, width: "100%" }}>
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                value={truck}
                                onChange={handleChangeDriver}
                                sx={{
                                    px: 3, // padding ซ้าย-ขวา
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 180, // กำหนดความสูงของ dropdown
                                            overflowY: "auto", // เปิดใช้งาน scrollbar แนวตั้ง
                                        },
                                    },
                                }}
                                fullWidth
                            >
                                <MenuItem value={"0:0:0"}>กรุณาเลือกรถบรรทุก</MenuItem>
                                {
                                    driver.map((row) => (
                                        <MenuItem value={`${row.Driver}:${row.RegHead}:${row.RegTail}`}>{`${row.Driver ? row.Driver.split(":")[1] : ""} / ${row.RegHead}:${row.RegTail ? row.RegTail.split(":")[1] : ""}`}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={0.5} lg={1} />
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
                        <>
                            <Grid container spacing={2}>
                                <Grid item xs={0.5} lg={1} />
                                <Grid item xs={11} lg={10}>
                                    <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: theme.palette.error.main, textAlign: "right" }} gutterBottom>*กดปุ่มจัดส่งแล้วเมื่อถึงจุดส่ง*</Typography>
                                    <TableContainer
                                        component={Paper}
                                    >
                                        <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: { xs: "12px", sm: "8px", md: "4px" } } }}>
                                            <TableHead sx={{ height: "5vh" }}>
                                                <TableRow>
                                                    <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                                        ลำดับ
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 350 }}>
                                                        ชื่อลูกค้า
                                                    </TablecellSelling>
                                                    <TableCellG95 sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                                        G95
                                                    </TableCellG95>
                                                    <TableCellB95 sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                                        B95
                                                    </TableCellB95>
                                                    <TableCellB7 sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                                        B7(D)
                                                    </TableCellB7>
                                                    <TableCellG91 sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                                        G91
                                                    </TableCellG91>
                                                    <TableCellE20 sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                                        E20
                                                    </TableCellE20>
                                                    <TableCellPWD sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                                        PWD
                                                    </TableCellPWD>
                                                    <TablecellSelling sx={{ width: 100, position: "sticky", right: 0 }} />
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
                                                                <TableRow key={key}>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {value.No + 1}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {row.TicketName.split(":")[1]}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {row.Product.G95 === undefined ? "-" : row.Product.G95.Volume * 1000}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {row.Product.B95 === undefined ? "-" : row.Product.B95.Volume * 1000}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {row.Product.B7 === undefined ? "-" : row.Product.B7.Volume * 1000}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {row.Product.G91 === undefined ? "-" : row.Product.G91.Volume * 1000}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {row.Product.E20 === undefined ? "-" : row.Product.E20.Volume * 1000}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {row.Product.PWD === undefined ? "-" : row.Product.PWD.Volume * 1000}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                                                                        {
                                                                            row.Status === "จัดส่งสำเร็จ" ?
                                                                                <Typography variant="subtitle2" fontWeight="bold" color="success" gutterBottom>จัดส่งสำเร็จ</Typography>
                                                                                :
                                                                                <Button variant="contained" sx={{
                                                                                    fontSize: { xs: "16px", sm: "14px", md: "12px" },
                                                                                    padding: { xs: "12px 20px", sm: "10px 18px", md: "8px 16px" },
                                                                                    whiteSpace: "nowrap"
                                                                                }} color="primary" onClick={() => handleSaveStatus(row.No)}>จัดส่งแล้ว</Button>
                                                                        }
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        })))
                                                }
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid item xs={0.5} lg={1} />
                            </Grid>
                            {
                                windowWidth > 650 ?
                                    <Grid container paddingLeft={10} paddingRight={10} marginTop={3} marginBottom={3}>
                                        <Grid item xs={12} textAlign="center" marginTop={2} marginBottom={3}>
                                            <Typography variant="subtitle2" fontSize="12px" fontWeight="bold" color={theme.palette.error.main} gutterBottom>*ถ้าต้องการเช็คลำดับในการจัดส่งสินค้ากดปุ่มด้านล่างนี้*</Typography>
                                            <Button variant="outlined" fullWidth endIcon={showTrip ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />} onClick={() => setShowTrip(!showTrip)}>
                                                เช็คลำดับในการจัดส่งสินค้า
                                            </Button>
                                            {
                                                !showTrip &&
                                                (() => {
                                                    // รวม lat,lng จาก orderNew ที่ตรงกับ tripNew
                                                    const coordinates = Object.entries(tripNew).flatMap(([key, value]) =>
                                                        orderNew
                                                            .filter(row => {
                                                                let modifiedTicketName = row.TicketName;

                                                                // ตัดค่า branch ออกจาก TicketName
                                                                // branches.forEach(branch => {
                                                                //     if (row.TicketName.includes(branch)) {
                                                                //         modifiedTicketName = row.TicketName.split(branch).pop().trim();
                                                                //     }
                                                                // });

                                                                return modifiedTicketName === value.Name;
                                                            })
                                                            .map(row => row.Lat && row.Lng && row.Lat !== "-" && row.Lng !== "-" && row.Lat !== 0 && row.Lng !== 0 ? `${row.Lat},${row.Lng}` : null) // ตรวจสอบ lat,lng
                                                            .filter(Boolean) // ลบค่า null ออก
                                                    );

                                                    // ถ้ามีพิกัดให้สร้างลิงก์
                                                    if (coordinates.length > 0) {
                                                        const depotLatLng = depotNew.lat === "0" && depotNew.lng === "0" ? "" : `${depotNew.lat},${depotNew.lng}/`;
                                                        const googleMapsUrl = `https://www.google.com/maps/dir/${depotLatLng}${coordinates.join("/")}`;

                                                        return (
                                                            <Typography sx={{ marginTop: 2 }}>
                                                                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                                                    คลิ๊กตรงนี้เพื่อเช็คดูเส้นทางการเดินรถ
                                                                </a>
                                                            </Typography>
                                                        );
                                                    }

                                                    return null;
                                                })()}
                                        </Grid>
                                        {!showTrip &&
                                            <>
                                                <Grid item xs={3.5} />
                                                <Grid item xs={5}>
                                                    <Paper sx={{ p: 2 }}>
                                                        <Typography variant="h6" textAlign="center" fontWeight="bold" gutterBottom>เริ่มต้น</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={3.5} />
                                                <Grid item xs={5.5} />
                                                <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
                                                    <Box sx={{ width: "4px", height: "50px", backgroundColor: "black" }} />
                                                </Grid>
                                                <Grid item xs={5.5} />
                                                <Grid item xs={5.5}>
                                                    <Paper sx={{ p: 2 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{`เข้ารับน้ำมันที่ ${depotNew.Name}`}</Typography>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{`โซน ${depotNew.Zone}`}</Typography>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{`ที่อยู่ ${formatAddress(depotNew.Address)}`}</Typography>
                                                        <Typography variant="subtitle2" fontWeight="bold" textAlign="right" marginBottom={-2} color="warning" >กำลังเข้ารับน้ำมัน</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
                                                    <Box sx={{ width: "50px", height: "5px", backgroundColor: "black" }} />
                                                    <Box sx={{ width: "5px", height: "100%", backgroundColor: "black" }} />
                                                    <Box sx={{ width: "50px", height: "5px", backgroundColor: "white" }} />
                                                </Grid>
                                                <Grid item xs={5.5} />
                                                {Object.entries(tripNew).map(([key, value], index) => (
                                                    orderNew.map((row) => {
                                                        // หาค่าที่ต้อง split
                                                        let modifiedTicketName = row.TicketName;

                                                        // branches.forEach(branch => {
                                                        //     if (row.TicketName.includes(branch)) {
                                                        //         modifiedTicketName = row.TicketName.split(branch).pop().trim(); // เอาค่าหลังจาก branch และตัดช่องว่างออก
                                                        //     }
                                                        // });

                                                        return modifiedTicketName === value.Name && (
                                                            <React.Fragment key={key}>
                                                                {index % 2 === 0 ? (
                                                                    // แสดงข้อมูลฝั่งซ้าย
                                                                    <>
                                                                        <Grid item xs={5.5} />
                                                                        <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
                                                                            <Box sx={{ width: "50px", height: "5px", backgroundColor: "black" }} />
                                                                            <Box sx={{ width: "5px", height: "100%", backgroundColor: "black" }} />
                                                                            <Box sx={{ width: "50px", height: "5px", backgroundColor: "white" }} />
                                                                        </Grid>
                                                                        <Grid item xs={5.5}>
                                                                            <Paper sx={{ p: 2, borderLeft: row.Status === undefined ? "15px solid " + theme.palette.warning.main : "15px solid " + theme.palette.success.main }}>
                                                                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{`สินค้าลำดับที่ ${value.No + 1}`}</Typography>
                                                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{row.TicketName.split(":")[1]}</Typography>
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
                                                                ) : (
                                                                    // แสดงข้อมูลฝั่งขวา
                                                                    <>
                                                                        <Grid item xs={5.5}>
                                                                            <Paper sx={{ p: 2, borderRight: row.Status === undefined ? "15px solid " + theme.palette.warning.main : "15px solid " + theme.palette.success.main }}>
                                                                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{`สินค้าลำดับที่ ${value.No + 1}`}</Typography>
                                                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{row.TicketName.split(":")[1]}</Typography>
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
                                                                            <Box sx={{ width: "50px", height: "5px", backgroundColor: "white" }} />
                                                                            <Box sx={{ width: "5px", height: "100%", backgroundColor: "black" }} />
                                                                            <Box sx={{ width: "50px", height: "5px", backgroundColor: "black" }} />
                                                                        </Grid>
                                                                        <Grid item xs={5.5} />
                                                                    </>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })
                                                ))}
                                                <Grid item xs={5.5} />
                                                <Grid item xs={1} display="flex" justifyContent="center" alignItems="center">
                                                    <Box sx={{ width: "4px", height: "100px", backgroundColor: "black" }} />
                                                </Grid>
                                                <Grid item xs={5.5} />
                                                <Grid item xs={3.5} />
                                                <Grid item xs={5}>
                                                    <Paper sx={{ p: 2, backgroundColor: check.StatusTrips === "จบทริป" && theme.palette.success.main, color: check.StatusTrips === "จบทริป" && "white" }}>
                                                        <Typography variant="h6" textAlign="center" fontWeight="bold" gutterBottom>จบเที่ยววิ่ง</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={3.5} />
                                            </>
                                        }
                                    </Grid>
                                    :
                                    Object.keys(tripNew).length === 0 ?
                                        <Grid container spacing={2} marginTop={3} marginBottom={3}>
                                            <Grid item xs={12}>
                                                <Paper sx={{ p: 2, backgroundColor: "lightgray" }}>
                                                    <Typography variant="h6" textAlign="center" fontWeight="bold" gutterBottom>ไม่มีเที่ยววิ่ง</Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                        :
                                        <Grid container paddingLeft={10} paddingRight={10} marginTop={3} marginBottom={3}>
                                            <Grid item xs={12} textAlign="center" marginTop={2} marginBottom={3}>
                                                <Typography variant="subtitle2" fontSize="12px" fontWeight="bold" color={theme.palette.error.main} gutterBottom>*ถ้าต้องการเช็คลำดับในการจัดส่งสินค้ากดปุ่มด้านล่างนี้*</Typography>
                                                <Button variant="outlined" fullWidth endIcon={showTrip ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />} onClick={() => setShowTrip(!showTrip)}>
                                                    เช็คลำดับในการจัดส่งสินค้า
                                                </Button>
                                                {
                                                    !showTrip &&
                                                    (() => {
                                                        // รวม lat,lng จาก orderNew ที่ตรงกับ tripNew
                                                        const coordinates = Object.entries(tripNew).flatMap(([key, value]) =>
                                                            orderNew
                                                                .filter(row => {
                                                                    let modifiedTicketName = row.TicketName;

                                                                    // ตัดค่า branch ออกจาก TicketName
                                                                    branches.forEach(branch => {
                                                                        if (row.TicketName.includes(branch)) {
                                                                            modifiedTicketName = row.TicketName.split(branch).pop().trim();
                                                                        }
                                                                    });

                                                                    return modifiedTicketName === value.Name;
                                                                })
                                                                .map(row => row.Lat && row.Lng && row.Lat !== "-" && row.Lng !== "-" && row.Lat !== 0 && row.Lng !== 0 ? `${row.Lat},${row.Lng}` : null) // ตรวจสอบ lat,lng
                                                                .filter(Boolean) // ลบค่า null ออก
                                                        );

                                                        // ถ้ามีพิกัดให้สร้างลิงก์
                                                        if (coordinates.length > 0) {
                                                            const depotLatLng = depotNew.lat === "0" && depotNew.lng === "0" ? "" : `${depotNew.lat},${depotNew.lng}/`;
                                                            const googleMapsUrl = `https://www.google.com/maps/dir/${depotLatLng}${coordinates.join("/")}`;

                                                            return (
                                                                <Typography sx={{ marginTop: 2 }}>
                                                                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                                                        คลิ๊กตรงนี้เพื่อเช็คดูเส้นทางการเดินรถ
                                                                    </a>
                                                                </Typography>
                                                            );
                                                        }

                                                        return null;
                                                    })()}

                                            </Grid>
                                            {
                                                !showTrip &&
                                                <>
                                                    <Grid item xs={12}>
                                                        <Paper sx={{ p: 2 }}>
                                                            <Typography variant="h6" textAlign="center" fontWeight="bold" gutterBottom>เริ่มต้น</Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                                                        <Box sx={{ width: "5px", height: "50px", backgroundColor: "black" }} />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Paper sx={{ p: 2 }}>
                                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{`เข้ารับน้ำมันที่ ${depotNew.Name}`}</Typography>
                                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{`โซน ${depotNew.Zone}`}</Typography>
                                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{`ที่อยู่ ${formatAddress(depotNew.Address)}`}</Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                                                        <Box sx={{ width: "5px", height: "50px", backgroundColor: "black" }} />
                                                    </Grid>
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
                                                                    <Grid item xs={12}>
                                                                        <Paper sx={{ p: 2, borderBottom: row.Status === undefined ? "15px solid " + theme.palette.warning.main : "15px solid " + theme.palette.success.main }}>
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
                                                                    <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                                                                        <Box sx={{ width: "5px", height: "50px", backgroundColor: "black" }} />
                                                                    </Grid>
                                                                </React.Fragment>
                                                            );
                                                        })
                                                    ))}
                                                    <Grid item xs={12}>
                                                        <Paper sx={{ p: 2, backgroundColor: check.StatusTrips === "จบทริป" && theme.palette.success.main, color: check.StatusTrips === "จบทริป" && "white" }}>
                                                            <Typography variant="h6" textAlign="center" fontWeight="bold" gutterBottom>จบเที่ยววิ่ง</Typography>
                                                        </Paper>
                                                    </Grid>
                                                </>
                                            }
                                        </Grid>
                            }
                        </>
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
