import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputBase,
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
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HTTP } from "../../server/axios";
import Cookies from "js-cookie";
import Logo from "../../../public/logoPanda.jpg";
import InsertRetail from "./InsertRetail";

const Retail = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <React.Fragment>
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Typography variant="h6" fontWeight="bold" marginTop={1} gutterBottom>
                        ขายน้ำมันแบบย่อย
                    </Typography>
                </Grid>
                <Grid item xs={4} textAlign="right">
                    <InsertRetail />
                </Grid>
            </Grid>
            <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
            <TableContainer
                component={Paper}
                style={{ maxHeight: "90vh" }}
                sx={{ marginTop: 2 }}
            >
                <Table stickyHeader size="small">
                    <TableHead sx={{ height: "7vh" }}>
                        <TableRow>
                            <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                ลำดับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                วันที่รับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ชื่อสถานที่ / ชื่อลูกค้า
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                คลัง
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ปริมาตร
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ส่งโดย
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ทะเบียนรถ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                เวลาที่บันทึก
                            </TablecellHeader>
                            <TablecellHeader />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>

    );
};

export default Retail;
