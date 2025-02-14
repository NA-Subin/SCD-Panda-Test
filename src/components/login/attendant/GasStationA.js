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
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import theme from "../../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
    ShowConfirm,
    ShowError,
    ShowInfo,
    ShowSuccess,
    ShowWarning,
} from "../../sweetalert/sweetalert";
import Logo from "../../../theme/img/logoPanda.jpg";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { auth, database, googleProvider } from "../../../server/firebase";
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
import ReceiveOil from "./ReceiveOil";
import OilBalance from "./OilBalance";
import GasStationDetail from "./GasStationDetail";

const GasStationAdmin = () => {

    const navigate = useNavigate();
    const [open, setOpen] = React.useState(true);
    const [openOil, setOpenOil] = React.useState(true);
    const [gasStationOil, setGasStationsOil] = useState([]);
    const [stock, setStock] = useState([]);
    const [newVolume, setNewVolume] = React.useState(0);
    const [gasStation, setGasStation] = React.useState(0);
    const [gasStations, setGasStations] = React.useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const today = dayjs(new Date());
    const isToday = selectedDate.isSame(today, "day"); // เปรียบเทียบเฉพาะวันที่

    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const [gasStationID, setGasStationID] = React.useState(0);
    const [newVolumes, setNewVolumes] = useState({});
    const [products, setProducts] = useState([]);
    const [report, setReport] = React.useState([]);
    const [setting, setSetting] = React.useState(true);
    const [gasStationReport, setGasStationReport] = React.useState([]);

    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
            database.ref("/depot/gasStations").on("value", (snapshot) => {
                const datasG = snapshot.val();
                const dataListG = [];
                for (let idG in datasG) {
                    if (datasG[idG].Name === gasStation) {
                        dataListG.push({ idG, ...datasG[idG] });
                        database.ref("/depot/stock").on("value", (snapshot) => {
                            const datasS = snapshot.val();
                            const productsList = [];
                            const dataListReport = [];

                            for (let idS in datasS) {
                                if (datasS[idS].Name === datasG[idG].Stock) {
                                    // ดึงเฉพาะ Products และบันทึกลง productsList
                                    const products = datasS[idS].Products || {};
                                    productsList.push(...Object.values(products)); // รวม Products ทั้งหมดเข้าใน array

                                    const report = datasG[idG].Report || {};
                                    dataListReport.push(...Object.values(report));

                                    // ตั้งค่า GasStationID
                                    setGasStationID(datasG[idG].id);
                                    database.ref("depot/gasStations/" + (datasG[idG].id - 1) + "/Report/" + dayjs(formattedDate).format("DD-MM-YYYY")).on("value", (snapshot) => {
                                        const datas = snapshot.val();
                                        const dataList = [];
                                        for (let id in datas) {
                                            dataList.push({ id, ...datas[id] });
                                        }
                                        setGasStationReport(dataList);
                                    });
                                }
                            }
                            if (dataListReport.length === 0) {
                                setReport(0); // ถ้าไม่มีข้อมูลใน dataListReport ให้ตั้งค่าเป็น 0
                            } else {
                                setReport(dataListReport); // ถ้ามีข้อมูลให้บันทึกลง state
                            }
                            setStock(productsList);
                        })
                    }
                }
                setGasStationsOil(dataListG);
            });
        }
    };

    const getGasStations = async () => {
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] })
            }
            setGasStations(dataList);
        });
    };

    useEffect(() => {
        getGasStations();
    }, []);

    const handleBack = () => {
        navigate("/choose");
    }

    const handleGasStationChange = (e) => {
        setGasStation(e.target.value);
        const DataGasStation = e.target.value;
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datasG = snapshot.val();
            const dataListG = [];
            for (let idG in datasG) {
                if (datasG[idG].Name === DataGasStation) {
                    dataListG.push({ idG, ...datasG[idG] });
                    database.ref("/depot/stock").on("value", (snapshot) => {
                        const datasS = snapshot.val();
                        const productsList = [];
                        const dataListReport = [];

                        for (let idS in datasS) {
                            if (datasS[idS].Name === datasG[idG].Stock) {
                                // ดึงเฉพาะ Products และบันทึกลง productsList
                                const products = datasS[idS].Products || {};
                                productsList.push(...Object.values(products)); // รวม Products ทั้งหมดเข้าใน array

                                const report = datasG[idG].Report || {};
                                dataListReport.push(...Object.values(report));

                                // ตั้งค่า GasStationID
                                setGasStationID(datasG[idG].id);
                                database.ref("depot/gasStations/" + (datasG[idG].id - 1) + "/Report/" + dayjs(selectedDate).format("DD-MM-YYYY")).on("value", (snapshot) => {
                                    const datas = snapshot.val();
                                    const dataList = [];
                                    for (let id in datas) {
                                        dataList.push({ id, ...datas[id] });
                                    }
                                    setGasStationReport(dataList);
                                });
                            }
                        }
                        if (dataListReport.length === 0) {
                            setReport(0); // ถ้าไม่มีข้อมูลใน dataListReport ให้ตั้งค่าเป็น 0
                        } else {
                            setReport(dataListReport); // ถ้ามีข้อมูลให้บันทึกลง state
                        }
                        setStock(productsList);
                    })
                }
            }
            setGasStationsOil(dataListG);
        });
    };

    // const [showButton, setShowButton] = useState(false);

    // useEffect(() => {
    //     const checkTime = () => {
    //         const now = dayjs(); // เวลาปัจจุบัน
    //         const start = dayjs().hour(17).minute(0).second(0); // 17:00
    //         const end = dayjs().hour(20).minute(0).second(0); // 20:00
    //         setShowButton(now.isAfter(start) && now.isBefore(end)); // อัปเดตสถานะปุ่มตามช่วงเวลา
    //     };

    //     checkTime(); // ตรวจสอบครั้งแรกเมื่อคอมโพเนนต์โหลด
    //     const interval = setInterval(checkTime, 1000); // ตรวจสอบทุก 1 วินาที

    //     return () => clearInterval(interval); // ล้าง interval เมื่อคอมโพเนนต์ถูกทำลาย
    // }, []);

    console.log("GasStation :", gasStation);
    console.log("GasStationOil ::", gasStationOil);

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
                            isMobile ?
                                <>
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} onClick={handleBack}><ReplyAllIcon fontSize="small" /></Button>
                                </>

                                :
                                <>
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<ReplyAllIcon fontSize="small" />} onClick={handleBack}>กลับหน้าแรก</Button>
                                </>

                        }
                    </Box>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        color={theme.palette.panda.main}
                        gutterBottom
                    >
                        ยินดีต้อนรับเข้าสู่หน้าลงข้อมูลน้ำมัน
                        {/* {
                            openOil === true ? "รับน้ำมัน"
                                : openOil === false ? "ปิดยอดสต็อก"
                                    : "ยินดีต้อนรับเข้าสู่หน้าลงข้อมูลน้ำมัน"
                        } */}
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
                    <Grid container spacing={2} marginTop={-1} component="form">
                        <Grid item xs={12} md={3} lg={3} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>วันที่</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    openTo="day"
                                    views={["year", "month", "day"]}
                                    value={dayjs(selectedDate)} // แปลงสตริงกลับเป็น dayjs object
                                    format="DD/MM/YYYY"
                                    onChange={handleDateChange}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            variant: "standard",
                                            "& .MuiInput-underline:before": {
                                                borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                            },
                                            "& .MuiInput-underline:after": {
                                                borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                            },
                                            marginLeft: 2
                                        }
                                    }}
                                    sx={{ marginLeft: 2 }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={9} lg={9} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ชื่อปั้ม</Typography>
                            <FormControl variant="standard" sx={{ m: 1, width: "100%" }}>
                                <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={gasStation}
                                    onChange={handleGasStationChange}
                                    fullWidth
                                >
                                    <MenuItem value={0}>กรุณาเลือกปั้ม</MenuItem>
                                    {
                                        [...new Set(gasStations.map(row => row.Name))].map((name) => (
                                            <MenuItem key={name} value={name}>{name}</MenuItem>
                                        ))
                                    }

                                </Select>
                            </FormControl>
                        </Grid>
                        {/* <Grid item xs={5} md={3} lg={2} textAlign="right">
                            {
                                openOil === true || openOil === false ? <Button variant="contained" color="error" onClick={() => setOpenOil("")}>ย้อนกลับ</Button> : ""
                            }
                        </Grid> */}
                    </Grid>
                    {gasStationOil.map((row, index) => {
                        const prevIndex = index - 1; // index ก่อนหน้า
                        const prevGas = gasStationOil[prevIndex] || {}; // ✅ ใช้ {} แทน []
                        const latestGas = gasStationOil[index] || {}; // ✅ ใช้ {} แทน []
                    
                        const selectedDateKey = dayjs(selectedDate).format("DD-MM-YYYY");
                    
                        // ตรวจสอบว่ามีค่าเป็นอาร์เรย์ก่อนใช้ spread operator
                        const prevReport = Array.isArray(prevGas.Report?.[selectedDateKey]) ? [...prevGas.Report[selectedDateKey]] : [];
                        const latestReport = Array.isArray(latestGas.Report?.[selectedDateKey]) ? [...latestGas.Report[selectedDateKey]] : [];
                    
                        // ตรวจสอบข้อมูลซ้ำ
                        const reportOilBalance = prevReport.map((prevItem) => {
                            const matchingLatestItem = latestReport.find(
                                (latestItem) => latestItem.ProductName === prevItem.ProductName
                            );
                    
                            return {
                                ProductName: prevItem.ProductName,
                                    Color: prevItem.Color,
                                    PrevOilBalance: prevItem.OilBalance,
                                    LatestOilBalance: matchingLatestItem ? matchingLatestItem.OilBalance : 0,
                                    Difference: Number(prevItem.OilBalance) - Number(matchingLatestItem ? matchingLatestItem.OilBalance : 0) 
                            };
                        });

                        const oilBalance = prevReport.map((prevItem) => {
                            const matchingLatestItem = latestReport.find(
                                (latestItem) => latestItem.ProductName === prevItem.ProductName
                            );
                    
                            return {
                                    ProductName: prevItem.ProductName || "",
                                    Capacity: prevItem.Capacity || 0,
                                    Color: prevItem.Color || "",
                                    Volume: prevItem.Volume || 0,
                                    Squeeze: prevItem.Squeeze || 0,
                                    Delivered: prevItem.Delivered || 0,
                                    Pending1: prevItem.Pending1 || 0,
                                    Pending2: prevItem.Pending2 || 0,
                                    Driver1: prevItem.Driver1 || 0,
                                    Driver2: prevItem.Driver2 || 0,
                                    EstimateSell: prevItem.EstimateSell || 0,
                                    Period: prevItem.Period || 0,
                                    DownHole: prevItem.DownHole || 0,
                                    YesterDay: prevItem.YesterDay || 0,
                                    Sell: prevItem.Sell || 0,
                                    TotalVolume: prevItem.TotalVolume || 0,
                                    OilBalance: prevItem.OilBalance || 0,
                                    Difference: Number(prevItem.OilBalance) - Number(matchingLatestItem ? matchingLatestItem.OilBalance : 0) 
                            };
                        });

                        // const handleSave = () => {
                        //     console.log("latestGas ::::::: ",prevGas.id);
                        //     console.log("✅ reportOilBalance "+`${index}:`, oilBalance);
                        //     database
                        //         .ref("/depot/gasStations/" + (prevGas.id - 1) + "/Report")
                        //         .child(dayjs(selectedDate).format("DD-MM-YYYY"))
                        //         .update(oilBalance)
                        //         .then(() => {
                        //             ShowSuccess("บันทึกข้อมูลสำเร็จ");
                        //             console.log("Data pushed successfully");
                        //         })
                        //         .catch((error) => {
                        //             ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        //             console.error("Error pushing data:", error);
                        //         });
                                
                        // }

                        return (
                            <React.Fragment key={index}>
                                <GasStationDetail
                                    stock={stock}
                                    gasStationID={gasStationID}
                                    // report={report}
                                    // gasStationReport={gasStationReport}
                                    selectedDate={selectedDate}
                                    // gasStationOil={gasStationOil}
                                    isToday={isToday}
                                    gas={row}
                                    gasID={index}
                                    first={prevGas}
                                    last={latestGas}
                                    reportOilBalance={reportOilBalance}
                                    oilBalance={oilBalance}
                                />
                            </React.Fragment>
                        );
                    })}

                    {/* {
                        // gasStation !== "0:0" ?
                        // (
                            openOil === true ?
                            <ReceiveOil
                                stock={stock}
                                gasStationID={gasStationID}
                                report={report}
                                gasStationReport={gasStationReport}
                                selectedDate={selectedDate}
                                gasStationOil={gasStationOil}
                                isToday={isToday}
                            />
                            : openOil === false ?
                                <OilBalance
                                    stock={stock}
                                    gasStationID={gasStationID}
                                    report={report}
                                    gasStationReport={gasStationReport}
                                    selectedDate={selectedDate}
                                    gasStationOil={gasStationOil}
                                    isToday={isToday}
                                />
                                :
                                <Grid container spacing={5} marginTop={1}>
                                    <Grid item xs={1} />
                                    <Grid item xs={5}>
                                        <Button
                                            variant="contained"
                                            color="info"
                                            fullWidth
                                            sx={{
                                                height: 100,
                                                borderRadius: 3,
                                                fontSize: 24, // ขนาดตัวหนังสือ
                                                fontWeight: "bold"
                                            }}
                                            onClick={() => setOpenOil(true)}
                                            startIcon={isMobile ? "" : <PostAddIcon style={{ fontSize: "50px" }} />} // กำหนดขนาดไอคอน
                                        >
                                            {isMobile ? <PostAddIcon style={{ fontSize: "50px" }} /> : "รับน้ำมัน"}
                                        </Button>
                                    </Grid>
                                        <Grid item xs={5}>
                                            <Button
                                                variant="contained"
                                                color="info"
                                                fullWidth
                                                sx={{
                                                    height: 100,
                                                    borderRadius: 3,
                                                    fontSize: 24, // ขนาดตัวหนังสือ
                                                    fontWeight: "bold"
                                                }}
                                                onClick={() => setOpenOil(false)}
                                                startIcon={isMobile ? "" : <FactCheckIcon style={{ fontSize: "50px" }} />} // กำหนดขนาดไอคอน
                                            >
                                                {isMobile ? <FactCheckIcon style={{ fontSize: "50px" }} /> : "ปิดยอดสต็อก"}
                                            </Button>
                                        </Grid>
                                    <Grid item xs={1} />
                                </Grid>
                        // )
                        // :
                        // <Grid container spacing={2} sx={{ backgroundColor: "#eeeeee", marginTop: 2, p: 3, borderRadius: 5 }}>
                        //     <Grid item xs={12}>
                        //         <Typography variant="h4" fontWeight="bold" textAlign="center" color="gray" gutterBottom>กรุณาเลือกปั้มให้เรียบร้อย</Typography>
                        //     </Grid>
                        // </Grid>
                    } */}
                </Box>
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

export default GasStationAdmin;
