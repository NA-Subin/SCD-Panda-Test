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
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";

const Quotation = () => {
    const navigate = useNavigate();
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

    const handleBack = () => {
        navigate("/choose");
    }

    const { company, customerbigtruck, customersmalltruck, officers } = useBasicData();
    const { banks } = useTripData();
    const companyDetail = Object.values(company || {});
    const customerB = Object.values(customerbigtruck || {});
    const customerS = Object.values(customersmalltruck || {});
    const employees = Object.values(officers || {});
    const bankDetail = Object.values(banks || {});

    const [companyName, setCompanyName] = useState("");
    const [employee, setEmployee] = useState("");
    const [customer, setCustomer] = useState("");
    const [note, setNote] = useState("");
    const [check, setCheck] = useState(true);
    const [selectedDateBid, setSelectedDateBid] = useState(dayjs().startOf('month'));
    const [selectedDateDelivery, setSelectedDateDelivery] = useState(dayjs().endOf('month'));
    const productColors = {
        G91: "#c7f4a3ff",   // เขียวอ่อน
        G95: "#f3de8aff",   // เหลืองอ่อน
        B7: "#ffffc2ff",    // เหลืองจาง
        B95: "#ddf2f6ff",   // ฟ้าอ่อน
        E20: "#e8e1c2ff",   // ครีมอ่อน
        PWD: "#fdb4f0ff",   // ชมพูอ่อน
    };

    const productColorsHead = {
        G95: "#FFC000",   // แก๊สโซฮอล์ 95
        B95: "#B7DEE8",   // เบนซิน 95
        B7: "#FFFF99",    // ดีเซล B7
        G91: "#92D050",   // แก๊สโซฮอล์ 91
        E20: "#C4BD97",   // แก๊สโซฮอล์ E20
        PWD: "#F141D8",   // ดีเซลพรีเมียม
    };

    const products = [
        { code: "G95", name: "แก๊สโซฮอล์ 95" },
        { code: "B95", name: "เบนซิน 95" },
        { code: "B7", name: "ดีเซล B7" },
        { code: "G91", name: "แก๊สโซฮอล์ 91" },
        { code: "E20", name: "แก๊สโซฮอล์ E20" },
        { code: "PWD", name: "ดีเซลพรีเมียม (Premium Diesel)" },
    ];

    // 🧠 สร้างค่าเริ่มต้นจาก products
    const initialFuelData = Object.fromEntries(
        products.map(({ code }) => [
            code,
            { Volume: "", RateOil: "" },
        ])
    );

    const [fuelData, setFuelData] = useState(initialFuelData);

    // ฟังก์ชันกรองเฉพาะค่าที่กรอกจริง ๆ
    const getFilledFuelData = (data) => {
        return Object.fromEntries(
            Object.entries(data).filter(([code, { Volume, RateOil }]) =>
                (Volume !== "" && Number(Volume) !== 0) ||
                (RateOil !== "" && Number(RateOil) !== 0)
            )
        );
    };

    // แสดงผลเฉพาะข้อมูลที่กรอก
    console.log("fuelData:", getFilledFuelData(fuelData));

    const handleChange = (type, field, value) => {
        setFuelData((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value === "" || Number(value) === 0 ? "" : Number(value)
            },
        }));
    };

    const handleSave = () => {
        // สร้าง object Product ที่กรองเฉพาะเชื้อเพลิงที่มีค่า != 0
        const Product = Object.entries(fuelData).reduce((acc, [key, val]) => {
            const { Volume, RateOil } = val;
            if (Volume > 0 || RateOil > 0) {
                const Amount = Volume * RateOil;
                acc[key] = { Volume, RateOil, Amount };
            }
            return acc;
        }, {});

        console.log({ Product });
        alert(JSON.stringify({ Product }, null, 2));
    };

    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateBid(formattedDate);
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateDelivery(formattedDate);
        }
    };

    const exportToPDF = () => {
        // let Code = ""
        // if (invoices2.length !== 0) {
        //     Code = `${invoices2[0]?.Code}-${invoices2[0]?.Number}`
        // } else {
        //     const lastItemInvoice = invoiceDetail[invoiceDetail.length - 1];
        //     let newNumberInvoice = 1;
        //     if (lastItemInvoice && lastItemInvoice.Number && lastItemInvoice.Code === `lV${currentCode}`) {
        //         newNumberInvoice = Number(lastItemInvoice.Number) + 1;
        //     }
        //     const formattedNumberInvoice = String(newNumberInvoice).padStart(4, "0");

        //     Code = `lV${currentCode}-${formattedNumberInvoice}`;

        //     database
        //         .ref("invoice/")
        //         .child(invoiceDetail.length)
        //         .update({
        //             id: invoiceDetail.length,
        //             Code: `lV${currentCode}`,
        //             Number: formattedNumberInvoice,
        //             DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
        //             Transport: company2Tickets[0]?.Company,
        //             TicketName: ticket.TicketName,
        //             TicketNo: ticket.No,
        //             TicketType: ticket.CustomerType,
        //         }) // ใช้ .set() แทน .update() เพื่อแทนที่ข้อมูลทั้งหมด
        //         .then(() => {
        //             console.log("บันทึกข้อมูลเรียบร้อย ✅");
        //         })
        //         .catch((error) => {
        //             ShowError("ไม่สำเร็จ");
        //             console.error("Error updating data:", error);
        //         });
        // }

        const invoiceData = {
            DateB: formatThaiSlash(dayjs(selectedDateBid, "DD/MM/YYYY")),
            DateD: formatThaiSlash(dayjs(selectedDateDelivery, "DD/MM/YYYY")),
            Company: companyName,
            Customer: customer,
            Employee: employee,
            Note: note
        };

        // บันทึกข้อมูลลง sessionStorage
        sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

        // เปิดหน้าต่างใหม่ไปที่ /print-invoice
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        // ขนาด A5 แนวนอน (ประมาณ)
        const windowWidth = 900;
        const windowHeight = 600;

        const left = (screenWidth - windowWidth) / 2;
        const top = (screenHeight - windowHeight) / 2;

        const printWindow = window.open(
            "/print-quotation",
            "_blank",
            `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`
        );

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    return (
        <Container
            sx={{
                paddingLeft: { xs: 2, sm: 3, md: 4 },
                paddingRight: { xs: 2, sm: 3, md: 4 },
                marginTop: { xs: 0, sm: 0, md: 1 },
                maxWidth: { xs: "lg", sm: "lg", md: "lg" }
            }}>
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
                        <Button
                            variant="contained"
                            color="error"
                            sx={{
                                border: "3px solid white",
                                borderTopRightRadius: 15,
                                borderTopLeftRadius: 6,
                                borderBottomRightRadius: 6,
                                borderBottomLeftRadius: 6
                            }}
                            endIcon={
                                <ReplyAllIcon fontSize="small" />
                            }
                            onClick={handleBack}
                        >
                            กลับหน้าแรก
                        </Button>
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
                            ยินดีต้อนรับเข้าสู่หน้าใบเสนอราคาลูกค้า
                        </Typography>
                    </Box>
                    <Divider />
                    <Grid container spacing={2} marginTop={1}>
                        {/* <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: -2, marginBottom: -1 }} gutterBottom>กรอกข้อมูลใบเสนอราคาลูกค้า</Typography>
                        </Grid> */}
                        <Grid item xs={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Paper>
                                    <DatePicker
                                        openTo="day"
                                        views={["year", "month", "day"]}
                                        value={selectedDateBid ? dayjs(selectedDateBid, "DD/MM/YYYY") : null}
                                        format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                        onChange={handleDateChangeDateStart}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                inputProps: {
                                                    value: formatThaiFull(selectedDateBid), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                    readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                },
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <b>วันที่เสนอราคา :</b>
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
                        </Grid>
                        <Grid item xs={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Paper>
                                    <DatePicker
                                        openTo="day"
                                        views={["year", "month", "day"]}
                                        value={selectedDateDelivery ? dayjs(selectedDateDelivery, "DD/MM/YYYY") : null}
                                        format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                        onChange={handleDateChangeDateEnd}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                inputProps: {
                                                    value: formatThaiFull(selectedDateDelivery), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                    readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                },
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <b>วันที่จัดส่ง :</b>
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
                        </Grid>
                        <Grid item xs={4}>
                            <FormGroup row >
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>สถานะรถ : </Typography>
                                <FormControlLabel control={<Checkbox checked={check ? true : false} />} onChange={() => setCheck(true)} label="รถใหญ่" />
                                <FormControlLabel control={<Checkbox checked={!check ? true : false} />} onChange={() => setCheck(false)} label="รถเล็ก" />
                            </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
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
                                                "& .MuiOutlinedInput-root": { height: "40px" },
                                                "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                            }}
                                            InputProps={{
                                                ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <b>เลือกบริษัท :</b>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: "16px",
                                                    height: "40px",
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
                        <Grid item xs={6}>
                            <Paper sx={{ width: "100%" }}>
                                {
                                    check ?
                                        <Autocomplete
                                            options={customerB}
                                            getOptionLabel={(option) => option.Name}
                                            isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                            value={
                                                customerB.find((c) => `${c.id}:${c.Name}` === customer) || null
                                            }
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    setCustomer(`${newValue.id}:${newValue.Name}`);
                                                } else {
                                                    setCustomer("");
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "40px" },
                                                        "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                <b>เลือกลูกค้ารถใหญ่ :</b>
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px",
                                                            height: "40px",
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
                                                customerS.find((c) => `${c.id}:${c.Name}` === customer) || null
                                            }
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    setCustomer(`${newValue.id}:${newValue.Name}`);
                                                } else {
                                                    setCustomer("");
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "40px" },
                                                        "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                <b>เลือกลูกค้ารถเล็ก :</b>
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px",
                                                            height: "40px",
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
                        <Grid item xs={12}>
                            <TableContainer component={Paper} sx={{ height: "15vh" }}>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                                    <TableHead>
                                        <TableRow>
                                            {products.map((product) => (
                                                <TableCell
                                                    key={product.code}
                                                    width={70}
                                                    sx={{
                                                        textAlign: "center",
                                                        height: "35px",
                                                        borderBottom: "2px solid lightgray",
                                                        fontWeight: "bold",
                                                        backgroundColor: productColorsHead[product.code]
                                                    }}
                                                >
                                                    {`${product.code} (${product.name})`}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            {Object.entries(fuelData).map(([key, fuel]) => (
                                                <TableCell sx={{ backgroundColor: productColors[key] }} >
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={5}>
                                                            <Typography variant="subtitle2" sx={{ marginBottom: -1, fontSize: "12px", textAlign: "center", fontWeight: "bold" }} gutterBottom>ราคา/ลิตร</Typography>
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <Typography variant="subtitle2" sx={{ marginBottom: -1, fontSize: "12px", textAlign: "center", fontWeight: "bold" }} gutterBottom>จำนวนลิตร</Typography>
                                                        </Grid>
                                                        <Grid item xs={5}>
                                                            <Paper sx={{ width: "100%" }} >
                                                                <TextField
                                                                    size="small"
                                                                    type="number"
                                                                    fullWidth
                                                                    InputLabelProps={{ sx: { fontSize: "16px" } }}
                                                                    value={fuel.RateOil}
                                                                    onChange={(e) => handleChange(key, "RateOil", e.target.value)}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <Paper sx={{ width: "100%" }} >
                                                                <TextField
                                                                    size="small"
                                                                    type="number"
                                                                    fullWidth
                                                                    InputLabelProps={{ sx: { fontSize: "16px" } }}
                                                                    value={fuel.Volume}
                                                                    onChange={(e) => handleChange(key, "Volume", e.target.value)}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ marginLeft: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
                                    หมายเหตุ*
                                </Typography>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    ข้อกำหนดและเงื่อนไขการขอใบเสนอราคา
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        ราคาที่เสนอ :
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ marginLeft: 2 }} gutterBottom>
                                        เงินบาทไทย ราคานี้รวมภาษีมูลค่าเพิ่มแล้ว
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        ชำระเงิน :
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ marginLeft: 2 }} gutterBottom>

                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        ธนาคาร :
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ marginLeft: 2 }} gutterBottom>

                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                type="number"
                                fullWidth
                                multiline
                                minRows={6}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                InputLabelProps={{ sx: { fontSize: "16px" } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: 'auto', // ให้ขยายตามเนื้อหา (แทนการ fix 35px)
                                    },
                                    '& .MuiInputBase-input': {
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        textAlign: 'left', // สำหรับข้อความแบบ textarea
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <b>หมายเหตุเพิ่มเติม :</b>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                options={employees}
                                getOptionLabel={(option) => option.Name}
                                isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                value={
                                    employees.find((c) => `${c.id}:${c.Name}` === employee) || null
                                }
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        setEmployee(`${newValue.id}:${newValue.Name}`);
                                    } else {
                                        setEmployee("");
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": { height: "40px" },
                                            "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                        }}
                                        InputProps={{
                                            ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>เลือกผู้เสนอราคา :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: "16px",
                                                height: "40px",
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
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                            <Button variant="contained" size="small" onClick={exportToPDF} sx={{ marginTop: 1 }} >พิมพ์ใบเสนอราคาลูกค้า</Button>
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

export default Quotation;
