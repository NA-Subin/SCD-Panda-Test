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
import InsertCustomerBigTruck from "./InsertCustomerBigTruck";
import ExcelUploader from "../excel/ImportExcel";

const TicketsBigTruck = () => {
    const [update, setUpdate] = React.useState("");
    const [newName, setNewName] = React.useState("");
    const [ticket, setTicket] = React.useState([]);
    const [open, setOpen] = useState(1);
    const [setting, setSetting] = React.useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข
    const [ticketM, setTicketM] = React.useState([]);
    const [ticketR, setTicketR] = React.useState([]);

    console.log("ticketM", ticketM);
    console.log("ticketR", ticketR);

    const getTicket = async () => {
        database.ref("/customers/bigtruck").on("value", (snapshot) => {
            const datas = snapshot.val();
            if (datas === null || datas === undefined) {
                setTicketM([]);
                setTicketR([]);
            } else {
                const dataList = [];
                for (let id in datas) {
                    dataList.push({ id, ...datas[id] });
                }

                // กรองข้อมูลตาม type
                const ticketM = dataList.filter((item) => item.Type === "เชียงใหม่");
                const ticketR = dataList.filter((item) => item.Type === "เชียงราย");

                // เรียงลำดับข้อมูล (สามารถปรับเปลี่ยนเงื่อนไขการเรียงได้ตามต้องการ)
                // ตัวอย่าง: เรียงตาม id (หรือ key อื่นๆ ที่เหมาะสม)
                ticketM.sort((a, b) => a.id - b.id);
                ticketR.sort((a, b) => a.id - b.id);


                // เพิ่มลำดับโดยใช้ property "No"
                ticketM.forEach((item, index) => {
                    item.No = index + 1;
                });
                ticketR.forEach((item, index) => {
                    item.No = index + 1;
                });

                // บันทึกข้อมูลเข้า state
                setTicketM(ticketM);
                setTicketR(ticketR);
            }
        });
    };

    useEffect(() => {
        getTicket();
    }, []);

    // State สำหรับเก็บค่าแก้ไข Rate
        const [rate1Edit, setRate1Edit] = useState("");
        const [rate2Edit, setRate2Edit] = useState("");
        const [rate3Edit, setRate3Edit] = useState("");
        const [creditTimeEdit, setCreditTimeEdit] = useState("");
        const [name,setName] = useState("");

    
        // ฟังก์ชันสำหรับกดแก้ไข
        const handleSetting = (rowId, status, rowRate1, rowRate2, rowRate3, rowCreditTime, newname) => {
            setSetting(true);
            setSelectedRowId(rowId);

            if(status === "ลูกค้าประจำ"){
                setTicketChecked(true);
                setRecipientChecked(false);
            }else{
                setTicketChecked(false);
                setRecipientChecked(true);
            }
            
            // เซ็ตค่า RateEdit เป็นค่าปัจจุบันของ row ที่เลือก
            setRate1Edit(rowRate1);
            setRate2Edit(rowRate2);
            setRate3Edit(rowRate3);
            setName(newname);
            setCreditTimeEdit(rowCreditTime);
        };

    // บันทึกข้อมูลที่แก้ไขแล้ว
    const handleSave = async () => {
        const newStatus = 
            (ticketChecked && !recipientChecked ? "ลูกค้าประจำ" : 
            !ticketChecked && recipientChecked ? "ลูกค้าไม่ประจำ" : "ยกเลิก")

        // บันทึกสถานะใหม่ไปยัง Firebase
        await database.ref(`/customers/bigtruck/${selectedRowId - 1}`).update({
            Status: newStatus,
            Rate1: rate1Edit,
            Rate2: rate2Edit,
            Rate3: rate3Edit,
            CreditTime: creditTimeEdit,
            Name: name
        });
        setSetting(false);
        setSelectedRowId(null);
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

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ลูกค้ารถใหญ่
            </Typography>
            {/* <ExcelUploader /> */}
            <Divider sx={{ marginBottom: 1 }} />
            <Grid container spacing={2} marginTop={1}>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={handleClickOpen1}>เชียงใหม่</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={handleClickOpen2}>เชียงราย</Button>
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
            <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light, marginTop: -2.5 }}>
                <Grid container spacing={2}>
                    <Grid item xs={9}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>ลูกค้าของ{open === 1 ? "เชียงใหม่" : "เชียงราย"}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <InsertCustomerBigTruck show={open} />
                    </Grid>
                </Grid>
                <Divider sx={{ marginBottom: 1, marginTop: 2 }} />
                <TableContainer
                    component={Paper}
                    sx={{ marginTop: 2 }}
                >
                    <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                        <TableHead sx={{ height: "7vh" }}>
                            <TableRow>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                    ลำดับ
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
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
                                <TablecellHeader sx={{ width: 80 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                open === 1 ?
                                    (
                                        ticketM === null || ticketM === undefined ?
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                            </TableRow>
                                            :
                                            ticketM.sort((a, b) => a.Name.localeCompare(b.Name)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,index) => (
                                                <TableRow key={index} sx={{ backgroundColor: !setting || row.id !== selectedRowId ? "" : "#fff59d" }}>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                            {index +1}
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
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
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
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
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
                                                                            sx={{ whiteSpace: "nowrap",marginTop: -2 }}
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
                                                    <TableCell width={70}>
                                                        <Box sx={{ textAlign: "center", marginTop: -0.5 }}>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }} size="small" onClick={() => handleSetting(row.id, row.Status, row.Rate1, row.Rate2, row.Rate3, row.CreditTime, row.Name)} fullWidth>แก้ไข</Button>
                                                                    :
                                                                    <>
                                                                        <Button variant="contained" color="success" onClick={handleSave} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>บันทึก</Button>
                                                                        <Button variant="contained" color="error" onClick={handleCancel} sx={{ height: "25px", marginTop: 0.5 }}  size="small" fullWidth>ยกเลิก</Button>
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )
                                    :
                                    (
                                        ticketM === null || ticketM === undefined ?
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                            </TableRow>
                                            :
                                            ticketR.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                                <TableRow key={row.id} sx={{ backgroundColor: !setting || row.id !== selectedRowId ? "" : "#fff59d" }}>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                            {row.No}
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
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
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
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
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
                                                                            sx={{ whiteSpace: "nowrap", marginTop: -2 }}
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
                                                    <TableCell width={70}>
                                                        <Box sx={{ marginTop: -0.5 }}>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }} size="small" onClick={() => handleSetting(row.id, row.Status, row.Rate1, row.Rate2, row.Rate3, row.CreditTime, row.Name)} fullWidth>แก้ไข</Button>
                                                                    :
                                                                    <>
                                                                        <Button variant="contained" color="success" onClick={handleSave} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>บันทึก</Button>
                                                                        <Button variant="contained" color="error" onClick={handleCancel} sx={{ height: "25px", marginTop: 0.5 }}  size="small" fullWidth>ยกเลิก</Button>
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                {
                    open === 1 ?
                        ticketM.length <= 10 ? null :
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 30]}
                                component="div"
                                count={ticketM.length}
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
                        ticketR.length <= 10 ? null :
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 30]}
                                component="div"
                                count={ticketR.length}
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

export default TicketsBigTruck;
