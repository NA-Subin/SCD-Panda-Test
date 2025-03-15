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
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { database } from "../../server/firebase";
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import theme from "../../theme/theme";
import InsertTickets from "./InsertTickets";
import { TablecellHeader } from "../../theme/style";

const Tickets = () => {
 const [update, setUpdate] = React.useState("");
     const [newName, setNewName] = React.useState("");
     const [ticket, setTicket] = React.useState([]);
     const [open, setOpen] = useState(1);
     const [setting, setSetting] = React.useState(false);
         const [ticketChecked, setTicketChecked] = useState(false);
         const [recipientChecked, setRecipientChecked] = useState(false);
         const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข
     
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
 
     const getTicket = async () => {
         database.ref("/customers/tickets").on("value", (snapshot) => {
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
 
        // State สำหรับเก็บค่าแก้ไข Rate
        const [rate1Edit, setRate1Edit] = useState("");
        const [rate2Edit, setRate2Edit] = useState("");
        const [rate3Edit, setRate3Edit] = useState("");
    
        // ฟังก์ชันสำหรับกดแก้ไข
        const handleSetting = (rowId, status, rowRate1, rowRate2, rowRate3) => {
            setSetting(true);
            setSelectedRowId(rowId);
            // ตั้งค่าของ checkbox ตามสถานะที่มีอยู่
            const hasTicket = status.includes("รถใหญ่");
            const hasRecipient = status.includes("รถเล็ก");
            setTicketChecked(hasTicket);
            setRecipientChecked(hasRecipient);
            // เซ็ตค่า RateEdit เป็นค่าปัจจุบันของ row ที่เลือก
            setRate1Edit(rowRate1);
            setRate2Edit(rowRate2);
            setRate3Edit(rowRate3);
        };
    
        // ฟังก์ชันสำหรับบันทึก
        const handleSave = async () => {
            const newType = [
                ticketChecked ? "รถใหญ่" : "",
                recipientChecked ? "รถเล็ก" : ""
            ].filter((s) => s).join("/");
    
            // Update ทั้ง Status และค่า Rate ไปยัง Firebase
            await database.ref(`/customers/tickets/${selectedRowId - 1}`).update({
                Type: newType,
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

        const [page, setPage] = useState(0);
                const [rowsPerPage, setRowsPerPage] = useState(10);
            
                const handleChangePage = (event, newPage) => {
                    setPage(newPage);
                };
            
                const handleChangeRowsPerPage = (event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
              >
                ตั๋วน้ำมัน
              </Typography>
              <Box textAlign="right" marginRight={3} marginTop={-10}>
                <InsertTickets />
              </Box>
                <Divider sx={{ marginBottom: 1, marginTop: 5 }} />
                <TableContainer
                            component={Paper}
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
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                            ประเภทรถ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ width: 50 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        ticket === null || ticket === undefined ?
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: "center",lineHeight: 1, margin: 0 }}>ไม่มีข้อมูล</TableCell>
                                            </TableRow>
                                            :
                                            ticket.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>
                                                            {row.id}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.TicketsName}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.id !== selectedRowId ?
                                                            <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Rate1}</Typography>
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
                                                    <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                            <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Rate2}</Typography>
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
                                                    <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                        {
                                                            !setting || row.id !== selectedRowId ?
                                                            <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Rate3}</Typography>
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
                                                    <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Type}</Typography>
                                                                    :
                                                                    <>
                                                                        <FormControlLabel
                                                                            sx={{ ml: -2,mt: -2,mb: -2 }}
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={ticketChecked}
                                                                                    onChange={(e) => setTicketChecked(e.target.checked)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label="รถใหญ่"
                                                                        />
                                                                        <FormControlLabel
                                                                            sx={{ mr: -2,mt: -2,mb: -2 }}
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={recipientChecked}
                                                                                    onChange={(e) => setRecipientChecked(e.target.checked)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label="รถเล็ก"
                                                                        />
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell width={70} sx={{ height: "30px" }}>
                                                        <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", marginTop: -0.5 }}>
                                                            {
                                                                !setting || row.id !== selectedRowId ?
                                                                    <Button
                                                                        variant="contained"
                                                                        color="warning"
                                                                        startIcon={<EditNoteIcon />}
                                                                        size="small"
                                                                        onClick={() => handleSetting(row.id, row.Type, row.Rate1, row.Rate2, row.Rate3)}
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

export default Tickets;
