import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
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
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/th';
import { database } from "../../server/firebase";
import { TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellSelling, TableCellPWD, TablecellHeader } from "../../theme/style";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";

const QuotationUpdate = ({ setOpen }) => {
    const navigate = useNavigate();

    const { company, customerbigtruck, customersmalltruck, officers, quotation } = useBasicData();
    const { banks } = useTripData();
    const companyDetail = Object.values(company || {});
    const customerB = Object.values(customerbigtruck || {});
    const customerS = Object.values(customersmalltruck || {});
    const employees = Object.values(officers || {});
    const bankDetail = Object.values(banks || {});
    const quotations = Object.values(quotation || {});

    const [edit, setEdit] = useState(true);
    const [companies, setCompanies] = useState(null);
    const [invoice, setInvoice] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [isBangchak, setIsBangchak] = useState("");
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

    const handleUpdate = (row) => {
        // แยก id ของ Company, Customer, Employee จาก string "id:Name"
        const getIdFromString = (str) => (str ? Number(str.split(":")[0]) : null);

        const companyId = getIdFromString(row.Company);
        const customerId = getIdFromString(row.Customer);
        const employeeId = getIdFromString(row.Employee);

        // หา object ที่ตรงกับ id
        const cn = companyDetail.find((com) => com.id === companyId);

        const cm =
            row.Truck === "รถใหญ่"
                ? customerB.find((cus) => cus.id === customerId)
                : customerS.find((cus) => cus.id === customerId);

        const em = employees.find((emp) => emp.id === employeeId);

        // ตั้งค่า state
        setCompanies(cn);
        setCustomer(cm);
        setEmployee(em);
        setInvoice(true);
        // เปลี่ยนหน้า
        setCheck(row.Truck === "รถใหญ่");
        setSelectedDateBid(dayjs(row.Date, "DD/MM/YYYY"))
        setNote(row.Note);

        // 🔹 merge fuelData: เติม "" ให้สินค้าที่ไม่มีค่าใน row.Product
        const newFuelData = { ...initialFuelData }; // copy ค่า default
        Object.keys(newFuelData).forEach((code) => {
            if (row.Product?.[code]) {
                newFuelData[code] = { ...row.Product[code] };
            }
        });
        setFuelData(newFuelData);
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
        const invoiceData = {
            DateB: dayjs(selectedDateBid, "DD/MM/YYYY"),
            DateD: dayjs(selectedDateDelivery, "DD/MM/YYYY"),
            Company: companies,
            Customer: customer,
            Employee: employee,
            Product: getFilledFuelData(fuelData),
            Products: products,
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
        <React.Fragment>
            <Grid container spacing={2} marginTop={1}>
                {/* <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: -2, marginBottom: -1 }} gutterBottom>กรอกข้อมูลใบเสนอราคาลูกค้า</Typography>
                        </Grid> */}
                <Grid item xs={12} textAlign="right">
                    <Button variant="contained" color="error" onClick={() => setOpen(true)} startIcon={<KeyboardDoubleArrowLeftIcon />} >กลับไปยังหน้าสำหรับเพิ่มข้อมูล</Button>
                </Grid>
                <Grid item xs={12}>
                    <TableContainer
                        component={Paper}
                        sx={{
                            height: "55vh",
                        }}
                    >
                        <Table
                            stickyHeader
                            size="small"
                            sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                        >
                            <TableHead sx={{ height: "5vh" }}>
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", width: 50 }}>ลำดับ</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 80 }}>วันที่</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 80 }}>Code</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 200 }}>บริษัท</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 200 }}>ลูกค้า</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 120 }}>ผู้เสนอราคา</TablecellSelling>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {quotations.map((row, index) => (
                                    <TableRow
                                        key={row.id || index}
                                        onClick={() => handleUpdate(row)}
                                        sx={{
                                            cursor: "pointer",
                                            ':hover': {
                                                backgroundColor: "#e8eaf6"
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ textAlign: "center", fontWeight: invoice && "bold", backgroundColor: invoice && "#e8eaf6" }} >{index + 1}</TableCell>
                                        <TableCell sx={{ textAlign: "center", fontWeight: invoice && "bold", backgroundColor: invoice && "#e8eaf6" }} >{formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}</TableCell>
                                        <TableCell sx={{ textAlign: "center", fontWeight: invoice && "bold", backgroundColor: invoice && "#e8eaf6" }} >{row.Code}</TableCell>
                                        <TableCell sx={{ textAlign: "left", fontWeight: invoice && "bold", backgroundColor: invoice && "#e8eaf6" }} >{row.Company ? row.Company.split(":")[1] : ""}</TableCell>
                                        <TableCell sx={{ textAlign: "left", fontWeight: invoice && "bold", backgroundColor: invoice && "#e8eaf6" }} >{row.Customer ? row.Customer.split(":")[1] : ""}</TableCell>
                                        <TableCell sx={{ textAlign: "left", fontWeight: invoice && "bold", backgroundColor: invoice && "#e8eaf6" }} >{row.Employee ? row.Employee.split(":")[1] : ""}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                {
                    invoice &&
                    <React.Fragment>
                        <Grid item xs={12}>
                            <Divider sx={{ marginBottom: 1, marginTop: 1 }}>
                                <Chip label="ข้อมูลใบเสนอราคา" size="small" />
                            </Divider>
                        </Grid>
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
                                        disabled={edit ? true : false}
                                    />
                                </Paper>
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={4}>
                            <FormGroup row >
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>สถานะรถ : </Typography>
                                <FormControlLabel disabled={edit ? true : false} control={<Checkbox checked={check ? true : false} />} onChange={() => setCheck(true)} label="รถใหญ่" />
                                <FormControlLabel disabled={edit ? true : false} control={<Checkbox checked={!check ? true : false} />} onChange={() => setCheck(false)} label="รถเล็ก" />
                            </FormGroup>
                        </Grid>
                        <Grid item xs={4}></Grid>
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
                                                "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                            }}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <b>เลือกบริษัท :</b>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: "16px",
                                                    height: "40px",
                                                    padding: "10px",
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Typography fontSize="16px">{option.Name}</Typography>
                                        </li>
                                    )}
                                    disabled={edit ? true : false}
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
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="16px">{option.Name}</Typography>
                                                </li>
                                            )}
                                            disabled={edit ? true : false}
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
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="16px">{option.Name}</Typography>
                                                </li>
                                            )}
                                            disabled={edit ? true : false}
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
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            marginLeft: -1,
                                                                            marginRight: -2
                                                                        },
                                                                    }}
                                                                    disabled={edit ? true : false}
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
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                        },
                                                                    }}
                                                                    disabled={edit ? true : false}
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
                                disabled={edit ? true : false}
                            />
                        </Grid>
                        <Grid item xs={6}>
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
                                disabled={edit ? true : false}
                            />
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                            <Box sx={{ marginTop: 1, display: "flex", alignItems: "center", justifyContent: "right" }}>
                                {
                                    edit ?
                                        <React.Fragment>
                                            <Button variant="contained" size="small" color="warning" onClick={() => setEdit(false)} sx={{ marginRight: 1 }} >แก้ไข</Button>
                                            <Button variant="contained" size="small" onClick={exportToPDF} >พิมพ์ใบเสนอราคาลูกค้า</Button>
                                        </React.Fragment>

                                        :
                                        <React.Fragment>
                                            <Button variant="contained" size="small" color="error" onClick={() => setEdit(true)} sx={{ marginRight: 1 }} >ยกเลิก</Button>
                                            <Button variant="contained" size="small" color="success" onClick={() => setEdit(true)} >บันทึก</Button>
                                        </React.Fragment>
                                }
                            </Box>
                        </Grid>
                    </React.Fragment>
                }
            </Grid>
        </React.Fragment>
    );
};

export default QuotationUpdate;
