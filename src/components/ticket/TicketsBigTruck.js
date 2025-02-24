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
import InsertCustomerBigTruck from "./InsertCustomerBigTruck";

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

    console.log("ticketM",ticketM);
    console.log("ticketR",ticketR);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const getTicket = async () => {
        database.ref("/customers/bigtruck").on("value", (snapshot) => {
          const datas = snapshot.val();
          const dataList = [];
          for (let id in datas) {
            dataList.push({ id, ...datas[id] });
          }
      
          // กรองข้อมูลตาม type
          const ticketM = dataList.filter((item) => item.type === "เชียงใหม่");
          const ticketR = dataList.filter((item) => item.type === "เชียงราย");
      
          // เรียงลำดับข้อมูล (สามารถปรับเปลี่ยนเงื่อนไขการเรียงได้ตามต้องการ)
          // ตัวอย่าง: เรียงตาม id (หรือ key อื่นๆ ที่เหมาะสม)
          ticketM.sort((a, b) => a.id.localeCompare(b.id));
          ticketR.sort((a, b) => a.id.localeCompare(b.id));
      
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
        });
      };

    useEffect(() => {
        getTicket();
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
            await database.ref(`/customers/transports/${selectedRowId-1}`).update({ 
                Status: newStatus 
            });
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
                ลูกค้ารถใหญ่
            </Typography>
            <Divider sx={{ marginBottom: 1 }} />
            <Grid container spacing={2} marginTop={1}>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(1)}>เชียงใหม่</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(2)}>เชียงราย</Button>
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
                        <InsertCustomerBigTruck show={open}/>
                    </Grid>
                </Grid>
                <Divider sx={{ marginBottom: 1,marginTop: 2 }} />
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
                                open === 1 ?
                                (
                                    ticketM === null || ticketM === undefined ?
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                </TableRow>
                                :
                                ticketM.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                {row.No}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.TicketsName}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate1}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate2}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate3}</TableCell>
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
                                            <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center",marginTop:-0.5 }}>
                                            {
                                                !setting ?
                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} size="small" onClick={() => handleSetting(row.id, row.Status)} fullWidth>แก้ไข</Button>
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
                                )
                                :
                                (
                                    ticketM === null || ticketM === undefined ?
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                </TableRow>
                                :
                                ticketR.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                {row.No}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.TicketsName}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate1}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate2}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate3}</TableCell>
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
                                            <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center",marginTop:-0.5 }}>
                                            {
                                                !setting ?
                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} size="small" onClick={() => handleSetting(row.id, row.Status)} fullWidth>แก้ไข</Button>
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
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default TicketsBigTruck;
