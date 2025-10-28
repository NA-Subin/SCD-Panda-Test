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
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
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

const QuotationDetail = ({ setOpen }) => {
    const navigate = useNavigate();

    const items = [
        `น้ำมัน CALTEX รับตามมาตราฐาน นน 0.80 กก./ลิตรและตามแป้นรถบรรทุกพร้อมเอกสารใบ COA กรณีไม่ได้สินค้าตามกำหนด นน.ทางบริษัทจะรับผิดชอบ`,
        `น้ำมัน บางจาก รับตามมาตราฐาน นน 0.80 กก./ลิตรและตามแป้นรถบรรทุกพร้อมเอกสารใบ COA กรณีไม่ได้สินค้าตามกำหนด นน.ทางบริษัทจะรับผิดชอบ`,
        `น้ำมันได้มาตราฐานส่งพร้อมใบ COA`,
    ];

    const { company, customerbigtruck, customersmalltruck, officers, quotation } = useBasicData();
    const { banks } = useTripData();
    const companyDetail = Object.values(company || {});
    const customerB = Object.values(customerbigtruck || {});
    const customerS = Object.values(customersmalltruck || {});
    const employees = Object.values(officers || {});
    const bankDetail = Object.values(banks || {});
    const quotations = Object.values(quotation || {});

    const [companies, setCompanies] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [isBangchak, setIsBangchak] = useState("");
    const [note, setNote] = useState("");
    const [check, setCheck] = useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date));
    const [selectedDateDelivery, setSelectedDateDelivery] = useState(dayjs(new Date));
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const handleSelect = (index) => {
        setSelectedIndex(index === selectedIndex ? null : index); // คลิกอีกครั้งเพื่อล้าง (optional)
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect(index);
        }
    };

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
    console.log("company : ", companies);

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

    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
        }
    };

    const handleDateChangeDateDelivery = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateDelivery(formattedDate);
        }
    };

    const exportToPDF = () => {
        // 🔹 ตรวจสอบข้อมูลก่อน
        if (!companies?.id || !customer?.id || !employee?.id) {
            ShowWarning("กรุณาเลือก บริษัท / ลูกค้า / ผู้เสนอราคา ให้ครบถ้วน");
            return;
        }

        // ตรวจสอบ fuelData ว่ามีค่า Volume และ RateOil อย่างน้อย 1 ตัว
        const hasFuelData = Object.values(fuelData).some(
            (p) => p.Volume && p.RateOil
        );
        if (!hasFuelData) {
            ShowWarning("กรุณากรอกข้อมูลสินค้า (ปริมาณ/ราคา) อย่างน้อย 1 รายการ");
            return;
        }

        if (!selectedDate) {
            ShowWarning("กรุณาเลือกวันที่เสนอราคา");
            return;
        }

        // ✅ สร้างรหัสใหม่
        const date = dayjs(new Date());
        const buddhistYear = date.year() + 543;
        const prefix = `${String(buddhistYear).slice(2)}${date.format("MM")}`;

        const sameMonth = Object.values(quotation).filter(
            (q) => q.Code?.startsWith(prefix)
        );

        const lastNo =
            sameMonth.length > 0
                ? Math.max(...sameMonth.map((q) => Number(q.Code.split("/")[1]) || 0))
                : 0;

        const newCode = `${prefix}/${String(lastNo + 1).padStart(3, "0")}`;

        // 🔹 บันทึกลง Firebase
        database
            .ref("quotation/")
            .child(quotations.length)
            .update({
                id: quotations.length,
                Code: newCode,
                DateStart: dayjs(new Date).format("DD/MM/YYYY"),
                Date: dayjs(selectedDate, "DD/MM/YYYY").format("DD/MM/YYYY"),
                DateDelivery: dayjs(selectedDateDelivery, "DD/MM/YYYY").format("DD/MM/YYYY"),
                Company: `${companies?.id}:${companies?.Name}`,
                Customer: `${customer?.id}:${customer?.Name}`,
                Employee: `${employee?.id}:${employee?.Name}`,
                Product: getFilledFuelData(fuelData),
                selectedIndex: selectedIndex,
                Truck: check ? "รถใหญ่" : "รถเล็ก",
                Note: note,
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                console.log("บันทึกข้อมูลเรียบร้อย ✅");

                // 🔹 เตรียมข้อมูลสำหรับหน้าพิมพ์
                const invoiceData = {
                    Code: newCode,
                    DateB: dayjs(selectedDate, "DD/MM/YYYY"),
                    DateD: dayjs(selectedDateDelivery, "DD/MM/YYYY"),
                    Company: companies,
                    Customer: customer,
                    Employee: employee,
                    Product: getFilledFuelData(fuelData),
                    Products: products,
                    Note: note,
                    items: items[selectedIndex] || "",
                };

                sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

                // 🔹 เปิดหน้าต่างใหม่
                const screenWidth = window.screen.width;
                const screenHeight = window.screen.height;
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
            })
            .catch((error) => {
                ShowError("ไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    };

    return (
        <React.Fragment>
            <Grid container spacing={2} marginTop={1}>
                {/* <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: -2, marginBottom: -1 }} gutterBottom>กรอกข้อมูลใบเสนอราคาลูกค้า</Typography>
                        </Grid> */}
                <Grid item xs={8} textAlign="left">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>กรอกข้อมูลใบเสนอราคาลูกค้า</Typography>
                    <Divider />
                </Grid>
                <Grid item xs={4} textAlign="right">
                    <Button variant="contained" color="warning" onClick={() => setOpen(false)} endIcon={<KeyboardDoubleArrowRightIcon />} >ตรวจสอบใบวางบิลที่เคยกรอกข้อมูล</Button>
                </Grid>
                <Grid item xs={4}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Paper>
                            <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={selectedDate ? dayjs(selectedDate, "DD/MM/YYYY") : null}
                                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                onChange={handleDateChangeDate}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDate), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                            readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                        },
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <b>วันที่เสนอราคา :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: "15px",
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
                                onChange={handleDateChangeDateDelivery}
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
                                                fontSize: "15px",
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
                {/* <Grid item xs={4} textAlign="right">
                    <Button variant="contained" color="warning" onClick={() => setOpen(false)} endIcon={<KeyboardDoubleArrowRightIcon />} >ตรวจสอบใบวางบิลที่เคยกรอกข้อมูล</Button>
                </Grid> */}
                <Grid item xs={6}>
                    <Paper sx={{ width: "100%" }}>
                        <Autocomplete
                            options={companyDetail.filter((row) => row.id !== 1)}
                            getOptionLabel={(option) => option.Name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={companies}
                            onChange={(event, newValue) => {
                                setCompanies(newValue);
                                const companyName = newValue.Name?.trim() || "";
                                const isBangchak = companyName.includes("นาครา ปิโตรเลียม 2016");
                                setIsBangchak(isBangchak)
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": { height: "40px" },
                                        "& .MuiInputBase-input": { fontSize: "15px", padding: "2px 6px" },
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                <b>เลือกบริษัท :</b>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            fontSize: "15px",
                                            height: "40px",
                                            padding: "10px",
                                            fontWeight: "bold",
                                        },
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Typography fontSize="15px">{option.Name}</Typography>
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
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    value={customer}
                                    onChange={(event, newValue) => setCustomer(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "40px" },
                                                "& .MuiInputBase-input": { fontSize: "15px", padding: "2px 6px" },
                                            }}
                                            InputProps={{
                                                ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <b>เลือกลูกค้ารถใหญ่ :</b>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: "15px",
                                                    height: "40px",
                                                    padding: "10px",
                                                    fontWeight: "bold",
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Typography fontSize="15px">{option.Name}</Typography>
                                        </li>
                                    )}
                                />
                                :
                                <Autocomplete
                                    options={customerS}
                                    getOptionLabel={(option) => option.Name}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    value={customer}
                                    onChange={(event, newValue) => setCustomer(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "40px" },
                                                "& .MuiInputBase-input": { fontSize: "15px", padding: "2px 6px" },
                                            }}
                                            InputProps={{
                                                ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <b>เลือกลูกค้ารถเล็ก :</b>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: "15px",
                                                    height: "40px",
                                                    padding: "10px",
                                                    fontWeight: "bold",
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Typography fontSize="15px">{option.Name}</Typography>
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
                                                            InputLabelProps={{ sx: { fontSize: "14px" } }}
                                                            value={fuel.RateOil}
                                                            onChange={(e) => handleChange(key, "RateOil", e.target.value)}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '30px', // ปรับความสูงของ TextField
                                                                    display: 'flex', // ใช้ flexbox
                                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'left', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                    marginLeft: -0.5,
                                                                    marginRight: -1.5
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
                                                            InputLabelProps={{ sx: { fontSize: "14px" } }}
                                                            value={fuel.Volume}
                                                            onChange={(e) => handleChange(key, "Volume", e.target.value)}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '30px', // ปรับความสูงของ TextField
                                                                    display: 'flex', // ใช้ flexbox
                                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'left', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                    marginLeft: -0.5,
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
                {/* <Grid item xs={6}>
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
                                {companies ? companies?.Name.split("(")[0] : ""}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                ธนาคาร :
                            </Typography>
                            <Typography variant="subtitle2" sx={{ marginLeft: 2 }} gutterBottom>
                                {isBangchak ? "กสิกรไทย 663-100-9768" : "กสิกรไทย 633-101-3579"}
                            </Typography>
                        </Box>
                    </Box>
                </Grid> */}
                <Grid item xs={12} sx={{ mb: -2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        เลือกหมายเหตุมาตรฐานที่ต้องการเพิ่มในใบเสนอราคา
                    </Typography>
                </Grid>
                {items.map((text, idx) => {
                    const selected = idx === selectedIndex;
                    return (
                        <Grid item xs={12} md={4} key={idx}>
                            <Box
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSelect(idx)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: selected ? "2px solid" : "1px solid",
                                    borderColor: selected ? theme.palette.panda.main : "divider",
                                    cursor: "pointer",
                                    transition: "box-shadow 0.15s, transform 0.08s",
                                    boxShadow: selected ? 3 : 0,
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                    },
                                    height: "60px"
                                }}
                            >
                                <Typography variant="subtitle2" gutterBottom component="div"
                                    sx={{
                                        fontWeight: selected ? "bold" : "none",
                                        color: selected ? "black" : "gray"
                                    }}>
                                    {text}
                                </Typography>
                            </Box>
                        </Grid>
                    );
                })}
                <Grid item xs={6}>
                    <TextField
                        size="small"
                        type="text"
                        fullWidth
                        multiline
                        minRows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        InputLabelProps={{ sx: { fontSize: "15px" } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                display: 'flex',
                                alignItems: 'flex-start', // <-- แก้จาก 'top' เป็น 'flex-start'
                                height: 'auto', // ให้ขยายตามเนื้อหา (แทนการ fix 35px)
                            },
                            '& .MuiInputBase-input': {
                                fontSize: '15px',
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
                    <Grid container>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={employees}
                                getOptionLabel={(option) => option.Name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={employee}
                                onChange={(event, newValue) => setEmployee(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": { height: "40px" },
                                            "& .MuiInputBase-input": { fontSize: "15px", padding: "2px 6px" },
                                        }}
                                        InputProps={{
                                            ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>เลือกผู้เสนอราคา :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: "15px",
                                                height: "40px",
                                                padding: "10px",
                                                fontWeight: "bold",
                                            },
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Typography fontSize="15px">{option.Name}</Typography>
                                    </li>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} textAlign="right">
                            <Button variant="contained" onClick={exportToPDF} sx={{ marginTop: 1 }} >พิมพ์ใบเสนอราคาลูกค้า</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default QuotationDetail;
