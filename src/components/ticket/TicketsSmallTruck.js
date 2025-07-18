import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
import { IconButtonError, TablecellHeader } from "../../theme/style";
import EditNoteIcon from '@mui/icons-material/EditNote';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertCustomerSmallTruck from "./InsertCustomerSmallTruck";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const TicketsSmallTruck = () => {
    const [update, setUpdate] = React.useState("");
    const [newName, setNewName] = React.useState("");
    //const [ticket, setTicket] = React.useState([]);
    const [open, setOpen] = useState(1);
    const [setting, setSetting] = React.useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข
    //const [ticketM, setTicketM] = React.useState([]);
    //const [ticketR, setTicketR] = React.useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const { customersmalltruck } = useBasicData();
    const ticket = Object.values(customersmalltruck || {});

    const ticketM = ticket.filter((item) => item.Type === "เชียงใหม่" && item.SystemStatus !== "ไม่อยู่ในระบบ").sort((a, b) => a.id - b.id);
    const ticketR = ticket.filter((item) => item.Type === "บ้านโฮ่ง" && item.SystemStatus !== "ไม่อยู่ในระบบ").sort((a, b) => a.id - b.id);

    const [search, setSearch] = useState("");

    const filtered =
        open === 1
            ? ticketM.filter((item) => {
                const name = (item.Name?.split(":")[1] || item.Name || "").toLowerCase().trim();
                const searchText = search.toLowerCase().trim();
                return name.includes(searchText);
            })
            : ticketR.filter((item) => {
                const name = (item.Name?.split(":")[1] || item.Name || "").toLowerCase().trim();
                const searchText = search.toLowerCase().trim();
                return name.includes(searchText);
            });
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


    console.log("ticketM", ticketM);
    console.log("ticketR", ticketR);

    const handleClickOpen = () => {
        setOpen(true);
    };

    // const getTicket = async () => {
    //     database.ref("/customers/smalltruck").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         if (datas === null || datas === undefined) {
    //             setTicketM([]);
    //             setTicketR([]);
    //         } else {
    //             const dataList = [];
    //             for (let id in datas) {
    //                 dataList.push({ id, ...datas[id] });
    //             }

    //             // กรองข้อมูลตาม type
    //             const ticketM = dataList.filter((item) => item.Type === "เชียงใหม่");
    //             const ticketR = dataList.filter((item) => item.Type === "บ้านโฮ่ง");

    //             // เรียงลำดับข้อมูล (สามารถปรับเปลี่ยนเงื่อนไขการเรียงได้ตามต้องการ)
    //             // ตัวอย่าง: เรียงตาม id (หรือ key อื่นๆ ที่เหมาะสม)
    //             ticketM.sort((a, b) => a.id - b.id);
    //             ticketR.sort((a, b) => a.id - b.id);

    //             // เพิ่มลำดับโดยใช้ property "No"
    //             ticketM.forEach((item, index) => {
    //                 item.No = index + 1;
    //             });
    //             ticketR.forEach((item, index) => {
    //                 item.No = index + 1;
    //             });

    //             // บันทึกข้อมูลเข้า state
    //             setTicketM(ticketM);
    //             setTicketR(ticketR);
    //         }
    //     });
    // };

    // useEffect(() => {
    //     getTicket();
    // }, []);

    // State สำหรับเก็บค่าแก้ไข Rate
    // const [rate1Edit, setRate1Edit] = useState("");
    // const [rate2Edit, setRate2Edit] = useState("");
    // const [rate3Edit, setRate3Edit] = useState("");
    const [ticketCheckedC, setTicketCheckedC] = useState(true); // สถานะของ checkbox สำหรับ "อยู่บริษัทในเครือ"
    const [creditTimeEdit, setCreditTimeEdit] = useState("");
    const [name, setName] = useState("");
    const [rowId, setRowId] = useState(null);

    // ฟังก์ชันสำหรับกดแก้ไข
    const handleSetting = (index, rowId, statusCompany, status, rowCreditTime, newname
        // , rowRate1, rowRate2, rowRate3
    ) => {
        setRowId(index + 1);
        setSetting(true);
        setSelectedRowId(rowId);
        if (statusCompany === "อยู่บริษัทในเครือ") {
            setTicketCheckedC(true);
        } else {
            setTicketCheckedC(false);
        }
        // ตั้งค่าของ checkbox ตามสถานะที่มีอยู่
        if (status === "ลูกค้าประจำ") {
            setTicketChecked(true);
            setRecipientChecked(false);
        } else {
            setTicketChecked(false);
            setRecipientChecked(true);
        }

        setCreditTimeEdit(rowCreditTime);
        setName(newname);
        // เซ็ตค่า RateEdit เป็นค่าปัจจุบันของ row ที่เลือก
        // setRate1Edit(rowRate1);
        // setRate2Edit(rowRate2);
        // setRate3Edit(rowRate3);
    };

    // บันทึกข้อมูลที่แก้ไขแล้ว
    const handleSave = async () => {
        const newStatus =
            (ticketChecked && !recipientChecked ? "ลูกค้าประจำ" :
                !ticketChecked && recipientChecked ? "ลูกค้าไม่ประจำ" : "ยกเลิก")

        // บันทึกสถานะใหม่ไปยัง Firebase
        // await database.ref(`/customers/smalltruck/${selectedRowId - 1}`).update({
        //     Status: newStatus,
        //     CreditTime: creditTimeEdit,
        //     Name: name
        //     // Rate1: rate1Edit,
        //     // Rate2: rate2Edit,
        //     // Rate3: rate3Edit,
        // });
        // setSetting(false);
        // setSelectedRowId(null);
        database
            .ref("/customers/smalltruck/")
            .child(selectedRowId - 1)
            .update({
                Status: newStatus,
                StatusCompany: ticketCheckedC ? "อยู่บริษัทในเครือ" : "ไม่อยู่บริษัทในเครือ",
                CreditTime: creditTimeEdit,
                Name: name
                // Rate1: rate1Edit,
                // Rate2: rate2Edit,
                // Rate3: rate3Edit,
            }) // อัพเดท values ทั้งหมด
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data updated successfully");
                setSetting(false);
                setSelectedRowId(null);
                setRowId(null);
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

    const handleChangeTicketChecked = () => {
        setTicketChecked(true);
        setRecipientChecked(false);
    }

    const handleChangeRecipientChecked = () => {
        setTicketChecked(false);
        setRecipientChecked(true);
    }

    const handleDelete = () => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วรถเล็กที่ ${rowId} ใช่หรือไม่`,
            () => {
                database
                    .ref("/customers/smalltruck/")
                    .child(selectedRowId - 1)
                    .update({
                        SystemStatus: "ไม่อยู่ในระบบ",
                    }) // อัพเดท values ทั้งหมด
                    .then(() => {
                        ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                        console.log("Data updated successfully");
                        setSetting(false);
                        setSelectedRowId(null);
                        setRowId(null);
                    })
                    .catch((error) => {
                        ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                        console.error("Error updating data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกลบตั๋วรถเล็กที่ ${rowId}`);
            }
        )
    }

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ลูกค้ารถเล็ก
            </Typography>
            <Divider sx={{ marginBottom: 1 }} />
            <Grid container spacing={2} marginTop={1}>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={handleClickOpen1}>เชียงใหม่</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={handleClickOpen2}>บ้านโฮ่ง</Button>
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
                    <Grid item md={3} xs={12} >
                        <Typography variant="h6" fontWeight="bold" gutterBottom>รายการลูกค้าของ{open === 1 ? "เชียงใหม่" : "บ้านโฮ่ง"}</Typography>
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
                                                    <Typography fontWeight="bold">ค้นหาชื่อลูกค้าเชียงใหม่ :</Typography>
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
                                                    <Typography fontWeight="bold">ค้นหาชื่อปั้มบ้านโฮ่ง :</Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                            }
                        </Paper>
                    </Grid>
                    <Grid item md={3} xs={12} >
                        <InsertCustomerSmallTruck show={open} />
                    </Grid>
                </Grid>
                <Divider sx={{ marginBottom: 1, marginTop: 2 }} />
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
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                    ชื่อตั๋ว
                                </TablecellHeader>
                                {/* <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เรทคลังลำปาง
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เรทคลังพิจิตร
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เรทคลังสระบุรี/บางปะอิน/IR
                                </TablecellHeader> */}
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 100 : 150 }}>
                                    ระยะเวลาเครดิต
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 100 : 150 }}>
                                    สถานะบริษัท
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 100 : 150 }}>
                                    สถานะ
                                </TablecellHeader>
                                <TablecellHeader sx={{ position: 'sticky', right: !setting ? 20 : 60, width: !setting ? 30 : 70, textAlign: "center" }}>

                                </TablecellHeader>
                                <TablecellHeader sx={{ position: 'sticky', right: 0, width: !setting ? 10 : 60, textAlign: "center" }}>

                                </TablecellHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                open === 1 ?
                                    (
                                        filtered === null || filtered === undefined ?
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
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
                                                                        value={creditTimeEdit}
                                                                        onChange={(e) => setCreditTimeEdit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate1
                                                                :
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
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={rate1Edit}
                                                                    onChange={(e) => setRate1Edit(e.target.value)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate2
                                                                :
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
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={rate2Edit}
                                                                    onChange={(e) => setRate2Edit(e.target.value)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate3
                                                                :
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
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={rate3Edit}
                                                                    onChange={(e) => setRate3Edit(e.target.value)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                        }
                                                    </TableCell> */}
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Typography variant="subtitle2" gutterBottom>{row.StatusCompany || "-"}</Typography>
                                                                    :
                                                                    <>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={ticketCheckedC === true ? true : false}
                                                                                    onChange={(e) => setTicketCheckedC(true)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                    อยู่บริษัทในเครือ
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={ticketCheckedC === false ? true : false}
                                                                                    onChange={(e) => setTicketCheckedC(false)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                    ไม่อยู่บริษัทในเครือ
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                                <Typography variant="subtitle2" gutterBottom>{row.Status}</Typography>
                                                                :
                                                                <>
                                                                    <FormControlLabel
                                                                        sx={{ whiteSpace: "nowrap" }}
                                                                        control={
                                                                            <Checkbox
                                                                                checked={ticketChecked && !recipientChecked ? true : false}
                                                                                onChange={handleChangeTicketChecked}
                                                                                size="small"
                                                                            />
                                                                        }
                                                                        label={
                                                                            <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                ลูกค้าประจำ
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                    <FormControlLabel
                                                                        sx={{ whiteSpace: "nowrap" }}
                                                                        control={
                                                                            <Checkbox
                                                                                checked={!ticketChecked && recipientChecked ? true : false}
                                                                                onChange={handleChangeRecipientChecked}
                                                                                size="small"
                                                                            />
                                                                        }
                                                                        label={
                                                                            <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                ลูกค้าไม่ประจำ
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </>
                                                        }
                                                    </TableCell>
                                                    {/* <TableCell width={70} sx={{ position: "sticky", right: 0, backgroundColor: "white" }}>
                                                        <Box sx={{ marginTop: -0.5 }}>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }} size="small" onClick={() => handleSetting(row.id, row.Status, row.CreditTime, row.Name)} fullWidth>แก้ไข</Button>
                                                                    :
                                                                    <>
                                                                        <Button variant="contained" color="success" onClick={handleSave} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>บันทึก</Button>
                                                                        <Button variant="contained" color="error" onClick={handleCancel} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>ยกเลิก</Button>
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell> */}
                                                    <TableCell sx={{ width: !setting || row.id !== selectedRowId ? 30 : 70, height: "30px", position: "sticky", right: !setting || row.id !== selectedRowId ? 0 : 60, backgroundColor: "white", textAlign: "center" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                                <Button
                                                                    variant="contained"
                                                                    color="warning"
                                                                    startIcon={<EditNoteIcon />}
                                                                    size="small"
                                                                    sx={{ height: "25px" }}
                                                                    onClick={() => handleSetting(index, row.id, row.StatusCompany, row.Status, row.CreditTime, row.Name)}
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
                                    )
                                    :
                                    (
                                        filtered === null || filtered === undefined ?
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                            </TableRow>
                                            :
                                            filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TableRow key={row.id} sx={{ backgroundColor: !setting || row.id !== selectedRowId ? "" : "#fff59d" }}>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                            {index + page * rowsPerPage + 1}
                                                        </Typography>
                                                    </TableCell>
                                                    {/* <TableCell sx={{ textAlign: "center", fontWeight: !setting || row.id !== selectedRowId ? "" : "bold" }}>{row.TicketsName}</TableCell> */}
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
                                                                        value={creditTimeEdit}
                                                                        onChange={(e) => setCreditTimeEdit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                                    {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate1
                                                                :
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
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={rate1Edit}
                                                                    onChange={(e) => setRate1Edit(e.target.value)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                    {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate2
                                                                :
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
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={rate2Edit}
                                                                    onChange={(e) => setRate2Edit(e.target.value)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                    {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                                row.Rate3
                                                                :
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
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={rate3Edit}
                                                                    onChange={(e) => setRate3Edit(e.target.value)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                        }
                                                    </TableCell> */}
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Typography variant="subtitle2" gutterBottom>{row.StatusCompany || "-"}</Typography>
                                                                    :
                                                                    <>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={ticketCheckedC === true ? true : false}
                                                                                    onChange={(e) => setTicketCheckedC(true)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                    อยู่บริษัทในเครือ
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={ticketCheckedC === false ? true : false}
                                                                                    onChange={(e) => setTicketCheckedC(false)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                    ไม่อยู่บริษัทในเครือ
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                                <Typography variant="subtitle2" gutterBottom>{row.Status}</Typography>
                                                                :
                                                                <>
                                                                    <FormControlLabel
                                                                        sx={{ whiteSpace: "nowrap" }}
                                                                        control={
                                                                            <Checkbox
                                                                                checked={ticketChecked && !recipientChecked ? true : false}
                                                                                onChange={handleChangeTicketChecked}
                                                                                size="small"
                                                                            />
                                                                        }
                                                                        label={
                                                                            <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                ลูกค้าประจำ
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                    <FormControlLabel
                                                                        sx={{ whiteSpace: "nowrap" }}
                                                                        control={
                                                                            <Checkbox
                                                                                checked={!ticketChecked && recipientChecked ? true : false}
                                                                                onChange={handleChangeRecipientChecked}
                                                                                size="small"
                                                                            />
                                                                        }
                                                                        label={
                                                                            <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                ลูกค้าไม่ประจำ
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </>
                                                        }
                                                    </TableCell>
                                                    {/* <TableCell width={70} sx={{ backgroundColor: "white",position: "sticky", right: 0 }}>
                                                        <Box sx={{ marginTop: -0.5 }}>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }} size="small" onClick={() => handleSetting(row.id, row.Status, row.CreditTime, row.Name)} fullWidth>แก้ไข</Button>
                                                                    :
                                                                    <>
                                                                        <Button variant="contained" color="success" onClick={handleSave} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>บันทึก</Button>
                                                                        <Button variant="contained" color="error" onClick={handleCancel} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>ยกเลิก</Button>
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell> */}
                                                    <TableCell sx={{ width: !setting || row.id !== selectedRowId ? 30 : 70, height: "30px", position: "sticky", right: !setting || row.id !== selectedRowId ? 0 : 60, backgroundColor: "white", textAlign: "center" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                                <Button
                                                                    variant="contained"
                                                                    color="warning"
                                                                    startIcon={<EditNoteIcon />}
                                                                    size="small"
                                                                    sx={{ height: "25px" }}
                                                                    onClick={() => handleSetting(index, row.id, row.StatusCompany, row.Status, row.CreditTime, row.Name)}
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
                                    )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
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

export default TicketsSmallTruck;
