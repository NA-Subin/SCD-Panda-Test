import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Drawer,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Popover,
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
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import SaveIcon from '@mui/icons-material/Save';
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import theme from "../../../theme/theme";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ShowError, ShowSuccess, ShowWarning } from "../../sweetalert/sweetalert";
import { formatThaiMonth, formatThaiSlash } from "../../../theme/DateTH";
import { TablecellHeader } from "../../../theme/style";
import FullPageLoading from "../../navbar/Loading";
import { database } from "../../../server/firebase";

const ReportBackyard = (props) => {
    const {
        total,
        row,
        product,
        index,
        backyardItem,
        setBackyardData,
        selectedDate,
        lightenColor,
        summary,
        pumpOrder,
        stockCount,
        daysInMonth,
        backyardData,
        dailySummaryBackyard } = props;
    const [openMenu, setOpenMenu] = React.useState(1);

    const { depots } = useBasicData();
    const { gasstationDetail, stockDetail } = useGasStationData();

    const gasStationOil = Object.values(gasstationDetail || {});
    const stocks = Object.values(stockDetail || {});
    const depot = Object.values(depots || {});

    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const monthKey = `${year}-${month}`;

    const getNextDate = (year, month, day, daysInMonthLength) => {
        // ถ้าไม่ใช่วันสุดท้าย → วันถัดไปในเดือนเดียวกัน
        if (day < daysInMonthLength) {
            return { y: year, m: month, d: day + 1 };
        }

        // ถ้าเป็นวันสุดท้าย → วันที่ 1 ของเดือนถัดไป
        if (month === 12) {
            return { y: year + 1, m: 1, d: 1 };
        }

        return { y: year, m: month + 1, d: 1 };
    };

    const y = selectedDate ? selectedDate.year() : null;
    const m = selectedDate ? selectedDate.month() + 1 : null; // month เริ่มต้นที่ 0

    const handleSaveCBP = async (row) => {
        if (!selectedDate) return;

        const year = selectedDate.year();
        const month = selectedDate.month() + 1;
        const monthKey = `${year}-${month}`;

        const gasStationIndex = Number(row.id) - 1;

        const payload = backyardData?.[row.id]?.[year]?.[month] ?? {};

        // console.log("🚀 ~ file: ReportDetail.js:256 ~ handleSaveBackyard ~ backyardData:", backyardData?.[row.id]?.[year]?.[month]);
        // console.log("🚀 ~ file: ReportDetail.js:256 ~ handleSaveBackyard ~ row:", row);
        // console.log("🚀 ~ file: ReportDetail.js:263 ~ handleSaveBackyard ~ payload:", payload);

        await database
            .ref(`/depot/gasStations/${gasStationIndex}/Backyard/${year}/${month}`)
            .set(payload)
            .then(() => {
                ShowSuccess("✅ บันทึก Backyard สำเร็จ", payload);
            })
            .catch((err) => {
                ShowError("❌ บันทึก Backyard ล้มเหลว", err);
            });
    };

    return (
        <React.Fragment>
            <TableRow>
                <TablecellHeader
                    sx={{
                        backgroundColor: product.Backyard ? (product.Color ?? "white") : "lightgray",
                        width: 140,
                        color: product.Backyard ? "black" : "darkgray",
                        position: "sticky",
                        left: 0,
                        zIndex: 1, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                        borderBottom: "2px solid white"
                    }}
                >
                    {product.Name}
                </TablecellHeader>
                <TableCell sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    position: "sticky",
                    left: 140,
                    backgroundColor: product.Backyard ? lightenColor(product.Color, 0.6) : "lightgray",
                    color: product.Backyard ? "black" : "darkgray",
                }}>
                    {product.Backyard ? (backyardItem.Diff ?? 0).toLocaleString() : "-"}
                </TableCell>
                <TableCell sx={{
                    position: "sticky",
                    left: 260,
                    backgroundColor: product.Backyard ? lightenColor(product.Color, 0.6) : "lightgray",
                    color: product.Backyard ? "black" : "darkgray",
                    textAlign: "center"
                }}>
                    {
                        product.Backyard ? (
                            pumpOrder === 0 ? (
                                <Paper sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        // type={isFieldFocused(index, "EstimateSell") ? "text" : "text"}
                                        // label={"ขาย"}
                                        // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                        InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                        value={backyardItem.CBP}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/,/g, "");
                                            if (!/^-?\d*$/.test(raw)) return;

                                            const cbp = raw === "" ? "" : Number(raw);

                                            setBackyardData(prev => ({
                                                ...prev,
                                                [row.id]: {
                                                    ...prev[row.id],
                                                    [year]: {
                                                        ...prev[row.id]?.[year],
                                                        [month]: {
                                                            ...prev[row.id]?.[year]?.[month],
                                                            [index]: {
                                                                ProductName: product.Name,
                                                                Color: product.Color,
                                                                CBP: cbp,
                                                                Total: total, // ✅ เก็บ total ล่าสุด
                                                                Diff: (cbp || 0) - total
                                                            }
                                                        }
                                                    }
                                                }
                                            }));
                                        }}
                                        // onFocus={() => handleFocus(index, "EstimateSell")}
                                        // onBlur={(e) => handleBlur(index, "EstimateSell", e)} // ส่ง event
                                        // onChange={(e) => {
                                        //     let raw = e.target.value.replace(/,/g, "");

                                        //     // ⭐ อนุญาตให้เริ่มด้วย "-"
                                        //     if (raw === "-" || raw === "") {
                                        //         handleProductChange(index, "EstimateSell", raw);
                                        //         return;
                                        //     }

                                        //     // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                        //     if (/^-?\d+$/.test(raw)) {
                                        //         handleProductChange(index, "EstimateSell", Number(raw));
                                        //     }
                                        // }}
                                        // onKeyDown={(e) => {
                                        //     let raw = String(s.EstimateSell).replace(/,/g, "");

                                        //     // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                        //     if (raw === "" || raw === "-") raw = "0";

                                        //     let current = Number(raw);

                                        //     if (e.key === "ArrowUp") {
                                        //         e.preventDefault();
                                        //         handleProductChange(index, "EstimateSell", current + 1000);
                                        //     }

                                        //     if (e.key === "ArrowDown") {
                                        //         e.preventDefault();
                                        //         handleProductChange(index, "EstimateSell", current - 1000);
                                        //     }
                                        // }}
                                        fullWidth
                                        // InputProps={{
                                        //     inputProps: {
                                        //         min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                        //         step: 1000,
                                        //     },
                                        //     sx: {
                                        //         "& input::-webkit-inner-spin-button": {
                                        //             marginLeft: isFieldFocused(index, "EstimateSell") ? 1 : 0,
                                        //             marginRight: -0.5
                                        //         }
                                        //     },
                                        // }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": { height: 25 },
                                            "& .MuiInputBase-input": {
                                                fontSize: 12,
                                                fontWeight: "bold",
                                                textAlign: "right",
                                                mr: -0.5,
                                                ml: -0.5,
                                                pr: 0.5,
                                                paddingLeft: -3, // เพิ่มพื้นที่ให้ endAdornment
                                                paddingRight: 2, // เพิ่มพื้นที่ให้ endAdornment
                                            },
                                        }}
                                    />
                                </Paper>
                            ) : <Box sx={{ textAlign: "center" }}>
                                -
                            </Box>
                        )
                            : "-"
                    }
                </TableCell>
                <TableCell sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    position: "sticky",
                    left: 380,
                    backgroundColor: product.Backyard ? lightenColor(product.Color, 0.4) : "lightgray",
                    color: product.Backyard ? "black" : "darkgray",
                }}>
                    {product.Backyard ? (backyardItem.Total ?? total).toLocaleString() : "-"}
                </TableCell>

                {/* วันที่ เรียงตาม daysInMonth */}
                {daysInMonth.map((d) => {
                    const source = getNextDate(
                        y,
                        m,
                        d,
                        daysInMonth.length
                    );

                    const productOfDay =
                        row.Report?.[source.y]?.[source.m]?.[source.d]?.Products?.find(
                            p => p.ProductName === product.Name
                        );

                    const sell = productOfDay?.BackyardSales ?? "-";

                    // // ✅ เก็บ daily summary แยกตามวันในตาราง
                    // if (sell !== "-" && !isNaN(sell)) {
                    //     dailySummaryBackyard[d] += Number(sell);
                    // }

                    return (
                        <TableCell
                            key={d}
                            sx={{
                                width: 50,
                                textAlign: "center",
                                backgroundColor: product.Backyard ? lightenColor(product.Color, 0.75) : "lightgray",
                                color: product.Backyard ? "black" : "darkgray"
                            }}
                        >
                            {sell === "-" ? "-" : new Intl.NumberFormat("en-US").format(Math.round(sell))}
                        </TableCell>
                    );
                })}
                <TableCell sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    position: "sticky",
                    right: 220,
                    backgroundColor: product.Backyard ? lightenColor(product.Color, 0.4) : "lightgray",
                    color: product.Backyard ? "black" : "darkgray",
                }}>
                    {new Intl.NumberFormat("en-US").format(Math.round(backyardItem.Carry))}
                </TableCell>
                <TableCell sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    position: "sticky",
                    right: 100,
                    backgroundColor: product.Backyard ? lightenColor(product.Color, 0.4) : "lightgray",
                    color: product.Backyard ? "black" : "darkgray",
                }}>
                    {new Intl.NumberFormat("en-US").format(Math.round(backyardItem.Accumulate))}
                </TableCell>
                {
                    index === 0 &&
                    <TableCell rowSpan={row.Products.length + 1}
                        sx={{
                            right: 0,
                            position: "sticky",
                            zIndex: 5,
                            backgroundColor: "white"
                        }}>
                        <Paper
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 2,
                                backgroundColor: theme.palette.success.main
                            }}
                        >
                            <Button
                                color="inherit"
                                fullWidth
                                sx={{ flexDirection: "column", gap: 0.5 }}
                                onClick={() => handleSaveCBP(row)}   // ⭐ เพิ่มตรงนี้
                            >
                                <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                    บันทึก
                                </Typography>
                            </Button>
                        </Paper>
                    </TableCell>
                }
            </TableRow>
            {
                index === row.Products.length - 1 && (
                    <TableRow>
                        <TablecellHeader
                            sx={{
                                backgroundColor: "#bdbdbd",
                                width: 140,
                                color: "black",
                                position: "sticky",
                                left: 0,
                                zIndex: 1, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                borderBottom: "2px solid white"
                            }}
                        >
                            {/* {`รวม${row.ShortName}`} */}
                            ผลรวม
                        </TablecellHeader>
                        <TableCell sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            position: "sticky",
                            left: 140,
                            backgroundColor: lightenColor("#bdbdbd", 0.6),
                        }}>
                            {summary.diff.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            position: "sticky",
                            left: 260,
                            backgroundColor: lightenColor("#bdbdbd", 0.6),
                        }}>
                            {summary.cbp.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            position: "sticky",
                            left: 380,
                            backgroundColor: lightenColor("#bdbdbd", 0.4),
                        }}>
                            {summary.total.toLocaleString()}
                        </TableCell>
                        {daysInMonth.map((d) => (
                            <TableCell
                                key={d}
                                sx={{
                                    width: 50,
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    backgroundColor: lightenColor("#bdbdbd", 0.6)
                                }}
                            >
                                {dailySummaryBackyard[d] === 0
                                    ? "-"
                                    : new Intl.NumberFormat("en-US").format(Math.round(dailySummaryBackyard[d]))}
                            </TableCell>
                        ))}
                        <TableCell sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            position: "sticky",
                            right: 220,
                            backgroundColor: lightenColor("#bdbdbd", 0.4),
                        }}>
                            {new Intl.NumberFormat("en-US").format(Math.round(summary.carry))}
                        </TableCell>
                        <TableCell sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            position: "sticky",
                            right: 100,
                            backgroundColor: lightenColor("#bdbdbd", 0.4),
                        }}>
                            {new Intl.NumberFormat("en-US").format(Math.round(summary.accumulate))}
                        </TableCell>
                    </TableRow>
                )
            }
        </React.Fragment>
    );
};

export default ReportBackyard;
