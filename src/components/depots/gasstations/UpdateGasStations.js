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
import theme from "../../../theme/theme";
import { IconButtonError, IconButtonInfo, RateOils, TablecellHeader } from "../../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HTTP } from "../../../server/axios";
import Cookies from "js-cookie";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SaveIcon from '@mui/icons-material/Save';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import GasStationsProduct from "./GasStationsProduct";
import e from "cors";

const UpdateGasStations = (props) => {
    const { gasStation, gasStationOil, onSendBack, selectedDate, Squeeze, currentReport } = props;

    const [setting, setSetting] = React.useState(true);
    const [name, setName] = React.useState(gasStation.Name);
    const [number, setNumber] = React.useState(gasStation.OilWellNumber);
    const [stockOil, setStockOil] = React.useState(gasStation.Stock);
    const [squeeze, setSqueeze] = React.useState(Squeeze);
    const [yesterDay, setYesterDay] = React.useState(0);
    const [estimateSell, setEstimateSell] = React.useState(0);
    const [estimateStock, setEstimateStock] = React.useState(0);
    const [show, setShow] = React.useState(true);
    const [update, setUpdate] = React.useState(true);

    const [stock, setStock] = React.useState([]);
    const [values, setValues] = useState([]);

    const downHole = currentReport && currentReport[dayjs(selectedDate).format("DD-MM-YYYY")]
        ? currentReport[dayjs(selectedDate).format("DD-MM-YYYY")].map(item => ({
            ProductName: item.ProductName,
            DownHole: item.DownHole
        }))
        : null;

    // console.log(gasStation.id+" แสดงค่า : ",downHole);
    console.log(gasStation.id + " แสดงค่า : ", downHole);

    const getStock = async () => {
        database.ref("depot/stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataStock = [];
            for (let id in datas) {
                datas[id].Name === gasStation.Stock &&
                    database.ref("depot/stock/" + (datas[id].id - 1) + "/Products").on("value", (snapshot) => {
                        const product = snapshot.val();
                        for (let id in product) {
                            dataStock.push({ id, ...product[id] });
                        }
                    });
            }
            dataStock.sort((a, b) => a.ProductName.localeCompare(b.ProductName));
            setStock(dataStock);
        });
    };

    useEffect(() => {
        getStock();
    }, []);


    useEffect(() => {
        const isFirstStation = (gasStationOil?.[0]?.Name === gasStation?.Name) || false;
        const formattedDate = dayjs(selectedDate).format("DD-MM-YYYY");
        const reportData = gasStation?.Report?.[formattedDate];
    
        const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
        const yesterdayData = gasStation?.Report?.[yesterdayDate];
    
        let sharedDownHole = 0;
    
        if (isFirstStation && reportData) {
            const firstProductWithDownHole = Object.values(reportData).find(
                (entry) => entry?.DownHole
            );
            sharedDownHole = firstProductWithDownHole?.DownHole || 0;
        }
    
        const updatedValues = reportData
            ? Object.entries(reportData)
                .sort(([keyA, valueA], [keyB, valueB]) =>
                    valueA?.ProductName?.localeCompare(valueB?.ProductName || "") || 0
                )
                .map(([key, value]) => ({
                    ProductName: value?.ProductName || "",
                    Capacity: value?.Capacity || 0,
                    Color: value?.Color || "",
                    Value: value?.Value || 0,
                    Squeeze: value?.Squeeze || 800,
                    Delivered: value?.Delivered || 0,
                    Pending1: value?.Pending1 || 0,
                    Pending2: value?.Pending2 || 0,
                    EstimateSell: value?.EstimateSell || 0,
                    Period: value?.Period || 0,
                    // ป้องกันการซ้ำกันของ DownHole โดยการเลือกค่าแรกที่มีอยู่
                    DownHole: value?.DownHole || 0,
                    YesterDay: value?.YesterDay || 0,
                    Sell: value?.Sell || 0,
                }))
            : stock.map((row) => {
                const yesterdayEntry = Object.values(yesterdayData || {}).find(
                    (entry) => entry?.ProductName === row?.ProductName
                );
    
                const downHoleValue = downHole
                    ? (downHole.find((item) => item?.ProductName === row?.ProductName)?.DownHole || gasStation?.Products?.[row?.ProductName] || 0)
                    : (isFirstStation
                        ? gasStation?.Products?.[row?.ProductName] || 0
                        : sharedDownHole || 0);
    
                return {
                    ProductName: row?.ProductName || "",
                    Capacity: row?.Capacity || 0,
                    Color: row?.Color || "",
                    Value: gasStation?.Products?.[row?.ProductName] || 0,
                    Squeeze: squeeze,
                    Delivered: 0,
                    Pending1: 0,
                    Pending2: 0,
                    EstimateSell: 0,
                    Period: 0,
                    DownHole: downHoleValue, // ใช้ DownHole ที่คำนวณแล้ว
                    YesterDay: yesterdayEntry?.Value || 0,
                    Sell: 0,
                };
            });
    
        updatedValues.forEach((row) => {
            row.Period = calculatePeriod(row);
            row.Sell = calculateSell(row);
            row.DownHole = calculateDownHole(row);
        });
    
        setValues(updatedValues);
    }, [stock, selectedDate, gasStation, squeeze, gasStationOil, downHole]);
    
    const handleInputChange = (index, field, value) => {
        const updatedValues = [...values];
    
        // ตรวจสอบการเพิ่มข้อมูลครั้งแรก
        if (!updatedValues[index]) {
            updatedValues[index] = {
                ProductName: "",
                Capacity: 0,
                Color: "",
                Value: 0,
                Squeeze: squeeze,
                Delivered: 0,
                Pending1: 0,
                Pending2: 0,
                EstimateSell: 0,
                Period: 0,
                // ใช้ค่า DownHole เริ่มต้นจาก gasStation ถ้าค่าใน downHole ไม่มี
                DownHole: 0, 
                YesterDay: 0,
                Sell: 0
            };
        }
    
        updatedValues[index][field] = value;
    
        // ตรวจสอบว่า DownHole ถูกตั้งค่าแล้วหรือยัง
        const downHoleValue = downHole
            ? downHole.find(item => item?.ProductName === updatedValues[index]?.ProductName)?.DownHole
            : gasStation?.Products?.[updatedValues[index]?.ProductName] || 0;
    
        updatedValues[index].Period = calculatePeriod(updatedValues[index]);
        updatedValues[index].DownHole = downHoleValue; // ใช้ค่าจากการตรวจสอบ
        updatedValues[index].Sell = calculateSell(updatedValues[index]);
        updatedValues[index].DownHole = calculateDownHole(updatedValues[index]);
    
        setValues(updatedValues);
    };
    
    // ฟังก์ชันคำนวณผลรวม
    const calculatePeriod = (row) => {
        const estimateSell = parseFloat(row.EstimateSell) || 0;
        const Delivered = parseFloat(row.Delivered) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const squeezeoil = parseFloat(row.Squeeze) || squeeze;
        const value = parseFloat(row.Value) || 0;
        if (estimateSell === 0) {
            return ((value + Delivered + Pending1 + Pending2) - squeezeoil).toFixed(2);
        } else {
            return (((value + Delivered + Pending1 + Pending2) - squeezeoil) / estimateSell).toFixed(2);
        }
    };

    const calculateDownHole = (row) => {
        const Delivered = parseFloat(row.Delivered) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const downHole = parseFloat(row.DownHole) || 0;
        const value = parseFloat(row.Value) || 0;
        
        // console.log("downHole :",downHole);
        // console.log("value :",value);
        // return ((value + Delivered + Pending1 + Pending2)).toFixed(2);
        if(downHole === value){
            return ((value + Delivered + Pending1 + Pending2)).toFixed(2);
        }
        else{
            return ((value + Delivered + Pending1 + Pending2 + downHole)).toFixed(2);
        }
    };

    const calculateSell = (row) => {
        const yesterDay = parseFloat(row.YesterDay) || 0;
        const value = parseFloat(row.Value) || 0;
        return ((yesterDay - value)).toFixed(2); // ผลรวมในรูปทศนิยม 2 ตำแหน่ง
    };

    console.log(values);

    const handleUpdate = () => {
        database
            .ref("/depot/gasStations/" + (gasStation.id - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(values)
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    return (
        <React.Fragment>
            <Grid container marginBottom={1}>
                <Grid item xs={0.5}>
                    <Typography variant="subtitle1" textAlign="right" fontWeight="bold" gutterBottom>ชื่อปั้ม</Typography>
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        variant="standard"
                        value={name}
                        InputProps={{
                            sx: {
                                textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                            },
                            inputProps: {
                                style: {
                                    textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                                },
                            },
                        }}
                        disabled />
                </Grid>
                <Grid item xs={1}>
                    <Typography variant="subtitle1" textAlign="right" fontWeight="bold" gutterBottom>จำนวนหลุม</Typography>
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        variant="standard"
                        value={number}
                        InputProps={{
                            sx: {
                                textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                            },
                            inputProps: {
                                style: {
                                    textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                                },
                            },
                        }}
                        disabled />
                </Grid>
                <Grid item xs={1}>
                    <Typography variant="subtitle1" textAlign="right" fontWeight="bold" gutterBottom>คลังสต็อก</Typography>
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        variant="standard"
                        value={stockOil}
                        InputProps={{
                            sx: {
                                textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                            },
                            inputProps: {
                                style: {
                                    textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                                },
                            },
                        }}
                        disabled />
                </Grid>
                <Grid item xs={0.5}>
                    <Typography variant="subtitle1" textAlign="right" fontWeight="bold" gutterBottom>ที่อยู่</Typography>
                </Grid>
                <Grid item xs={4.5}>
                    <TextField fullWidth variant="standard" value={gasStation.Address} disabled />
                </Grid>
            </Grid>
            <TableContainer
                component={Paper}
                style={{ maxHeight: "70vh" }}
                sx={{ marginBottom: 2 }}
            >
                <Table stickyHeader size="small">
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
                                    <Typography fontSize="14px" fontWeight="bold" gutterBottom paddingTop={0.5}>วันที่ {dayjs(selectedDate).format("DD/MM/YYYY")}</Typography>
                                </Paper>
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main }}>
                                ปริมาณ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 100 }}>
                                หักบีบไม่ขึ้น
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 400 }}>
                                {
                                    update ?
                                        <Grid container>
                                            <Grid item xs={2.5}>
                                                ลงจริงไปแล้ว
                                            </Grid>
                                            <Grid item xs={0.5}>
                                                |
                                            </Grid>
                                            <Grid item xs={2.5}>
                                                ที่มาจะลง
                                            </Grid>
                                            <Grid item xs={0.5}>
                                                |
                                            </Grid>
                                            <Grid item xs={2.5}>
                                                ที่มาจะลง
                                            </Grid>
                                            <Grid item xs={0.5}>
                                                |
                                            </Grid>
                                            <Grid item xs={2.5}>
                                                ขาย/วัน
                                            </Grid>
                                        </Grid>
                                        :
                                        "ประมาณการรับเข้า/วัน"
                                }
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main }}>
                                หมด
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main }}>
                                ลงหลุม
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 120 }}>
                                เมื่อวาน
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main }}>
                                ขายได้
                            </TablecellHeader>
                            <TablecellHeader sx={{ backgroundColor: theme.palette.panda.main, width: 100 }}>
                                <Paper component="form" sx={{ height: "25px", paddingTop: -0.5 }}>
                                    {
                                        update ?
                                            <IconButton color="inherit" size="small" fullWidth onClick={(e) => setUpdate(false)}>
                                                <DriveFileRenameOutlineIcon fontSize="small" color="warning" />
                                            </IconButton>
                                            :
                                            <Grid container width="100%">
                                                <Grid item xs={6}>
                                                    <IconButton color="inherit" size="small" fullWidth onClick={(e) => setUpdate(true)}>
                                                        <DisabledByDefaultIcon fontSize="small" color="error" />
                                                    </IconButton>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <IconButton color="inherit" size="small" fullWidth onClick={handleUpdate}>
                                                        <SaveIcon fontSize="small" color="success" />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                    }
                                </Paper>
                            </TablecellHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            update ?
                                gasStation.Report ?
                                    (gasStation.Report[dayjs(selectedDate).format("DD-MM-YYYY")] ?
                                        Object.entries(gasStation.Report[dayjs(selectedDate).format("DD-MM-YYYY")])
                                            .sort(([keyA, valueA], [keyB, valueB]) =>
                                                valueA.ProductName.localeCompare(valueB.ProductName)
                                            )
                                            .map(([key, value]) => (
                                                <TableRow key={key}>
                                                    <TablecellHeader sx={{ backgroundColor: value.Color, width: 50, color: "black" }}>{value.ProductName}</TablecellHeader>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.Capacity)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.Value)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.Squeeze)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Grid container>
                                                            <Grid item xs={2.5}>
                                                                {new Intl.NumberFormat("en-US").format(value.Delivered)}
                                                            </Grid>
                                                            <Grid item xs={0.5}>
                                                                |
                                                            </Grid>
                                                            <Grid item xs={2.5}>
                                                                {new Intl.NumberFormat("en-US").format(value.Pending1)}
                                                            </Grid>
                                                            <Grid item xs={0.5}>
                                                                |
                                                            </Grid>
                                                            <Grid item xs={2.5}>
                                                                {new Intl.NumberFormat("en-US").format(value.Pending2)}
                                                            </Grid>
                                                            <Grid item xs={0.5}>
                                                                |
                                                            </Grid>
                                                            <Grid item xs={2.5}>
                                                                {new Intl.NumberFormat("en-US").format(value.EstimateSell)}
                                                            </Grid>
                                                            <Grid item xs={0.5} />
                                                        </Grid>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.Period)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.DownHole)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.YesterDay)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.Sell)}</TableCell>
                                                </TableRow>
                                            ))
                                        :
                                        gasStation.Products &&
                                        Object.entries(gasStation.Products).map(([key, value], index) => (
                                            <React.Fragment key={index}>
                                                {
                                                    stock.map((row, index) => (
                                                        row.ProductName === key &&
                                                        <TableRow key={row.id}>
                                                            <TablecellHeader sx={{ backgroundColor: row.Color, width: 50, color: "black" }}>{row.ProductName}</TablecellHeader>
                                                            <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.Capacity)}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value)}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Grid container>
                                                                    <Grid item xs={2.5}>
                                                                        0
                                                                    </Grid>
                                                                    <Grid item xs={0.5}>
                                                                        |
                                                                    </Grid>
                                                                    <Grid item xs={2.5}>
                                                                        0
                                                                    </Grid>
                                                                    <Grid item xs={0.5}>
                                                                        |
                                                                    </Grid>
                                                                    <Grid item xs={2.5}>
                                                                        0
                                                                    </Grid>
                                                                    <Grid item xs={0.5}>
                                                                        |
                                                                    </Grid>
                                                                    <Grid item xs={2.5}>
                                                                        0
                                                                    </Grid>
                                                                    <Grid item xs={0.5} />
                                                                </Grid>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </React.Fragment>
                                        ))
                                    )
                                    :
                                    (
                                        gasStation.Products &&
                                        Object.entries(gasStation.Products).map(([key, value], index) => (
                                            <React.Fragment key={index}>
                                                {
                                                    stock.map((row, index) => (
                                                        row.ProductName === key &&
                                                        <TableRow key={row.id}>
                                                            <TablecellHeader sx={{ backgroundColor: row.Color, width: 50, color: "black" }}>{row.ProductName}</TablecellHeader>
                                                            <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.Capacity)}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value)}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Grid container>
                                                                    <Grid item xs={2.5}>
                                                                        0
                                                                    </Grid>
                                                                    <Grid item xs={0.5}>
                                                                        |
                                                                    </Grid>
                                                                    <Grid item xs={2.5}>
                                                                        0
                                                                    </Grid>
                                                                    <Grid item xs={0.5}>
                                                                        |
                                                                    </Grid>
                                                                    <Grid item xs={2.5}>
                                                                        0
                                                                    </Grid>
                                                                    <Grid item xs={0.5}>
                                                                        |
                                                                    </Grid>
                                                                    <Grid item xs={2.5}>
                                                                        0
                                                                    </Grid>
                                                                    <Grid item xs={0.5} />
                                                                </Grid>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </React.Fragment>
                                        ))
                                    )
                                :
                                gasStation.Products &&
                                Object.entries(gasStation.Products).map(([key, value], index) => (
                                    <React.Fragment key={index}>
                                        {
                                            stock.map((row, index) => (
                                                row.ProductName === key &&
                                                <TableRow key={row.id}>
                                                    <TablecellHeader sx={{ backgroundColor: values[index]?.Color || 0, width: 50, color: "black" }}>{values[index]?.ProductName || 0}</TablecellHeader>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(values[index]?.Capacity || 0)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(values[index]?.Value || 0)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <TextField
                                                            style={{ display: 'none' }}
                                                            inputProps={{ readOnly: true }}
                                                            value={values[index]?.Value || 0}
                                                        />
                                                        <TextField
                                                            style={{ display: 'none' }}
                                                            inputProps={{ readOnly: true }}
                                                            value={values[index]?.Color || ""}
                                                        />
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            // InputProps={{
                                                            //     startAdornment: (
                                                            //         <InputAdornment position="start">สต็อก</InputAdornment>
                                                            //     ),
                                                            // }}
                                                            InputLabelProps={{
                                                                sx: {
                                                                    fontSize: '12px',
                                                                },
                                                            }}
                                                            value={values[index]?.Squeeze || squeeze}
                                                            onChange={(e) =>
                                                                handleInputChange(index, "Squeeze", e.target.value)
                                                            }
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '25px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '4px 8px', // ปรับ padding ภายใน input
                                                                    textAlign: "center",
                                                                },
                                                            }}
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            gap: 1, // เพิ่มระยะห่างระหว่าง TextField
                                                        }}
                                                    >
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            // InputProps={{
                                                            //     startAdornment: (
                                                            //         <InputAdornment position="start">สต็อก</InputAdornment>
                                                            //     ),
                                                            // }}
                                                            label="ลงจริงไปแล้ว"
                                                            value={values[index]?.Delivered || 0}
                                                            onChange={(e) =>
                                                                handleInputChange(index, "Delivered", e.target.value)
                                                            }
                                                            InputLabelProps={{
                                                                sx: {
                                                                    fontSize: '12px',
                                                                },
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '25px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '4px 8px', // ปรับ padding ภายใน input
                                                                    textAlign: "center",
                                                                },
                                                            }}
                                                            fullWidth
                                                        />
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            // InputProps={{
                                                            //     startAdornment: (
                                                            //         <InputAdornment position="start">สต็อก</InputAdornment>
                                                            //     ),
                                                            // }}
                                                            label="ที่จะมาลง"
                                                            value={values[index]?.Pending1 || 0}
                                                            onChange={(e) =>
                                                                handleInputChange(index, "Pending1", e.target.value)
                                                            }
                                                            InputLabelProps={{
                                                                sx: {
                                                                    fontSize: '12px',
                                                                },
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '25px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '4px 8px', // ปรับ padding ภายใน input
                                                                    textAlign: "center",
                                                                },
                                                            }}
                                                            fullWidth
                                                        />
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            // InputProps={{
                                                            //     startAdornment: (
                                                            //         <InputAdornment position="start">สต็อก</InputAdornment>
                                                            //     ),
                                                            // }}
                                                            label="ที่จะมาลง"
                                                            value={values[index]?.Pending2 || 0}
                                                            onChange={(e) =>
                                                                handleInputChange(index, "Pending2", e.target.value)
                                                            }
                                                            InputLabelProps={{
                                                                sx: {
                                                                    fontSize: '12px',
                                                                },
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '25px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '4px 8px', // ปรับ padding ภายใน input
                                                                    textAlign: "center",
                                                                },
                                                            }}
                                                            fullWidth
                                                        />
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            // InputProps={{
                                                            //     startAdornment: (
                                                            //         <InputAdornment position="start">ขาย</InputAdornment>
                                                            //     ),
                                                            // }}
                                                            label="ขาย"
                                                            InputLabelProps={{
                                                                sx: {
                                                                    fontSize: '12px',
                                                                },
                                                            }}
                                                            value={values[index]?.EstimateSell || 0}
                                                            onChange={(e) =>
                                                                handleInputChange(index, "EstimateSell", e.target.value)
                                                            }
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '25px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '4px 8px', // ปรับ padding ภายใน input
                                                                    textAlign: "center",
                                                                },
                                                            }}
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(values[index]?.Period || (values[index]?.Value - values[index]?.Squeeze))}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format((values[index]?.Capacity || 0)-(values[index]?.DownHole || 0))}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            InputLabelProps={{
                                                                sx: {
                                                                    fontSize: '12px',
                                                                },
                                                            }}
                                                            value={values[index]?.YesterDay || 0}
                                                            onChange={(e) =>
                                                                handleInputChange(index, "YesterDay", e.target.value)
                                                            }
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '25px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '4px 8px', // ปรับ padding ภายใน input
                                                                    textAlign: "center",
                                                                },
                                                            }}
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(values[index]?.Sell || 0)}</TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </React.Fragment>
                                ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>

    );
};

export default UpdateGasStations;
