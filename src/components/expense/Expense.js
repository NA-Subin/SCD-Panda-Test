import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
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
    MenuItem,
    Paper,
    Popover,
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
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { TablecellSelling } from "../../theme/style";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { database } from "../../server/firebase";

const ExpenseDetail = ({ openNavbar }) => {
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [ID, setID] = useState("");

    const [openTab, setOpenTab] = React.useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            let width = window.innerWidth;
            if (!openNavbar) {
                width += 120; // ✅ เพิ่ม 200 ถ้า openNavbar = false
            }
            setWindowWidth(width);
        };

        // เรียกครั้งแรกตอน mount
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [openNavbar]); // ✅ ทำงานใหม่ทุกครั้งที่ openNavbar เปลี่ยน

    //const { creditors } = useData();
    const { expenseitems } = useBasicData();
    const expenseitem = Object.values(expenseitems || {});

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleUpdate = (data) => {
        setID(data.id);
        setName(data.Name);
        setType(data.Type);
        setStatus(data.Status);
    }

    const handleSave = () => {
        database
            .ref("/expenseitems/")
            .child(expenseitem.length)
            .update({
                id: expenseitem.length + 1,
                Name: name,
                Type: type,
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setName("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleUpdateData = () => {
        database
            .ref("/expenseitems/")
            .child(Number(ID) - 1)
            .update({
                Name: name,
                Type: type,
                Status: status
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setID("");
                setName("");
                setType("");
                setStatus("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleCancel = () => {
        setID("");
        setName("");
        setType("");
        setStatus("");
    }

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ค่าใช้จ่าย
            </Typography>
            {/* <ImportExcel /> */}
            <Divider sx={{ marginBottom: 1 }} />
            <Box sx={{ width: "100%" }}>
                {
                    windowWidth >= 800 ?
                        <Grid container spacing={2} p={1}>
                            <Grid item sm={8} lg={10}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>รายการค่าใช้จ่าย</Typography>
                            </Grid>
                            <Grid item sm={4} lg={2} sx={{ textAlign: "right" }}>

                            </Grid>
                        </Grid>
                        :
                        <Grid container spacing={2} p={1}>
                            <Grid item xs={12} sx={{ textAlign: "center" }}>

                            </Grid>
                        </Grid>
                }
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TableContainer
                            component={Paper}
                            style={{ maxHeight: "70vh" }}
                            sx={{ marginBottom: 2 }}
                        >
                            <Table stickyHeader size="small">
                                <TableHead sx={{ height: "7vh" }}>
                                    <TableRow>
                                        <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                            ชื่อรายการ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            ประเภท
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            สถานะ
                                        </TablecellSelling>
                                        <TablecellSelling width={50} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        expenseitem.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                            <TableRow>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                    <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{index + 1}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                    {
                                                        ID !== row.id ?
                                                            <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Name}</Typography>
                                                            :
                                                            <Paper>
                                                                <TextField
                                                                    fullWidth
                                                                    value={name}
                                                                    onChange={(e) => setName(e.target.value)}
                                                                    size="small"
                                                                    sx={{
                                                                        '& .MuiInputBase-root': {
                                                                            height: 30, // ปรับความสูงรวม
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            padding: '4px 8px', // ปรับ padding ด้านใน input
                                                                            fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                                        },
                                                                    }}
                                                                    InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                                                                />
                                                            </Paper>
                                                    }
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                    {
                                                        ID !== row.id ?
                                                            <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Type}</Typography>
                                                            :
                                                            <Paper>
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    value={type}
                                                                    onChange={(e) => setType(e.target.value)}
                                                                    size="small"
                                                                    sx={{
                                                                        "& .MuiInputBase-root": {
                                                                            height: 30, // ปรับความสูงรวม
                                                                        },
                                                                        "& .MuiInputBase-input": {
                                                                            padding: "4px 8px", // ปรับ padding ด้านใน input
                                                                            fontSize: "0.85rem", // ลดขนาด font
                                                                        },
                                                                    }}
                                                                    InputProps={{ sx: { height: 30 } }}
                                                                >
                                                                    <MenuItem value="ค่าใช้จ่าย">ค่าใช้จ่าย</MenuItem>
                                                                </TextField>
                                                            </Paper>
                                                    }
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                    {
                                                        ID !== row.id ?
                                                            <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Status}</Typography>
                                                            :
                                                            <Paper>
                                                                <TextField
                                                                    fullWidth
                                                                    value={status}
                                                                    onChange={(e) => setStatus(e.target.value)}
                                                                    size="small"
                                                                    sx={{
                                                                        '& .MuiInputBase-root': {
                                                                            height: 30, // ปรับความสูงรวม
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            padding: '4px 8px', // ปรับ padding ด้านใน input
                                                                            fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                                        },
                                                                    }}
                                                                    InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                                                                />
                                                            </Paper>
                                                    }
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                    {
                                                        ID !== row.id ?
                                                            <IconButton size="small" onClick={() => handleUpdate(row)}>
                                                                <SettingsIcon fontSize="small" color="warning" />
                                                            </IconButton>
                                                            :
                                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -2, marginRight: -2 }}>
                                                                <IconButton size="small" onClick={() => handleCancel()}>
                                                                    <Paper
                                                                        elevation={0}
                                                                        sx={{
                                                                            p: 0, // ไม่มี padding
                                                                            m: 0, // ไม่มี margin
                                                                            display: 'flex', // ให้ Checkbox ขยายได้เต็มพื้นที่
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center', // กรณีต้องการอยู่ตรงกลาง (เลือกปรับตามต้องการ)
                                                                            width: 'fit-content', // ปรับตาม Checkbox
                                                                            height: 'fit-content',
                                                                            backgroundColor: 'white'
                                                                        }}
                                                                    >
                                                                        <DisabledByDefaultIcon fontSize="small" color="error" />
                                                                    </Paper>
                                                                </IconButton>
                                                                <IconButton size="small" onClick={() => handleUpdateData()}>
                                                                    <Paper
                                                                        elevation={0}
                                                                        sx={{
                                                                            p: 0, // ไม่มี padding
                                                                            m: 0, // ไม่มี margin
                                                                            display: 'flex', // ให้ Checkbox ขยายได้เต็มพื้นที่
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center', // กรณีต้องการอยู่ตรงกลาง (เลือกปรับตามต้องการ)
                                                                            width: 'fit-content', // ปรับตาม Checkbox
                                                                            height: 'fit-content',
                                                                            backgroundColor: 'white'
                                                                        }}
                                                                    >
                                                                        <AssignmentTurnedInIcon fontSize="small" color="success" />
                                                                    </Paper>
                                                                </IconButton>
                                                            </Box>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                    {
                                        open &&
                                        <TableRow>
                                            <TableCell sx={{ textAlign: "center" }}>{expenseitem.length + 1}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                <TextField
                                                    fullWidth
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    size="small"
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            height: 30, // ปรับความสูงรวม
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            padding: '4px 8px', // ปรับ padding ด้านใน input
                                                            fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                        },
                                                    }}
                                                    InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                                                />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    value={type}
                                                    onChange={(e) => setType(e.target.value)}
                                                    size="small"
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            height: 30, // ปรับความสูงรวม
                                                        },
                                                        "& .MuiInputBase-input": {
                                                            padding: "4px 8px", // ปรับ padding ด้านใน input
                                                            fontSize: "0.85rem", // ลดขนาด font
                                                        },
                                                    }}
                                                    InputProps={{ sx: { height: 30 } }}
                                                >
                                                    <MenuItem value="ค่าใช้จ่าย">ค่าใช้จ่าย</MenuItem>
                                                </TextField>
                                            </TableCell>
                                            {/* <TableCell sx={{ textAlign: "center" }}>
                                                <TextField
                                                    fullWidth
                                                    value={status}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    size="small"
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            height: 30, // ปรับความสูงรวม
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            padding: '4px 8px', // ปรับ padding ด้านใน input
                                                            fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                        },
                                                    }}
                                                    InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                                                />
                                            </TableCell> */}
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {
                            expenseitem.length <= 10 ? null :
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 30]}
                                    component="div"
                                    count={expenseitem.length}
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
                    </Grid>
                </Grid>
                <Box sx={{ marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {
                        open ?
                            <Box display="flex" alignItems="center" justifyContent="center" >
                                <Button variant="contained" color="error" sx={{ marginRight: 2 }} size="small" onClick={() => setOpen(false)}>ยกเลิก</Button>
                                <Button variant="contained" color="success" size="small" onClick={() => handleSave()}>บันทึก</Button>
                            </Box>
                            :
                            <Button variant="contained" size="small" onClick={() => setOpen(true)}>เพิ่มบริษัทสั่งจ่าย</Button>
                    }
                </Box>
            </Box>
        </Container>
    );
};

export default ExpenseDetail;
