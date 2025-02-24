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
import InsertCustomerSmallTruck from "./InsertCustomerSmallTruck";

const TicketsSmallTruck = () => {
    const [update, setUpdate] = React.useState("");
    const [newName, setNewName] = React.useState("");
    const [ticket, setTicket] = React.useState([]);
    const [open, setOpen] = useState(1);
    const [setting, setSetting] = React.useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข

    const handleClickOpen = () => {
        setOpen(true);
    };

    const getTicket = async () => {
        database.ref("/customers/smalltruck").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            setTicket(dataList);
        });
    };

    useEffect(() => {
        getTicket();
    }, []);

    // State สำหรับเก็บค่าแก้ไข Rate
    const [rate1Edit, setRate1Edit] = useState("");
    const [rate2Edit, setRate2Edit] = useState("");
    const [rate3Edit, setRate3Edit] = useState("");

    // ฟังก์ชันสำหรับกดแก้ไข
    const handleSetting = (rowId, status, rowRate1, rowRate2, rowRate3) => {
        setSetting(true);
        setSelectedRowId(rowId);
        // ตั้งค่าของ checkbox ตามสถานะที่มีอยู่
        const hasTicket = status.includes("ตั๋ว");
        const hasRecipient = status.includes("ผู้รับ");
        setTicketChecked(hasTicket);
        setRecipientChecked(hasRecipient);
        // เซ็ตค่า RateEdit เป็นค่าปัจจุบันของ row ที่เลือก
        setRate1Edit(rowRate1);
        setRate2Edit(rowRate2);
        setRate3Edit(rowRate3);
    };

    // ฟังก์ชันสำหรับบันทึก
    const handleSave = async () => {
        const newStatus = [
            ticketChecked ? "ตั๋ว" : "",
            recipientChecked ? "ผู้รับ" : ""
        ].filter((s) => s).join("/");

        // Update ทั้ง Status และค่า Rate ไปยัง Firebase
        await database.ref(`/customers/smalltruck/${selectedRowId - 1}`).update({
            Status: newStatus,
            Rate1: rate1Edit,
            Rate2: rate2Edit,
            Rate3: rate3Edit,
        });
        // Reset state หลังบันทึก
        setSetting(false);
        setSelectedRowId(null);
    };

    const handleCancel = () => {
        setSetting(false);
        setSelectedRowId(null);
    };

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
            <Grid container spacing={2}>
                <Grid item xs={9}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>ลูกค้ารถเล็ก</Typography>
                </Grid>
                <Grid item xs={3}>
                    <InsertCustomerSmallTruck />
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 1, marginTop: 2 }} />
            <TableContainer
                component={Paper}
                style={{ maxHeight: "70vh" }}
                sx={{ marginTop: 2 }}
            >
                <Table stickyHeader size="small">
                    <TableHead sx={{ height: "7vh" }}>
                        <TableRow>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                ลำดับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ชื่อตั๋ว
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                เรทคลังลำปาง
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                เรทคลังพิจิตร
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                เรทคลังสระบุรี/บางปะอิน/IR
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                สถานะ
                            </TablecellHeader>
                            <TablecellHeader sx={{ width: 50 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            ticket === null || ticket === undefined ?
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                </TableRow>
                                :
                                ticket.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                {row.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.TicketsName}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
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
                                                                label="ตั๋ว"
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={recipientChecked}
                                                                        onChange={(e) => setRecipientChecked(e.target.checked)}
                                                                        size="small"
                                                                    />
                                                                }
                                                                label="ผู้รับ"
                                                            />
                                                        </>
                                                }
                                            </Box>
                                        </TableCell>
                                        <TableCell width={70}>
                                            <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", marginTop: -0.5 }}>
                                                {
                                                    !setting || row.id !== selectedRowId ?
                                                        <Button
                                                            variant="contained"
                                                            color="warning"
                                                            startIcon={<EditNoteIcon />}
                                                            size="small"
                                                            onClick={() => handleSetting(row.id, row.Status, row.Rate1, row.Rate2, row.Rate3)}
                                                            fullWidth
                                                        >
                                                            แก้ไข
                                                        </Button>
                                                        :
                                                        <>
                                                            <IconButton color="error" onClick={handleCancel} sx={{ marginRight: 2 }} fullWidth>
                                                                <CancelIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton color="success" onClick={handleSave} fullWidth>
                                                                <SaveIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                }
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default TicketsSmallTruck;
