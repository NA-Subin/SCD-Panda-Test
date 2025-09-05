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
    const [price, setPrice] = useState(0);
    const [vat, setVat] = useState(0);
    const [total, setTotal] = useState(0);
    const [manualTotal, setManualTotal] = useState(false); // เช็คว่าผู้ใช้แก้ total โดยตรง

    // คำนวณ total เมื่อ price หรือ vat เปลี่ยน และ total ไม่ได้แก้เอง
    useEffect(() => {
        if (!manualTotal) {
            setTotal(Number(price) + Number(vat));
        }
    }, [price, vat]);

    const [selectedDateInvoice, setSelectedDateInvoice] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const [selectedDateTransfer, setSelectedDateTransfer] = useState(dayjs(new Date).format("DD/MM/YYYY"));
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
            ...registrationH.map((item) => ({ ...item, TruckType: "หัวรถใหญ่" })),
            ...registrationT.map((item) => ({ ...item, TruckType: "หางรถใหญ่" })),
            ...registrationS.map((item) => ({ ...item, TruckType: "รถเล็ก" })),
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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePost = () => {
        if (!list || list.length === 0) {
            ShowError("ไม่มีข้อมูลที่จะบันทึก");
            return;
        }

        const startId = reportDetail.length; // ใช้ต่อจากของเดิม
        const updates = {};

        list.forEach((item, index) => {
            const id = startId + index;

            updates[id] = {
                id: id,
                InvoiceID: invoiceID,
                SelectedDateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                SelectedDateTransfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                Registration: item.truckType === "หัวรถ" || item.truckType === "รถเล็ก"
                    ? `${item.registration}:${item?.RegHead || ""}`
                    : `${item.registration}:${item?.RegTail || ""}`,
                Company: `${company?.id}:${company?.Name}`,
                Details: details,
                Bank: `${bank?.id}:${bank?.Name}`,
                Note: note,
                Price: parseFloat((price / list.length).toFixed(2)),
                Vat: parseFloat((vat / list.length).toFixed(2)),
                Total: parseFloat(((Number(price) + Number(vat)) / list.length).toFixed(2)),
                TruckType: item.truckType,
                Status: "อยู่ในระบบ"
            };
        });

        console.log("updates : ", updates);

        database
            .ref("report/invoice")
            .update(updates)
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("All data pushed successfully");
                setList([]); // ล้าง list
                setInvoiceID("");
                setSelectedDateInvoice(dayjs(new Date).format("DD/MM/YYYY"));
                setSelectedDateTransfer(dayjs(new Date).format("DD/MM/YYYY"));
                setCompany("");
                setDetails("");
                setBank("");
                setNote("");
                setPrice("");
                setVat("");
                setOpen(false);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    console.log("registrationTruck: ", registrationTruck);
    console.log("Group : ", group);
    console.log("List : ", list);


    return (
        <React.Fragment>
            <Button
                variant="contained"
                color="primary"
                size="small"
                fullWidth
                sx={{
                    fontSize: "16px",
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
                                        getOptionLabel={(option) => {
                                            if (!option) return "";
                                            if (type === "หัวรถ" || type === "รถเล็ก") {
                                                return `${option?.RegHead} (${option?.TruckType})`;
                                            }
                                            if (type === "หางรถ") {
                                                return `${option?.RegTail} (${option?.TruckType})`;
                                            }
                                            return "";
                                        }}
                                        value={selectedValue}  // แสดงค่าที่เลือกปัจจุบัน
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                const reg =
                                                    type === "หัวรถ" || type === "รถเล็ก"
                                                        ? `${newValue.id}:${newValue.RegHead}`
                                                        : `${newValue.id}:${newValue.RegTail}`;

                                                setSelectedValue(newValue);

                                                setList((prev) => {
                                                    const newItem = {
                                                        id: prev.length,
                                                        invoiceID: invoiceID,
                                                        dateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                                                        dateTranfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                                                        registration: reg,
                                                        company: company,
                                                        details: details,
                                                        bank: bank,
                                                        note: note,
                                                        price: price,
                                                        vat: vat,
                                                        total: Number(price) + Number(vat),
                                                        truckType: newValue?.TruckType,
                                                    };

                                                    if (group === "เดี่ยว") {
                                                        return [newItem]; // ให้มีแค่ 1 รายการ
                                                    } else {
                                                        return [...prev, newItem]; // เพิ่มได้หลายรายการ
                                                    }
                                                });
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
                                            <TextField
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
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>

                                <Grid item md={6} xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ยอด Vat</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField
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
                                                type="number"
                                                fullWidth
                                                value={total}
                                                onChange={(e) => {
                                                    setTotal(e.target.value);
                                                    setManualTotal(true); // ผู้ใช้แก้ total โดยตรง
                                                }}
                                                onFocus={(e) => e.target.value === "0" && setTotal("")}
                                                onBlur={(e) => e.target.value === "" && setTotal(0)}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>
                            </React.Fragment>
                        }
                        <Grid item md={12} xs={12}>
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
                        </Grid>
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
                                                                    <TextField size="small" type="number" fullWidth
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
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ยอด Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    <TextField size="small" type="number" fullWidth
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
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ยอดรวม</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    <TextField size="small" type="number" fullWidth
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
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={price / (list.length !== 0 && list.length)}
                                                                        disabled
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ยอด Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={vat / (list.length !== 0 && list.length)}
                                                                        disabled
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ยอดรวม</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={(Number(price) + Number(vat)) / (list.length !== 0 && list.length)}
                                                                        disabled
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
