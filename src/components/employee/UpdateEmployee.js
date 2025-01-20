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
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import HailIcon from "@mui/icons-material/Hail";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const UpdateEmployee = (props) => {
    const { row } = props;
    const [update, setUpdate] = React.useState(true);
    const [openOfficeDetail, setOpenOfficeDetail] = useState(false);

    const [name,setName] = React.useState(row.Name);
    const [user,setUser] = React.useState(row.User);
    const [position,setPosition] = React.useState(row.Position);
    const [phone,setPhone] = React.useState(row.Phone);

    const handleClose = () => {
        setOpenOfficeDetail(false);
    };

    return (
        <React.Fragment>
            <TableCell sx={{ textAlign: "center" }}>
                <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setOpenOfficeDetail(row.id)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell>
            <Dialog
                open={openOfficeDetail === row.id ? true : false}
                keepMounted
                onClose={() => setOpenOfficeDetail(false)}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "800px", // กำหนดความกว้างแบบ Fixed
                        maxWidth: "none", // ปิดการปรับอัตโนมัติ
                    },
                }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดพนักงานชื่อ{row.Name}</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={() => setOpenOfficeDetail(false)}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Paper
                        sx={{ p: 2, border: "1px solid" + theme.palette.grey[600], marginTop: 2, marginBottom: 2 }}
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อ-สกุล</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={name} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตำแหน่ง</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={position} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เบอร์โทร</Typography>
                            </Grid>
                            <Grid item xs={4.5}>
                                <TextField fullWidth variant="standard" value={phone} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>UserID</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={user} disabled={update ? true : false} />
                            </Grid>
                        </Grid>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    {
                        update ?
                            <>
                                <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                                <Button variant="contained" color="warning" onClick={() => setUpdate(false)} >แก้ไข</Button>
                            </>
                            :
                            <>
                                <Button variant="contained" color="error" onClick={() => setUpdate(true)}>ยกเลิก</Button>
                                <Button onClick={handleClose} variant="contained" color="success">บันทึก</Button>
                            </>
                    }
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateEmployee;
