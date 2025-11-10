import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Autocomplete,
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
    FormControl,
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
import SaveIcon from '@mui/icons-material/Save';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { formatThaiSlash } from "../../../theme/DateTH";

const UpdateGasStations = (props) => {
    const { gasStation,
        products,
        selectedDate,
        isFirst,                // แถวแรกของ stock
        downHoleByProduct,      // มาจากหน้าหลัก
        onProductChange,
        handleSave,
        stationId,
        check
    } = props;
    const [name, setName] = useState(gasStation.Name);
    const [shortName, setShortName] = useState(gasStation.ShortName);
    const [number, setNumber] = useState(gasStation.OilWellNumber);
    const [driver1, setDriver1] = useState("");
    const [driver2, setDriver2] = useState("");
    const [focused, setFocused] = useState({}); // { [index]: { [column]: true/false } }

    const handleFocus = (index, column) => {
        setFocused(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [column]: true
            }
        }));
    };

    const handleBlur = (index, column) => {
        setFocused(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [column]: false
            }
        }));
    };

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
    console.log("1.truckDriver : ", truckDriver);
    console.log("2.truckDriver : ", truckDriver.map((row) => row.Driver.split(":")[1]?.split(" ")[0]));

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

    const handleProductChange = (index, field, value) => {
        // ตรวจสอบว่ากำลังแก้ไข field ของ Products หรือ Driver
        if (index !== null) {
            // อัปเดต Products
            const updated = [...products?.Products];
            updated[index][field] = value;

            // คำนวณค่าต่างๆ ของ Products
            updated[index].Period = calculatePeriod(updated[index]);
            updated[index].Sell = calculateSell(updated[index]);
            updated[index].TotalVolume = calculateTotalVolume(updated[index]);
            updated[index].PeriodDisplay = parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

            // ส่งกลับไปยัง parent
            onProductChange(gasStation.id, updated, "Products"); // ✅ เพิ่ม type
        } else {
            // อัปเดต Driver1 / Driver2 ของ station
            onProductChange(gasStation.id, value, field); // ส่ง value + field name
        }
    };

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

    console.log("products length : ", products?.Products.length);
    return (
        <React.Fragment>
            <Box textAlign="center"
                sx={{
                    backgroundColor:
                        gasStation.Stock.split(":")[1] === "แม่โจ้" ? "#92D050"
                            : gasStation.Stock.split(":")[1] === "สันกลาง" ? "#B1A0C7"
                                : gasStation.Stock.split(":")[1] === "สันทราย" ? "#B7DEE8"
                                    : gasStation.Stock.split(":")[1] === "บ้านโฮ่ง" ? "#FABF8F"
                                        : gasStation.Stock.split(":")[1] === "ป่าแดด" ? "#B1A0C7"
                                            : ""
                    ,
                    paddingTop: 2,
                    paddingBottom: 1,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10
                }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: 18, marginBottom: -1 }} gutterBottom>{name + " / " + shortName + " มีทั้งหมด " + number + " หลุม" + "ที่อยู่ " + gasStation.Address}</Typography>
            </Box>
            <TableContainer
                component={Paper}
                style={{ maxHeight: "70vh" }}
                sx={{ marginBottom: 2 }}
            >
                <Table stickyHeader size="small" sx={{ width: 1280 }}>
                    <TableHead>
                        <TableRow>
                            <TablecellHeader colSpan={2} width={160} sx={{ textAlign: "center", backgroundColor: theme.palette.panda.main }}>
                                <Paper
                                    component="form"
                                    sx={{
                                        width: "100%", // กำหนดความกว้างของ Paper
                                        height: "25px"
                                    }}
                                >
                                    <Typography fontSize="14px" fontWeight="bold" gutterBottom paddingTop={0.5}>วันที่ {formatThaiSlash(dayjs(selectedDate))}</Typography>
                                </Paper>
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                ปริมาณ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 100, whiteSpace: "nowrap" }}>
                                หักบีบไม่ขึ้น
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 300, whiteSpace: "nowrap" }}>
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
                            <TablecellHeader sx={{ backgroundColor: theme.palette.panda.main, width: 60 }} rowSpan={products?.Products.length}>

                            </TablecellHeader>
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
                                        backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`,
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        paddingLeft: "20px !important",
                                        paddingRight: "20px !important",
                                        fontVariantNumeric: "tabular-nums"
                                    }}>
                                        {isFirst ? new Intl.NumberFormat("en-US").format(s.Capacity) : ""}
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`, color: s.Volume < 0 ? "#d50000" : "black",
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white"
                                    }}>
                                        {/* {new Intl.NumberFormat("en-US").format(Math.round(s.Volume || 0))} */}
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Volume") ? "number" : "text"}
                                                // label="ปริมาณ"
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={isFieldFocused(index, "Volume")
                                                    ? s.Volume || 0
                                                    : Number(s.Volume || 0).toLocaleString()}
                                                onFocus={() => handleFocus(index, "Volume")}
                                                onBlur={() => handleBlur(index, "Volume")}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "").replace(/^0+(?=\d)/, "");
                                                    handleProductChange(index, "Volume", raw === "" ? "" : Number(raw));
                                                }}
                                                onKeyDown={(e) => {
                                                    const current = Number(s.Volume) || 0;
                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Volume", current + 1000);
                                                    }
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Volume", Math.max(0, current - 1000));
                                                    }
                                                }}
                                                InputProps={{
                                                    inputProps: {
                                                        min: 0,
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Volume") ? 1 : 0, // เว้นระยะจากตัวเลข
                                                            marginRight: -0.5
                                                        }
                                                    }
                                                }}
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        pr: isFieldFocused(index, "Volume") ? 1 : 3
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white"
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
                                                type={isFieldFocused(index, "Squeeze") ? "number" : "text"}
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                style={{ display: isFirst ? "" : "none" }}
                                                value={isFieldFocused(index, "Squeeze")
                                                    ? s.Squeeze || 0
                                                    : Number(s.Squeeze || 0).toLocaleString()}
                                                onFocus={() => handleFocus(index, "Squeeze")}
                                                onBlur={() => handleBlur(index, "Squeeze")}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "").replace(/^0+(?=\d)/, "");
                                                    handleProductChange(index, "Squeeze", raw === "" ? "" : Number(raw));
                                                }}
                                                onKeyDown={(e) => {
                                                    const current = Number(s.Squeeze) || 0;
                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Squeeze", current + 1000);
                                                    }
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Squeeze", Math.max(0, current - 1000));
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    inputProps: {
                                                        min: 0,
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Squeeze") ? 1 : 0, // เว้นระยะจากตัวเลข
                                                            marginRight: -0.5
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        pr: isFieldFocused(index, "Squeeze") ? 1 : 3
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 1, // เพิ่มระยะห่างระหว่าง TextField
                                            backgroundColor: s.Color
                                                ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                : `${s.Color}4A`,
                                            borderBottom: "2px solid white"
                                        }}
                                    >
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending3") ? "number" : "text"}
                                                label="ลงจริงไปแล้ว"
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={isFieldFocused(index, "Pending3")
                                                    ? s.Pending3 || 0
                                                    : Number(s.Pending3 || 0).toLocaleString()}
                                                onFocus={() => handleFocus(index, "Pending3")}
                                                onBlur={() => handleBlur(index, "Pending3")}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "").replace(/^0+(?=\d)/, "");
                                                    handleProductChange(index, "Pending3", raw === "" ? "" : Number(raw));
                                                }}
                                                onKeyDown={(e) => {
                                                    const current = Number(s.Pending3) || 0;
                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending3", current + 1000);
                                                    }
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending3", Math.max(0, current - 1000));
                                                    }
                                                }}
                                                InputProps={{
                                                    inputProps: {
                                                        min: 0,
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Pending3") ? 1 : 0, // เว้นระยะจากตัวเลข
                                                            marginRight: -0.5
                                                        }
                                                    }
                                                }}
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        pr: isFieldFocused(index, "Pending3") ? 1 : 3
                                                    },
                                                }}
                                            />
                                        </Paper>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending1") ? "number" : "text"}
                                                label={products.Driver1 ? products.Driver1.split(":")[1]?.split(" ")[0] : ""}
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={isFieldFocused(index, "Pending1")
                                                    ? s.Pending1 || 0
                                                    : Number(s.Pending1 || 0).toLocaleString()}
                                                onFocus={() => handleFocus(index, "Pending1")}
                                                onBlur={() => handleBlur(index, "Pending1")}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "").replace(/^0+(?=\d)/, "");
                                                    handleProductChange(index, "Pending1", raw === "" ? "" : Number(raw));
                                                }}
                                                onKeyDown={(e) => {
                                                    const current = Number(s.Pending1) || 0;
                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending1", current + 1000);
                                                    }
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending1", Math.max(0, current - 1000));
                                                    }
                                                }}
                                                InputProps={{
                                                    inputProps: {
                                                        min: 0,
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Pending1") ? 1 : 0, // เว้นระยะจากตัวเลข
                                                            marginRight: -0.5
                                                        }
                                                    }
                                                }}
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        pr: isFieldFocused(index, "Pending1") ? 1 : 3
                                                    },
                                                }}
                                            />
                                        </Paper>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending2") ? "number" : "text"}
                                                label={products.Driver2 ? products.Driver2.split(":")[1]?.split(" ")[0] : ""}
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={isFieldFocused(index, "Pending2")
                                                    ? s.Pending2 || 0
                                                    : Number(s.Pending2 || 0).toLocaleString()}
                                                onFocus={() => handleFocus(index, "Pending2")}
                                                onBlur={() => handleBlur(index, "Pending2")}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "").replace(/^0+(?=\d)/, "");
                                                    handleProductChange(index, "Pending2", raw === "" ? "" : Number(raw));
                                                }}
                                                onKeyDown={(e) => {
                                                    const current = Number(s.Pending2) || 0;
                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending2", current + 1000);
                                                    }
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending2", Math.max(0, current - 1000));
                                                    }
                                                }}
                                                InputProps={{
                                                    inputProps: {
                                                        min: 0,
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "Pending2") ? 1 : 0, // เว้นระยะจากตัวเลข
                                                            marginRight: -0.5
                                                        }
                                                    }
                                                }}
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        pr: isFieldFocused(index, "Pending2") ? 1 : 3
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white"
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "EstimateSell") ? "number" : "text"}
                                                label="ขาย"
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={isFieldFocused(index, "EstimateSell")
                                                    ? s.EstimateSell || 0
                                                    : Number(s.EstimateSell || 0).toLocaleString()}
                                                onFocus={() => handleFocus(index, "EstimateSell")}
                                                onBlur={() => handleBlur(index, "EstimateSell")}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "").replace(/^0+(?=\d)/, "");
                                                    handleProductChange(index, "EstimateSell", raw === "" ? "" : Number(raw));
                                                }}
                                                onKeyDown={(e) => {
                                                    const current = Number(s.EstimateSell) || 0;
                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "EstimateSell", current + 1000);
                                                    }
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "EstimateSell", Math.max(0, current - 1000));
                                                    }
                                                }}
                                                InputProps={{
                                                    inputProps: {
                                                        min: 0,
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            marginLeft: isFieldFocused(index, "EstimateSell") ? 1 : 0, // เว้นระยะจากตัวเลข
                                                            marginRight: -0.5
                                                        }
                                                    }
                                                }}
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        pr: isFieldFocused(index, "EstimateSell") ? 1 : 3
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
                                    {/* ถ้าเป็นแถวแรก (index === 0) ให้เพิ่ม rowSpan, แถวอื่นไม่ต้องแสดง cell นี้ */}
                                    {index === 0 ? (
                                        <TableCell rowSpan={products?.Products.length}>
                                            {
                                                check && (<Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.success.main }}>
                                                    <Button
                                                        color="inherit"
                                                        fullWidth
                                                        onClick={() => handleSave(stationId, gasStation, products)}
                                                        sx={{ flexDirection: "column", gap: 0.5 }}
                                                    >
                                                        <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                                        <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                            บันทึก
                                                        </Typography>
                                                    </Button>
                                                </Paper>
                                                )
                                            }
                                        </TableCell>
                                    ) : ""}
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>

    );
};

export default UpdateGasStations;
