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
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import UpdateTrip from "./UpdateTrip";

const TripsDetail = (props) => {
    const { trips, windowWidth } = props;
    const [approve, setApprove] = React.useState(false);

    const handleApprove = () => {
        database
            .ref("trip/")
            .child(trips.id - 1)
            .update({
                Status: "อนุมัติแล้ว",
            })
            .then(() => {
                ShowSuccess("อนุมัติเที่ยววิ่งเรียบร้อย");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("อนุมัติเที่ยววิ่งไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleNonApprove = () => {
        database
            .ref("trip/")
            .child(trips.id - 1)
            .update({
                Status: "ไม่อนุมัติ",
            })
            .then(() => {
                ShowSuccess("ไม่อนุมัติเที่ยววิ่งเรียบร้อย");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("ไม่อนุมัติเที่ยววิ่งไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center" }}>{trips.id}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.DateStart}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Depot}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Driver}/{trips.Registration}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Order1 === undefined ? "-" : trips.Order1}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Order2 === undefined ? "-" : trips.Order2}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Order3 === undefined ? "-" : trips.Order3}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Order4 === undefined ? "-" : trips.Order4}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Order5 === undefined ? "-" : trips.Order5}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Order6 === undefined ? "-" : trips.Order6}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Order7 === undefined ? "-" : trips.Order7}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{trips.Order8 === undefined ? "-" : trips.Order8}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(trips.CostTrip)}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(parseFloat(trips.WeightHigh) + parseFloat(trips.WeightLow))}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(trips.WeightTruck)}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(trips.TotalWeight)}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>

                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <UpdateTrip 
                        tripID={trips.id} 
                        dateStart={trips.DateStart} 
                        weightHigh={trips.WeightHigh} 
                        weightLow={trips.WeightLow} 
                        totalWeight={trips.TotalWeight} 
                        weightTruck={trips.WeightTruck} />
                </TableCell>
                {/* <TableCell sx={{
                    textAlign: "center",
                    color: "white",
                    backgroundColor:
                        trips.Status === "รออนุมัติ" ? "yellowgreen"
                            : trips.Status === "ไม่อนุมัติ" ? "orangered"
                                : trips.Status === "อนุมัติแล้ว" ? "blue"
                                    : trips.Status === "ยกเลิก" ? "red"
                                        : "green",
                    position: "sticky",
                    right: windowWidth <= 900 ? 0 : "200px", // ติดซ้ายสุด
                    zIndex: windowWidth <= 900 ? 2 : 4,
                }}>{trips.Status}</TableCell>
                <TableCell sx={
                    windowWidth <= 900 ?
                        { textAlign: "center" }
                        :
                        (trips.Status === "รออนุมัติ" ?
                            { textAlign: "center" }
                            :
                            {
                                textAlign: "center",
                                position: "sticky",
                                right: 0, // ระยะที่ชิดซ้ายต่อจากเซลล์ก่อนหน้า
                                backgroundColor: "#fff", // ใส่พื้นหลังเพื่อไม่ให้โปร่งใส
                                zIndex: 1,
                            })
                }>{trips.Creditor}</TableCell>
                <TableCell
                    sx={
                        windowWidth <= 900 ?
                            {
                                textAlign: "center",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }
                            :
                            trips.Status === "รออนุมัติ" ?
                                {
                                    textAlign: "center",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    position: "sticky",
                                    right: 0, // ระยะที่ชิดซ้ายต่อจากเซลล์ก่อนหน้า
                                    backgroundColor: "#fff", // ใส่พื้นหลังเพื่อไม่ให้โปร่งใส
                                    zIndex: 1,
                                }
                                :
                                {
                                    textAlign: "center",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }
                    }>
                    {
                        trips.Status === "รออนุมัติ" ?
                            <>
                                <Button variant="contained" color="warning" size="small" onClick={handleApprove} sx={{ marginRight: 1 }} fullWidth>อนุมัติ</Button>
                                <Button variant="contained" color="error" size="small" onClick={handleNonApprove} fullWidth>ไม่อนุมัติ</Button>
                            </>
                            :
                            <Button variant="text" size="small" fullWidth>-</Button>
                    }
                </TableCell> */}
            </TableRow>
        </React.Fragment>

    );
};

export default TripsDetail;
