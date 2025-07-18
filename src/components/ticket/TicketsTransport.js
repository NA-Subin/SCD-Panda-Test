import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { database } from "../../server/firebase";
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import theme from "../../theme/theme";
import { TablecellHeader } from "../../theme/style";
import InsertTicketsTransport from "./InsertTicketsTransport";
import InsertTicketsGasStations from "./InsertTicketsGasStations";
import TicketsGasStation from "./TicketsGasStation";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const TicketsTransport = () => {
    //const [transport, setTransport] = useState([]);
    //const [gasStation, setGasStation] = React.useState([]);
    const [setting, setSetting] = useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข
    const [typeCustomer, setTypeCuster] = React.useState(0);
    const [open, setOpen] = useState(1);

    const { customertransports, customergasstations } = useBasicData();
    const transports = Object.values(customertransports || {});
    const gasStations = Object.values(customergasstations || {});

    const transport = transports.filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ");
    const gasStation = gasStations.filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ");

    console.log("gasStation : ", gasStation);

    const [search, setSearch] = useState("");

    const filtered =
        open === 1
            ? transport.filter((item) => {
                const name = (item.Name?.split(":")[1] || item.Name || "").toLowerCase().trim();
                const searchText = search.toLowerCase().trim();
                return name.includes(searchText);
            })
            : gasStation.filter((item) => {
                const name = (item.Name?.split(":")[1] || item.Name || "").toLowerCase().trim();
                const searchText = search.toLowerCase().trim();
                return name.includes(searchText);
            });


    console.log("Show :: ", filtered);
    console.log("search : ", search);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

    // ดึงข้อมูลจาก Firebase
    // const getTransport = async () => {
    //     database.ref("/customers/transports/").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         if (datas === null || datas === undefined) {
    //             setTransport([]);
    //         } else {
    //             const dataList = [];
    //             for (let id in datas) {
    //                 dataList.push({ id, ...datas[id] })
    //             }
    //             setTransport(dataList);
    //         }
    //     });
    // };

    // const getGasStation = async () => {
    //     database.ref("/customers/gasstations/").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         if (datas === null || datas === undefined) {
    //             setGasStation([]);
    //         } else {
    //             const dataList = [];
    //             for (let id in datas) {
    //                 datas[id].SystemStatus !== "ไม่อยู่ในระบบ" &&
    //                     dataList.push({ id, ...datas[id] })
    //             }
    //             setGasStation(dataList);
    //         }
    //     });
    // };

    // useEffect(() => {
    //     getTransport();
    //     getGasStation();
    // }, []);

    // State สำหรับเก็บค่าแก้ไข Rate
    const [ticketCheckedC, setTicketCheckedC] = useState(true);
    const [rate1Edit, setRate1Edit] = useState("");
    const [rate2Edit, setRate2Edit] = useState("");
    const [rate3Edit, setRate3Edit] = useState("");
    const [creditTimeEdit, setCreditTimeEdit] = useState("");
    const [name, setName] = useState("");
    const [rowIndex, setRowIndex] = useState(null);

    // ฟังก์ชันสำหรับกดแก้ไข
    const handleSetting = (index, rowId, statusCompany, status, rowRate1, rowRate2, rowRate3, rowCreditTime, newname) => {
        setRowIndex(index + 1);
        setSetting(true);
        setSelectedRowId(rowId);

        if (statusCompany === "อยู่บริษัทในเครือ") {
            setTicketCheckedC(true);
        } else {
            setTicketCheckedC(false);
        }
        // ตั้งค่าของ checkbox ตามสถานะที่มีอยู่
        const hasTicket = status.includes("ตั๋ว");
        const hasRecipient = status.includes("ผู้รับ");
        setTicketChecked(hasTicket);
        setRecipientChecked(hasRecipient);
        // เซ็ตค่า RateEdit เป็นค่าปัจจุบันของ row ที่เลือก
        setRate1Edit(rowRate1);
        setRate2Edit(rowRate2);
        setRate3Edit(rowRate3);
        setName(newname);
        setCreditTimeEdit(rowCreditTime);
    };

    // ฟังก์ชันสำหรับบันทึก
    const handleSave = async () => {
        const newStatus = [
            ticketChecked ? "ตั๋ว" : "",
            recipientChecked ? "ผู้รับ" : ""
        ].filter((s) => s).join("/");

        // Update ทั้ง Status และค่า Rate ไปยัง Firebase
        // await database.ref(`/customers/transports/${selectedRowId - 1}`).update({
        //     Status: newStatus,
        //     Rate1: rate1Edit,
        //     Rate2: rate2Edit,
        //     Rate3: rate3Edit,
        //     CreditTime: creditTimeEdit,
        //     Name: name
        // });
        // // Reset state หลังบันทึก
        // setSetting(false);
        // setSelectedRowId(null);
        database
            .ref("/customers/transports/")
            .child(selectedRowId - 1)
            .update({
                Status: newStatus,
                Rate1: rate1Edit,
                Rate2: rate2Edit,
                Rate3: rate3Edit,
                CreditTime: creditTimeEdit,
                Name: name
            }) // อัพเดท values ทั้งหมด
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data updated successfully");
                setSetting(false);
                setSelectedRowId(null);
                setRowIndex(null);
            })
            .catch((error) => {
                ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    };

    const handleCancel = () => {
        setSetting(false);
        setSelectedRowId(null);
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleClickOpen1 = () => {
        setOpen(1);
        setPage(0)
        setRowsPerPage(10)
    };

    const handleClickOpen2 = () => {
        setOpen(2);
        setPage(0)
        setRowsPerPage(10)
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = () => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วรับจ้างขนส่งที่ ${rowIndex} ใช่หรือไม่`,
            () => {
                database
                    .ref("/customers/transports/")
                    .child(selectedRowId - 1)
                    .update({
                        SystemStatus: "ไม่อยู่ในระบบ"
                    }) // อัพเดท values ทั้งหมด
                    .then(() => {
                        ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                        console.log("Data updated successfully");
                        setSetting(false);
                        setSelectedRowId(null);
                        setRowIndex(null);
                    })
                    .catch((error) => {
                        ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                        console.error("Error updating data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกลบตั๋วรับจ้างขนส่งที่ ${rowIndex}`);
            }
        );
    }

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                {open === 1 ? "ลูกค้ารับจ้างขนส่ง" : "ปั้มน้ำมัน"}
            </Typography>
            <Divider sx={{ marginBottom: 1 }} />
            <Grid container spacing={2} marginTop={1}>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={handleClickOpen1}>ลูกค้ารับจ้างขนส่ง</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={handleClickOpen2}>ปั้มน้ำมัน</Button>
                </Grid>
                <Grid item xs={6} sx={{ marginTop: -3 }}>
                    {
                        open === 1 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
                    }
                </Grid>
                <Grid item xs={6} sx={{ marginTop: -3 }}>
                    {
                        open === 2 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
                    }
                </Grid>
            </Grid>
            <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light, marginTop: -2.5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                <Grid container spacing={2}>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h6" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>{open === 1 ? "รายการลูกค้ารับจ้างขนส่ง" : "รายการปั้มน้ำมัน"}</Typography>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <Paper >
                            {
                                open === 1 ?
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <Typography fontWeight="bold">ค้นหาชื่อลูกค้า :</Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    :
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <Typography fontWeight="bold">ค้นหาชื่อปั้ม :</Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                            }
                        </Paper>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        {
                            open === 1 ? <InsertTicketsTransport show={open} /> : <InsertTicketsGasStations show={open} />
                        }
                    </Grid>
                </Grid>
                <Divider sx={{ marginBottom: 1, marginTop: 2 }} />
                {
                    open === 1 ?
                        <TableContainer
                            component={Paper}
                            sx={{ marginTop: 2 }}
                        >
                            <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, width: "1250px" }}>
                                <TableHead sx={{ height: "7vh" }}>
                                    <TableRow>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            ลำดับ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                            ชื่อตั๋ว
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100, whiteSpace: "nowrap" }}>
                                            ระยะเครดิต
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังลำปาง
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังพิจิตร
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังสระบุรี/บางปะอิน/IR
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 100 : 150 }}>
                                            สถานะ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ position: 'sticky', right: !setting ? 20 : 60, width: !setting ? 50 : 100, textAlign: "center" }}>

                                        </TablecellHeader>
                                        <TablecellHeader sx={{ position: 'sticky', right: 0, width: !setting ? 20 : 60, textAlign: "center" }}>

                                        </TablecellHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        filtered === null || filtered === undefined ?
                                            <TableRow>
                                                <TableCell colSpan={9} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                            </TableRow>
                                            :
                                            filtered.sort((a, b) => a.Name.localeCompare(b.Name)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TableRow key={index} sx={{ backgroundColor: !setting || row.id !== selectedRowId ? "" : "#fff59d" }}>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                            {index + page * rowsPerPage + 1}
                                                        </Typography>
                                                    </TableCell>
                                                    {/* <TableCell sx={{ textAlign: "center", fontWeight: !setting || row.id !== selectedRowId ? "" : "bold" }}>{row.Name}</TableCell> */}
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Name
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        fullWidth
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '14px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '30px', // ปรับความสูงของ TextField
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: "center"
                                                                            },
                                                                        }}
                                                                        value={name}
                                                                        onChange={(e) => setName(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.CreditTime
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        type="number"
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '14px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '30px', // ปรับความสูงของ TextField
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: "center"
                                                                            },
                                                                        }}
                                                                        value={creditTimeEdit}
                                                                        onChange={(e) => setCreditTimeEdit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate1
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        type="number"
                                                                        fullWidth
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '14px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '30px', // ปรับความสูงของ TextField
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: "center"
                                                                            },
                                                                        }}
                                                                        value={rate1Edit}
                                                                        onChange={(e) => setRate1Edit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate2
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        type="number"
                                                                        fullWidth
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '14px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '30px', // ปรับความสูงของ TextField
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: "center"
                                                                            },
                                                                        }}
                                                                        value={rate2Edit}
                                                                        onChange={(e) => setRate2Edit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate3
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        type="number"
                                                                        fullWidth
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '14px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '30px', // ปรับความสูงของ TextField
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: "center"
                                                                            },
                                                                        }}
                                                                        value={rate3Edit}
                                                                        onChange={(e) => setRate3Edit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Typography variant="subtitle2" gutterBottom>{row.Status}</Typography>
                                                                    :
                                                                    <>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={ticketChecked}
                                                                                    onChange={(e) => setTicketChecked(e.target.checked)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                    ตั๋ว
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={recipientChecked}
                                                                                    onChange={(e) => setRecipientChecked(e.target.checked)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                    ผู้รับ
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell>
                                                    {/* <TableCell width={70} sx={{ position: "sticky", right: 0, backgroundColor: "white" }}>
                                                        <Box sx={{ marginTop: -0.5 }}>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Button
                                                                        variant="contained"
                                                                        color="warning"
                                                                        startIcon={<EditNoteIcon />}
                                                                        size="small"
                                                                        sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }}
                                                                        onClick={() => handleSetting(row.id, row.Status, row.Rate1, row.Rate2, row.Rate3, row.CreditTime, row.Name)}
                                                                        fullWidth
                                                                    >
                                                                        แก้ไข
                                                                    </Button>
                                                                    :
                                                                    <>
                                                                        <Button variant="contained" color="success" onClick={handleSave} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>บันทึก</Button>
                                                                        <Button variant="contained" color="error" onClick={handleCancel} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>ยกเลิก</Button>
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell> */}
                                                    <TableCell sx={{ width: !setting || row.id !== selectedRowId ? 50 : 100, height: "30px", position: "sticky", right: !setting || row.id !== selectedRowId ? 0 : 60, backgroundColor: "white", textAlign: "center" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                                <Button
                                                                    variant="contained"
                                                                    color="warning"
                                                                    startIcon={<EditNoteIcon />}
                                                                    size="small"
                                                                    sx={{ height: "25px" }}
                                                                    onClick={() => handleSetting(index, row.id, row.StatusCompany, row.Status, row.Rate1, row.Rate2, row.Rate3, row.CreditTime, row.Name)}
                                                                >
                                                                    แก้ไข
                                                                </Button>
                                                                :
                                                                <Box sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                                                    <Button
                                                                        variant="contained"
                                                                        fullWidth
                                                                        color="success"
                                                                        endIcon={<SaveIcon />}
                                                                        size="small"
                                                                        sx={{ height: "25px", marginBottom: 0.5 }}
                                                                        onClick={handleSave}
                                                                    >
                                                                        บันทึก
                                                                    </Button>
                                                                    <Button
                                                                        variant="contained"
                                                                        fullWidth
                                                                        color="error"
                                                                        endIcon={<CancelIcon />}
                                                                        size="small"
                                                                        sx={{ height: "25px" }}
                                                                        onClick={handleCancel}
                                                                    >
                                                                        ยกเลิก
                                                                    </Button>

                                                                    {/* <IconButton color="error" onClick={handleCancel}>
                                                                    <CancelIcon />
                                                                </IconButton>
                                                                <IconButton color="success" onClick={handleSave} >
                                                                    <SaveIcon />
                                                                </IconButton> */}
                                                                </Box>
                                                        }
                                                    </TableCell>
                                                    {
                                                        !setting || row.id !== selectedRowId ?
                                                            ""
                                                            :
                                                            <TableCell sx={{ width: 50, height: "30px", position: "sticky", right: 0, backgroundColor: "white", textAlign: "center" }}>
                                                                <Box>
                                                                    <Button
                                                                        variant="contained"
                                                                        color="error"
                                                                        endIcon={<DeleteIcon />}
                                                                        size="small"
                                                                        sx={{ height: "25px" }}
                                                                        onClick={handleDelete}

                                                                    >
                                                                        ลบ
                                                                    </Button>
                                                                </Box>
                                                            </TableCell>
                                                    }
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        :
                        <TableContainer
                            component={Paper}
                            sx={{ marginTop: 2 }}
                        >
                            <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, width: "1250px" }}>
                                <TableHead sx={{ height: "7vh" }} >
                                    <TableRow>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            ลำดับ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                            ชื่อตั๋ว
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                            ระยะเครดิต
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังลำปาง
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังพิจิตร
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังสระบุรี/บางปะอิน/IR
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            สถานะ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ width: 80, position: "sticky", right: 0 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        filtered === null || filtered === undefined ?
                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                            </TableRow>
                                            :
                                            filtered.sort((a, b) => a.ShortName.localeCompare(b.ShortName)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TicketsGasStation key={row.id} row={row} index={index + page * rowsPerPage} />
                                            ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                }
                {
                    open === 1 ?
                        filtered.length <= 10 ? null :
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 30]}
                                component="div"
                                count={filtered.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                                }
                                sx={{
                                    overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                                    borderBottomLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    '& .MuiTablePagination-toolbar': {
                                        backgroundColor: "lightgray",
                                        height: "20px", // กำหนดความสูงของ toolbar
                                        alignItems: "center",
                                        paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                                        overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                                        fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-select': {
                                        paddingY: 0,
                                        fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-actions': {
                                        '& button': {
                                            paddingY: 0,
                                            fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                                        },
                                    },
                                    '& .MuiTablePagination-displayedRows': {
                                        fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-selectLabel': {
                                        fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                                    }
                                }}
                            />
                        :
                        filtered.length <= 10 ? null :
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 30]}
                                component="div"
                                count={filtered.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                                }
                                sx={{
                                    overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                                    borderBottomLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    '& .MuiTablePagination-toolbar': {
                                        backgroundColor: "lightgray",
                                        height: "20px", // กำหนดความสูงของ toolbar
                                        alignItems: "center",
                                        paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                                        overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                                        fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-select': {
                                        paddingY: 0,
                                        fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-actions': {
                                        '& button': {
                                            paddingY: 0,
                                            fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                                        },
                                    },
                                    '& .MuiTablePagination-displayedRows': {
                                        fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-selectLabel': {
                                        fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                                    }
                                }}
                            />
                }
            </Paper>
        </Container>
    );
};

export default TicketsTransport;
