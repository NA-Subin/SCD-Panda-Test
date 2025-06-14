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
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const TicketsGasStation = (props) => {
    const { row, index } = props;
    const [update, setUpdate] = React.useState(true);
    const [name, setName] = React.useState(row.Name);
    const [shortName, setShortName] = React.useState(row.ShortName || "");
    const [lastName, setLastName] = React.useState(row.LastName || "");
    const [rate1, setRate1] = React.useState(row.Rate1);
    const [rate2, setRate2] = React.useState(row.Rate2);
    const [rate3, setRate3] = React.useState(row.Rate3);
    const [creditTime, setCreditTime] = React.useState(row.CreditTime);
    const [status, setStatus] = React.useState(row.Status);
    const [open, setOpen] = useState(false);

    const handleUpdate = () => {
        database
            .ref("/customers/gasstations/")
            .child(row.id - 1)
            .update({
                Rate1: rate1,
                Rate2: rate2,
                Rate3: rate3,
                CreditTime: creditTime,
                Name: shortName + lastName,
                ShortName: shortName,
                LastName: lastName
            }) // อัพเดท values ทั้งหมด
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data updated successfully");
                setOpen(false);
            })
            .catch((error) => {
                ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    };

    const handleDelete = () => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วปั้มที่ ${index + 1} ใช่หรือไม่`,
            () => {
                database
                    .ref("/customers/gasstations/")
                    .child(row.id - 1)
                    .update({
                        SystemStatus: "ไม่อยู่ในระบบ"
                    }) // อัพเดท values ทั้งหมด
                    .then(() => {
                        ShowSuccess(`ลบข้อตั๋วปั้มลำดับที่ ${index + 1} สำเร็จ`);
                        console.log("Data updated successfully");
                        setOpen(false);
                    })
                    .catch((error) => {
                        ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                        console.error("Error updating data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกลบตั๋วปั้มที่ ${index + 1}`);
            }
        )
    }

    return (
        <React.Fragment>
            {
                !open ?
                    <TableRow key={index} >
                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{name}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{creditTime}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate1}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate2}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate3}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{status}</TableCell>
                        <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<EditNoteIcon />}
                                size="small"
                                sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }}
                                onClick={() => setOpen(true)}
                                fullWidth
                            >
                                แก้ไข
                            </Button>
                        </TableCell>
                    </TableRow>
                    :
                    <TableRow key={index} sx={{ backgroundColor: "#fff59d" }}>
                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{index + 1}</TableCell>
                        {/* <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{name}</TableCell> */}
                        <TableCell sx={{ textAlign: "center" }}>
                            <Grid container>
                                <Grid item xs={4}>
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
                                            value={shortName}
                                            onChange={(e) => setShortName(e.target.value)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={8}>
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
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
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
                                            textAlign: "center"
                                        },
                                    }}
                                    value={creditTime || 0}
                                    onChange={(e) => setCreditTime(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
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
                                            textAlign: "center"
                                        },
                                    }}
                                    value={rate1 || 0}
                                    onChange={(e) => setRate1(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
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
                                            textAlign: "center"
                                        },
                                    }}
                                    value={rate2 || 0}
                                    onChange={(e) => setRate2(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
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
                                            textAlign: "center"
                                        },
                                    }}
                                    value={rate3 || 0}
                                    onChange={(e) => setRate3(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            <Box sx={{ marginLeft: 2.5, marginRight: 2.5 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    endIcon={<DeleteIcon />}
                                    size="small"
                                    sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }}
                                    onClick={handleDelete}
                                    fullWidth
                                >
                                    ลบ
                                </Button>
                            </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                            {
                                !open ?
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        startIcon={<EditNoteIcon />}
                                        size="small"
                                        sx={{ height: "25px" }}
                                        onClick={() => setOpen(true)}
                                        fullWidth
                                    >
                                        แก้ไข
                                    </Button>
                                    :
                                    <>
                                        <Button variant="contained" color="success" onClick={handleUpdate} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>บันทึก</Button>
                                        <Button variant="contained" color="error" onClick={() => setOpen(false)} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>ยกเลิก</Button>
                                    </>
                            }
                        </TableCell>
                    </TableRow>
            }
        </React.Fragment>
    );
};

export default TicketsGasStation;
