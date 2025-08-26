import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
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
    FormGroup,
    Grid,
    IconButton,
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
import { IconButtonWarning, TablecellSelling } from "../../theme/style";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import InsertDeductibleIncome from "./InsertDeductibleIncome";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const DeductibleIncomeDetail = ({openNavbar}) => {
    const [update, setUpdate] = React.useState({});
    const [open, setOpen] = useState(false);
    const [typeIncome, setTypeIncome] = React.useState(true);
    const [typeDeduction, setTypeDeduction] = React.useState(true);
    const [ID, setID] = React.useState("");
    const [name, setName] = React.useState("");
    const [status, setStatus] = React.useState("");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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
    const { creditors, deductibleincome } = useBasicData();
    const creditor = Object.values(creditors || {});
    const deductibleIncome = Object.values(deductibleincome || {});

    const deduction = deductibleIncome.filter((row, index) => row.Type === "รายหัก")
    const income = deductibleIncome.filter((row, index) => row.Type === "รายได้")

    const [pageIncome, setPageIncome] = useState(0);
    const [rowsPerPageIncome, setRowsPerPageIncome] = useState(10);

    const handleChangePageIncome = (event, newPage) => {
        setPageIncome(newPage);
    };

    const handleChangeRowsPerPageIncome = (event) => {
        setRowsPerPageIncome(parseInt(event.target.value, 10));
        setPageIncome(0);
    };

    const [pageDeduction, setPageDeduction] = useState(0);
    const [rowsPerPageDeduction, setRowsPerPageDeduction] = useState(10);

    const handleChangePageDeduction = (event, newPage) => {
        setPageDeduction(newPage);
    };

    const handleChangeRowsPerPageDeduction = (event) => {
        setRowsPerPageDeduction(parseInt(event.target.value, 10));
        setPageDeduction(0);
    };

    const handleUpdate = (data) => {
        setID(data.id);
        setName(data.Name);
        setStatus(data.Status === "ประจำ" ? true : false);
    }

    const handleCancel = () => {
        setID("");
        setName("");
        setStatus("");
    }

    const handleSave = () => {
        database
            .ref("/deductibleincome/")
            .child(Number(ID) - 1)
            .update({
                Name: name,
                Status: status ? "ประจำ" : "ไม่ประจำ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setID("");
                setName("");
                setStatus("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
            {
                windowWidth >= 800 ?
                    <Grid container spacing={2} p={1}>
                        <Grid item sm={8} lg={9}>
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                textAlign="center"
                                gutterBottom
                            >
                                {
                                    (typeIncome && !typeDeduction) ? "รายได้"
                                        : (!typeIncome && typeDeduction) ? "รายหัก"
                                            : "รายได้รายหัก"
                                }
                            </Typography>
                        </Grid>
                        <Grid item sm={4} lg={3} sx={{ textAlign: "right" }}>
                            <InsertDeductibleIncome data={deductibleIncome.length} income={income.length + 1} deduction={deduction.length + 1} />
                        </Grid>
                    </Grid>
                    :
                    <Grid container spacing={2} p={1}>
                        <Grid item xs={12}>
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                textAlign="center"
                                gutterBottom
                            >
                                รายได้รายหัก
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: "center" }}>
                            <InsertDeductibleIncome data={deductibleIncome.length} income={income.length + 1} deduction={deduction.length + 1} />
                        </Grid>
                    </Grid>
            }
            <Divider sx={{ marginBottom: 1 }} />
            <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                {/* {
                    windowWidth >= 800 ?
                        <Grid container spacing={2} p={1}>
                            <Grid item sm={8} lg={10}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>รายได้รายหัก</Typography>
                            </Grid>
                            <Grid item sm={4} lg={2} sx={{ textAlign: "right" }}>
                                <InsertDeductibleIncome data={deductibleIncome.length} />
                            </Grid>
                        </Grid>
                        :
                        <Grid container spacing={2} p={1}>
                            <Grid item xs={12} sx={{ textAlign: "center" }}>
                                <InsertDeductibleIncome data={deductibleIncome.length} />
                            </Grid>
                        </Grid>
                } */}
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                        <FormGroup row>
                            <Typography variant="subtitle1" sx={{ marginRight: 1, marginTop: 1 }} gutterBottom>เลือกเพื่อแสดงข้อมูล</Typography>
                            <FormControlLabel control={<Checkbox checked={typeIncome} color="info" onChange={() => setTypeIncome(!typeIncome)} />} label="รายได้" />
                            <FormControlLabel control={<Checkbox checked={typeDeduction} color="info" onChange={() => setTypeDeduction(!typeDeduction)} />} label="รายหัก" />
                        </FormGroup>
                    </Grid>
                    {
                        typeIncome &&
                        <Grid item xs={12} md={(typeIncome && typeDeduction) ? 6 : 12} >
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>รายละเอียดรายได้</Typography>
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
                                                รหัส
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ชื่อ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ประจำ
                                            </TablecellSelling>
                                            <TablecellSelling width={50} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            income.slice(pageIncome * rowsPerPageIncome, pageIncome * rowsPerPageIncome + rowsPerPageIncome).map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{row.Code}</Typography>
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
                                                                <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Status}</Typography>
                                                                :
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
                                                                        backgroundColor: 'white',
                                                                        marginLeft: 2
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={status}
                                                                        onChange={() => setStatus(!status)}
                                                                        sx={{
                                                                            p: 0, // ไม่มี padding รอบ checkbox
                                                                            m: 0, // ไม่มี margin
                                                                        }}
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
                                                                    <IconButton size="small" onClick={() => handleSave()}>
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
                                                    {/* <UpdateCreditor key={row.id} employee={row} /> */}
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {
                                income.length <= 10 ? null :
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 30]}
                                        component="div"
                                        count={income.length}
                                        rowsPerPage={rowsPerPageIncome}
                                        page={pageIncome}
                                        onPageChange={handleChangePageIncome}
                                        onRowsPerPageChange={handleChangeRowsPerPageIncome}
                                        labelRowsPerPage="เลือกจำนวนแถว:"  // เปลี่ยนข้อความตามที่ต้องการ
                                        labelDisplayedRows={({ from, to, count }) =>
                                            `${from} - ${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
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
                    }
                    {
                        typeDeduction &&
                        <Grid item xs={12} md={(typeIncome && typeDeduction) ? 6 : 12} >
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>รายละเอียดรายหัก</Typography>
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
                                                รหัส
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ชื่อ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ประจำ
                                            </TablecellSelling>
                                            <TablecellSelling width={50} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            deduction.slice(pageDeduction * rowsPerPageDeduction, pageDeduction * rowsPerPageDeduction + rowsPerPageDeduction).map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{row.Code}</Typography>
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
                                                                <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Status}</Typography>
                                                                :
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
                                                                        backgroundColor: 'white',
                                                                        marginLeft: 2
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={status}
                                                                        onChange={() => setStatus(!status)}
                                                                        sx={{
                                                                            p: 0, // ไม่มี padding รอบ checkbox
                                                                            m: 0, // ไม่มี margin
                                                                        }}
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
                                                                    <IconButton size="small" onClick={() => handleSave()}>
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
                                                    {/* <UpdateCreditor key={row.id} employee={row} /> */}
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {
                                deduction.length <= 10 ? null :
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 30]}
                                        component="div"
                                        count={deduction.length}
                                        rowsPerPage={rowsPerPageDeduction}
                                        page={pageDeduction}
                                        onPageChange={handleChangePageDeduction}
                                        onRowsPerPageChange={handleChangeRowsPerPageDeduction}
                                        labelRowsPerPage="เลือกจำนวนแถว:"  // เปลี่ยนข้อความตามที่ต้องการ
                                        labelDisplayedRows={({ from, to, count }) =>
                                            `${from} - ${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
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
                    }
                </Grid>
            </Box>
        </Container>
    );
};

export default DeductibleIncomeDetail;
