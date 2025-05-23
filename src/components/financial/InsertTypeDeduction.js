import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
    MenuItem,
    Paper,
    Popover,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { IconButtonError, TablecellSelling } from "../../theme/style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useData } from "../../server/path";
import dayjs from "dayjs";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useTripData } from "../../server/provider/TripProvider";

const InsertTypeDeduction = ({ onSend }) => {
    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("");
    const [name, setName] = React.useState("");
    const [openMain, setOpenMain] = useState(false);
    const [openSub, setOpenSub] = useState(false);
    // const { typeFinancial } = useData();
    const { typeFinancial } = useTripData();
    const typeFinancialDetail = Object.values(typeFinancial);

    console.log("Type : ", type);

    const handleClickOpen = () => {
        setOpen(true);
        onSend(true);
    };

    const handleClose = () => {
        setOpen(false);
        onSend(false);
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

    const handlePost = () => {
        database
            .ref("financial/type")
            .child(typeFinancialDetail.length)
            .update({
                id: typeFinancialDetail.length,
                Name: name,
                Type: type,
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setName("");
                setType("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleChangDelete = (id) => {
        ShowConfirm(
            `ต้องการลบบิลลำดับที่ ${id + 1} ใช่หรือไม่`,
            () => {
                database
                    .ref("/financial/type")
                    .child(id)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ลบข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกการลบบิลลำดับที่ ${id + 1}`);
            }
        );
    }


    return (
        <React.Fragment>
            {/* <IconButton color="primary" size="large" sx={{ marginTop: -1.5 }} onClick={handleClickOpen}>
                <AddBoxIcon fontSize="large"/>
            </IconButton> */}
            <Button variant="contained" color="primary" fullWidth onClick={handleClickOpen}>
                เพิ่มประเภทรายได้รายรับ
            </Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="sm"
                hideBackdrop
                sx={{
                    '& .MuiDialog-container': {
                        justifyContent: 'flex-end', // 👈 ชิดซ้าย
                        alignItems: 'center',
                    },
                    zIndex: 1200
                }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >เพิ่มประเภท</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    height: "50vh",
                                    marginTop: 2,
                                }}
                            >
                                <Table
                                    stickyHeader
                                    size="small"
                                    sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                >
                                    <TableHead sx={{ height: "5vh" }}>
                                        <TableRow>
                                            <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                                ลำดับ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ชื่อ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ประเภท
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", width: 100, position: "sticky", right: 0 }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            typeFinancialDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Typography variant="subtitle1" fontSize="14px" sx={{ lineHeight: 1, whiteSpace: "nowrap" }} gutterBottom>{index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Typography variant="subtitle1" fontSize="14px" sx={{ lineHeight: 1, whiteSpace: "nowrap" }} gutterBottom>{row.Name}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Typography variant="subtitle1" fontSize="14px" sx={{ lineHeight: 1, whiteSpace: "nowrap" }} gutterBottom>{row.Type}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Button variant="contained" size="small" sx={{ height: "22px" }} color="error" fullWidth
                                                            onClick={() => handleChangDelete(row.id)}
                                                        >ลบ</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                                {
                                    typeFinancialDetail.length <= 10 ? null :
                                        <TablePagination
                                            rowsPerPageOptions={[10, 25, 30]}
                                            component="div"
                                            count={typeFinancialDetail.length}
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
                            </TableContainer>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ชื่อ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ประเภท</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel id="demo-simple-select-label">เลือกประเภท</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={type}
                                            label="เลือกประเภท"
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <MenuItem value={"รายได้"}>รายได้</MenuItem>
                                            <MenuItem value={"รายหัก"}>รายหัก</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={4} />
                        <Grid item xs={4}>
                            <Button onClick={handlePost} variant="contained" fullWidth color="success">บันทึก</Button>
                        </Grid>
                        <Grid item xs={4} />
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertTypeDeduction;
