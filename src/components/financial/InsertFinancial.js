import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    List,
    MenuItem,
    Paper,
    Popover,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { IconButtonError, TablecellSelling } from "../../theme/style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useData } from "../../server/path";
import dayjs from "dayjs";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InsertSpendingAbout from "./InsertSpendingAbout";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { Details } from "@mui/icons-material";
import { formatThaiFull, formatThaiShort, formatThaiSlash } from "../../theme/DateTH";
import FileUploadCard from "../../theme/FileUploadCard";

const InsertFinancial = () => {
    // const { reghead, regtail, small, report, reportType } = useData();
    const { reghead, regtail, small, companypayment, expenseitems } = useBasicData();
    const { report, reportType } = useTripData();
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(regtail);
    const registrationS = Object.values(small);
    const reportDetail = Object.values(report);
    const companypaymentDetail = Object.values(companypayment);
    const expenseitem = Object.values(expenseitems);
    const [open, setOpen] = React.useState(false);
    const [registrationTruck, setRegistrationTruck] = React.useState("");
    const [invoiceID, setInvoiceID] = React.useState("");
    const [note, setNote] = React.useState("");
    const [details, setDetails] = React.useState("");
    const [company, setCompany] = React.useState("");
    const [bank, setBank] = React.useState("");
    const [price, setPrice] = useState("0.00");
    const [vat, setVat] = useState("0.00");
    const [total, setTotal] = useState("0.00");
    const [resultPrice, setResultPrice] = useState("0.00");
    const [resultVat, setResultVat] = useState("0.00");
    const [resultTotal, setResultTotal] = useState("0.00");
    const [manualTotal, setManualTotal] = useState(false); // เช็คว่าผู้ใช้แก้ total โดยตรง
    const [file, setFile] = useState("ไม่แนบไฟล์");
    const [fileType, setFileType] = useState(1);

    console.log("P : ", price);
    console.log("V : ", vat);
    console.log("T : ", total);
    console.log("M : ", manualTotal);

    console.log("RP : ", resultPrice);
    console.log("RV : ", resultVat);
    console.log("RT : ", resultTotal);

    const parseNumber = (val) => {
        if (typeof val === "string") {
            return parseFloat(val.replace(/,/g, "")) || 0;
        }
        return Number(val) || 0;
    };


    // คำนวณ total เมื่อ price หรือ vat เปลี่ยน และ total ไม่ได้แก้เอง
    useEffect(() => {
        if (manualTotal) {
            const priceNum = parseNumber(price);
            const vatNum = parseNumber(vat);
            setTotal((priceNum + vatNum).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }));
        }
    }, [price, vat]);

    const [selectedDateInvoice, setSelectedDateInvoice] = useState(dayjs(new Date));
    const [selectedDateTransfer, setSelectedDateTransfer] = useState(dayjs(new Date));
    const [result, setResult] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [type, setType] = useState("หัวรถ");
    const [group, setGroup] = useState("เดี่ยว");

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

    const handleReceiveData = (data) => {
        console.log('Data from child:', data);
        setResult(data);
    };

    const getRegistration = () => {
        const registartion = [
            ...registrationH.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "หัวรถใหญ่" })),
            ...registrationT.map((item) => ({ ...item, Registration: item.RegTail, TruckType: "หางรถใหญ่" })),
            ...registrationS.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "รถเล็ก" })),
        ];

        return registartion;
    };

    console.log("Show Registration : ", getRegistration());
    console.log("company : ", company);

    const truckTypeMap = {
        "หัวรถ": "หัวรถใหญ่",
        "หางรถ": "หางรถใหญ่",
        "รถเล็ก": "รถเล็ก"
    };

    console.log("Date Invoice : ", dayjs(selectedDateInvoice));
    console.log("Date Transfer : ", dayjs(selectedDateTransfer));

    const handleDateChangeDateInvoice = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateInvoice(formattedDate);
        }
    };

    const handleDateChangeDateTransfer = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateTransfer(formattedDate);
        }
    };

    //const [registrationTruck, setRegistrationTruck] = useState(null);
    const [list, setList] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null);

    const handleAdd = () => {
        if (!registrationTruck) return;
        const reg =
            type === "หัวรถ" || type === "รถเล็ก"
                ? registrationTruck?.RegHead
                : registrationTruck?.RegTail;

        setList((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                registration: reg,
                truckType: registrationTruck?.TruckType,
            },
        ]);
        setRegistrationTruck("");
    };

    const handleDelete = (id) => {
        setList((prev) => prev.filter((item) => item.id !== id));
    };

    console.log("Registration Truck : ",
        registrationTruck.TruckType === "หัวรถใหญ่"
            ? `${registrationTruck.RegHead}(${registrationTruck.TruckType})`
            : registrationTruck.TruckType === "หางรถใหญ่"
                ? `${registrationTruck.RegTail}(${registrationTruck.TruckType})`
                : registrationTruck.TruckType === "รถเล็ก"
                    ? `${registrationTruck.RegHead}(${registrationTruck.TruckType})`
                    : ""
    );

    useEffect(() => {
        if (manualTotal) {
            if (list.length > 0) {
                const priceNum = parseNumber(price);
                const vatNum = parseNumber(vat);
                const totalNum = parseNumber(total);
                setResultPrice((priceNum / list.length).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }))
                setResultVat((vatNum / list.length).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }))
                setResultTotal((totalNum / list.length).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }))
            } else {
                setResultPrice("0.00");
                setResultVat("0.00");
                setResultTotal("0.00");
            }
        }
    }, [price, vat, list]);  // 👈 เพิ่ม list เข้าไป

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePost = async () => {
        if (!list || list.length === 0) {
            ShowError("ไม่มีข้อมูลที่จะบันทึก");
            return;
        }

        if (!file) return alert("กรุณาเลือกไฟล์ก่อน");

        let img = "ไม่แนบไฟล์"; // ตั้งค่าเริ่มต้นไว้เลย

        // ✅ ตรวจสอบก่อนว่า file เป็น "ไม่แนบไฟล์" หรือไม่
        if (file !== "ไม่แนบไฟล์") {
            const formData = new FormData();
            formData.append("pic", file);

            try {
                const response = await fetch("https://upload.happysoftth.com/panda/uploads", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                img = data.file_path;
            } catch (err) {
                console.error("Upload failed:", err);
            }
        }

        console.log("Image after try/catch:", img);

        const startId = reportDetail.length; // ใช้ต่อจากของเดิม
        const updates = {};

        list.forEach((item, index) => {
            const id = startId + index;

            updates[id] = {
                id: id,
                InvoiceID: invoiceID,
                SelectedDateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                SelectedDateTransfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                Registration: item.registration,
                Company: `${company?.id}:${company?.Name}`,
                Details: details,
                Bank: `${bank?.id}:${bank?.Name}`,
                Note: note,
                Price: list.length <= 1 ? parseNumber(price) : parseNumber(resultPrice),
                Vat: list.length <= 1 ? parseNumber(vat) : parseNumber(resultVat),
                Total: list.length <= 1 ? parseNumber(total) : parseNumber(resultTotal),
                TruckType: item.truckType,
                Status: "อยู่ในระบบ",
                Path: img, // ✅ ถ้าไม่แนบไฟล์ก็จะได้ "ไม่แนบไฟล์"
            };
        });

        console.log("updates : ", updates);

        database
            .ref("report/invoice")
            .update(updates)
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("All data pushed successfully");
                setList([]);
                setInvoiceID("");
                setSelectedDateInvoice(dayjs(new Date()).format("DD/MM/YYYY"));
                setSelectedDateTransfer(dayjs(new Date()).format("DD/MM/YYYY"));
                setCompany("");
                setDetails("");
                setBank("");
                setNote("");
                setPrice("");
                setVat("");
                setOpen(false);
                setFile("ไม่แนบไฟล์");
                setFileType(1);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    console.log("registrationTruck: ", registrationTruck);
    console.log("Group : ", group);
    console.log("List : ", list);
    console.log("File : ", file);

    return (
        <React.Fragment>
            <Button
                variant="contained"
                color="primary"
                size="small"
                fullWidth
                sx={{
                    fontSize: "14px",
                    fontWeight: "bold"
                }}
                endIcon={<NoteAddIcon />}   // 👈 ใส่ไอคอนด้านหน้า
                onClick={handleClickOpen}
            >
                เพิ่มบิล
            </Button>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidth <= 900 ? true : false}
                onClose={handleClose}
                maxWidth="sm"
                sx={
                    (!result && group === "เดี่ยว") ?
                        {
                            zIndex: 1200,
                        }
                        :
                        {
                            '& .MuiDialog-container': {
                                justifyContent: 'flex-start', // 👈 ชิดซ้าย
                                alignItems: 'center',
                                marginLeft: windowWidth <= 900 ? 0 : 15
                            },
                            zIndex: 1200,
                        }
                }
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >เพิ่มบิล</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={0.5} marginBottom={-0.5}>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4.5 }} gutterBottom>เลขที่บิล</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={invoiceID} onChange={(e) => setInvoiceID(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 5 }} gutterBottom>วันที่บิล</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(selectedDateInvoice, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                                            format="DD/MM/YYYY"
                                            onChange={handleDateChangeDateInvoice}
                                            sx={{ marginRight: 2, }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                        value: formatThaiSlash(selectedDateInvoice), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 0.5 }} gutterBottom>วันที่โอน</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(selectedDateTransfer, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                                            format="DD/MM/YYYY"
                                            onChange={handleDateChangeDateTransfer}
                                            sx={{ marginRight: 2, }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                        value: formatThaiSlash(selectedDateTransfer), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ชื่อบริษัท</Typography>
                                {/* <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={company} onChange={(e) => setCompany(e.target.value)} />
                                </Paper> */}
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={companypaymentDetail}
                                        getOptionLabel={(option) => option?.Name || ""}
                                        value={company} // registrationTruck เป็น object แล้ว
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setCompany(newValue); // เก็บทั้ง object
                                            } else {
                                                setCompany(null); // หรือ default object ถ้ามี
                                            }
                                        }}
                                        ListboxProps={{
                                            sx: {
                                                maxHeight: 200, // ความสูงสูงสุดของ list
                                                overflow: 'auto',
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!company ? "เลือกบริษัทที่ต้องการเพิ่ม" : ""}
                                                variant="outlined"
                                                size="small"
                                            //   sx={{
                                            //     "& .MuiOutlinedInput-root": { height: "30px" },
                                            //     "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                            //   }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {option.Name}
                                                </Typography>
                                            </li>
                                        )}
                                    />

                                </Paper>
                                <Tooltip title="เพิ่มข้อมูลประเภทค่าใช้จ่าย" placement="top">
                                    <InsertSpendingAbout onSend={handleReceiveData} />
                                </Tooltip>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: -1.5, marginBottom: -1.5 }} >
                                <FormGroup row>
                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 3, marginLeft: 0.5, marginTop: 1 }} gutterBottom>เลือกประเภทรถ</Typography>
                                    <FormControlLabel control={<Checkbox checked={type === "หัวรถ" ? true : false} color="info" onChange={() => { setType("หัวรถ"); setSelectedValue(null) }} />} label="หัวรถ" />
                                    <FormControlLabel control={<Checkbox checked={type === "หางรถ" ? true : false} color="info" onChange={() => { setType("หางรถ"); setSelectedValue(null) }} />} label="หางรถ" />
                                    <FormControlLabel control={<Checkbox checked={type === "รถเล็ก" ? true : false} color="info" onChange={() => { setType("รถเล็ก"); setSelectedValue(null) }} />} label="รถเล็ก" />
                                </FormGroup>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1 }} gutterBottom>ป้ายทะเบียน</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        sx={{ flex: 1 }}
                                        options={(getRegistration() || []).filter(
                                            (option) => option?.TruckType === truckTypeMap[type]
                                        )}
                                        getOptionLabel={(option) => { return `${option?.Registration} (${option?.TruckType})`; }}
                                        value={selectedValue}  // แสดงค่าที่เลือกปัจจุบัน
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setSelectedValue(newValue);

                                                setList((prev) => {
                                                    const newItem = {
                                                        id: prev.length,
                                                        invoiceID: invoiceID,
                                                        dateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                                                        dateTranfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                                                        registration: `${newValue.id}:${newValue.Registration}`,
                                                        company: company,
                                                        details: details,
                                                        bank: bank,
                                                        note: note,
                                                        price: parseNumber(price),
                                                        vat: parseNumber(vat),
                                                        total: parseNumber(price) + parseNumber(vat),
                                                        truckType: newValue?.TruckType,
                                                    };

                                                    if (group === "เดี่ยว") {
                                                        return [newItem]; // ให้มีแค่ 1 รายการ
                                                    } else {
                                                        return [...prev, newItem]; // เพิ่มได้หลายรายการ
                                                    }
                                                });
                                                // setResultPrice((Number(price) / list.length).toLocaleString("en-US", {
                                                //     minimumFractionDigits: 2,
                                                //     maximumFractionDigits: 2,
                                                // }))
                                                // setResultVat((Number(vat) / list.length).toLocaleString("en-US", {
                                                //     minimumFractionDigits: 2,
                                                //     maximumFractionDigits: 2,
                                                // }))
                                                // setResultTotal(((Number(price) + Number(vat)) / list.length).toLocaleString("en-US", {
                                                //     minimumFractionDigits: 2,
                                                //     maximumFractionDigits: 2,
                                                // }))
                                            } else {
                                                setSelectedValue(null);  // เคลียร์ถ้าเลือกลบค่า
                                            }
                                        }}
                                        ListboxProps={{
                                            sx: {
                                                maxHeight: 200,
                                                overflow: "auto",
                                            },
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={`กรุณาเลือก${type}`}
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {(type === "หัวรถ" || type === "รถเล็ก") &&
                                                        `${option?.RegHead} (${option?.TruckType})`}
                                                    {type === "หางรถ" &&
                                                        `${option?.RegTail} (${option?.TruckType})`}
                                                </Typography>
                                            </li>
                                        )}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: -1.5, marginBottom: -1.5 }} >
                                <FormGroup row>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        textAlign="right"
                                        sx={{ whiteSpace: "nowrap", marginRight: 3, marginLeft: 0.5, marginTop: 1 }}
                                        gutterBottom
                                    >
                                        เลือกการเพิ่มข้อมูลรถ
                                    </Typography>

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={group === "เดี่ยว"}
                                                color="info"
                                                onChange={() => {
                                                    setGroup("เดี่ยว");
                                                    setList([]);
                                                    setSelectedValue(null);
                                                    setPrice("0.00");
                                                    setVat("0.00");
                                                }}
                                            />
                                        }
                                        label="เดี่ยว"
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={group === "กลุ่ม"}
                                                color="info"
                                                onChange={() => {
                                                    setGroup("กลุ่ม");
                                                    setList([]);
                                                    setSelectedValue(null);
                                                    setPrice("0.00");
                                                    setVat("0.00");
                                                }}
                                            />
                                        }
                                        label="กลุ่ม"
                                    />
                                </FormGroup>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1.5 }} gutterBottom>รายละเอียด</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4.5 }} gutterBottom>ชื่อบัญชี</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={expenseitem.filter((item) => item.Status === "อยู่ในระบบ") // ✅ filter ตาม Status
                                            .sort((a, b) => a.Name.localeCompare(b.Name))}
                                        getOptionLabel={(option) => option?.Name || ""}
                                        value={bank} // registrationTruck เป็น object แล้ว
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setBank(newValue); // เก็บทั้ง object
                                            } else {
                                                setBank(null); // หรือ default object ถ้ามี
                                            }
                                        }}
                                        ListboxProps={{
                                            sx: {
                                                maxHeight: 200, // ความสูงสูงสุดของ list
                                                overflow: 'auto',
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!bank ? "เลือกชื่อบัญชีที่ต้องการเพิ่ม" : ""}
                                                variant="outlined"
                                                size="small"
                                            //   sx={{
                                            //     "& .MuiOutlinedInput-root": { height: "30px" },
                                            //     "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                            //   }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {option.Name}
                                                </Typography>
                                            </li>
                                        )}
                                    />

                                </Paper>
                                {/* <TextField size="small" fullWidth value={bank} onChange={(e) => setBank(e.target.value)} />*/}
                            </Box>
                        </Grid>
                        {
                            (group !== "กลุ่ม") &&
                            <React.Fragment>
                                <Grid item md={6} xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 0.5 }} gutterBottom>ยอดก่อน Vat</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            {/* <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={price}
                                                onChange={(e) => {
                                                    setPrice(e.target.value);
                                                    setManualTotal(false); // price เปลี่ยน → total คำนวณอัตโนมัติ
                                                }}
                                                onFocus={(e) => e.target.value === "0" && setPrice("")}
                                                onBlur={(e) => e.target.value === "" && setPrice(0)}
                                            /> */}
                                            <TextField
                                                size="small"
                                                type="text"
                                                fullWidth
                                                value={price}
                                                onChange={(e) => {
                                                    // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                        setPrice(raw);
                                                    }
                                                    setManualTotal(true);
                                                }}
                                                onBlur={(e) => {
                                                    const val = parseFloat(price);
                                                    if (isNaN(val)) {
                                                        setPrice("0" || "0.00");
                                                    } else {
                                                        setPrice(
                                                            val.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })
                                                        );
                                                    }
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0" || e.target.value === "0.00") {
                                                        setPrice("");
                                                    } else {
                                                        setPrice(price.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                    }
                                                }}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>

                                <Grid item md={6} xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ยอด Vat</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            {/* <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={vat}
                                                onChange={(e) => {
                                                    setVat(e.target.value);
                                                    setManualTotal(false); // vat เปลี่ยน → total คำนวณอัตโนมัติ
                                                }}
                                                onFocus={(e) => e.target.value === "0" && setVat("")}
                                                onBlur={(e) => e.target.value === "" && setVat(0)}
                                            /> */}
                                            <TextField
                                                size="small"
                                                type="text"
                                                fullWidth
                                                value={vat}
                                                onChange={(e) => {
                                                    // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                        setVat(raw);
                                                    }
                                                    setManualTotal(true);
                                                }}
                                                onBlur={(e) => {
                                                    const val = parseFloat(vat);
                                                    if (isNaN(val)) {
                                                        setVat("0" || "0.00");
                                                    } else {
                                                        setVat(
                                                            val.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })
                                                        );
                                                    }
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0" || e.target.value === "0.00") {
                                                        setVat("");
                                                    } else {
                                                        setVat(vat.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                    }
                                                }}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>

                                <Grid item md={12} xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4 }} gutterBottom>ยอดรวม</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type="text"
                                                fullWidth
                                                value={total}
                                                onChange={(e) => {
                                                    // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                        setTotal(raw);
                                                    }
                                                    setManualTotal(true);
                                                }}
                                                onBlur={(e) => {
                                                    const val = parseFloat(total);
                                                    if (isNaN(val)) {
                                                        setTotal("0" || "0.00");
                                                    } else {
                                                        setTotal(
                                                            val.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })
                                                        );
                                                    }
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0" || e.target.value === "0.00") {
                                                        setTotal("");
                                                    } else {
                                                        setTotal(total.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                    }
                                                }}
                                            />
                                            {/* <TextField
                                                size="small"
                                                type="text" // ❗ ต้องใช้ text ไม่ใช่ number เพื่อให้ format 1,234.56 แสดงได้
                                                fullWidth
                                                value={Number(total).toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                                onChange={(e) => {
                                                    // ลบ comma ออกก่อนแล้ว parse เป็น float
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    const val = parseFloat(raw);
                                                    setTotal(isNaN(val) ? 0 : val);
                                                    setManualTotal(true); // ผู้ใช้แก้ total โดยตรง
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0.00") setTotal("");
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") setTotal(0);
                                                }}
                                            /> */}
                                        </Paper>
                                    </Box>
                                </Grid>
                            </React.Fragment>
                        }
                        {/* <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3 }} gutterBottom>หมายเหตุ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </Paper>
                            </Box>
                        </Grid> */}
                        {
                            (!result && group === "กลุ่ม") &&
                            <Grid item xs={12}>
                                <Paper
                                    sx={{
                                        position: 'fixed',
                                        top: '50%',            // กึ่งกลางแนวตั้ง
                                        right: 100,              // ชิดขวาสุด
                                        transform: 'translateY(-50%)',  // เลื่อนขึ้นครึ่งความสูงเพื่อกึ่งกลางจริงๆ
                                        width: '650px',
                                        height: '80vh',
                                        zIndex: 1300,
                                    }}
                                >
                                    <Grid container sx={{ backgroundColor: theme.palette.panda.dark, height: "50px", borderTopLeftRadius: 5, borderTopRightRadius: 5 }} >
                                        <Grid item xs={10}>
                                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: 1, marginLeft: 2 }} >รายการทะเบียนรถ</Typography>
                                        </Grid>
                                        <Grid item xs={2} textAlign="right">
                                            <IconButtonError onClick={() => setGroup("เดี่ยว")} sx={{ marginTop: 1, marginRight: 2 }}>
                                                <CancelIcon fontSize="small" />
                                            </IconButtonError>
                                        </Grid>
                                    </Grid>
                                    {/* <Typography variant="h6" fontWeight="bold" textAlign="center" marginTop={0.5} gutterBottom>รายการทะเบียนรถ</Typography> */}
                                    <Box sx={{ p: 4 }}>
                                        <TableContainer component={Paper} sx={{ width: "100%", height: "35vh" }}>
                                            <Table
                                                stickyHeader
                                                size="small"
                                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                            >
                                                <TableHead sx={{ height: "5vh" }}>
                                                    <TableRow>
                                                        <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                                            ลำดับ
                                                        </TablecellSelling>
                                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                            ทะเบียนรถ
                                                        </TablecellSelling>
                                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                            ประเภท
                                                        </TablecellSelling>
                                                        <TablecellSelling sx={{ textAlign: "center", width: 50, position: "sticky", right: 0 }} />
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {list.map((item, index) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {item.registration?.includes(":")
                                                                    ? item.registration.split(":")[1]
                                                                    : item.registration}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>{item.truckType}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <IconButton size="smal" color="error" onClick={() => handleDelete(item.id)} sx={{ marginTop: -0.5, marginBottom: -0.5 }}>
                                                                    <DeleteForeverIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}

                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Paper sx={{ backgroundColor: "lightgray", p: 2, marginTop: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item md={5} xs={5}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center" sx={{ marginBottom: 0.5, marginTop: -1, color: theme.palette.panda.light }}>กรอกข้อมูลตรงนี้</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ยอดก่อน Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField size="small" type="number" fullWidth
                                                                        value={price}
                                                                        onChange={(e) => {
                                                                            setPrice(e.target.value);
                                                                            setManualTotal(false); // vat เปลี่ยน → total คำนวณอัตโนมัติ
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0") {
                                                                                setPrice(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            if (e.target.value === "") {
                                                                                setPrice(0); // ถ้าค่าว่างให้เป็น 0
                                                                            }
                                                                        }}
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={price}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setPrice(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(price);
                                                                            if (isNaN(val)) {
                                                                                setPrice("0" || "0.00");
                                                                            } else {
                                                                                setPrice(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setPrice("");
                                                                            } else {
                                                                                setPrice(price.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ยอด Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField size="small" type="number" fullWidth
                                                                        value={vat}
                                                                        onChange={(e) => {
                                                                            setVat(e.target.value);
                                                                            setManualTotal(false); // vat เปลี่ยน → total คำนวณอัตโนมัติ
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0") {
                                                                                setVat(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            if (e.target.value === "") {
                                                                                setVat(0); // ถ้าค่าว่างให้เป็น 0
                                                                            }
                                                                        }}
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={vat}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setVat(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(vat);
                                                                            if (isNaN(val)) {
                                                                                setVat("0" || "0.00");
                                                                            } else {
                                                                                setVat(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setVat("");
                                                                            } else {
                                                                                setVat(vat.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ยอดรวม</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField size="small" type="number" fullWidth
                                                                        value={total}
                                                                        onChange={(e) => {
                                                                            setTotal(e.target.value);
                                                                            setManualTotal(true); // ผู้ใช้แก้ total โดยตรง
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0") {
                                                                                setTotal(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            if (e.target.value === "") {
                                                                                setTotal(0); // ถ้าค่าว่างให้เป็น 0
                                                                            }
                                                                        }}
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={total}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setTotal(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(total);
                                                                            if (isNaN(val)) {
                                                                                setTotal("0" || "0.00");
                                                                            } else {
                                                                                setTotal(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setTotal("");
                                                                            } else {
                                                                                setTotal(total.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item md={2} xs={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Typography
                                                        fontWeight="bold"
                                                        sx={{
                                                            fontSize: "60px",     // ขนาดพื้นฐาน
                                                            display: "inline-block",
                                                            transform: "scaleY(3.5)", // ยืดแนวตั้ง 2 เท่า
                                                            transformOrigin: "center",
                                                            marginTop: -3,
                                                            marginRight: -3,
                                                            color: theme.palette.panda.dark
                                                        }}
                                                    >
                                                        {"➤"}
                                                    </Typography>
                                                </Grid>
                                                <Grid item md={5} xs={5}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center" sx={{ marginBottom: 0.5, marginTop: -1, color: theme.palette.panda.light }}>ผลการคำนวณ</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ยอดก่อน Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={price / (list.length !== 0 && list.length)}
                                                                        disabled
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={resultPrice}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setResultPrice(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(resultPrice);
                                                                            if (isNaN(val)) {
                                                                                setResultPrice("0" || "0.00");
                                                                            } else {
                                                                                setResultPrice(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setResultPrice("");
                                                                            } else {
                                                                                setResultPrice(resultPrice.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ยอด Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={vat / (list.length !== 0 && list.length)}
                                                                        disabled
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={resultVat}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setResultVat(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(resultVat);
                                                                            if (isNaN(val)) {
                                                                                setResultVat("0" || "0.00");
                                                                            } else {
                                                                                setResultVat(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setResultVat("");
                                                                            } else {
                                                                                setResultVat(resultVat.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ยอดรวม</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={(Number(price) + Number(vat)) / (list.length !== 0 && list.length)}
                                                                        disabled
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={resultTotal}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setResultTotal(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(resultTotal);
                                                                            if (isNaN(val)) {
                                                                                setResultTotal("0" || "0.00");
                                                                            } else {
                                                                                setResultTotal(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setResultTotal("");
                                                                            } else {
                                                                                setResultTotal(resultTotal.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Box>
                                </Paper>

                            </Grid>
                        }
                        <Grid item md={12} xs={12}>
                            <Divider>
                                <Chip label="เพิ่มไฟล์เพิ่มเติม" size="small" sx={{ marginTop: -1, marginBottom: 1 }} />
                            </Divider>
                            {
                                file === "ไม่แนบไฟล์" ?
                                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingLeft: 3, paddingRight: 3 }}>
                                        <Button
                                            variant="contained"
                                            component="label"
                                            size="small"
                                            fullWidth
                                            sx={{
                                                height: "50px",
                                                backgroundColor: fileType === 1 ? "#5552ffff" : "#eeeeee",
                                                borderRadius: 2,
                                            }}
                                            onClick={() => { setFileType(1); setFile("ไม่แนบไฟล์"); }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="bold"
                                                color={fileType === 1 ? "white" : "lightgray"}
                                                sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                                                gutterBottom
                                            >
                                                ไม่แนบไฟล์
                                            </Typography>
                                            <FolderOffIcon
                                                sx={{
                                                    fontSize: 30,
                                                    color: fileType === 1 ? "white" : "lightgray",
                                                    marginLeft: 0.5,
                                                }}
                                            />
                                        </Button>
                                        {/* <Chip label="หรือ" size="small" sx={{ marginLeft: 3, marginRight: 3 }} /> */}
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 3, marginRight: 3, marginTop: 0.5 }} gutterBottom>หรือ</Typography>
                                        <Button
                                            variant="contained"
                                            component="label"
                                            size="small"
                                            fullWidth
                                            sx={{
                                                height: "50px",
                                                backgroundColor: fileType === 2 ? "#ff5252" : "#eeeeee",
                                                borderRadius: 2,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                            onClick={() => setFileType(2)}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color={fileType === 2 ? "white" : "lightgray"}
                                                gutterBottom
                                            >
                                                PDF
                                            </Typography>
                                            <PictureAsPdfIcon
                                                sx={{
                                                    fontSize: 40,
                                                    color: fileType === 2 ? "white" : "lightgray",
                                                    marginLeft: 0.5,
                                                }}
                                            />
                                            <input
                                                type="file"
                                                hidden
                                                accept="application/pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setFile(file);
                                                }}
                                            />
                                        </Button>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 3, marginRight: 3, marginTop: 0.5 }} gutterBottom>หรือ</Typography>
                                        <Button
                                            variant="contained"
                                            component="label"
                                            size="small"
                                            fullWidth
                                            sx={{
                                                height: "50px",
                                                backgroundColor: fileType === 3 ? "#29b6f6" : "#eeeeee",
                                                borderRadius: 2,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                            onClick={() => setFileType(3)}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color={fileType === 3 ? "white" : "lightgray"}
                                                gutterBottom
                                            >
                                                รูปภาพ
                                            </Typography>
                                            <ImageIcon
                                                sx={{
                                                    fontSize: 40,
                                                    color: fileType === 3 ? "white" : "lightgray",
                                                    marginLeft: 0.5,
                                                }}
                                            />
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setFile(file);
                                                }}
                                            />
                                        </Button>
                                    </Box>
                                    :
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 7.5 }} gutterBottom>File</Typography>
                                        <Box component="form" sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <TextField
                                                size="small"
                                                type="text"
                                                fullWidth
                                                value={file.name}
                                                sx={{ marginRight: 2 }}
                                            />
                                            <Button variant="outlined" color="error" size="small" sx={{ marginRight: 2 }} onClick={() => { setFileType(1); setFile("ไม่แนบไฟล์"); }}>
                                                ลบไฟล์
                                            </Button>
                                        </Box>
                                    </Box>
                                // <Box sx={{
                                //     display: "flex",
                                //     alignItems: "center",
                                //     justifyContent: "space-between", // ช่วยแยกซ้ายขวา
                                //     paddingLeft: 12,
                                // }}>
                                //     <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                //         File : {file.name}
                                //     </Typography>
                                //     {/* <IconButton color="error" onClick={() => { setFile(null); setFileType(null); }}>
                                //         <DeleteForeverIcon />
                                //     </IconButton> */}
                                //     <Button variant="outlined" color="error" size="small" onClick={() => { setFile(null); setFileType(null); }}>
                                //         ลบไฟล์
                                //     </Button>
                                // </Box>
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handlePost} variant="contained" fullWidth color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" fullWidth color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertFinancial;
