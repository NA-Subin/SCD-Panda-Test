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
import DeleteIcon from '@mui/icons-material/Delete';
import theme from "../../theme/theme";
import InsertTickets from "./InsertTickets";
import { TablecellHeader } from "../../theme/style";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const Tickets = () => {
    const [update, setUpdate] = React.useState("");
    const [newName, setNewName] = React.useState("");
    //const [ticket, setTicket] = React.useState([]);
    const [open, setOpen] = useState(1);
    const [setting, setSetting] = React.useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข

    const { customertickets } = useBasicData();
    const tickets = Object.values(customertickets || {});
    const ticket = tickets.filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ");
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

    // const getTicket = async () => {
    //     database.ref("/customers/tickets").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         const dataList = [];
    //         for (let id in datas) {
    //             dataList.push({ id, ...datas[id] })
    //         }
    //         setTicket(dataList);
    //     });
    // };

    // useEffect(() => {
    //     getTicket();
    // }, []);

    // State สำหรับเก็บค่าแก้ไข Rate
    const [rate1Edit, setRate1Edit] = useState("");
    const [rate2Edit, setRate2Edit] = useState("");
    const [rate3Edit, setRate3Edit] = useState("");
    const [rowIndex, setRowIndex] = useState(null);
    const [name, setName] = useState("");

    // ฟังก์ชันสำหรับกดแก้ไข
    const handleSetting = (index,rowId, status, rowRate1, rowRate2, rowRate3, newname) => {
        setRowIndex(index+1);
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
        setName(newname)
    };

    // ฟังก์ชันสำหรับบันทึก
    const handleSave = async () => {
        const newType = [
            ticketChecked ? "รถใหญ่" : "",
            recipientChecked ? "รถเล็ก" : ""
        ].filter((s) => s).join("/");

        // // Update ทั้ง Status และค่า Rate ไปยัง Firebase
        // await database.ref(`/customers/tickets/${selectedRowId - 1}`).update({
        //     Type: newType,
        //     Rate1: rate1Edit,
        //     Rate2: rate2Edit,
        //     Rate3: rate3Edit,
        //     Name: name
        // });
        // Reset state หลังบันทึก
        // setSetting(false);
        // setSelectedRowId(null);
        database
            .ref("/customers/tickets/")
            .child(selectedRowId - 1)
            .update({
                Type: newType,
                Rate1: rate1Edit,
                Rate2: rate2Edit,
                Rate3: rate3Edit,
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = () => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วน้ำมันที่ ${rowIndex} ใช่หรือไม่`,
            () => {
                database
                    .ref("/customers/tickets/")
                    .child(selectedRowId - 1)
                    .update({
                        SystemStatus: "ไม่อยู่ในระบบ",
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
                console.log(`ยกเลิกลบตั๋วน้ำมันที่ ${rowIndex}`);
            }
        )
    }

    console.log("ticket", ticket);
    console.log("name", name);
    console.log("selectedRowId ", selectedRowId - 1);

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
            <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                <TableContainer
                    component={Paper}
                    sx={{ marginTop: 2 }}
                >
                    <Table stickyHeader size="small" sx={{ width: "1330px" }}>
                        <TableHead sx={{ height: "7vh" }}>
                            <TableRow>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                    ลำดับ
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 550 }}>
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
                                <TablecellHeader sx={{ position: "sticky", right: 0 }} colSpan={2} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                ticket === null || ticket === undefined ?
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ textAlign: "center", lineHeight: 1, margin: 0 }}>ไม่มีข้อมูล</TableCell>
                                    </TableRow>
                                    :
                                    ticket.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                        <TableRow key={row.id}>
                                            <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {index+1}
                                                </Typography>
                                            </TableCell>
                                            {/* <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Name}</Typography> */}
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
                                                                    sx={{ ml: -2, mt: -2, mb: -2 }}
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
                                                                    sx={{ mr: -2, mt: -2, mb: -2 }}
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
                                            <TableCell sx={{ height: "30px", position: "sticky", right: !setting || row.id !== selectedRowId ? 20 : 100, backgroundColor: "white" }}>
                                                <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", marginTop: -0.5 }}>
                                                    {
                                                        !setting || row.id !== selectedRowId ?
                                                            <Button
                                                                variant="contained"
                                                                color="warning"
                                                                startIcon={<EditNoteIcon />}
                                                                size="small"
                                                                sx={{ height: "25px" }}
                                                                onClick={() => handleSetting(index,row.id, row.Type, row.Rate1, row.Rate2, row.Rate3, row.Name)}
                                                                fullWidth
                                                            >
                                                                แก้ไข
                                                            </Button>
                                                            :
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    endIcon={<CancelIcon />}
                                                                    size="small"
                                                                    sx={{ height: "25px", marginRight: 1 }}
                                                                    onClick={handleCancel}
                                                                >
                                                                    ยกเลิก
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    endIcon={<SaveIcon />}
                                                                    size="small"
                                                                    sx={{ height: "25px" }}
                                                                    onClick={handleSave}
                                                                >
                                                                    บันทึก
                                                                </Button>

                                                                {/* <IconButton color="error" onClick={handleCancel}>
                                                                    <CancelIcon />
                                                                </IconButton>
                                                                <IconButton color="success" onClick={handleSave} >
                                                                    <SaveIcon />
                                                                </IconButton> */}
                                                            </Box>
                                                    }
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ height: "30px", position: "sticky", right: 0, backgroundColor: "white" }}>
                                                {
                                                    !setting || row.id !== selectedRowId ?
                                                        ""
                                                        :
                                                        <Box sx={{ marginTop: -0.5 }}>
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
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default Tickets;
