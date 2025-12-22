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

const ReportGasStation = ({ openNavbar }) => {
    const [openMenu, setOpenMenu] = React.useState(1);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const { depots } = useBasicData();
    const { gasstationDetail, stockDetail } = useGasStationData();

    const gasStationOil = Object.values(gasstationDetail || {});
    const stocks = Object.values(stockDetail || {});
    const depot = Object.values(depots || {});
    const [cbpData, setCbpData] = useState({});

    const [selectedDate, setSelectedDate] = useState(dayjs()); // ใช้วันปัจจุบัน
    const [checkStock, setCheckStock] = useState("ทั้งหมด");

    const handleDateChange = (newValue) => {
        if (newValue) {
            setSelectedDate(dayjs(newValue));
        }
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

    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const monthKey = `${year}-${month}`;

    const toNumber = (v) => {
        if (v === "" || v === null || v === undefined) return 0;
        const n = Number(String(v).replace(/,/g, ""));
        return isNaN(n) ? 0 : n;
    };

    const calculateMonthlyTotal = (
        report,
        productName,
        y,
        m,
        daysInMonth
    ) => {
        return daysInMonth.reduce((sum, d) => {
            const product =
                report?.[y]?.[m]?.[d]?.Products?.find(
                    p => p.ProductName === productName
                );

            if (!product?.Sell) return sum;

            return sum + toNumber(product.Sell);
        }, 0);
    };

    const getOrCreateCBP = (
        row,
        product,
        index,
        y,
        m,
        total
    ) => {
        const existing = row.CBP?.[y]?.[m]?.[index];

        if (existing) {
            return {
                ...existing,
                Total: total,
                Diff: toNumber(existing.CBP) - total
            };
        }

        return {
            ProductName: product.Name,
            CBP: "",
            Total: total,
            Diff: 0 - total,
            Color: product.Color
        };
    };

    const customOrder = ["G95", "B95", "B7", "B7(1)", "B7(2)", "G91", "E20", "PWD"];
    const stationSummary = {};

    const y = selectedDate ? selectedDate.year() : null;
    const m = selectedDate ? selectedDate.month() + 1 : null; // month เริ่มต้นที่ 0

    const getDaysInMonth = (date) => {
        if (!date) return [];
        const d = dayjs(date);
        const days = d.daysInMonth(); // 28–31
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    const lightenColor = (hex, amount = 0.85) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const lr = Math.round(r + (255 - r) * amount);
        const lg = Math.round(g + (255 - g) * amount);
        const lb = Math.round(b + (255 - b) * amount);

        return `rgb(${lr}, ${lg}, ${lb})`; // ✅ สีทึบ
    };

    const daysInMonth = getDaysInMonth(selectedDate);

    const summary = {
        total: 0,
        cbp: 0,
        diff: 0
    };

    const stockSummary = {
        total: 0,
        cbp: 0,
        diff: 0
    };

    const dailySummary = {};
    daysInMonth.forEach(d => {
        dailySummary[d] = 0;
    });

    useEffect(() => {
        if (!selectedDate) return;

        const year = selectedDate.year();
        const month = selectedDate.month() + 1;

        setCbpData(prev => {
            const updated = { ...prev };

            gasStationOil.forEach(row => {
                const stationId = row.id;

                if (!updated[stationId]) updated[stationId] = {};
                if (!updated[stationId][year]) updated[stationId][year] = {};
                if (updated[stationId][year][month]) return;

                const cbpOfMonth = row.CBP?.[year]?.[month] ?? {};
                const productMap = {};

                row.Products.forEach((p, idx) => {
                    const total = calculateMonthlyTotal(
                        row.Report,
                        p.Name,
                        year,
                        month,
                        daysInMonth
                    );

                    productMap[idx] = {
                        ProductName: p.Name,
                        Color: p.Color,
                        CBP: cbpOfMonth[idx]?.CBP ?? "",
                        Total: total,
                        Diff:
                            (cbpOfMonth[idx]?.CBP ?? 0) - total
                    };
                });

                updated[stationId][year][month] = productMap;
            });

            return updated;
        });
    }, [selectedDate, gasStationOil]);

    const handleSaveCBP = async (row) => {
        if (!selectedDate) return;

        // const year = selectedDate.year();
        // const month = selectedDate.month() + 1;

        // // 🔑 index ของ gasStation
        // const gasStationIndex = Number(row.id) - 1;

        // // 🔥 เตรียมข้อมูล CBP สำหรับเดือนนี้
        // const cbpPayload = {};

        // Object.keys(cbpData).forEach((idx) => {
        //     const item = cbpData[idx];
        //     if (!item?.ProductName) return;

        //     cbpPayload[idx] = {
        //         ProductName: item.ProductName,
        //         CBP: Number(item.CBP ?? 0),
        //         Total: Number(item.Total ?? 0),
        //         Diff: Number(item.Diff ?? 0),
        //         Color: item.Color
        //     };
        // });
        // await database
        //     .ref(`/depot/gasStations/${gasStationIndex}/CBP/${year}/${month}`)
        //     .set(cbpPayload)
        //     .then(() => {
        //         ShowSuccess("✅ บันทึก CBP สำเร็จ", cbpPayload);
        //     })
        //     .catch((err) => {
        //         ShowError("❌ บันทึก CBP ล้มเหลว", err);
        //     });

        const year = selectedDate.year();
        const month = selectedDate.month() + 1;
        const monthKey = `${year}-${month}`;

        const gasStationIndex = Number(row.id) - 1;

        const payload = cbpData[monthKey] ?? {};

        await database
            .ref(`/depot/gasStations/${gasStationIndex}/CBP/${year}/${month}`)
            .set(payload)
            .then(() => {
                ShowSuccess("✅ บันทึก CBP สำเร็จ", payload);
            })
            .catch((err) => {
                ShowError("❌ บันทึก CBP ล้มเหลว", err);
            });
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                รายงานสต๊อกหน้าลาน
            </Typography>
            <Divider />
            <Box sx={{ mt: 2 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} lg={4}>
                        <Paper
                            component="form"
                            sx={{
                                //width: "100%", // กำหนดความกว้างของ Paper
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                <DatePicker
                                    openTo="month"
                                    views={["month"]}
                                    value={selectedDate ? dayjs(selectedDate, "MMMM") : null}
                                    format="MMMM"
                                    onChange={(newValue) => {
                                        // ตรวจสอบว่ามีการแก้ไขค้างอยู่หรือไม่
                                        // const hasUnsaved = stationReports.some(st => st.hasChanged);
                                        // if (hasUnsaved) {
                                        //     ShowWarning("กรุณาบันทึกการแก้ไขข้อมูลก่อนเปลี่ยนวันที่!");
                                        //     return; // ❌ หยุดไม่ให้เปลี่ยนค่า
                                        // }

                                        // ถ้าไม่มีการแก้ไขค้าง ให้เปลี่ยน selectedDate ตรง ๆ
                                        if (newValue) {
                                            setSelectedDate(dayjs(newValue, "MMMM"));
                                        }
                                    }}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            inputProps: {
                                                value: selectedDate
                                                    ? formatThaiMonth(selectedDate) // ✅ แสดงเป็น 05/11/2568
                                                    : "",
                                                readOnly: true,
                                            },
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        กรุณาเลือกวันที่ :
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: "16px",
                                                    height: "40px",
                                                    padding: "10px",
                                                    fontWeight: "bold",
                                                },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Paper>
                    </Grid>
                    <Grid item sm={6} lg={8}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checkStock === "ทั้งหมด"}
                                        onChange={() => setCheckStock("ทั้งหมด")}
                                    //disabled={isDataUpdated} // 🔹 ปิดการเลือกถ้ามีการเปลี่ยนแปลง
                                    />
                                }
                                label="ทั้งหมด"
                            />
                            {stocks.map((row) => (
                                <FormControlLabel
                                    key={row.Name}
                                    control={
                                        <Checkbox
                                            checked={checkStock === row.Name}
                                            onChange={() => {
                                                // ✅ เช็คว่ามี station ไหนถูกแก้
                                                // const hasUnsaved = stationReports.some(st => st.hasChanged);
                                                // if (hasUnsaved) {
                                                //     ShowWarning("กรุณาบันทึกการแก้ไขข้อมูลก่อนเปลี่ยน Stock!");
                                                //     return; // ❌ หยุดไม่ให้เปลี่ยนค่า
                                                // }

                                                setCheckStock(row.Name); // ✅ ถ้าไม่มี unsaved จะเปลี่ยนค่าได้
                                            }}
                                        //disabled={isDataUpdated} // 🔹 ปิดการเลือกถ้ามีการเปลี่ยนแปลง
                                        />
                                    }
                                    label={row.Name}
                                />
                            ))}
                            {/* {isDataUpdated && (
                                <Typography color="error" sx={{ mt: 1 }}>
                                    ⚠️ กรุณาบันทึกข้อมูลก่อนเปลี่ยนสาขา
                                </Typography>
                            )} */}
                        </FormGroup>
                    </Grid>
                </Grid>
                {(checkStock === "ทั้งหมด" ? stocks : [stocks.find(s => s.Name === checkStock)]).map((stock, idx) => {
                    let matchCount = 0;

                    return (
                        <Paper
                            sx={{
                                p: 2,
                                mb: 2,
                                border: '2px solid lightgray',
                                borderRadius: 3,
                                boxShadow: 1,
                                //width: "100%",
                                overflowY: 'auto',
                            }}
                            key={stock.id || idx}
                        >
                            {gasStationOil.map((row, index) => {
                                if (Number(row.Stock.split(":")[0]) === stock.id) {
                                    const filteredStocks = gasStationOil.filter(r => Number(r.Stock.split(":")[0]) === stock.id);
                                    const stockCount = filteredStocks.length;  // จำนวนปั้มที่ตรงกัน
                                    // ✔ หาลำดับปั้ม (0,1)
                                    const pumpOrder = filteredStocks.findIndex(p => p.id === row.id);

                                    const year = selectedDate.year();
                                    const month = selectedDate.month() + 1;

                                    // 🔹 summary ต่อปั้ม
                                    const pumpSummary = row.Products.reduce(
                                        (acc, _, idx) => {
                                            const item = cbpData?.[row.id]?.[year]?.[month]?.[idx];
                                            acc.total += Number(item?.Total ?? 0);
                                            acc.cbp += Number(item?.CBP ?? 0);
                                            acc.diff += Number(item?.Diff ?? 0);
                                            return acc;
                                        },
                                        { total: 0, cbp: 0, diff: 0 }
                                    );

                                    // 🔹 เอาค่าปั้มนี้ไปรวมใน stock
                                    stockSummary.total += pumpSummary.total;
                                    stockSummary.cbp += pumpSummary.cbp;
                                    stockSummary.diff += pumpSummary.diff;

                                    matchCount++;
                                    return (
                                        <React.Fragment key={row.id || index}>
                                            <Box textAlign="center"
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between", // ชิดซ้าย-ขวา
                                                    alignItems: "center",
                                                    backgroundColor:
                                                        row.Stock.split(":")[1] === "แม่โจ้" ? "#92D050"
                                                            : row.Stock.split(":")[1] === "สันกลาง" ? "#B1A0C7"
                                                                : row.Stock.split(":")[1] === "สันทราย" ? "#B7DEE8"
                                                                    : row.Stock.split(":")[1] === "บ้านโฮ่ง" ? "#FABF8F"
                                                                        : row.Stock.split(":")[1] === "ป่าแดด" ? "#B1A0C7"
                                                                            : "lightgray"
                                                    ,
                                                    paddingLeft: 2,
                                                    paddingTop: 2,
                                                    paddingBottom: 1,
                                                    borderTopLeftRadius: 10,
                                                    borderTopRightRadius: 10
                                                }}>

                                                {/* ด้านซ้าย */}
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    sx={{ fontSize: 18, marginBottom: -1 }}
                                                >
                                                    {`${row.Name} / ${row.ShortName} มีทั้งหมด ${row.OilWellNumber} หลุม ที่อยู่ ${row.Address}`}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <TableContainer
                                                    component={Paper}
                                                    style={{ maxHeight: "70vh" }}
                                                    sx={{ marginBottom: 2 }}
                                                >
                                                    <Table stickyHeader size="small" sx={{ width: "100%" }}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 140,
                                                                    position: "sticky",
                                                                    left: 0,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    <Paper
                                                                        component="form"
                                                                        sx={{
                                                                            width: "100%", // กำหนดความกว้างของ Paper
                                                                            height: "25px"
                                                                        }}
                                                                    >
                                                                        <Typography fontSize="18px" fontWeight="bold" gutterBottom paddingTop={-0.5}>{formatThaiMonth(dayjs(selectedDate))}</Typography>
                                                                    </Paper>
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 150,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    left: 130,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    ส่วนต่าง
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 150,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    left: 280,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    ยอด CBP
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 150,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    left: 430,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    รวม
                                                                </TablecellHeader>
                                                                {daysInMonth.map(day => (
                                                                    <TablecellHeader
                                                                        key={day}
                                                                        sx={{
                                                                            textAlign: "center",
                                                                            fontSize: 13,
                                                                            backgroundColor: theme.palette.panda.main,

                                                                            minWidth: 120,   // ⭐ ใช้ minWidth ดีกว่า width
                                                                            whiteSpace: "nowrap"
                                                                        }}
                                                                    >
                                                                        {`วันที่ ${day}`}
                                                                    </TablecellHeader>
                                                                ))}
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 100,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    right: 0,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>

                                                                </TablecellHeader>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {
                                                                row.Products.sort((a, b) => {
                                                                    const ai = customOrder.indexOf(a.Name);
                                                                    const bi = customOrder.indexOf(b.Name);
                                                                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                                                                }).map((product, index) => {
                                                                    const y = selectedDate.year();
                                                                    const m = selectedDate.month() + 1;

                                                                    const total = calculateMonthlyTotal(
                                                                        row.Report,
                                                                        product.Name,
                                                                        y,
                                                                        m,
                                                                        daysInMonth
                                                                    );

                                                                    const year = selectedDate.year();
                                                                    const month = selectedDate.month() + 1;

                                                                    const cbpItem =
                                                                        cbpData?.[row.id]?.[year]?.[month]?.[index] ?? {
                                                                            ProductName: product.Name,
                                                                            Color: product.Color,
                                                                            CBP: "",
                                                                            Total: total,
                                                                            Diff: -total
                                                                        };

                                                                    // ✅ สร้าง summary ของปั้มนี้ ถ้ายังไม่มี
                                                                    if (!stationSummary[row.id]) {
                                                                        stationSummary[row.id] = {
                                                                            total: 0,
                                                                            cbp: 0,
                                                                            diff: 0
                                                                        };
                                                                    }

                                                                    stationSummary[row.id].total += Number(cbpItem?.Total ?? 0);
                                                                    stationSummary[row.id].cbp += Number(cbpItem?.CBP ?? 0);
                                                                    stationSummary[row.id].diff += Number(cbpItem?.Diff ?? 0);

                                                                    const summary = stationSummary[row.id] ?? {
                                                                        total: 0,
                                                                        cbp: 0,
                                                                        diff: 0
                                                                    };

                                                                    return (
                                                                        <React.Fragment key={index}>
                                                                            <TableRow>
                                                                                <TablecellHeader
                                                                                    sx={{
                                                                                        backgroundColor: product.Color ?? "white",
                                                                                        width: 50,
                                                                                        color: "black",
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
                                                                                    left: 130,
                                                                                    backgroundColor: lightenColor(product.Color, 0.6),
                                                                                }}>
                                                                                    {(cbpItem.Diff ?? 0).toLocaleString()}
                                                                                </TableCell>
                                                                                <TableCell sx={{
                                                                                    position: "sticky",
                                                                                    left: 280,
                                                                                    backgroundColor: lightenColor(product.Color, 0.6),
                                                                                }}>
                                                                                    <Paper sx={{ width: "100%" }}>
                                                                                        <TextField
                                                                                            size="small"
                                                                                            // type={isFieldFocused(index, "EstimateSell") ? "text" : "text"}
                                                                                            // label={"ขาย"}
                                                                                            // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                                                            InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                                                            value={cbpItem.CBP}
                                                                                            onChange={(e) => {
                                                                                                const raw = e.target.value.replace(/,/g, "");
                                                                                                if (!/^-?\d*$/.test(raw)) return;

                                                                                                const cbp = raw === "" ? "" : Number(raw);

                                                                                                setCbpData(prev => ({
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
                                                                                </TableCell>
                                                                                <TableCell sx={{
                                                                                    textAlign: "center",
                                                                                    fontWeight: "bold",
                                                                                    position: "sticky",
                                                                                    left: 430,
                                                                                    backgroundColor: lightenColor(product.Color, 0.4),
                                                                                }}>
                                                                                    {(cbpItem.Total ?? total).toLocaleString()}
                                                                                </TableCell>

                                                                                {/* วันที่ เรียงตาม daysInMonth */}
                                                                                {daysInMonth.map((d) => {
                                                                                    const productOfDay =
                                                                                        row.Report?.[y]?.[m]?.[d]?.Products?.find(
                                                                                            p => p.ProductName === product.Name
                                                                                        );

                                                                                    const sell = productOfDay?.Sell ?? "-";

                                                                                    // 🔥🔥🔥 ตรงนี้คือ "การเก็บผลรวม" 🔥🔥🔥
                                                                                    if (sell !== "-" && !isNaN(sell)) {
                                                                                        dailySummary[d] += Number(sell);
                                                                                    }

                                                                                    return (
                                                                                        <TableCell
                                                                                            key={d}
                                                                                            sx={{
                                                                                                width: 50,
                                                                                                textAlign: "center",
                                                                                                backgroundColor: lightenColor(product.Color, 0.75)
                                                                                            }}
                                                                                        >
                                                                                            {sell === "-" ? "-" : new Intl.NumberFormat("en-US").format(Math.round(sell))}
                                                                                        </TableCell>
                                                                                    );
                                                                                })}
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
                                                                                                width: 50,
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
                                                                                            left: 130,
                                                                                            backgroundColor: lightenColor("#bdbdbd", 0.6),
                                                                                        }}>
                                                                                            {summary.diff.toLocaleString()}
                                                                                        </TableCell>
                                                                                        <TableCell sx={{
                                                                                            textAlign: "center",
                                                                                            fontWeight: "bold",
                                                                                            position: "sticky",
                                                                                            left: 280,
                                                                                            backgroundColor: lightenColor("#bdbdbd", 0.6),
                                                                                        }}>
                                                                                            {summary.cbp.toLocaleString()}
                                                                                        </TableCell>
                                                                                        <TableCell sx={{
                                                                                            textAlign: "center",
                                                                                            fontWeight: "bold",
                                                                                            position: "sticky",
                                                                                            left: 430,
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
                                                                                                {dailySummary[d] === 0
                                                                                                    ? "-"
                                                                                                    : new Intl.NumberFormat("en-US").format(Math.round(dailySummary[d]))}
                                                                                            </TableCell>
                                                                                        ))}
                                                                                    </TableRow>
                                                                                )
                                                                            }
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                                {/* <TableContainer
                                                    component={Paper}
                                                    style={{ maxHeight: "70vh" }}
                                                    sx={{ marginBottom: 2, marginLeft: 5 }}
                                                >
                                                    <Table stickyHeader size="small" sx={{ width: "100%" }}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TablecellHeader colSpan={2} width={130} sx={{ textAlign: "center", backgroundColor: theme.palette.panda.main }}>
                                                                    <Paper
                                                                        component="form"
                                                                        sx={{
                                                                            width: "100%", // กำหนดความกว้างของ Paper
                                                                            height: "25px"
                                                                        }}
                                                                    >
                                                                        <Typography fontSize="18px" fontWeight="bold" gutterBottom paddingTop={-0.5}>{formatThaiSlash(dayjs(selectedDate))}</Typography>
                                                                    </Paper>
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                                                    ส่วนต่าง
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 80, whiteSpace: "nowrap" }}>
                                                                    ยอด CBP
                                                                </TablecellHeader>
                                                            </TableRow>
                                                        </TableHead>
                                                    </Table>
                                                </TableContainer> */}
                                            </Box>
                                        </React.Fragment>
                                    )
                                }
                            }
                            )}
                        </Paper>
                    )
                })}
            </Box>
        </Container>
    );
};

export default ReportGasStation;
