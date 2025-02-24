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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const TicketsGasStation = (props) => {
    const { row } = props;
    const [update, setUpdate] = React.useState(true);
    const [name, setName] = React.useState(row.TicketsName);
    const [rate1, setRate1] = React.useState(row.Rate1);
    const [rate2, setRate2] = React.useState(row.Rate2);
    const [rate3, setRate3] = React.useState(row.Rate3);
    const [status, setStatus] = React.useState(row.Status);
    const [open, setOpen] = useState(false);

    const handleUpdate = () => {
        database
                    .ref("/customers/gasstations/")
                    .child(row.id-1)
                    .update({
                    Rate1: rate1,
                    Rate2: rate2,
                    Rate3: rate3,
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

    return (
        <React.Fragment>
            {
                !open ?
                    <TableRow key={row.id}>
                        <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{name}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate1}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate2}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate3}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{status}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <IconButton color="warning" onClick={() => setOpen(true)}>
                                <BorderColorIcon />
                            </IconButton>
                        </TableCell>
                    </TableRow>
                    :
                    <TableRow key={row.id}>
                        <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{name}</TableCell>
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
                                            paddingLeft: 2
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
                                            paddingLeft: 2
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
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={rate3 || 0}
                                    onChange={(e) => setRate3(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.Status}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                !open ?
                                <IconButton color="warning" size="small" onClick={() => setOpen(true)}>
                                <BorderColorIcon fontSize="small"/>
                            </IconButton>
                            :
                            <Box display="flex" justifyContent="center" alignItems="center">
                            <IconButton color="error" size="small" onClick={() => setOpen(false)}>
                                <BorderColorIcon fontSize="small"/>
                            </IconButton>
                            <IconButton color="success" size="small" onClick={handleUpdate}>
                                <BorderColorIcon fontSize="small"/>
                            </IconButton>
                            </Box>
                            }
                        </TableCell>
                    </TableRow>
            }
        </React.Fragment>
    );
};

export default TicketsGasStation;
