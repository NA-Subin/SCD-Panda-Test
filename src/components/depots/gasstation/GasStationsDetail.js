import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
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
    InputAdornment,
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
import { database } from "../../../server/firebase";
import UpdateGasStations from "./UpdateGasStations";
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import { formatThaiSlash } from "../../../theme/DateTH";
import { ShowError, ShowSuccess, ShowWarning } from "../../sweetalert/sweetalert";

const GasStationsDetail = (props) => {
    const { gasStation } = props;
    const [open, setOpen] = useState("แม่โจ้");
    const [openTab, setOpenTab] = React.useState(true);
    const [checkStock, setCheckStock] = useState("ทั้งหมด");

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
        };

        window.addEventListener('resize', handleResize); // เพิ่ม event listener

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
        }
    };

    const [downHole, setDownHole] = React.useState([]);
    const total = downHole.reduce((sum, value) => sum + value.DownHole, 0); // บวกค่า DownHole จากทุก item ใน array

    const { gasstationDetail, stockDetail } = useGasStationData();
    const gasStationOil = Object.values(gasstationDetail || {});
    const stocks = Object.values(stockDetail || {});

    const customOrder = ["G95", "B95", "B7", "B7(1)", "B7(2)", "G91", "E20", "PWD"];

    const calculatePeriod = (row) => {
        const estimateSell = parseFloat(row.EstimateSell) || 0;
        const Pending3 = parseFloat(row.Pending3) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const squeezeoil = parseFloat(row.Squeeze) || 0;
        const volume = parseFloat(row.Volume) || 0;

        if (estimateSell === 0) {
            return ((volume + Pending3 + Pending1 + Pending2) - squeezeoil).toFixed(2);
        } else {
            return (((volume + Pending3 + Pending1 + Pending2) - squeezeoil) / estimateSell).toFixed(2);
        }
    };

    const calculateSell = (row) => {
        const yesterDay = parseFloat(row.YesterDay) || 0;
        const volume = parseFloat(row.Volume) || 0;
        return (yesterDay - volume).toFixed(2);
    };

    const calculateTotalVolume = (row) => {
        const downHole = parseFloat(row.DownHole) || 0;
        const estimateSell = parseFloat(row.EstimateSell) || 0;
        return (downHole - estimateSell).toFixed(2);
    };

    const calculateDownHole = (row) => {
        const Pending3 = parseFloat(row.Pending3) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const downHole = parseFloat(row.DownHole) || 0;
        const volume = parseFloat(row.Volume) || 0;

        return ((volume + Pending3 + Pending1 + Pending2)).toFixed(2);
    };

    const calculateStockDownHole = (stockId) => {
        const stations = gasStationOil.filter(r => Number(r.Stock.split(":")[0]) === stockId);
        const grouped = {};

        stations.forEach(station => {
            // ✅ ดึง products ให้ถูกต้อง และแปลงเป็น array จริง
            const data = stationReports.find((r) => r.stationId === station.id);

            let products = [];

            if (Array.isArray(data)) {
                products = data;
            } else if (data?.Products) {
                products = Array.isArray(data.Products)
                    ? data.Products
                    : Object.values(data.Products);
            } else if (typeof data === "object" && data !== null) {
                products = Object.values(data); // เผื่อเป็น object index
            }

            if (!Array.isArray(products)) return; // กันพลาด

            products.forEach(p => {
                const total = (parseFloat(p.Volume) || 0) +
                    (parseFloat(p.Pending1) || 0) +
                    (parseFloat(p.Pending2) || 0) +
                    (parseFloat(p.Pending3) || 0);

                if (!grouped[p.ProductName]) {
                    grouped[p.ProductName] = {
                        sum: 0,
                        capacity: parseFloat(p.Capacity) || 0
                    };
                }
                grouped[p.ProductName].sum += total;
            });
        });

        const result = {};
        Object.keys(grouped).forEach(name => {
            result[name] = grouped[name].capacity - grouped[name].sum;
        });

        return result;
    };

    // ปลอดภัย: wrapper สำหรับเรียกฟังก์ชันคำนวณ ไม่ให้ throw
    const safeCall = (fn, arg, name) => {
        try {
            return fn(arg);
        } catch (e) {
            console.error(`Error in ${name}:`, e, "arg:", arg);
            return 0;
        }
    };

    const getStationReportsArray = (stocks, gasStationOil, selectedDate, Squeeze = 800) => {
        console.log("getStationReportsArray start", {
            stocksLen: stocks?.length,
            gasStationOilLen: gasStationOil?.length,
            selectedDate,
        });

        if (!Array.isArray(gasStationOil) || !gasStationOil.length) {
            console.warn("gasStationOil empty or not array");
            return [];
        }

        const selected = dayjs(selectedDate);

        // ✅ Function หา last report date ของ station
        const getLastReportDate = (reportObj) => {
            if (!reportObj) return null;
            const dates = [];

            Object.keys(reportObj).forEach((y) =>
                Object.keys(reportObj[y]).forEach((m) =>
                    Object.keys(reportObj[y][m]).forEach((d) =>
                        dates.push(dayjs(`${y}-${m}-${d}`, "YYYY-M-D"))
                    )
                )
            );

            // ✅ fix no plugin error
            return dates.length ? dayjs(Math.max(...dates.map(d => d.valueOf()))) : null;
        };

        // ✅ Pre-compute lastDate ของทุก station
        const lastDateMap = new Map();
        gasStationOil.forEach((st) => {
            lastDateMap.set(st.id, getLastReportDate(st.Report));
        });

        const firstStationOfStock = new Set();

        return gasStationOil.map((station, stationIndex) => {
            console.log(`--- stationIndex ${stationIndex} id:${station?.id} Stock:${station?.Stock}`);

            const stockId = Number((station?.Stock || "").toString().split(":")[0]);
            const stock = stocks.find((s) => s.id === stockId);

            const isFirst = !firstStationOfStock.has(stockId);
            if (isFirst) firstStationOfStock.add(stockId);

            // ✅ LastDate ของ station นี้
            const lastDate = lastDateMap.get(station.id);

            // ✅ RefDate สำหรับ Squeeze/EstimateSell
            // ถ้า selected > lastDate → ใช้ lastDate
            // else → ใช้เมื่อวาน
            const squeezeRefDate =
                lastDate && selected.isAfter(lastDate)
                    ? lastDate
                    : selected.subtract(1, "day");

            // ✅ Volume ต้องใช้ "เมื่อวาน" เสมอ
            const volumeRefDate = selected.subtract(1, "day");

            const vY = volumeRefDate.format("YYYY");
            const vM = volumeRefDate.format("M");
            const vD = volumeRefDate.format("D");
            const reportForVolume = station?.Report?.[vY]?.[vM]?.[vD];

            const rY = squeezeRefDate.format("YYYY");
            const rM = squeezeRefDate.format("M");
            const rD = squeezeRefDate.format("D");
            const reportForRef = station?.Report?.[rY]?.[rM]?.[rD];

            const y = selected.format("YYYY");
            const m = selected.format("M");
            const d = selected.format("D");
            const reportForDate = station?.Report?.[y]?.[m]?.[d];

            // ✅ ถ้ามี report ของวันที่เลือก
            if (reportForDate) {
                if (reportForVolume && Array.isArray(reportForDate.Products)) {
                    reportForDate.Products = reportForDate.Products.map((todayItem) => {
                        const yesterdayItem = reportForVolume.Products?.find(
                            (p) => p.ProductName === todayItem.ProductName
                        );

                        const parseNum = (val) =>
                            Number(String(val || 0).replace(/,/g, "").trim()) || 0;

                        if (yesterdayItem) {
                            const prevVol = parseNum(yesterdayItem.Volume);
                            const todayVol = parseNum(todayItem.Volume);
                            const todayYsd = parseNum(todayItem.YesterDay);

                            let newYesterDay = todayYsd;
                            let newSell = parseNum(todayItem.Sell);

                            if (todayYsd !== prevVol) {
                                newYesterDay = prevVol;
                                newSell = prevVol - todayVol;
                            }

                            return {
                                ...todayItem,
                                YesterDay: newYesterDay,
                                Sell: newSell,
                            };
                        }
                        return todayItem;
                    });
                }
                return reportForDate;
            }

            // ✅ fallback products
            let fallbackProducts = [];
            if (Array.isArray(station?.Products) && station.Products.length)
                fallbackProducts = station.Products;
            else if (Array.isArray(stock?.Products) && stock.Products.length)
                fallbackProducts = stock.Products;
            else if (station?.Products && typeof station.Products === "object")
                fallbackProducts = Object.values(station.Products);
            else if (stock?.Products && typeof stock.Products === "object")
                fallbackProducts = Object.values(stock.Products);

            if (!Array.isArray(fallbackProducts))
                fallbackProducts = Array.from(fallbackProducts || []);

            if (!fallbackProducts.length) {
                return {
                    Date: selected.format("DD/MM/YYYY"),
                    Products: [],
                    Driver1: "",
                    Driver2: "",
                    stationId: station.id,
                };
            }

            const defaultProducts = fallbackProducts
                .map((p) => {
                    let volYesterday = 0;
                    let prevSqueeze = 0;
                    let prevEstimateSell = 0;

                    // ✅ ดึง Volume จากเมื่อวานเสมอ
                    if (reportForVolume?.Products) {
                        const v = reportForVolume.Products.find(
                            (item) => item.ProductName === p?.Name
                        );
                        volYesterday = Number(v?.Volume ?? 0);
                    }

                    // ✅ ดึง Squeeze, EstimateSell จาก ref (ล่าสุด หรือ เมื่อวาน)
                    if (reportForRef?.Products) {
                        const r = reportForRef.Products.find(
                            (item) => item.ProductName === p?.Name
                        );
                        prevSqueeze = Number(r?.Squeeze ?? 0);
                        prevEstimateSell = Number(r?.EstimateSell ?? 0);
                    }

                    const row = {
                        ProductName: (p?.Name ?? "").toString(),
                        Capacity: Number(p?.Capacity) || 0,
                        Color: p?.Color ?? "",
                        Volume: Number(p?.Volume) || 0,

                        // ✅ Logic ใหม่
                        Squeeze: isFirst ? (prevSqueeze || Squeeze || 0) : 0,
                        EstimateSell: prevEstimateSell || 0,

                        Delivered: Number(p?.Delivered) || 0,
                        Pending1: Number(p?.Pending1) || 0,
                        Pending2: Number(p?.Pending2) || 0,
                        Pending3: Number(p?.Pending3) || 0,
                        Period: 0,
                        DownHole: Number(p?.DownHole) || 0,

                        // ✅ Volume ของเมื่อวาน
                        YesterDay: volYesterday,
                        Sell: volYesterday - Number(p?.Volume),
                        TotalVolume: 0,
                        OilBalance: 0,
                        Difference: 0,
                    };

                    const Period = safeCall(calculatePeriod, row, "calculatePeriod");
                    const TotalVolume = safeCall(calculateTotalVolume, row, "calculateTotalVolume");

                    return {
                        ...row,
                        Period,
                        TotalVolume,
                        PeriodDisplay: Period || row.Volume - row.Squeeze,
                        DownHoleDisplay: row.Capacity - Math.round(row.DownHole || 0),
                    };
                })
                .sort((a, b) => {
                    const ai = customOrder.indexOf(a.ProductName);
                    const bi = customOrder.indexOf(b.ProductName);
                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                });

            return {
                Date: selected.format("DD/MM/YYYY"),
                Products: defaultProducts,
                Driver1: "",
                Driver2: "",
                stationId: station.id,
            };
        });
    };

    const STORAGE_KEY = "stationReports";

    const prepareData = (data) => {
        // ✅ เพิ่ม originalProducts / hasChanged เข้าไปทุก station
        return data.map(st => ({
            ...st,
            originalProducts: JSON.parse(JSON.stringify(st.Products)), // clone ไว้เทียบ
            hasChanged: false,
        }));
    };

    const [stationReports, setStationReports] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === selectedDate) {
                return prepareData(parsed.data);
            }
        }
        return prepareData(getStationReportsArray(stocks, gasStationOil, selectedDate, 800));
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === selectedDate) {
                return; // ไม่ต้องโหลดใหม่
            }
        }

        const newData = prepareData(getStationReportsArray(stocks, gasStationOil, selectedDate, 800));
        setStationReports(newData);

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            date: selectedDate,
            data: newData
        }));

    }, [selectedDate]);

    // ฟังก์ชันอัปเดตจาก UpdateGasStations
    const handleProductChange = (stationId, valueOrProducts, fieldOrType) => {
        setStationReports(prev =>
            prev.map(s => {
                if (s.stationId !== stationId) return s;

                // ถ้า fieldOrType = "Products" → อัปเดต Products
                if (fieldOrType === "Products") {
                    const original = s.original ?? JSON.parse(JSON.stringify(s.Products));
                    const fields = ["Volume", "Squeeze", "Pending1", "Pending2", "Pending3", "EstimateSell"];
                    const changed = valueOrProducts.some((p, i) =>
                        fields.some(f => String(original[i]?.[f] ?? "") !== String(p[f] ?? ""))
                    );

                    return { ...s, Products: valueOrProducts, hasChanged: changed, original };
                }

                // ถ้า fieldOrType = "Driver1" หรือ "Driver2"
                return { ...s, [fieldOrType]: valueOrProducts, hasChanged: true };
            })
        );
    };

    // ✅ เมื่อกด Save
    const handleSave = async (stationId, gasStation, products) => {
        const year = dayjs(selectedDate).format("YYYY");
        const month = dayjs(selectedDate).format("M");
        const day = dayjs(selectedDate).format("D");

        try {
            // 1️⃣ อัปเดตไป Firebase
            await database
                .ref(`/depot/gasStations/${gasStation.id - 1}/Report/${year}/${month}`)
                .child(day)
                .update(products);

            ShowSuccess("บันทึกข้อมูลสำเร็จ");
            console.log("✅ Updated success");

            // 2️⃣ รีเซ็ต hasChanged + original ให้ UI update
            setStationReports(prev =>
                prev.map(s =>
                    s.stationId === stationId
                        ? {
                            ...s,
                            hasChanged: false,
                            original: JSON.parse(JSON.stringify(s.Products)),
                        }
                        : s
                )
            );
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error updating data:", error);
        }
    };

    console.log("stocks : ", stocks);
    console.log("gasStationOil : ", gasStationOil);
    console.log("stationReports : ", stationReports);

    return (
        <React.Fragment>
            <Box
                sx={{
                    p: 1,
                    // height: "70vh"
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} lg={4}>
                        <Paper
                            component="form"
                            sx={{
                                width: "100%", // กำหนดความกว้างของ Paper
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                <DatePicker
                                    openTo="day"
                                    views={["year", "month", "day"]}
                                    value={selectedDate ? dayjs(selectedDate, "DD/MM/YYYY") : null}
                                    format="DD/MM/YYYY"
                                    onChange={handleDateChange}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            inputProps: {
                                                value: selectedDate
                                                    ? formatThaiSlash(selectedDate) // ✅ แสดงเป็น 05/11/2568
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
                                                const hasUnsaved = stationReports.some(st => st.hasChanged);
                                                if (hasUnsaved) {
                                                    ShowWarning("กรุณาบันทึกการแก้ไขข้อมูลก่อนเปลี่ยน Stock!");
                                                    return; // ❌ หยุดไม่ให้เปลี่ยนค่า
                                                }

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
                    <Grid item xs={12}>
                        {(checkStock === "ทั้งหมด" ? stocks : [stocks.find(s => s.Name === checkStock)]).map((stock, idx) => {
                            const downHoleByProduct = calculateStockDownHole(stock.id);
                            let matchCount = 0;

                            return (
                                <Paper
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        border: '2px solid lightgray',
                                        borderRadius: 3,
                                        boxShadow: 1,
                                        width:
                                            windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 125) :
                                                windowWidth <= 600 ? (windowWidth - 65) : (windowWidth - 275),
                                        overflowY: 'auto',
                                    }}
                                    key={stock.id || idx}
                                >
                                    {gasStationOil.map((row, index) => {
                                        if (Number(row.Stock.split(":")[0]) === stock.id) {
                                            matchCount++;
                                            return (
                                                <UpdateGasStations
                                                    key={row.id}
                                                    gasStation={row}
                                                    products={stationReports[index]}
                                                    selectedDate={selectedDate}
                                                    onProductChange={handleProductChange}
                                                    downHoleByProduct={downHoleByProduct}
                                                    isFirst={matchCount === 1}
                                                    handleSave={handleSave}           // 👈 เพิ่มตรงนี้
                                                    check={stationReports[index]?.hasChanged}  // ✅ ใช้ optional chaining
                                                    stationId={stationReports[index]?.stationId}   // ✅ ส่ง stationId มาด้วย
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </Paper>
                            );
                        })}

                    </Grid>
                </Grid>
            </Box>

        </React.Fragment>

    );
};

export default GasStationsDetail;
