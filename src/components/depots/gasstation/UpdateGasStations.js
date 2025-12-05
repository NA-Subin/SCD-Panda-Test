import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Autocomplete,
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
    FormControl,
    FormControlLabel,
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
import dayjs from "dayjs";
import "dayjs/locale/th";
import theme from "../../../theme/theme";
import { IconButtonError, IconButtonInfo, RateOils, TablecellHeader } from "../../../theme/style";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import SaveIcon from '@mui/icons-material/Save';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { formatThaiSlash } from "../../../theme/DateTH";
import Detail from "./Detail";

const UpdateGasStations = (props) => {
    const { gasStation,
        volumeData,
        products,
        selectedDate,
        isFirst,                // แถวแรกของ stock
        isFirstPump,            // ปั้มแรกของ stock
        stockCount,            // จำนวนปั้มที่ตรงกัน
        downHoleByProduct,      // มาจากหน้าหลัก
        totaldownHoleByProduct, // มาจากหน้าหลัก
        onProductChange,
        handleSave,
        stationId,
        check,
        stocks,
        onCheck
    } = props;
    const [name, setName] = useState(gasStation.Name);
    const [shortName, setShortName] = useState(gasStation.ShortName);
    const [number, setNumber] = useState(gasStation.OilWellNumber);
    const [driver1, setDriver1] = useState("");
    const [driver2, setDriver2] = useState("");
    const [focused, setFocused] = useState({}); // { [index]: { [column]: true/false } }

    // --- State เริ่มต้น ---
    const [localProducts, setLocalProducts] = useState(products?.Products || []);
    const [originalProducts, setOriginalProducts] = useState(products?.Products || []);

    const isSmallTrucksEmpty = (arr) => {
        // กรณี array ว่างหรือ undefined → ไม่มีข้อมูล
        if (!Array.isArray(arr) || arr.length === 0) return true;

        // กรณีมีมากกว่า 1 แถว → มีข้อมูลแน่นอน
        if (arr.length > 1) return false;

        // กรณีมี 1 แถว → ตรวจสอบค่าภายใน
        const t = arr[0];

        const noValue =
            (t.Truck ?? "").trim() === "" &&
            (t.Price ?? "").trim() === "" &&
            (t.Volume ?? "").trim() === "";

        return noValue; // true = ว่าง, false = มี
    };

    const [checkTruck, setCheckTruck] = useState(gasStation.id);
    const [showTruckFromClick, setShowTruckFromClick] = useState(false); // กดจาก onclick

    // console.log("product truck : ", products?.Truck);
    // console.log("gasstation ID : ", gasStation.id);
    // const [checkTruck, setCheckTruck] = useState(isSmallTrucksEmpty(products?.Truck) ? gasStation.id : false);

    const DEFAULT_TRUCK = [{ id: 0, Truck: "", Price: "", Volume: "" }];

    const [localTruck, setLocalTruck] = useState(products?.Truck || DEFAULT_TRUCK);
    const [originalTruck, setOriginalTruck] = useState(products?.Truck || DEFAULT_TRUCK);

    // console.log("localTruck : ", localTruck);
    // console.log("localProducts : ", localProducts);
    // --- โหลดใหม่เมื่อ products เปลี่ยน ---
    useEffect(() => {
        setOriginalProducts(products?.Products || []);
        setLocalProducts(products?.Products || []);

        if (products?.Truck) {
            setOriginalTruck(products.Truck);
            setLocalTruck(products.Truck);

            if (!showTruckFromClick) {
                // ถ้าเป็นค่าเริ่มต้น ให้ตรวจสอบ row ว่างหรือไม่
                setCheckTruck(isSmallTrucksEmpty(products.Truck) ? false : gasStation.id);
            }
        }
    }, [products, showTruckFromClick, gasStation.id]);

    // ---- ฟังก์ชันจัดเรียง id ใหม่ ----
    const reorderIds = (arr) => {
        return arr.map((item, index) => ({
            ...item,
            id: index
        }));
    };


    // --- handleChange (แก้ไขข้อมูลในตาราง Truck) ---
    const handleChange = (index, field, value) => {
        const updated = [...localTruck];
        updated[index][field] = value;

        const reordered = reorderIds(updated);

        setLocalTruck(reordered);

        // ส่งกลับให้ parent เก็บลง Firebase (หรือ state ด้านบน)
        onProductChange(gasStation.id, reordered, "Truck");
    };

    // --- handleAdd (เพิ่ม row Truck ใหม่) ---
    const handleAdd = () => {
        const updated = [
            ...localTruck,
            { id: 0, Truck: "", Price: "", Volume: "" }
        ];

        const reordered = reorderIds(updated);

        setLocalTruck(reordered);

        // ⭐ ส่งไป parent
        onProductChange(gasStation.id, reordered, "Truck");
    };


    // --- handleDelete (ลบ row Truck) ---
    const handleDelete = (index) => {
        const updated = localTruck.filter((_, i) => i !== index);

        const reordered = reorderIds(updated);

        setLocalTruck(reordered);

        // ⭐ ส่งไป parent
        onProductChange(gasStation.id, reordered, "Truck");
    };
    // 2️⃣ Sync ค่าเริ่มต้นเมื่อ parent เปลี่ยน

    console.log("products : ", products);

    const handleProductChange = (index, field, value) => {
        if (index === null) {
            onProductChange(gasStation.id, value, field);
            return;
        }

        const updated = [...localProducts];
        updated[index][field] = value;

        if (stockCount === 2) {
            const sameStock = volumeData.filter(p => p.stockID === products?.stockID);

            if (sameStock.length === 2) {
                const pump1 = sameStock[0].Products;
                const pump2 = sameStock[1].Products;

                const pump1Product = pump1.find(p => p.ProductName === updated[index].ProductName);
                const pump2Product = pump2.find(p => p.ProductName === updated[index].ProductName);

                const fullVolume = Number(pump1Product?.FullVolume || pump2Product?.FullVolume || 0);

                if (field === "Volume") {
                    if (updated[index] === pump1Product && pump2Product) {
                        pump2Product.Volume = fullVolume - Number(pump1Product.Volume || 0);
                    } else if (updated[index] === pump2Product && pump1Product) {
                        pump1Product.Volume = fullVolume - Number(pump2Product.Volume || 0);
                    } else if (!pump2Product) {
                        pump1Product.FullVolume = Number(pump1Product.Volume || 0);
                    }
                }

                if (field === "FullVolume") {
                    if (updated[index] === pump1Product && pump2Product) {
                        pump1Product.Volume = Number(value) - Number(pump2Product.Volume || 0);
                    } else if (updated[index] === pump2Product && pump1Product) {
                        pump2Product.Volume = Number(value) - Number(pump1Product.Volume || 0);
                    } else if (!pump2Product) {
                        pump1Product.Volume = Number(value);
                    }
                }
            }
        }

        // ปั้มเดียว
        if (stockCount === 1 && field === "FullVolume") {
            updated[index].Volume = Number(value);
        }

        // คำนวณค่าต่าง ๆ
        updated[index].Period = calculatePeriod(updated[index]);
        updated[index].Sell = calculateSell(updated[index]);
        updated[index].TotalVolume = calculateTotalVolume(updated[index]);
        updated[index].PeriodDisplay =
            parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

        setLocalProducts(updated);
    };

    // const handleProductChange = (index, field, value) => {
    //     if (index !== null) {
    //         const updated = [...localProducts];
    //         updated[index][field] = value;

    //         // คำนวณค่าต่างๆ ใน local state
    //         updated[index].Period = calculatePeriod(updated[index]);
    //         updated[index].Sell = calculateSell(updated[index]);
    //         updated[index].TotalVolume = calculateTotalVolume(updated[index]);
    //         updated[index].PeriodDisplay = parseFloat(updated[index].Period) ||
    //             (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

    //         setLocalProducts(updated); // ✅ update local state เท่านั้น
    //     } else {
    //         onProductChange(gasStation.id, value, field); // สำหรับ Driver1/2
    //     }
    // };

    const handleBlur = (index, column, e) => {
        setFocused(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [column]: false
            }
        }));

        // อัปเดตค่าใน local state
        const raw = e.target.value.replace(/,/g, "");
        const newValue = raw === "" || raw === "-" ? 0 : Number(raw);

        const updated = [...localProducts];
        updated[index][column] = newValue;
        setLocalProducts(updated);

        // ส่งไป parent
        onProductChange(gasStation.id, updated, "Products");
    };

    const handleFocus = (index, column) => {
        setFocused(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [column]: true
            }
        }));
    };

    const handleChangeWithCheck = (index, field, newValue) => {
        const updated = [...localProducts];
        updated[index][field] = newValue;

        // ⭐ ถ้ามี 2 ปั้ม
        if (stockCount === 2) {
            const sameStock = volumeData.filter(p => p.stockID === products?.stockID);

            if (sameStock.length === 2) {
                const pump1 = sameStock[0].Products;
                const pump2 = sameStock[1].Products;

                // หา Product ตาม ProductName
                const pump1Product = pump1.find(p => p.ProductName === updated[index].ProductName);
                const pump2Product = pump2.find(p => p.ProductName === updated[index].ProductName);

                const full = Number(pump1Product?.FullVolume || pump2Product?.FullVolume || 0);

                if (field === "Volume" && pump1Product) {
                    if (pump2Product) {
                        // ปั้ม 2 มี product → คำนวณตามปกติ
                        if (updated[index] === pump1Product) {
                            pump2Product.Volume = full - Number(pump1Product.Volume || 0);
                        } else if (updated[index] === pump2Product) {
                            pump1Product.Volume = full - Number(pump2Product.Volume || 0);
                        }
                    } else {
                        // ปั้ม 2 ไม่มี product → ให้ FullVolume = Volume ของ pump1
                        pump1Product.FullVolume = Number(pump1Product.Volume || 0);
                    }
                }

                if (field === "FullVolume" && pump1Product) {
                    if (pump2Product) {
                        pump1Product.Volume = Number(newValue) - Number(pump2Product.Volume || 0);
                    } else {
                        pump1Product.Volume = Number(newValue);
                    }
                }
            }
        }

        // กรณีมีแค่ 1 ปั้ม
        if (stockCount === 1 && field === "FullVolume") {
            updated[index].Volume = Number(newValue);
        }

        // 2️⃣ คำนวณค่าต่าง ๆ
        updated[index].Period = calculatePeriod(updated[index]);
        updated[index].Sell = calculateSell(updated[index]);
        updated[index].TotalVolume = calculateTotalVolume(updated[index]);
        updated[index].PeriodDisplay =
            parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

        setLocalProducts(updated);

        // 3️⃣ ตรวจสอบ hasChanged
        const originalValue = originalProducts[index][field];
        updated[index].hasChanged = originalValue !== newValue;

        // 4️⃣ ส่ง parent
        onProductChange(gasStation.id, updated, "Products");
    };

    // const handleBlur = (index, column) => {
    //     setFocused(prev => ({
    //         ...prev,
    //         [index]: {
    //             ...prev[index],
    //             [column]: false
    //         }
    //     }));
    // };

    // ตรวจสอบว่า field นั้น focus อยู่ไหม
    const isFieldFocused = (index, column) => focused[index]?.[column] || false;

    const { reghead } = useBasicData();

    const registration = Object.values(reghead || {});

    const filterOptions = (options, { inputValue }) => {
        return options.filter((option) =>
            (option ?? "").toLowerCase().includes((inputValue ?? "").toLowerCase())
        );
    };

    const truckDriver = registration.filter((item => item.RegTail !== "0:ไม่มี" && item.Driver !== "0:ไม่มี"));
    // console.log("1.truckDriver : ", truckDriver);
    // console.log("2.truckDriver : ", truckDriver.map((row) => row.Driver.split(":")[1]?.split(" ")[0]));

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

    const calculateDownHole = (row) => {
        const Pending3 = parseFloat(row.Pending3) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const downHole = parseFloat(row.DownHole) || 0;
        const volume = parseFloat(row.Volume) || 0;

        if (downHole !== 0) {
            return ((volume + Pending3 + Pending1 + Pending2)).toFixed(2);
        } else {
            return ((volume + Pending3 + Pending1 + Pending2 + downHole)).toFixed(2);
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

    // const handleProductChange = (index, field, value) => {
    //     const updated = [...products?.Products];
    //     updated[index][field] = value;

    //     updated[index].Period = calculatePeriod(updated[index]);
    //     updated[index].Sell = calculateSell(updated[index]);
    //     updated[index].TotalVolume = calculateTotalVolume(updated[index]);
    //     updated[index].PeriodDisplay = parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

    //     onProductChange(gasStation.id, updated);
    // };

    // const handleProductChange = (index, field, value) => {
    //     // ตรวจสอบว่ากำลังแก้ไข field ของ Products หรือ Driver
    //     if (index !== null) {
    //         // อัปเดต Products
    //         const updated = [...products?.Products];
    //         updated[index][field] = value;

    //         // คำนวณค่าต่างๆ ของ Products
    //         updated[index].Period = calculatePeriod(updated[index]);
    //         updated[index].Sell = calculateSell(updated[index]);
    //         updated[index].TotalVolume = calculateTotalVolume(updated[index]);
    //         updated[index].PeriodDisplay = parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

    //         // ส่งกลับไปยัง parent
    //         onProductChange(gasStation.id, updated, "Products"); // ✅ เพิ่ม type
    //     } else {
    //         // อัปเดต Driver1 / Driver2 ของ station
    //         onProductChange(gasStation.id, value, field); // ส่ง value + field name
    //     }
    // };

    const handleUpdate = () => {
        const year = dayjs(selectedDate).format("YYYY");
        const month = dayjs(selectedDate).format("M");
        const day = dayjs(selectedDate).format("D");

        database
            .ref(`/depot/gasStations/${gasStation.id - 1}/Report/${year}/${month}`)
            .child(day)
            .update(products)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("✅ Updated success");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    };

    // console.log("products length : ", products?.Products.length);
    const stockProducts = volumeData.filter(v => v.stockID === products?.stockID);
    // console.log("stockProducts : ", stockProducts);
    return (
        <React.Fragment>
            <Box textAlign="center"
                sx={{
                    display: "flex",
                    justifyContent: "space-between", // ชิดซ้าย-ขวา
                    alignItems: "center",
                    backgroundColor:
                        gasStation.Stock.split(":")[1] === "แม่โจ้" ? "#92D050"
                            : gasStation.Stock.split(":")[1] === "สันกลาง" ? "#B1A0C7"
                                : gasStation.Stock.split(":")[1] === "สันทราย" ? "#B7DEE8"
                                    : gasStation.Stock.split(":")[1] === "บ้านโฮ่ง" ? "#FABF8F"
                                        : gasStation.Stock.split(":")[1] === "ป่าแดด" ? "#B1A0C7"
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
                    {`${name} / ${shortName} มีทั้งหมด ${number} หลุม ที่อยู่ ${gasStation.Address}`}
                </Typography>

                {/* ด้านขวา */}
                {/* <Button variant="contained" color="warning" size="small" sx={{ mr: -0.5, boxShadow: "1px 1px 4px gray" }} >แก้ไขข้อมูลปั้ม</Button> */}
                <Detail gasStation={gasStation} stock={stocks} onCheck={onCheck} />
            </Box>
            <TableContainer
                component={Paper}
                style={{ maxHeight: "70vh" }}
                sx={{ marginBottom: 2 }}
            >
                <Table stickyHeader size="small" sx={{ width: gasStation?.Gasstation === true ? 1480 : "100%" }}>
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
                                ปริมาณ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 80, whiteSpace: "nowrap" }}>
                                หักบีบไม่ขึ้น
                            </TablecellHeader>
                            {/* <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 300, whiteSpace: "nowrap", padding: 0.5 }}>
                                <Grid container>
                                    <Grid item xs={4}>
                                        ลงจริงไปแล้ว
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper
                                            component="form"
                                            sx={{
                                                width: "95%", // กำหนดความกว้างของ Paper
                                                height: "25px",
                                                marginLeft: 0.5,
                                            }}>
                                            <Autocomplete
                                                freeSolo
                                                options={truckDriver.map(row => row.Driver)} // เก็บเต็ม: "1:สมส่วน สุขสม"
                                                getOptionLabel={(option) => {
                                                    // แสดงเฉพาะชื่อแรก (สมส่วน)
                                                    return option?.split(":")[1]?.split(" ")[0] || "";
                                                }}
                                                isOptionEqualToValue={(option, value) => option === value} // เทียบค่าที่เก็บเต็ม
                                                value={products?.Driver1 || ""} // value เก็บเต็ม: "1:สมส่วน สุขสม"
                                                onChange={(event, newValue) => {
                                                    handleProductChange(null, "Driver1", newValue || ""); // เก็บเต็ม
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="standard"
                                                        placeholder="กรอกชื่อ"
                                                        sx={{ fontSize: "12px", fontWeight: "bold", paddingLeft: 0.5 }}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: { fontSize: "12px", fontWeight: "bold" },
                                                        }}
                                                        inputProps={{
                                                            ...params.inputProps,
                                                            sx: { fontSize: "12px", fontWeight: "bold" },
                                                        }}
                                                    />
                                                )}
                                                ListboxProps={{
                                                    sx: { fontSize: "12px", fontWeight: "bold", maxHeight: "150px", marginLeft: -1.5 },
                                                }}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper
                                            component="form"
                                            sx={{
                                                width: "95%", // กำหนดความกว้างของ Paper
                                                height: "25px",
                                                marginLeft: 0.5
                                            }}>
                                            <Autocomplete
                                                freeSolo
                                                options={truckDriver.map(row => row.Driver)} // เก็บเต็ม: "1:สมส่วน สุขสม"
                                                getOptionLabel={(option) => {
                                                    // แสดงเฉพาะชื่อแรก (สมส่วน)
                                                    return option?.split(":")[1]?.split(" ")[0] || "";
                                                }}
                                                isOptionEqualToValue={(option, value) => option === value} // เทียบค่าที่เก็บเต็ม
                                                value={products?.Driver2 || ""} // value เก็บเต็ม: "1:สมส่วน สุขสม"
                                                onChange={(event, newValue) => {
                                                    handleProductChange(null, "Driver2", newValue || ""); // เก็บเต็ม
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="standard"
                                                        placeholder="กรอกชื่อ"
                                                        sx={{ fontSize: "12px", fontWeight: "bold", paddingLeft: 0.5 }}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: { fontSize: "12px", fontWeight: "bold" },
                                                        }}
                                                        inputProps={{
                                                            ...params.inputProps,
                                                            sx: { fontSize: "12px", fontWeight: "bold" },
                                                        }}
                                                    />
                                                )}
                                                ListboxProps={{
                                                    sx: { fontSize: "12px", fontWeight: "bold", maxHeight: "150px", marginLeft: -1.5 },
                                                }}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TablecellHeader> */}
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                ลงจริงไปแล้ว
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap", padding: 0.5 }}>
                                <Paper
                                    component="form"
                                    sx={{
                                        width: 100, // กำหนดความกว้างของ Paper
                                        height: "25px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        marginLeft: gasStation?.Gasstation === true ? 0 : 0.5,
                                        marginRight: gasStation?.Gasstation === true ? 0 : -1,
                                    }}>
                                    <Autocomplete
                                        freeSolo
                                        fullWidth
                                        options={truckDriver.map(row => row.Driver)} // เก็บเต็ม: "1:สมส่วน สุขสม"
                                        getOptionLabel={(option) => {
                                            // แสดงเฉพาะชื่อแรก (สมส่วน)
                                            return option?.split(":")[1]?.split(" ")[0] || "";
                                        }}
                                        isOptionEqualToValue={(option, value) => option === value} // เทียบค่าที่เก็บเต็ม
                                        value={products?.Driver1 || ""} // value เก็บเต็ม: "1:สมส่วน สุขสม"
                                        onChange={(event, newValue) => {
                                            handleProductChange(null, "Driver1", newValue || ""); // เก็บเต็ม
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                variant="standard"
                                                placeholder="กรอกชื่อ"
                                                sx={{ fontSize: "12px", fontWeight: "bold", paddingLeft: 0.5 }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                                inputProps={{
                                                    ...params.inputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                            />
                                        )}
                                        ListboxProps={{
                                            sx: { fontSize: "12px", fontWeight: "bold", maxHeight: "150px", marginLeft: -1.5 },
                                        }}
                                    />
                                </Paper>
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap", padding: 0.5 }}>
                                <Paper
                                    component="form"
                                    sx={{
                                        width: 100, // กำหนดความกว้างของ Paper
                                        height: "25px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        marginLeft: gasStation?.Gasstation === true ? 0 : 0.5,
                                        marginRight: gasStation?.Gasstation === true ? 0 : -1,
                                    }}>
                                    <Autocomplete
                                        freeSolo
                                        fullWidth
                                        options={truckDriver.map(row => row.Driver)} // เก็บเต็ม: "1:สมส่วน สุขสม"
                                        getOptionLabel={(option) => {
                                            // แสดงเฉพาะชื่อแรก (สมส่วน)
                                            return option?.split(":")[1]?.split(" ")[0] || "";
                                        }}
                                        isOptionEqualToValue={(option, value) => option === value} // เทียบค่าที่เก็บเต็ม
                                        value={products?.Driver2 || ""} // value เก็บเต็ม: "1:สมส่วน สุขสม"
                                        onChange={(event, newValue) => {
                                            handleProductChange(null, "Driver2", newValue || ""); // เก็บเต็ม
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                variant="standard"
                                                placeholder="กรอกชื่อ"
                                                sx={{ fontSize: "12px", fontWeight: "bold", paddingLeft: 0.5 }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                                inputProps={{
                                                    ...params.inputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                            />
                                        )}
                                        ListboxProps={{
                                            sx: { fontSize: "12px", fontWeight: "bold", maxHeight: "150px", marginLeft: -1.5 },
                                        }}
                                    />
                                </Paper>
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                ขาย/วัน
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 80, whiteSpace: "nowrap" }}>
                                หมด
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 100, whiteSpace: "nowrap" }}>
                                ลงหลุม
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                เมื่อวาน
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                ขายได้
                            </TablecellHeader>
                            {
                                isFirstPump ?
                                    (
                                        stockCount === 2 ? (
                                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 100, whiteSpace: "nowrap" }}>
                                                หมดรวม
                                            </TablecellHeader>
                                        )
                                            :
                                            (
                                                gasStation?.Gasstation !== true &&
                                                <TablecellHeader sx={{ backgroundColor: theme.palette.panda.main, width: 100 }} rowSpan={products?.Products.length}>

                                                </TablecellHeader>
                                            )
                                    )
                                    :
                                    (
                                        gasStation?.Gasstation !== true &&
                                        <TablecellHeader sx={{ backgroundColor: theme.palette.panda.main, width: 100 }} rowSpan={products?.Products.length}>

                                        </TablecellHeader>
                                    )
                            }
                            {
                                gasStation?.Gasstation === true && (
                                    <React.Fragment>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 100, whiteSpace: "nowrap" }}>
                                            ยอดขายหลังบ้าน
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 100, whiteSpace: "nowrap" }}>
                                            สรุปยอดหน้าบ้าน
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ backgroundColor: theme.palette.panda.main, width: 100 }} rowSpan={products?.Products.length}>

                                        </TablecellHeader>
                                    </React.Fragment>
                                )
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            products?.Products.map((s, index) => (
                                <TableRow key={index}>
                                    <TablecellHeader
                                        sx={{
                                            backgroundColor: s.Color ?? "white",
                                            width: 50,
                                            color: "black",
                                            position: "sticky",
                                            left: 0,
                                            zIndex: 1, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                            borderBottom: "2px solid white"
                                        }}
                                    >
                                        {s.ProductName}
                                    </TablecellHeader>
                                    <TableCell sx={{
                                        textAlign: "center",
                                        backgroundColor: s.Color ? `${s.Color}4A` : `${s.Color}4A`,
                                        width: 80,
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        paddingLeft: "20px !important",
                                        paddingRight: "20px !important",
                                        fontVariantNumeric: "tabular-nums",
                                    }}>
                                        {isFirst ? new Intl.NumberFormat("en-US").format(s.Capacity) : "\u00A0"}
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`, color: s.Volume < 0 ? "#d50000" : "black",
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        padding: 0.5,
                                    }}>
                                        {/* {new Intl.NumberFormat("en-US").format(Math.round(s.Volume || 0))} */}
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Volume") ? "text" : "text"}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={
                                                    isFieldFocused(index, "Volume")
                                                        ? ((s.Volume === 0 || s.Volume === undefined) ? "" : s.Volume)
                                                        : Number(s.Volume || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Volume")}
                                                onBlur={(e) => handleBlur(index, "Volume", e)} // ส่ง event
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Volume", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Volume", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Volume).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Volume", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Volume", current - 1000);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    inputProps: {
                                                        min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Volume") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    // startAdornment: (
                                                    //     <InputAdornment position="start">
                                                    //         <IconButton
                                                    //             size="small"
                                                    //             sx={{
                                                    //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                    //                 width: 5,
                                                    //                 height: 18,
                                                    //                 ml: -1,
                                                    //                 opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                    //             }}
                                                    //             onClick={() => {
                                                    //                 let raw = String(s.Volume).replace(/,/g, "");
                                                    //                 if (raw === "" || raw === "-") raw = "0";

                                                    //                 const newValue = Number(raw) - 1000;

                                                    //                 handleChangeWithCheck(index, "Volume", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                    //             }}
                                                    //         >
                                                    //             <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                    //         </IconButton>
                                                    //     </InputAdornment>
                                                    // ),
                                                    // endAdornment: (
                                                    //     <InputAdornment position="end">
                                                    //         <IconButton
                                                    //             size="small"
                                                    //             sx={{
                                                    //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                    //                 width: 5,
                                                    //                 height: 18,
                                                    //                 mr: -1.5,
                                                    //                 opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                    //             }}
                                                    //             onClick={() => {
                                                    //                 let raw = String(s.Volume).replace(/,/g, "");
                                                    //                 if (raw === "" || raw === "-") raw = "0";

                                                    //                 const newValue = Number(raw) + 1000;

                                                    //                 handleChangeWithCheck(index, "Volume", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                    //             }}
                                                    //         >
                                                    //             <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                    //         </IconButton>
                                                    //     </InputAdornment>
                                                    // ),
                                                }}
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
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5,
                                    }}>
                                        <TextField
                                            style={{ display: 'none' }}
                                            inputProps={{ readOnly: true }}
                                            value={s.Volume || 0}
                                        />
                                        <TextField
                                            style={{ display: 'none' }}
                                            inputProps={{ readOnly: true }}
                                            value={s.Color || ""}
                                        />
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Squeeze") ? "text" : "text"}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                style={{ display: isFirst ? "" : "none" }}
                                                value={
                                                    isFieldFocused(index, "Squeeze")
                                                        ? ((s.Squeeze === 0 || s.Squeeze === undefined) ? "" : s.Squeeze)
                                                        : Number(s.Squeeze || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Squeeze")}
                                                onBlur={(e) => handleBlur(index, "Squeeze", e)} // ส่ง event
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Squeeze", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Squeeze", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Squeeze).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Squeeze", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Squeeze", current - 1000);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    inputProps: {
                                                        min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Squeeze") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    // startAdornment: (
                                                    //     <InputAdornment position="start">
                                                    //         <IconButton
                                                    //             size="small"
                                                    //             sx={{
                                                    //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                    //                 width: 5,
                                                    //                 height: 18,
                                                    //                 ml: -1,
                                                    //                 opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                    //             }}
                                                    //             onClick={() => {
                                                    //                 let raw = String(s.Squeeze).replace(/,/g, "");
                                                    //                 if (raw === "" || raw === "-") raw = "0";

                                                    //                 const newValue = Number(raw) - 1000;

                                                    //                 handleChangeWithCheck(index, "Squeeze", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                    //             }}
                                                    //         >
                                                    //             <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                    //         </IconButton>
                                                    //     </InputAdornment>
                                                    // ),
                                                    // endAdornment: (
                                                    //     <InputAdornment position="end">
                                                    //         <IconButton
                                                    //             size="small"
                                                    //             sx={{
                                                    //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                    //                 width: 5,
                                                    //                 height: 18,
                                                    //                 mr: -1.5,
                                                    //                 opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                    //             }}
                                                    //             onClick={() => {
                                                    //                 let raw = String(s.Squeeze).replace(/,/g, "");
                                                    //                 if (raw === "" || raw === "-") raw = "0";

                                                    //                 const newValue = Number(raw) + 1000;

                                                    //                 handleChangeWithCheck(index, "Squeeze", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                    //             }}
                                                    //         >
                                                    //             <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                    //         </IconButton>
                                                    //     </InputAdornment>
                                                    // ),
                                                }}
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
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending3") ? "text" : "text"}
                                                label="ลงจริงไปแล้ว"
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={
                                                    isFieldFocused(index, "Pending3")
                                                        ? ((s.Pending3 === 0 || s.Pending3 === undefined) ? "" : s.Pending3)
                                                        : Number(s.Pending3 || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Pending3")}
                                                onBlur={(e) => handleBlur(index, "Pending3", e)} // ส่ง event
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Pending3", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Pending3", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Pending3).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending3", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending3", current - 1000);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    inputProps: {
                                                        min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Pending3") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',        // 🔹 ตัด padding IconButton
                                                                    width: 5,
                                                                    height: 18,
                                                                    ml: -1,
                                                                    opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending3).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) - 1000;

                                                                    handleChangeWithCheck(index, "Pending3", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                                }}
                                                            >
                                                                <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',        // 🔹 ตัด padding IconButton
                                                                    width: 5,
                                                                    height: 18,
                                                                    mr: -1.5,
                                                                    opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending3).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) + 1000;

                                                                    handleChangeWithCheck(index, "Pending3", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                                }}
                                                            >
                                                                <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
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
                                                        paddingRight: 1, // เพิ่มพื้นที่ให้ endAdornment
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending1") ? "text" : "text"}
                                                label={products.Driver1 ? products.Driver1.split(":")[1]?.split(" ")[0] : ""}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={
                                                    isFieldFocused(index, "Pending1")
                                                        ? ((s.Pending1 === 0 || s.Pending1 === undefined) ? "" : s.Pending1)
                                                        : Number(s.Pending1 || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Pending1")}
                                                onBlur={(e) => handleBlur(index, "Pending1", e)} // ส่ง event
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Pending1", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Pending1", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Pending1).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending1", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending1", current - 1000);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    inputProps: {
                                                        min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Pending1") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',        // 🔹 ตัด padding IconButton
                                                                    width: 5,
                                                                    height: 18,
                                                                    ml: -1,
                                                                    opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending1).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) - 1000;

                                                                    handleChangeWithCheck(index, "Pending1", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                                }}
                                                            >
                                                                <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',        // 🔹 ตัด padding IconButton
                                                                    width: 5,
                                                                    height: 18,
                                                                    mr: -1.5,
                                                                    opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending1).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) + 1000;

                                                                    handleChangeWithCheck(index, "Pending1", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                                }}
                                                            >
                                                                <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
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
                                                        paddingRight: 1, // เพิ่มพื้นที่ให้ endAdornment
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending2") ? "text" : "text"}
                                                label={products.Driver2 ? products.Driver2.split(":")[1]?.split(" ")[0] : ""}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={
                                                    isFieldFocused(index, "Pending2")
                                                        ? ((s.Pending2 === 0 || s.Pending2 === undefined) ? "" : s.Pending2)
                                                        : Number(s.Pending2 || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Pending2")}
                                                onBlur={(e) => handleBlur(index, "Pending2", e)} // ส่ง event
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Pending2", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Pending2", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Pending2).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending2", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending2", current - 1000);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    inputProps: {
                                                        min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Pending2") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',        // 🔹 ตัด padding IconButton
                                                                    width: 5,
                                                                    height: 18,
                                                                    ml: -1,
                                                                    opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending2).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) - 1000;

                                                                    handleChangeWithCheck(index, "Pending2", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                                }}
                                                            >
                                                                <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',        // 🔹 ตัด padding IconButton
                                                                    width: 5,
                                                                    height: 18,
                                                                    mr: -1.5,
                                                                    opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending2).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) + 1000;

                                                                    handleChangeWithCheck(index, "Pending2", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                                }}
                                                            >
                                                                <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
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
                                                        paddingRight: 1, // เพิ่มพื้นที่ให้ endAdornment
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "EstimateSell") ? "text" : "text"}
                                                // label={"ขาย"}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={
                                                    isFieldFocused(index, "EstimateSell")
                                                        ? ((s.EstimateSell === 0 || s.EstimateSell === undefined) ? "" : s.EstimateSell)
                                                        : Number(s.EstimateSell || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "EstimateSell")}
                                                onBlur={(e) => handleBlur(index, "EstimateSell", e)} // ส่ง event
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "EstimateSell", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "EstimateSell", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.EstimateSell).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "EstimateSell", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "EstimateSell", current - 1000);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    inputProps: {
                                                        min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "EstimateSell") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    // startAdornment: (
                                                    //     <InputAdornment position="start">
                                                    //         <IconButton
                                                    //             size="small"
                                                    //             sx={{
                                                    //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                    //                 width: 5,
                                                    //                 height: 18,
                                                    //                 ml: -1,
                                                    //                 opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                    //             }}
                                                    //             onClick={() => {
                                                    //                 let raw = String(s.EstimateSell).replace(/,/g, "");
                                                    //                 if (raw === "" || raw === "-") raw = "0";

                                                    //                 const newValue = Number(raw) - 1000;

                                                    //                 handleChangeWithCheck(index, "EstimateSell", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                    //             }}
                                                    //         >
                                                    //             <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                    //         </IconButton>
                                                    //     </InputAdornment>
                                                    // ),
                                                    // endAdornment: (
                                                    //     <InputAdornment position="end">
                                                    //         <IconButton
                                                    //             size="small"
                                                    //             sx={{
                                                    //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                    //                 width: 5,
                                                    //                 height: 18,
                                                    //                 mr: -1.5,
                                                    //                 opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                    //             }}
                                                    //             onClick={() => {
                                                    //                 let raw = String(s.EstimateSell).replace(/,/g, "");
                                                    //                 if (raw === "" || raw === "-") raw = "0";

                                                    //                 const newValue = Number(raw) + 1000;

                                                    //                 handleChangeWithCheck(index, "EstimateSell", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                    //             }}
                                                    //         >
                                                    //             <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                    //         </IconButton>
                                                    //     </InputAdornment>
                                                    // ),
                                                }}
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
                                    <TableCell
                                        sx={{
                                            textAlign: "right",
                                            borderBottom: "2px solid white",
                                            backgroundColor: "#92CDDC",
                                            color: s.PeriodDisplay < 0 ? "#d50000" : "black",
                                            fontWeight: "bold",
                                            paddingLeft: "30px !important",
                                            paddingRight: "30px !important",
                                            fontVariantNumeric: "tabular-nums"
                                        }}
                                    >
                                        {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(s.PeriodDisplay)}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            textAlign: "right",
                                            borderBottom: "2px solid white",
                                            backgroundColor: "#a5d6a7",
                                            color: s.DownHoleDisplay < 0 ? "#d50000" : "black",
                                            fontWeight: "bold",
                                            paddingLeft: "30px !important",
                                            paddingRight: "30px !important",
                                            fontVariantNumeric: "tabular-nums"
                                        }}
                                    >
                                        {isFirst ? new Intl.NumberFormat("en-US").format(downHoleByProduct[s.ProductName]) ?? "" : ""}
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "right",
                                        backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`, color: s.YesterDay < 0 ? "#d50000" : "black",
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        paddingLeft: "30px !important",
                                        paddingRight: "30px !important",
                                        fontVariantNumeric: "tabular-nums"
                                    }}>
                                        {new Intl.NumberFormat("en-US").format(Math.round(s.YesterDay || 0))}
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "right",
                                        backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`, color: s.Sell < 0 ? "#d50000" : "black",
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        paddingLeft: "30px !important",
                                        paddingRight: "30px !important",
                                        fontVariantNumeric: "tabular-nums"
                                    }}>
                                        {new Intl.NumberFormat("en-US").format(Math.round(s.Sell || 0))}
                                    </TableCell>
                                    {
                                        gasStation?.Gasstation === true &&
                                        <React.Fragment>
                                            <TableCell sx={{
                                                textAlign: "center", backgroundColor: s.Color
                                                    ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                    : `${s.Color}4A`,
                                                borderBottom: "2px solid white",
                                                padding: 0.5,
                                            }}>
                                                <Paper sx={{ width: "100%" }}>
                                                    <TextField
                                                        size="small"
                                                        type={isFieldFocused(index, "BackyardSales") ? "text" : "text"}
                                                        // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                        InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                        style={{ display: isFirst ? "" : "none" }}
                                                        value={
                                                            isFieldFocused(index, "BackyardSales")
                                                                ? ((s.BackyardSales === 0 || s.BackyardSales === undefined) ? "" : s.BackyardSales)
                                                                : Number(s.BackyardSales || 0).toLocaleString()
                                                        }
                                                        onFocus={() => handleFocus(index, "BackyardSales")}
                                                        onBlur={(e) => handleBlur(index, "BackyardSales", e)} // ส่ง event
                                                        onChange={(e) => {
                                                            let raw = e.target.value.replace(/,/g, "");

                                                            // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                            if (raw === "-" || raw === "") {
                                                                handleProductChange(index, "BackyardSales", raw);
                                                                return;
                                                            }

                                                            // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                            if (/^-?\d+$/.test(raw)) {
                                                                handleProductChange(index, "BackyardSales", Number(raw));
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            let raw = String(s.BackyardSales).replace(/,/g, "");

                                                            // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                            if (raw === "" || raw === "-") raw = "0";

                                                            let current = Number(raw);

                                                            if (e.key === "ArrowUp") {
                                                                e.preventDefault();
                                                                handleProductChange(index, "BackyardSales", current + 1000);
                                                            }

                                                            if (e.key === "ArrowDown") {
                                                                e.preventDefault();
                                                                handleProductChange(index, "BackyardSales", current - 1000);
                                                            }
                                                        }}
                                                        fullWidth
                                                        InputProps={{
                                                            inputProps: {
                                                                min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                                step: 1000,
                                                            },
                                                            sx: {
                                                                "& input::-webkit-inner-spin-button": {
                                                                    marginLeft: isFieldFocused(index, "BackyardSales") ? 1 : 0,
                                                                    marginRight: -0.5
                                                                }
                                                            },
                                                            // startAdornment: (
                                                            //     <InputAdornment position="start">
                                                            //         <IconButton
                                                            //             size="small"
                                                            //             sx={{
                                                            //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                            //                 width: 5,
                                                            //                 height: 18,
                                                            //                 ml: -1,
                                                            //                 opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                            //             }}
                                                            //             onClick={() => {
                                                            //                 let raw = String(s.BackyardSales).replace(/,/g, "");
                                                            //                 if (raw === "" || raw === "-") raw = "0";

                                                            //                 const newValue = Number(raw) - 1000;

                                                            //                 handleChangeWithCheck(index, "BackyardSales", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                            //             }}
                                                            //         >
                                                            //             <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                            //         </IconButton>
                                                            //     </InputAdornment>
                                                            // ),
                                                            // endAdornment: (
                                                            //     <InputAdornment position="end">
                                                            //         <IconButton
                                                            //             size="small"
                                                            //             sx={{
                                                            //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                            //                 width: 5,
                                                            //                 height: 18,
                                                            //                 mr: -1.5,
                                                            //                 opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                            //             }}
                                                            //             onClick={() => {
                                                            //                 let raw = String(s.BackyardSales).replace(/,/g, "");
                                                            //                 if (raw === "" || raw === "-") raw = "0";

                                                            //                 const newValue = Number(raw) + 1000;

                                                            //                 handleChangeWithCheck(index, "BackyardSales", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                            //             }}
                                                            //         >
                                                            //             <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                            //         </IconButton>
                                                            //     </InputAdornment>
                                                            // ),
                                                        }}
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
                                                textAlign: "right",
                                                backgroundColor: s.Color
                                                    ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                    : `${s.Color}4A`, color: s.Sell < 0 ? "#d50000" : "black",
                                                fontWeight: "bold",
                                                borderBottom: "2px solid white",
                                                paddingLeft: "30px !important",
                                                paddingRight: "30px !important",
                                                fontVariantNumeric: "tabular-nums"
                                            }}>
                                                {new Intl.NumberFormat("en-US").format(
                                                    (Number(s.Sell ?? 0) - Number(s.BackyardSales ?? 0))
                                                )}
                                            </TableCell>
                                        </React.Fragment>
                                    }
                                    {
                                        stockCount === 2 ? (
                                            !isFirstPump && index === 1 ? (
                                                <TableCell rowSpan={products?.Products.length}>
                                                    {
                                                        check || volumeData?.some(v => v.stockID === products?.stockID && v.Products.some(p => p.hasChanged)) ? (
                                                            <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.success.main }}>
                                                                <Button
                                                                    color="inherit"
                                                                    fullWidth
                                                                    onClick={() => {
                                                                        const stockProducts = volumeData.filter(v => v.stockID === products?.stockID);
                                                                        handleSave(stockProducts); // ❗ ไม่ส่ง stationId
                                                                    }}
                                                                    sx={{ flexDirection: "column", gap: 0.5 }}
                                                                >
                                                                    <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                                                    <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                                        บันทึก
                                                                    </Typography>
                                                                </Button>
                                                            </Paper>
                                                        ) : null
                                                    }
                                                </TableCell>
                                            ) : (
                                                isFirstPump ? (
                                                    <TableCell
                                                        sx={{
                                                            textAlign: "right",
                                                            borderBottom: "2px solid white",
                                                            backgroundColor: "#e1eaf0ff",
                                                            color: totaldownHoleByProduct[s.ProductName] < 0 ? "#d50000" : "black",
                                                            fontWeight: "bold",
                                                            paddingLeft: "30px !important",
                                                            paddingRight: "30px !important",
                                                            fontVariantNumeric: "tabular-nums"
                                                        }}
                                                    >
                                                        {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totaldownHoleByProduct[s.ProductName]) ?? ""}
                                                    </TableCell>
                                                )
                                                    : null
                                            )
                                        ) : (
                                            isFirstPump && index === 0 ? (
                                                <TableCell rowSpan={products?.Products.length}>
                                                    {
                                                        check || volumeData?.some(v => v.stockID === products?.stockID && v.Products.some(p => p.hasChanged)) ? (
                                                            <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.success.main }}>
                                                                <Button
                                                                    color="inherit"
                                                                    fullWidth
                                                                    onClick={() => {
                                                                        const stockProducts = volumeData.filter(v => v.stockID === products?.stockID);
                                                                        handleSave(stockProducts); // ❗ ไม่ส่ง stationId
                                                                    }}
                                                                    sx={{ flexDirection: "column", gap: 0.5 }}
                                                                >
                                                                    <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                                                    <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                                        บันทึก
                                                                    </Typography>
                                                                </Button>
                                                            </Paper>
                                                        ) : null
                                                    }
                                                </TableCell>
                                            ) : null
                                        )
                                    }
                                    {/* ถ้าเป็นแถวแรก (index === 0) ให้เพิ่ม rowSpan, แถวอื่นไม่ต้องแสดง cell นี้ */}
                                    {/* {index === 0 ? (
                                        <TableCell rowSpan={products?.Products.length}>
                                            {
                                                // ตรวจสอบว่า Products ของ stock นี้มีการแก้ไขอย่างน้อย 1 ปั้ม
                                                check || volumeData?.some(v => v.stockID === products?.stockID && v.Products.some(p => p.hasChanged)) ? (
                                                    <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.success.main }}>
                                                        <Button
                                                            color="inherit"
                                                            fullWidth
                                                            onClick={() => {
                                                                // ดึง Products ทั้งหมดของ stock นี้ (ทั้งปั้ม 1 และ 2)
                                                                const stockProducts = volumeData.filter(v => v.stockID === products?.stockID);
                                                                handleSave(products?.stationId, stockProducts);
                                                            }}
                                                            sx={{ flexDirection: "column", gap: 0.5 }}
                                                        >
                                                            <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                                            <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                                บันทึก
                                                            </Typography>
                                                        </Button>
                                                    </Paper>
                                                ) : null
                                            }
                                        </TableCell>
                                    ) : null} */}
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "left", alignItems: "start", marginTop: -2, marginBottom: 2 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            onClick={() => {
                                const trucksAtDate = [{ id: 0, Truck: "", Price: "", Volume: "" }];

                                if (checkTruck === gasStation?.id) {
                                    // ❌ ปิด toggle
                                    setCheckTruck(false);
                                    setShowTruckFromClick(false); // กลับไปเป็นค่าเริ่มต้น
                                    setLocalTruck([]);
                                    onProductChange(gasStation.id, [], "Truck");
                                } else {
                                    // ✅ เปิด toggle
                                    setCheckTruck(gasStation?.id);
                                    setShowTruckFromClick(true); // บอกว่า toggle จาก onclick
                                    setLocalTruck(trucksAtDate);
                                    onProductChange(gasStation.id, trucksAtDate, "Truck");
                                }
                            }}
                            checked={checkTruck === gasStation?.id}
                        />
                    }
                    label="เพิ่มทะเบียนรถ"
                />

                {checkTruck === gasStation?.id && (
                    <TableContainer
                        component={Paper}
                        style={{ maxHeight: "30vh" }}
                        sx={{ width: "70%", marginTop: 1.5 }}
                    >
                        <Table stickyHeader size="small" sx={{ width: "100%" }}>
                            <TableHead>
                                <TableRow>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 14, width: 60, backgroundColor: theme.palette.panda.main, whiteSpace: "nowrap" }}>
                                        ลำดับ
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 14, width: 350, backgroundColor: theme.palette.panda.main, whiteSpace: "nowrap" }}>
                                        รถเล็ก
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 14, width: 150, backgroundColor: theme.palette.panda.main, whiteSpace: "nowrap" }}>
                                        คงเหลือบนรถ
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 14, width: 150, backgroundColor: theme.palette.panda.main, whiteSpace: "nowrap" }}>
                                        รับเพิ่ม
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 14, width: 150, backgroundColor: theme.palette.panda.main, whiteSpace: "nowrap" }}>
                                        รวม
                                    </TablecellHeader>
                                    <TableCell sx={{ textAlign: "center", fontSize: 14, width: 80, whiteSpace: "nowrap" }}>

                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products?.Truck &&
                                    products?.Truck.map((tr, index) => (
                                        <TableRow key={tr.id} sx={{ height: "20px" }}>
                                            <TableCell
                                                sx={{
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    borderBottom: "2px solid white",
                                                }}
                                            >
                                                {index + 1}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    borderBottom: "2px solid white",
                                                    paddingLeft: 0.5,
                                                    paddingRight: 0.5,
                                                }}
                                            >
                                                <Paper sx={{ width: "100%" }}>
                                                    <TextField
                                                        size="small"
                                                        type={"text"}
                                                        value={tr.Truck}
                                                        // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                        InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                        onChange={(e) => handleChange(index, "Truck", e.target.value)}
                                                        fullWidth
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": { height: 25 },
                                                            "& .MuiInputBase-input": {
                                                                fontSize: 12,
                                                                fontWeight: "bold",
                                                                textAlign: "center",
                                                                mr: -0.5,
                                                                ml: -0.5,
                                                                pr: 0.5,
                                                                paddingLeft: -3, // เพิ่มพื้นที่ให้ endAdornment
                                                                paddingRight: 1, // เพิ่มพื้นที่ให้ endAdornment
                                                            },
                                                        }}
                                                    />
                                                </Paper>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    borderBottom: "2px solid white",
                                                    paddingLeft: 0.5,
                                                    paddingRight: 0.5,
                                                }}
                                            >
                                                <Paper sx={{ width: "100%" }}>
                                                    <TextField
                                                        size="small"
                                                        type={"number"}
                                                        value={tr.Price}
                                                        onChange={(e) => handleChange(index, "Price", e.target.value)}
                                                        // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                        InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                        fullWidth
                                                        InputProps={{
                                                            inputProps: {
                                                                min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                                step: 1000,
                                                            },
                                                        }}
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
                                                                paddingRight: 1, // เพิ่มพื้นที่ให้ endAdornment
                                                            },
                                                        }}
                                                    />
                                                </Paper>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    borderBottom: "2px solid white",
                                                    paddingLeft: 0.5,
                                                    paddingRight: 0.5,
                                                }}
                                            >
                                                <Paper sx={{ width: "100%" }}>
                                                    <TextField
                                                        size="small"
                                                        type={"number"}
                                                        value={tr.Volume}
                                                        onChange={(e) => handleChange(index, "Volume", e.target.value)}
                                                        // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                        InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                        fullWidth
                                                        InputProps={{
                                                            inputProps: {
                                                                min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                                step: 1000,
                                                            },
                                                        }}
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
                                                                paddingRight: 1, // เพิ่มพื้นที่ให้ endAdornment
                                                            },
                                                        }}
                                                    />
                                                </Paper>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    borderBottom: "2px solid white",
                                                }}
                                            >
                                                {Number(tr.Price) + Number(tr.Volume)}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    borderBottom: "2px solid white",
                                                }}
                                            >
                                                <Box display="flex" justifyContent="right" alignItems="center" marginTop={-1} marginBottom={-1}>
                                                    {
                                                        products?.Truck.length === (index + 1) && (
                                                            <IconButton color="success" onClick={handleAdd}>
                                                                <AddCircleIcon fontSize="small" />
                                                            </IconButton>
                                                        )
                                                    }
                                                    {products?.Truck.length > 1 && (
                                                        <IconButton color="error" onClick={() => handleDelete(index)}>
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </React.Fragment>

    );
};

export default UpdateGasStations;
