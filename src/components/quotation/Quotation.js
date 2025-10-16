import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
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
import { formatThaiFull } from "../../theme/DateTH";

const Quotation = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

    const { company, customerbigtruck, customersmalltruck } = useBasicData();
    const companyDetail = Object.values(company || {});
    const customerB = Object.values(customerbigtruck || {});
    const customerS = Object.values(customersmalltruck || {});

    const [companyName, setCompanyName] = useState("");
    const [check, setCheck] = useState(true);
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
                            <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<ReplyAllIcon fontSize="small" />} >กลับหน้าแรก</Button>
                        }
                    </Box>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        color={theme.palette.panda.main}
                        gutterBottom
                    >
                        ยินดีต้อนรับเข้าสู่หน้าใบเสนอราคาลูกค้า
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
                    <Divider />
                    <Grid container spacing={2} marginTop={2}>
                        <Grid item xs={12}>
                            <Paper sx={{ width: "100%" }}>
                                <Autocomplete
                                    options={companyDetail.filter((row) => row.id !== 1)}
                                    getOptionLabel={(option) => option.Name}
                                    isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                    value={
                                        companyDetail
                                            .filter((row) => row.id !== 1)
                                            .find((c) => `${c.id}:${c.Name}` === companyName) || null
                                    }
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setCompanyName(`${newValue.id}:${newValue.Name}`);
                                        } else {
                                            setCompanyName("");
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "35px" },
                                                "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                            }}
                                            InputProps={{
                                                ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        เลือกบริษัท :
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: "16px",
                                                    height: "35px",
                                                    padding: "10px",
                                                    fontWeight: "bold",
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Typography fontSize="16px">{option.Name}</Typography>
                                        </li>
                                    )}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <FormGroup row sx={{ marginBottom: -1.5 }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>สถานะรถ : </Typography>
                                <FormControlLabel control={<Checkbox checked={check ? true : false} />} onChange={() => setCheck(true)} label="รถใหญ่" />
                                <FormControlLabel control={<Checkbox checked={!check ? true : false} />} onChange={() => setCheck(false)} label="รถเล็ก" />
                            </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
                            <Box
                                sx={{
                                    width: "100%", // กำหนดความกว้างของ Paper
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 3
                                }}
                            >
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Paper sx={{ marginRight: 2 }}>
                                        <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
                                            format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                            onChange={handleDateChangeDateStart}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                        value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                <b>วันที่ :</b>
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px",
                                                            height: "40px",
                                                            padding: "10px",
                                                            fontWeight: "bold",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Paper>
                                    <Paper>
                                        <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
                                            format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                            onChange={handleDateChangeDateEnd}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                        value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                <b>ถึงวันที่ :</b>
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px",
                                                            height: "40px",
                                                            padding: "10px",
                                                            fontWeight: "bold",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Paper>
                                </LocalizationProvider>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper sx={{ width: "100%" }}>
                                {
                                    check ?
                                        <Autocomplete
                                            options={customerB}
                                            getOptionLabel={(option) => option.Name}
                                            isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                            value={
                                                customerB.find((c) => `${c.id}:${c.Name}` === companyName) || null
                                            }
                                            // onChange={(event, newValue) => {
                                            //     if (newValue) {
                                            //         setCompanyName(`${newValue.id}:${newValue.Name}`);
                                            //     } else {
                                            //         setCompanyName("");
                                            //     }
                                            // }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "35px" },
                                                        "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                เลือกลูกค้ารถใหญ่ :
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px",
                                                            height: "35px",
                                                            padding: "10px",
                                                            fontWeight: "bold",
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="16px">{option.Name}</Typography>
                                                </li>
                                            )}
                                        />
                                        :
                                        <Autocomplete
                                            options={customerS}
                                            getOptionLabel={(option) => option.Name}
                                            isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                            value={
                                                customerS.find((c) => `${c.id}:${c.Name}` === companyName) || null
                                            }
                                            // onChange={(event, newValue) => {
                                            //     if (newValue) {
                                            //         setCompanyName(`${newValue.id}:${newValue.Name}`);
                                            //     } else {
                                            //         setCompanyName("");
                                            //     }
                                            // }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "35px" },
                                                        "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                เลือกลูกค้ารถเล็ก :
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px",
                                                            height: "35px",
                                                            padding: "10px",
                                                            fontWeight: "bold",
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="16px">{option.Name}</Typography>
                                                </li>
                                            )}
                                        />
                                }
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default Quotation;
