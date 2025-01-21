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
import { database } from "../../server/firebase";
import theme from "../../theme/theme";

const TicketsTransport = () => {
    // const [setting, setSetting] = React.useState(true);
    // const [open, setOpen] = useState(1);

    // const handleSetting = () => {
    //     setSetting(true)
    // };

    const [transport, setTransport] = React.useState([]);

    const getTransport = async () => {
        database.ref("/customer/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                // const { Name, Stock, OilWellNumber } = datas[id];
                const { Name, Phone, Status } = datas[id]; // ดึงเฉพาะ Name, Stock, OilWellNumber
                // console.log("Name :", Name);
                // console.log("Stock :", Stock);
                // console.log("OilWellNumber :", OilWellNumber);
                dataList.push({ id, Name, Phone, Status }); // push เฉพาะค่าที่ต้องการ
            }
            setTransport(dataList);
        });
    };

    useEffect(() => {
        getTransport();
    }, []);

    const [status, setStatus] = useState("ตั๋ว/ผู้รับ");
    const [setting, setSetting] = useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);

    // เมื่อ setting เปลี่ยนค่า ตรวจสอบค่า status เพื่อกำหนดค่าเริ่มต้นของ checkbox
    const handleSetting = () => {
        setSetting(!setting);
        if (!setting) {
            const hasTicket = status.includes("ตั๋ว");
            const hasRecipient = status.includes("ผู้รับ");
            setTicketChecked(hasTicket);
            setRecipientChecked(hasRecipient);
        }
    };

    const handleSave = () => {
        const newStatus = [
            ticketChecked ? "ตั๋ว" : "",
            recipientChecked ? "ผู้รับ" : ""
        ]
            .filter((s) => s) // กรองเฉพาะค่าที่ไม่ใช่ค่าว่าง
            .join("/");
        setStatus(newStatus);
        setSetting(false);
    };

    const handleCancel = () => {
        setSetting(false);
    };

    return (
        <React.Fragment>
            <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light }}>
                <Grid container spacing={2}>
                    <Grid item xs={10}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตั๋วขายส่ง</Typography>
                    </Grid>
                    <Grid item xs={2} marginTop={-2} display="flex" justifyContent="center" alignItems="center">
                        {
                            !setting ?
                                <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} onClick={handleSetting} fullWidth>แก้ไขตั๋วขายส่ง</Button>
                                :
                                <>
                                    <Button variant="contained" color="error" onClick={handleCancel} sx={{ marginRight: 2 }} fullWidth>ยกเลิก</Button>
                                    <Button variant="contained" color="success" onClick={handleSave} fullWidth>บันทึก</Button>
                                </>
                        }
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
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>T:{Number(row.id) + 1}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                                        <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            {
                                                !setting ?
                                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{row.Status}</Typography>
                                                    :
                                                    <>
                                                        {/* Checkbox สำหรับ "ตั๋ว" */}
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={ticketChecked}
                                                                    onChange={(e) => setTicketChecked(e.target.checked)}
                                                                />
                                                            }
                                                            label="ตั๋ว"
                                                        />
                                                        {/* Checkbox สำหรับ "ผู้รับ" */}
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
