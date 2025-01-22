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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { database } from "../../server/firebase";
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import theme from "../../theme/theme";
import { TablecellHeader } from "../../theme/style";

const TicketsTransport = () => {
    const [transport, setTransport] = useState([]);
    const [setting, setSetting] = useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข

    // ดึงข้อมูลจาก Firebase
    const getTransport = async () => {
        database.ref("/customer/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                const { Name, Phone, Status } = datas[id];
                dataList.push({ id, Name, Phone, Status });
            }
            setTransport(dataList);
        });
    };

    useEffect(() => {
        getTransport();
    }, []);

    // เปิด/ปิดโหมดการแก้ไข
    const handleSetting = (rowId, status) => {
        setSetting(true);
        setSelectedRowId(rowId);
        // ตั้งค่าของ checkbox ตามสถานะที่มีอยู่
        const hasTicket = status.includes("ตั๋ว");
        const hasRecipient = status.includes("ผู้รับ");
        setTicketChecked(hasTicket);
        setRecipientChecked(hasRecipient);
    };

    // บันทึกข้อมูลที่แก้ไขแล้ว
    const handleSave = async () => {
        const newStatus = [
            ticketChecked ? "ตั๋ว" : "",
            recipientChecked ? "ผู้รับ" : ""
        ]
            .filter((s) => s) // กรองค่าที่ไม่ใช่ค่าว่าง
            .join("/");

        // บันทึกสถานะใหม่ไปยัง Firebase
        await database.ref(`/customer/${selectedRowId}`).update({ Status: newStatus });
        setSetting(false);
        setSelectedRowId(null);
    };

    const handleCancel = () => {
        setSetting(false);
        setSelectedRowId(null);
    };

    return (
        <React.Fragment>
            <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตั๋วขายส่ง</Typography>
                    </Grid>
                    <Grid item xs={12} marginTop={-2}>
                        <Divider />
                    </Grid>
                </Grid>
                <TableContainer
                    component={Paper}
                    style={{ maxHeight: "70vh" }}
                    sx={{ marginTop: 2 }}
                >
                    <Table stickyHeader size="small">
                        <TableHead sx={{ height: "7vh" }}>
                            <TableRow>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                    รหัสตั๋ว
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ชื่อตั๋ว
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    สถานะตั๋ว
                                </TablecellHeader>
                                <TablecellHeader sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                transport.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                {
                                                    row.Status.includes("ตั๋ว") ? "T:" : ""
                                                }
                                                {Number(row.id) + 1}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                                        <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            {
                                                !setting || row.id !== selectedRowId ?
                                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{row.Status}</Typography>
                                                    :
                                                    <>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={ticketChecked}
                                                                    onChange={(e) => setTicketChecked(e.target.checked)}
                                                                />
                                                            }
                                                            label="ตั๋ว"
                                                        />
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={recipientChecked}
                                                                    onChange={(e) => setRecipientChecked(e.target.checked)}
                                                                />
                                                            }
                                                            label="ผู้รับ"
                                                        />
                                                    </>
                                            }
                                        </TableCell>
                                        <TableCell width={70}>
                                            <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            {
                                                !setting ?
                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} size="small" onClick={() => handleSetting(transport[row.id]?.id, transport[row.id]?.Status)} fullWidth>แก้ไข</Button>
                                                    :
                                                    <>
                                                        <IconButton variant="contained" color="error" onClick={handleCancel} sx={{ marginRight: 2 }} fullWidth><CancelIcon fontSize="small" /></IconButton>
                                                        <IconButton variant="contained" color="success" onClick={handleSave} fullWidth><SaveIcon fontSize="small" /></IconButton>
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
            </Paper>
        </React.Fragment>
    );
};

export default TicketsTransport;
