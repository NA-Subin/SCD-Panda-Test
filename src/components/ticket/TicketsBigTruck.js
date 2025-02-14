import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
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

const TicketsBigTruck = () => {
    const [update, setUpdate] = React.useState("");
    const [newName, setNewName] = React.useState("");
    const [ticket, setTicket] = React.useState([]);
    const [open, setOpen] = useState(1);
    const [setting, setSetting] = React.useState(false);
    
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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const getTicket = async () => {
        database.ref("/ticket-stock/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] })
            }
            setTicket(dataList);
        });
    };

    useEffect(() => {
        getTicket();
    }, []);

    const handleSetting = (rowId, TicketsName) => {
        setSetting(true);
        setNewName(TicketsName);
        setUpdate(rowId);
    };

    const handleSave = async () => {
        // บันทึกสถานะใหม่ไปยัง Firebase
        await database.ref(`/ticket-stock/${update - 1}`).update({ TicketsName: newName });
        setSetting(false);
        setNewName("");
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
                                                        <Divider sx={{ marginBottom: 1 }}/>
                                                        <Grid container spacing={2} marginTop={1}>
        <Grid item xs={6}>
          <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 &&  "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(1)}>เชียงใหม่</Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 &&  "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(2)}>เชียงราย</Button>
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
      <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light,marginTop: -2.5 }}>
        <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>{open === 1 ? "เชียงใหม่" : "เชียงราย"}</Typography>
            <Divider />
        </Box>
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
                                    ที่อยู่
                                </TablecellHeader>
                                <TablecellHeader sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                ticket.map((row) => (
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            {row.TicketsCode}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", fontSize: 16 }}>
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                {
                                                    !setting ?
                                                        row.TicketsName
                                                        :
                                                        <>
                                                            <Typography variant="subtitle2" gutterBottom sx={{ whiteSpace: 'nowrap', marginRight: 1 }}>ชื่อตั๋ว</Typography>
                                                            <TextField size="small" fullWidth value={newName} onChange={(e) => setNewName(e.target.value)} />
                                                        </>
                                                }
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", fontSize: 16 }}>
                                            {row.Address}
                                        </TableCell>
                                        <TableCell sx={{ width: 50 }} >
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            {
                                                !setting ?
                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} onClick={() => handleSetting(row.id, row.TicketsName)}>แก้ไข</Button>
                                                    :
                                                    <>
                                                        <Button variant="contained" color="error" onClick={() => setSetting(false)} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                                        <Button variant="contained" color="success" onClick={handleSave}>บันทึก</Button>
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
        </Container>
    );
};

export default TicketsBigTruck;
