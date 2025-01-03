import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
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
import theme from "../../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HTTP } from "../../../server/axios";
import Cookies from "js-cookie";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";

const GasStationsProduct = () => {

    const [setting, setSetting] = React.useState(true);
    const [name, setName] = React.useState("");
    const [number, setNumber] = React.useState("");
    const [show, setShow] = React.useState(true);

    const handleUpdate = () => {
        database
            .ref("/depot/gasStations")
            .child(gasStation.id - 1)
            .update({
                Name: name,
                OilWellNumber: number
            })
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setSetting(true)
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    return (
        <React.Fragment>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#FFA500", width: 50 }}>G95</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#FFD700", width: 50 }}>G91</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#008000", width: 50 }}>B7</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#006400", width: 50 }}>B95</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#32CD32", width: 50 }}>B10</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#228B22", width: 50 }}>B20</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#1E90FF", width: 50 }}>E20</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#0000FF", width: 50 }}>E85</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellHeader sx={{ backgroundColor: "#FF0000", width: 50 }}>PWD</TablecellHeader>
                                    <TableCell></TableCell>
                                </TableRow>
        </React.Fragment>

    );
};

export default GasStationsProduct;
