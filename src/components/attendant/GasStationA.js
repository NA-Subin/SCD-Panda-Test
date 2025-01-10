import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    InputAdornment,
    Paper,
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
import { auth, database, googleProvider } from "../../server/firebase";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import SettingA from "./SettingA";
import ReceiveOil from "./ReceiveOil";
import SellingOil from "./SellingOil";

const GasStationA = () => {

    const navigate = useNavigate();
    const [open, setOpen] = React.useState(true);
    const [openOil, setOpenOil] = React.useState("");
    const [gasStationOil, setGasStationsOil] = useState([]);
    const [stock, setStock] = useState([]);
    const [newVolume, setNewVolume] = React.useState(0);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
        }
    };

    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const location = useLocation();
    const { Employee } = location.state || {};

    const getNameParts = (fullName) => {
        // ใช้ Regex เพื่อจับคำนำหน้า และแยกชื่อออกจากคำนำหน้า
        const prefixMatch = fullName.match(/^(นาย|นาง|นางสาว)\s*/);
        const prefix = prefixMatch ? prefixMatch[0].trim() : ""; // เก็บคำนำหน้า หรือเว้นว่างไว้ถ้าไม่มี

        // ลบคำนำหน้าออกจากชื่อเต็ม
        const nameWithoutPrefix = fullName.replace(/^(นาย|นาง|นางสาว)\s*/, "");

        // แยกชื่อและนามสกุลโดยใช้ช่องว่าง
        const [firstName, lastName] = nameWithoutPrefix.split(" ");

        return { prefix, firstName, lastName };
    };

    // ตัวอย่างการใช้งาน
    const { prefix, firstName, lastName } = getNameParts(Employee.Name);

    const [gasStationID, setGasStationID] = React.useState(0);
    const [newVolumes, setNewVolumes] = useState({});
    const [products, setProducts] = useState([]);
    const [report, setReport] = React.useState([]);
    const [setting, setSetting] = React.useState(true);
    const [gasStationReport, setGasStationReport] = React.useState([]);

    const getStockOil = async (date) => {
        const gasStation = [];
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datasG = snapshot.val();
            const dataListG = [];
            for (let idG in datasG) {
                dataListG.push({ idG, ...datasG[idG] });
                if (datasG[idG].Name === Employee.GasStation) {
                    gasStation.push({ idG, ...datasG[idG] });
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
                                database.ref("depot/gasStations/" + (datasG[idG].id - 1) + "/Report/" + dayjs(date).format("DD-MM-YYYY")).on("value", (snapshot) => {
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
            setGasStationsOil(gasStation);
        });
    };

    useEffect(() => {
        getStockOil(selectedDate); // ส่ง selectedDate เข้าไปในฟังก์ชัน
    }, [selectedDate]);

    const handleLogout = () => {
        ShowConfirm(
            "ต้องการออกจากระบบใช่หรือไม่",
            () => {
                signOut(auth)
                    .then(() => {
                        console.log("User logged out");
                        // Cookies.remove('token');
                        navigate("/");
                    })
                    .catch(() => {
                        console.error("Error logging out:");
                    }); // นำผู้ใช้ไปยังหน้า login
            }, () => {
                // เงื่อนไขเมื่อกดปุ่มยกเลิก
                console.log("ยกเลิกแล้ว");
            }
        )
    };

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
                                    {
                                        open ?
                                            <Button variant="contained" color="warning" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} onClick={() => setOpen(false)}><SettingsIcon fontSize="small" /></Button>
                                            :
                                            <Button variant="contained" color="primary" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} onClick={() => setOpen(true)}><PostAddIcon fontSize="small" /></Button>
                                    }
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} onClick={handleLogout}><MeetingRoomIcon fontSize="small" /></Button>
                                </>

                                :
                                <>
                                    {
                                        open ?
                                            <Button variant="contained" color="warning" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} endIcon={<SettingsIcon fontSize="small" />} onClick={() => setOpen(false)}>ตั้งค่า</Button>
                                            :
                                            <Button variant="contained" color="primary" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} endIcon={<PostAddIcon fontSize="small" />} onClick={() => setOpen(true)}>ลงข้อมูล</Button>
                                    }
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<MeetingRoomIcon fontSize="small" />} onClick={handleLogout}>ออกจากระบบ</Button>
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
                        {
                            open ? "ยินดีต้อนรับเข้าสู่หน้าลงข้อมูลน้ำมัน" : "ตั้งค่าบัญชีผู้ใช้"
                        }
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
                        {
                            open &&
                            <>
                                <Grid item xs={7} md={5} lg={3} display="flex" justifyContent="center" alignItems="center">
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
                                <Grid item xs={5} md={7} lg={9} />
                            </>
                        }
                        <Grid item xs={12} sm={3} md={2} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom sx={{ whiteSpace: 'nowrap' }}>คำนำหน้า</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                    },
                                    marginLeft: 2
                                }}
                                value={prefix}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={4.5} md={2.5} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom>ชื่อ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                    },
                                    marginLeft: 2
                                }}
                                value={firstName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={4.5} md={2.5} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom>สกุล</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                    },
                                    marginLeft: 2
                                }}
                                value={lastName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={5} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ชื่อปั้ม</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                    },
                                    marginLeft: 2
                                }}
                                value={Employee.GasStation}
                                disabled
                            />
                        </Grid>
                    </Grid>
                    {
                        open ?
                        (
                            openOil === true ? 
                            <ReceiveOil 
                                stock={stock}
                                gasStationID={gasStationID}
                                report={report}
                                gasStationReport={gasStationReport}
                                selectedDate={selectedDate}
                                gasStationOil={gasStationOil}
                            />
                            : openOil === false ? 
                            <SellingOil 
                                stock={stock}
                                gasStationID={gasStationID}
                                report={report}
                                gasStationReport={gasStationReport}
                                selectedDate={selectedDate}
                                gasStationOil={gasStationOil}
                            />
                            :
                            <Grid container spacing={5} marginTop={1}>
                                <Grid item xs={1} />
                                <Grid item xs={5}>
                                    <Button variant="contained" color="warning" fullWidth sx={{ height: 100,borderRadius: 3 }} onClick={() => setOpenOil(true)}>
                                        รับน้ำมัน
                                    </Button>
                                </Grid>
                                <Grid item xs={5}>
                                    <Button variant="contained" color="warning" fullWidth sx={{ height: 100,borderRadius: 3 }} onClick={() => setOpenOil(false)}>
                                        ขายน้ำมัน
                                    </Button>
                                </Grid>
                                <Grid item xs={1} />
                            </Grid>
                        )
                            :
                            <SettingA employee={Employee} />
                    }
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

export default GasStationA;
