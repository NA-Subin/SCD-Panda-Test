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
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
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
} from "firebase/auth";
import { auth, database, googleProvider } from "../../server/firebase";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const GasStationA = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [gasStationOil, setGasStationsOil] = useState([]);
    const [stock, setStock] = React.useState([]);

    const getStockOil = async () => {
        const gasStation = [];
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
                if (datas[id].id === 1 || datas[id].id === "1") {
                    gasStation.push({ id, ...datas[id] });
                }
            }
            setGasStationsOil(gasStation);
        });

        database.ref("/depot/stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            setStock(dataList);

            // const matchedStocks = dataList.filter((stock) =>
            //     gasStation.some((station) => station.Stock === stock.Name)
            // );
            // setStock(matchedStocks);
        });
    };

    useEffect(() => {
        getStockOil();
    }, []);

    return (
        <Container sx={{ p: { xs: 3, sm: 6, md: 9 }, maxWidth: { xs: "lg", sm: "lg", md: "lg" } }}>
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
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        color={theme.palette.panda.main}
                        gutterBottom
                    >
                        ยินดีต้อนรับเข้าสู่หน้าลงข้อมูลน้ำมัน
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
                        <Grid item xs={7} md={5} lg={3} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>วันที่</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    openTo="day"
                                    views={["year", "month", "day"]}
                                    value={dayjs(new Date()).locale("th")} // ตั้ง locale เป็นไทย
                                    onChange={(newValue) => console.log(newValue)} // เอาไว้ใช้งานเมื่อมีการเลือกวันที่
                                    format="DD/MM/YYYY"
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
                        <Grid item xs={12} sm={6} display="flex" justifyContent="center" alignItems="center">
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
                            // value={name} 
                            // onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} display="flex" justifyContent="center" alignItems="center">
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
                            // value={name} 
                            // onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} display="flex" justifyContent="center" alignItems="center">
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
                            // value={name} 
                            // onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ที่อยู่</Typography>
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
                            // value={name} 
                            // onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ผลิตภัณฑ์</Typography>
                        </Grid>
                        {
                            gasStationOil.map((row) => (
                                Object.entries(row.Products).map(([key, value], index) => (
                                    <React.Fragment key={index}>
                                        <Grid item xs={5} md={2} lg={1}>
                                            <Box 
                                                sx={{
                                                    backgroundColor: (key === "G91" ? "#92D050" :
                                                        key === "G95" ? "#FFC000" :
                                                            key === "B7" ? "#FFFF99" :
                                                                key === "B95" ? "#B7DEE8" :
                                                                    key === "B10" ? "#32CD32" :
                                                                        key === "B20" ? "#228B22" :
                                                                            key === "E20" ? "#C4BD97" :
                                                                                key === "E85" ? "#0000FF" :
                                                                                    key === "PWD" ? "#F141D8" :
                                                                                        "#FFD700"),
                                                    borderRadius: 3,
                                                    textAlign: "center",
                                                    paddingTop: 2,
                                                    paddingBottom: 1
                                                }}
                                                disabled
                                            >
                                                <Typography variant="h5" fontWeight="bold" gutterBottom>{key}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={7} md={4} lg={2} marginTop={2}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={value} />
                                            </Paper>
                                        </Grid>
                                    </React.Fragment>
                                ))
                            ))
                        }
                        <Grid item xs={12} textAlign="center">
                            <Button variant="contained" color="warning" type="submit" sx={{ marginRight: 3 }}>
                                แก้ไข
                            </Button>
                            <Button variant="contained" color="success" type="submit">
                                บันทึก
                            </Button>
                        </Grid>
                    </Grid>
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
