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
import BorderColorIcon from '@mui/icons-material/BorderColor';
import theme from "../../theme/theme";
import { TablecellHeader } from "../../theme/style";
import InsertTicketsTransport from "./InsertTicketsTransport";
import InsertTicketsGasStations from "./InsertTicketsGasStations";

const TicketsTransport = () => {
    const [transport, setTransport] = useState([]);
    const [gasStation, setGasStation] = React.useState([]);
    const [setting, setSetting] = useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข
    const [typeCustomer, setTypeCuster] = React.useState(0);
    const [open, setOpen] = useState(1);

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
    const getTransport = async () => {
        database.ref("/customers/transports/").on("value", (snapshot) => {
            const datas = snapshot.val();
            if(datas === null || datas === undefined){
                setTransport([]);
            }else{
                const dataList = [];
                for (let id in datas) {
                    dataList.push({ id, ...datas[id] })
                }
                setTransport(dataList);
            }
        });
    };
    
        const getGasStation = async () => {
            database.ref("/customers/gasstations/").on("value", (snapshot) => {
                const datas = snapshot.val();
                if(datas === null || datas === undefined){
                    setGasStation([]);
                }else{
                    const dataList = [];
                    for (let id in datas) {
                        dataList.push({ id, ...datas[id] })
                    }
                    setGasStation(dataList);
                }
            });
        };

    useEffect(() => {
        getTransport();
        getGasStation();
    }, []);

    // เปิด/ปิดโหมดการแก้ไข
    const handleSetting = (rowId, status, type) => {
        setSetting(true);
        setSelectedRowId(rowId);
        setTypeCuster(type === "ลูกค้ารถใหญ่" ? 1 : type === "ลูกค้ารถเล็ก" ? 2 : type === "บริษัทในเครือ" ? 3 : 0);
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
        await database.ref(`/customer/${selectedRowId}`).update({ Status: newStatus, TypeCustomer: typeCustomer === 1 ? "ลูกค้ารถใหญ่" : typeCustomer === 2 ? "ลูกค้ารถเล็ก" : typeCustomer === 3 ? "บริษัทในเครือ" : "" });
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
                {open === 1 ? "ลูกค้ารับจ้างขนส่ง" : "ปั้มน้ำมัน" }
            </Typography>
            <Divider sx={{ marginBottom: 1 }} />
            <Grid container spacing={2} marginTop={1}>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(1)}>ลูกค้ารับจ้างขนส่ง</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(2)}>ปั้มน้ำมัน</Button>
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
                        <Typography variant="h6" fontWeight="bold" gutterBottom>{open === 1 ? "ลูกค้ารับจ้างขนส่ง" : "ปั้มน้ำมัน"}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        {
                            open === 1 ? <InsertTicketsTransport show={open}/> : <InsertTicketsGasStations show={open} />
                        }
                    </Grid>
                </Grid>
                <Divider sx={{ marginBottom: 1,marginTop: 2 }} />
                {
                    open === 1 ?
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
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ประเภทลูกค้า
                                </TablecellHeader>
                                <TablecellHeader sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                transport === null || transport === undefined ?
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: "center" }}>ไม่มีข้อมูล</TableCell>
                                </TableRow>
                                :
                                transport.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                {
                                                    row.Status !== "ตั๋ว" || row.Status !== "ตั๋ว/ผู้รับ" ? "" : (row.Status.includes("ตั๋ว") ? "T:" : "")
                                                }
                                                {Number(row.id) + 1}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
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
                                        <TableCell>
                                            <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            {
                                                !setting || row.id !== selectedRowId ?
                                                    <Typography variant="subtitle2" gutterBottom>{row.TypeCustomer}</Typography>
                                                    :
                                                    <>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={typeCustomer === 1 ? true : false}
                                                                    onChange={() => setTypeCuster(1)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label="ลูกค้ารถใหญ่"
                                                        />
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={typeCustomer === 2 ? true : false}
                                                                    onChange={() => setTypeCuster(2)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label="ลูกค้ารถเล็ก"
                                                        />
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={typeCustomer === 3 ? true : false}
                                                                    onChange={() => setTypeCuster(3)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label="บริษัทในเครือ"
                                                        />
                                                    </>
                                            }
                                            </Box>
                                        </TableCell>
                                        <TableCell width={70}>
                                            <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center",marginTop:-0.5 }}>
                                            {
                                                !setting ?
                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} size="small" onClick={() => handleSetting(transport[row.id]?.id, transport[row.id]?.Status, transport[row.id]?.TypeCustomer)} fullWidth>แก้ไข</Button>
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
                :
                <TableContainer
                    component={Paper}
                    style={{ maxHeight: "70vh" }}
                    sx={{ marginTop: 2 }}
                >
                    <Table stickyHeader size="small">
                        <TableHead sx={{ height: "7vh" }}>
                            <TableRow>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                    ลำดับ
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ชื่อตั๋ว
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    เรทคลังลำปาง
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    เรทคลังพิจิตร
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    เรทคลังสระบุรี/บางปะอิน/IR
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    สถานะ
                                </TablecellHeader>
                                <TablecellHeader sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                gasStation.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.TicketsName}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate1}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate2}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Rate3}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Status}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}><IconButton color="warning"><BorderColorIcon/></IconButton></TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                }
            </Paper>
        </Container>
    );
};

export default TicketsTransport;
