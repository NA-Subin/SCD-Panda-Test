import React, { useEffect, useMemo, useState } from "react";
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
    IconButton,
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
    Tooltip,
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
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });


    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const [cancel, setCancel] = useState(false);
    const [edit, setEdit] = useState(true);
    const [companies, setCompanies] = useState(null);
    const [invoice, setInvoice] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [ID, setID] = useState("");
    const [code, setCode] = useState("");
    const [isBangchak, setIsBangchak] = useState("");
    const [note, setNote] = useState("");
    const [check, setCheck] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState(dayjs().startOf('month'));
    const [selectedDateDelivery, setSelectedDateDelivery] = useState(dayjs(new Date));
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [selectedIndex, setSelectedIndex] = React.useState(null);

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
    console.log("quotations : ", quotations);

    const filteredQuotations = useMemo(() => {
        return quotations.filter(q => {
            // เอาเฉพาะข้อความหลัง ":"
            const codeText = q.Code.split(":")[1] || q.Code;
            const companyText = q.Company.split(":")[1] || q.Company;
            const customerText = q.Customer.split(":")[1] || q.Customer;

            // กรองตาม search
            const matchesSearch = search
                ? codeText.toLowerCase().includes(search.toLowerCase()) ||
                companyText.toLowerCase().includes(search.toLowerCase()) ||
                customerText.toLowerCase().includes(search.toLowerCase())
                : true;

            // กรองตามช่วงวันที่ DateStart
            const dateStart = dayjs(q.Date, "DD/MM/YYYY");
            const matchesDate = dateStart.isSameOrAfter(selectedDateStart, 'day') &&
                dateStart.isSameOrBefore(selectedDateEnd, 'day');

            const c = cancel ? q.Status === "ยกเลิก" : q.Status !== "ยกเลิก"

            return matchesSearch && matchesDate && c;
        }).sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case "Date":
                    aValue = dayjs(a.Date, "DD/MM/YYYY").toDate();
                    bValue = dayjs(b.Date, "DD/MM/YYYY").toDate();
                    break;
                case "Company":
                    aValue = a.Company?.split(":")[1] || "";
                    bValue = b.Company?.split(":")[1] || "";
                    break;
                case "Customer":
                    aValue = a.Customer?.split(":")[1] || "";
                    bValue = b.Customer?.split(":")[1] || "";
                    break;
                case "Employee":
                    aValue = a.Employee?.split(":")[1] || "";
                    bValue = b.Employee?.split(":")[1] || "";
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [quotations, search, selectedDateStart, selectedDateEnd, sortConfig]);

    console.log("filteredQuotations : ", filteredQuotations);

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
        setID(row.id);
        setCode(row.Code);
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
        setSelectedDate(dayjs(row.Date, "DD/MM/YYYY"))
        setSelectedDateDelivery(dayjs(row.DateDelivery, "DD/MM/YYYY"))
        setNote(row.Note);
        setSelectedIndex(row.selectedIndex);

        // 🔹 merge fuelData: เติม "" ให้สินค้าที่ไม่มีค่าใน row.Product
        const newFuelData = { ...initialFuelData }; // copy ค่า default
        Object.keys(newFuelData).forEach((code) => {
            if (row.Product?.[code]) {
                newFuelData[code] = { ...row.Product[code] };
            }
        });
        setFuelData(newFuelData);
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

    const handleSave = () => {
        database.ref("quotation/").child(ID).update({
            Date: dayjs(selectedDate, "DD/MM/YYYY").format("DD/MM/YYYY"),
            DateDelivery: dayjs(selectedDateDelivery, "DD/MM/YYYY").format("DD/MM/YYYY"),
            Company: `${companies?.id}:${companies?.Name}`,
            Customer: `${customer?.id}:${customer?.Name}`,
            Employee: `${employee?.id}:${employee?.Name}`,
            Product: getFilledFuelData(fuelData),
            selectedIndex: selectedIndex,
            Truck: check ? "รถใหญ่" : "รถเล็ก",
            Note: note,
        })
            .then(() => {
                console.log("บันทึกข้อมูลเรียบร้อย ✅");
                ShowSuccess("บันทึกข้อมูลเรียบร้อย ✅");
                setEdit(true);
            })
            .catch((error) => {
                ShowError("ไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    }

    const handleCancel = (id) => {
        ShowConfirm(
            `ต้องการลบใบวางบิลลำดับที่ ${id + 1} ใช่หรือไม่`,
            () => {
                database.ref("quotation/").child(id).update({
                    Status: "ยกเลิก",
                })
                    .then(() => {
                        ShowSuccess("บันทึกข้อมูลเรียบร้อย ✅");
                    })
                    .catch((error) => {
                        ShowError("ไม่สำเร็จ");
                        console.error("Error updating data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกการลบบิลลำดับที่ ${id + 1}`);
            }
        );
    }

    const handleEdit = (id) => {
        ShowConfirm(
            `ต้องการให้ใบวางบิลลำดับที่ ${id + 1} ย้อนกลับไปสถานะเดิมใช่หรือไม่`,
            () => {
                database.ref("quotation/").child(id).update({
                    Status: "อยู่ในระบบ",
                })
                    .then(() => {
                        ShowSuccess("บันทึกข้อมูลเรียบร้อย ✅");
                    })
                    .catch((error) => {
                        ShowError("ไม่สำเร็จ");
                        console.error("Error updating data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกการลบบิลลำดับที่ ${id + 1}`);
            }
        );
    }

    const exportToPDF = () => {
        const invoiceData = {
            Code: code,
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
                <Grid item xs={6} sx={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Paper sx={{ mr: 2 }}>
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
                                                <InputAdornment position="start">
                                                    <b>วันที่เริ่มต้น :</b>
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
                                                <InputAdornment position="start">
                                                    <b>วันที่สิ้นสุด :</b>
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
                <Grid item xs={5}>
                    <Paper>
                        <TextField
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{
                                "& .MuiOutlinedInput-root": { height: "40px" },
                                "& .MuiInputBase-input": { fontSize: "15px" },
                            }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                        <b>ค้นหา :</b>
                                    </InputAdornment>
                                ),
                                sx: {
                                    fontSize: "15px",
                                    height: "40px",
                                    padding: "10px",
                                },
                            }}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={1}>
                    <FormGroup row >
                        {/* <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>สถานะ : </Typography> */}
                        <FormControlLabel control={<Checkbox checked={cancel} />} onChange={() => setCancel(!cancel)} label="ยกเลิก" />
                    </FormGroup>
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
                            sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" }, width: "1155px" }}
                        >
                            <TableHead sx={{ height: "5vh" }}>
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", width: 50 }}>ลำดับ</TablecellSelling>
                                    <TablecellSelling onClick={() => handleSort("Date")} sx={{ textAlign: "center", width: 100 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'center' }}>
                                            วันที่
                                            {sortConfig.key === "Date" ? (
                                                sortConfig.direction === "asc" ? (
                                                    <ArrowDropDownIcon />
                                                ) : (
                                                    <ArrowDropUpIcon />
                                                )
                                            ) : (
                                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                            )}
                                        </Box>
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 100 }}>Code</TablecellSelling>
                                    <TablecellSelling onClick={() => handleSort("Company")} sx={{ textAlign: "center", width: 300 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'center' }}>
                                            บริษัท
                                            {sortConfig.key === "Company" ? (
                                                sortConfig.direction === "asc" ? (
                                                    <ArrowDropDownIcon />
                                                ) : (
                                                    <ArrowDropUpIcon />
                                                )
                                            ) : (
                                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                            )}
                                        </Box>
                                    </TablecellSelling>
                                    <TablecellSelling onClick={() => handleSort("Customer")} sx={{ textAlign: "center", width: 300 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'center' }}>
                                            ลูกค้า
                                            {sortConfig.key === "Customer" ? (
                                                sortConfig.direction === "asc" ? (
                                                    <ArrowDropDownIcon />
                                                ) : (
                                                    <ArrowDropUpIcon />
                                                )
                                            ) : (
                                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                            )}
                                        </Box>
                                    </TablecellSelling>
                                    <TablecellSelling onClick={() => handleSort("Employee")} sx={{ textAlign: "center", width: 170 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'center' }}>
                                            ผู้เสนอราคา
                                            {sortConfig.key === "Employee" ? (
                                                sortConfig.direction === "asc" ? (
                                                    <ArrowDropDownIcon />
                                                ) : (
                                                    <ArrowDropUpIcon />
                                                )
                                            ) : (
                                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                            )}
                                        </Box>
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 100 }} >
                                        สถานะ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ width: 30, position: "sticky", right: 0, zIndex: 2 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    filteredQuotations.length <= 0 ?
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Box
                                                    display="flex"
                                                    flexDirection="column"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    py={3} // เพิ่ม padding แนวตั้ง
                                                    height="42vh"
                                                >
                                                    <FolderOffIcon color="action" sx={{ fontSize: 20, mb: 1 }} />
                                                    <Typography variant="subtitle1" color="textSecondary">
                                                        ไม่มีข้อมูล
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                        :
                                        filteredQuotations.map((row, index) => (
                                            <TableRow
                                                key={row.id}
                                                onClick={() => handleUpdate(row)}
                                                sx={{
                                                    cursor: "pointer",
                                                    ':hover': {
                                                        backgroundColor: "#e8eaf6"
                                                    }
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: (invoice && ID === row.id) && "bold",
                                                        backgroundColor: (invoice && ID === row.id) && "#e8eaf6"
                                                    }}
                                                >
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: (invoice && ID === row.id) && "bold",
                                                        backgroundColor: (invoice && ID === row.id) && "#e8eaf6"
                                                    }}
                                                >
                                                    {formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: (invoice && ID === row.id) && "bold",
                                                        backgroundColor: (invoice && ID === row.id) && "#e8eaf6"
                                                    }}
                                                >
                                                    {row.Code}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "left",
                                                        fontWeight: (invoice && ID === row.id) && "bold",
                                                        backgroundColor: (invoice && ID === row.id) && "#e8eaf6"
                                                    }}
                                                >
                                                    <Box sx={{ marginLeft: 1 }}>
                                                        {row.Company ? row.Company.split(":")[1] : ""}
                                                    </Box>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "left",
                                                        fontWeight: (invoice && ID === row.id) && "bold",
                                                        backgroundColor: (invoice && ID === row.id) && "#e8eaf6"
                                                    }}
                                                >
                                                    <Box sx={{ marginLeft: 1 }}>
                                                        {row.Customer ? row.Customer.split(":")[1] : ""}
                                                    </Box>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "left",
                                                        fontWeight: (invoice && ID === row.id) && "bold",
                                                        backgroundColor: (invoice && ID === row.id) && "#e8eaf6"
                                                    }}
                                                >
                                                    <Box sx={{ marginLeft: 1 }}>
                                                        {row.Employee ? row.Employee.split(":")[1] : ""}
                                                    </Box>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: (invoice && ID === row.id) && "bold",
                                                        backgroundColor: (invoice && ID === row.id) && "#e8eaf6"
                                                    }}
                                                >
                                                    {row.Status}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        position: "sticky",
                                                        right: 0,
                                                        zIndex: 2,
                                                        backgroundColor: "white"
                                                    }}
                                                >
                                                    {
                                                        row.Status !== "ยกเลิก" ?
                                                            <Tooltip title="ยกเลิกใบเสนอราคา" placement="right" >
                                                                <IconButton color="error" size="small" onClick={() => handleCancel(row.id)} >
                                                                    <DeleteForeverIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            :
                                                            <Tooltip title="ย้อนกลับไปสถานะเดิม" placement="right" >
                                                                <IconButton color="success" size="small" onClick={() => handleEdit(row.id)} >
                                                                    <ChangeCircleIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                    }
                                                </TableCell>
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
                                        disabled={edit ? true : false}
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
                                        disabled={edit ? true : false}
                                    />
                                </Paper>
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={4}>
                            <FormGroup row >
                                <Typography variant="subtitle1" fontWeight="bold" color={edit ? "gray" : "black"} sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>สถานะรถ : </Typography>
                                <FormControlLabel disabled={edit ? true : false} control={<Checkbox checked={check ? true : false} />} onChange={() => setCheck(true)} label="รถใหญ่" />
                                <FormControlLabel disabled={edit ? true : false} control={<Checkbox checked={!check ? true : false} />} onChange={() => setCheck(false)} label="รถเล็ก" />
                            </FormGroup>
                        </Grid>
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
                                                    fontWeight: "bold"
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Typography fontSize="15px">{option.Name}</Typography>
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
                                                            fontWeight: "bold"
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="15px">{option.Name}</Typography>
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
                                                            fontWeight: "bold"
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="15px">{option.Name}</Typography>
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
                                                        backgroundColor: productColorsHead[product.code],
                                                        opacity: edit ? 0.7 : 0.9
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
                                                            <Typography variant="subtitle2" sx={{ marginBottom: -1, fontSize: "12px", textAlign: "center", fontWeight: "bold", opacity: edit ? 0.7 : 0.9 }} gutterBottom>ราคา/ลิตร</Typography>
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <Typography variant="subtitle2" sx={{ marginBottom: -1, fontSize: "12px", textAlign: "center", fontWeight: "bold", opacity: edit ? 0.7 : 0.9 }} gutterBottom>จำนวนลิตร</Typography>
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
                                                                            marginLeft: -0.5,
                                                                            marginRight: -1.5
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
                                                                            marginLeft: -0.5,
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
                            <Typography variant="subtitle1" fontWeight="bold" color={edit ? "gray" : "black"} gutterBottom>
                                เลือกหมายเหตุมาตรฐานที่ต้องการเพิ่มในใบเสนอราคา
                            </Typography>
                        </Grid>
                        {items.map((text, idx) => {
                            const selected = idx === selectedIndex;
                            return (
                                <Grid item xs={12} md={4} key={idx}>
                                    {
                                        edit ? (
                                            <Box
                                                role="button"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    border: selected ? "2px solid" : "1px solid",
                                                    borderColor: selected ? "gray" : "divider",
                                                    height: "60px"
                                                }}
                                            >
                                                <Typography variant="subtitle2" gutterBottom component="div"
                                                    sx={{
                                                        fontWeight: selected ? "bold" : "none",
                                                        color: selected ? "gray" : "lightgray"
                                                    }}>
                                                    {text}
                                                </Typography>
                                            </Box>
                                        )
                                            :
                                            (
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
                                            )
                                    }
                                </Grid>
                            );
                        })}
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                type="number"
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
                                disabled={edit ? true : false}
                            />
                        </Grid>
                        <Grid item xs={6}>
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
                                    disabled={edit ? true : false}
                                />
                            </Grid>
                            <Grid item xs={12} textAlign="right">
                                <Box sx={{ marginTop: 1, display: "flex", alignItems: "center", justifyContent: "right" }}>
                                    {
                                        edit ?
                                            <React.Fragment>
                                                {
                                                    !cancel &&
                                                    <React.Fragment>
                                                        <Button variant="contained" color="warning" onClick={() => setEdit(false)} sx={{ marginRight: 1 }} >แก้ไข</Button>
                                                        <Button variant="contained" onClick={exportToPDF} >พิมพ์ใบเสนอราคาลูกค้า</Button>
                                                    </React.Fragment>
                                                }
                                            </React.Fragment>

                                            :
                                            <React.Fragment>
                                                <Button variant="contained" color="error" onClick={() => setEdit(true)} sx={{ marginRight: 1 }} >ยกเลิก</Button>
                                                <Button variant="contained" color="success" onClick={handleSave} >บันทึก</Button>
                                            </React.Fragment>
                                    }
                                </Box>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                }
            </Grid>
        </React.Fragment>
    );
};

export default QuotationUpdate;
