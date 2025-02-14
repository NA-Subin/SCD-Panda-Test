import React, { useContext, useEffect, useRef, useState } from "react";
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

const UpdateGasStations = (props) => {
    const { gasStation, gasStationOil, onSendBack, selectedDate, Squeeze, currentReport } = props;
    const customOrder = ["G95", "B95", "B7", "B7(1)", "B7(2)", "G91", "E20", "PWD"];

    const [setting, setSetting] = React.useState(true);
    const [name, setName] = React.useState(gasStation.Name);
    const [shortName, setShortName] = React.useState(gasStation.ShortName);
    const [number, setNumber] = React.useState(gasStation.OilWellNumber);
    const [stockOil, setStockOil] = React.useState(gasStation.Stock);
    const [squeeze, setSqueeze] = React.useState(Squeeze);
    const [yesterDay, setYesterDay] = React.useState(0);
    const [estimateSell, setEstimateSell] = React.useState(0);
    const [estimateStock, setEstimateStock] = React.useState(0);
    const [show, setShow] = React.useState(true);
    const [update, setUpdate] = React.useState(true);
    const [yesTerDayData, setYesterdayData] = React.useState("");
    const [twoDaysAgoData, setTwoDaysAgoData] = React.useState("");
    const [formattedDate, setFormattedDate] = React.useState("");
    const [driversData, setDriversData] = useState([]);
    const [driver1, setDriver1] = React.useState("");
    const [driver2, setDriver2] = React.useState("");

    // ฟังก์ชันค้นหาข้อมูลที่ใกล้เคียงกับที่พิมพ์
    const filterOptions = (options, { inputValue }) => {
        return options.filter((option) =>
            option.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    const [products, setProducts] = React.useState('');
    const [volumeProduct, setVolumeProduct] = React.useState(0);

    const [stock, setStock] = React.useState([]);
    const [values, setValues] = useState([]);

    console.log("values :: ", values);

    const downHole = currentReport && currentReport[dayjs(selectedDate).format("DD-MM-YYYY")]
        ? currentReport[dayjs(selectedDate).format("DD-MM-YYYY")].map(item => ({
            ProductName: item.ProductName,
            DownHole: item.DownHole
        }))
        : null;

    const productsLength = Object.keys(gasStation.Products).length;

    // console.log(gasStation.id+" แสดงค่า : ",downHole);
    console.log(gasStation.id + " แสดงค่า : ", downHole);
    console.log("gasStation.Products : ", productsLength);

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
            dataStock.sort((a, b) => {
                // หาลำดับใน customOrder ของแต่ละ ProductName
                const indexA = customOrder.indexOf(a.ProductName);
                const indexB = customOrder.indexOf(b.ProductName);

                // เรียงตามลำดับที่กำหนดใน customOrder
                return indexA - indexB;
            });
            setStock(dataStock);
        });
    };

    const [truckDriver, setTruckDriver] = React.useState([]);

    const getTruck = async () => {
        database.ref("truck/registration").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTruck = [];
            for (let id in datas) {
                if (datas[id].RegTail !== "ไม่มี" && datas[id].Driver !== "ไม่มี") {
                    dataTruck.push({ id, ...datas[id] });
                }
            }
            setTruckDriver(dataTruck);
            setDriversData(
                dataTruck.map((driver) => ({
                    driverName: driver.Driver, // แยกชื่อ
                    product: "",
                    volume: 0,
                }))
            );
        });
    };

    useEffect(() => {
        getStock();
        getTruck();
    }, []);

    // ฟังก์ชันอัปเดตค่าของสินค้าและปริมาณ
    //     const handleChange = (index, field, value) => {
    //         setDriversData((prev) =>
    //             prev.map((data, i) => (i === index ? { ...data, [field]: value } : data))
    //         );
    //     };

    //     const allProducts = gasStation.Products
    //         ? Object.keys(gasStation.Products).sort((keyA, keyB) => {
    //             const indexA = customOrder.indexOf(keyA);
    //             const indexB = customOrder.indexOf(keyB);
    //             return indexA - indexB;
    //         })
    //         : [];

    //     // คำนวณผลรวมของสินค้าทั้งหมด
    //     const totalVolumes = allProducts.reduce((acc, product) => {
    //         const total = driversData
    //             .filter((driver) => driver.product === product)
    //             .reduce((sum, driver) => sum + (parseFloat(driver.volume) || 0), 0);

    //         acc[product] = total; // ถ้าไม่มีข้อมูล จะให้เป็น 0 โดยอัตโนมัติ
    //         return acc;
    //     }, {});

    //     // ใช้ useRef เพื่อเก็บค่า totalVolumes ล่าสุดที่ใช้ไปแล้ว
    // const prevTotalVolumesRef = useRef({});

    // ✅ ตรวจสอบก่อนอัปเดตค่า Pending2
    // useEffect(() => {
    //     // แปลง totalVolumes เป็น JSON string เพื่อเปรียบเทียบ
    //     const prevTotalVolumesString = JSON.stringify(prevTotalVolumesRef.current);
    //     const currentTotalVolumesString = JSON.stringify(totalVolumes);

    //     // ถ้า totalVolumes ไม่เปลี่ยนแปลง ไม่ต้องอัปเดต
    //     if (prevTotalVolumesString === currentTotalVolumesString) return;

    //     // อัปเดตค่าของ totalVolumes ที่ใช้ไปล่าสุด
    //     prevTotalVolumesRef.current = totalVolumes;

    //     setValues(prevValues =>
    //         prevValues.map(row => ({
    //             ...row,
    //             Pending2: totalVolumes[row.ProductName] ?? 0, // อัปเดต Pending2 ตาม totalVolumes ล่าสุด
    //             Period: calculatePeriod({ ...row, Pending2: totalVolumes[row.ProductName] ?? 0 }), // คำนวณใหม่
    //         }))
    //     );
    // }, [totalVolumes]); // รันเมื่อ totalVolumes เปลี่ยนแปลง

    const updateValuesForDate = () => {
        const isFirstStation = (gasStationOil?.[0]?.Name === gasStation?.Name) || false;
        const formattedDate = dayjs(selectedDate).format("DD-MM-YYYY");
        const reportData = gasStation?.Report?.[formattedDate];

        const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
        const twoDaysAgoDate = dayjs(selectedDate).subtract(2, "day").format("DD-MM-YYYY");

        const yesterdayData = gasStation?.Report?.[yesterdayDate];
        const twoDaysAgoData = gasStation?.Report?.[twoDaysAgoDate];

        setYesterdayData(yesterdayData);
        setTwoDaysAgoData(twoDaysAgoData);
        setFormattedDate(formattedDate);

        let sharedDownHole = 0;
        if (isFirstStation && reportData) {
            const firstProductWithDownHole = Object.values(reportData).find(entry => entry?.DownHole);
            sharedDownHole = firstProductWithDownHole?.DownHole || 0;
        }

        const updatedValues = reportData
            ? Object.entries(reportData)
                .sort(([keyA, valueA], [keyB, valueB]) => {
                    const indexA = customOrder.indexOf(valueA?.ProductName);
                    const indexB = customOrder.indexOf(valueB?.ProductName);
                    return indexA - indexB;
                })
                .map(([, value], index) => {
                    const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === value?.ProductName) || { OilBalance: 0 };
                    const twoDaysAgoEntry = Object.values(twoDaysAgoData || {}).find(entry => entry?.ProductName === value?.ProductName) || { OilBalance: 0 };
                    setDriver1(value?.Driver1 || "")
                    setDriver2(value?.Driver2 || "")
                    return {
                        ProductName: value?.ProductName || "",
                        Capacity: value?.Capacity || 0,
                        Color: value?.Color || "",
                        Volume: (yesterdayEntry?.Difference || yesterdayEntry?.OilBalance) || 0,
                        Squeeze: value?.Squeeze || 0,
                        Delivered: value?.Delivered || 0,
                        Pending1: value?.Pending1 || 0,
                        Pending2: value?.Pending2 || 0,
                        EstimateSell: value?.EstimateSell || yesterdayEntry?.EstimateSell,
                        Period: value?.Period || 0,
                        DownHole: value?.DownHole || 0,
                        YesterDay: (Number(twoDaysAgoEntry?.Difference || twoDaysAgoEntry?.OilBalance) + Number(yesterdayEntry?.Delivered)) || 0,
                        Sell: value?.Sell || 0,
                        TotalVolume: value?.TotalVolume || 0,
                        OilBalance: value?.OilBalance || 0,
                        Difference: value?.Difference || 0
                    };
                })
            : stock.map((row, index) => {
                const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === row?.ProductName) || { OilBalance: 0 };
                const twoDaysAgoEntry = Object.values(twoDaysAgoData || {}).find(entry => entry?.ProductName === row?.ProductName) || { OilBalance: 0 };
                return {
                    ProductName: row?.ProductName || "",
                    Capacity: row?.Capacity || 0,
                    Color: row?.Color || "",
                    Volume: (yesterdayEntry?.Difference || yesterdayEntry?.OilBalance) || 0,
                    Squeeze: squeeze,
                    Delivered: 0,
                    Pending1: 0,
                    Pending2: 0,
                    EstimateSell: values[index]?.EstimateSell !== undefined ? values[index]?.EstimateSell : yesterdayEntry?.EstimateSell || 0,
                    Period: 0,
                    DownHole: sharedDownHole || 0,
                    YesterDay: (Number(yesterdayEntry?.Difference || twoDaysAgoEntry?.OilBalance) + Number(yesterdayEntry?.Delivered)) || 0,
                    Sell: 0,
                    TotalVolume: 0,
                    OilBalance: 0,
                    Difference: 0
                };
            });

        updatedValues.forEach(row => {
            row.Period = calculatePeriod(row);
            row.Sell = calculateSell(row);
            row.DownHole = calculateDownHole(row);
            row.TotalVolume = calculateTotalVolume(row);
        });

        setValues(updatedValues);
    };

    useEffect(() => {
        updateValuesForDate();
    }, [selectedDate]);

    const deepEqual = (obj1, obj2) => {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    };



    // const handleEditVolume = () => {
    //     const isFirstStation = (gasStationOil?.[0]?.Name === gasStation?.Name) || false;
    //     const reportData = gasStation?.Report?.[formattedDate];

    //     let sharedDownHole = 0;

    //     if (isFirstStation && reportData) {
    //         const firstProductWithDownHole = Object.values(reportData).find(
    //             (entry) => entry?.DownHole
    //         );
    //         sharedDownHole = firstProductWithDownHole?.DownHole || 0;
    //     }

    //     if (reportData) {
    //         const updatedValues = Object.entries(reportData)
    //             .sort(([keyA, valueA], [keyB, valueB]) => {
    //                 const indexA = customOrder.indexOf(valueA?.ProductName);
    //                 const indexB = customOrder.indexOf(valueB?.ProductName);
    //                 return indexA - indexB;
    //             })
    //             .map(([, value], index) => {
    //                 const yesterdayEntry = Object.values(yesTerDayData || {}).find(
    //                     (entry) => entry?.ProductName === value?.ProductName
    //                 ) || { OilBalance: 0 };

    //                 const twoDaysAgoEntry = Object.values(twoDaysAgoData || {}).find(
    //                     (entry) => entry?.ProductName === value?.ProductName
    //                 ) || { OilBalance: 0 };

    //                 return {
    //                     ProductName: value?.ProductName || "",
    //                     Capacity: value?.Capacity || 0,
    //                     Color: value?.Color || "",
    //                     Volume: yesterdayEntry?.OilBalance || 0,
    //                     Squeeze: value?.Squeeze || 0,
    //                     Delivered: value?.Delivered || 0,
    //                     Pending1: value?.Pending1 || 0,
    //                     Pending2: value?.Pending2 || 0,
    //                     EstimateSell: value?.EstimateSell || 0,
    //                     Period: value?.Period || 0,
    //                     DownHole: value?.DownHole || 0,
    //                     YesterDay: (Number(twoDaysAgoEntry?.OilBalance) + Number(yesterdayEntry?.Delivered)) || 0,
    //                     Sell: value?.Sell || 0,
    //                     TotalVolume: value?.TotalVolume || 0,
    //                     OilBalance: value?.OilBalance || 0
    //                 };
    //             });

    //         setValues(updatedValues);
    //     }else{
    //         const updatedValues = stock.map((row) => {
    //             const yesterdayEntry = Object.values(yesTerDayData || {}).find(
    //                 (entry) => entry?.ProductName === row?.ProductName
    //             ) || { OilBalance: 0 };

    //             const twoDaysAgoEntry = Object.values(twoDaysAgoData || {}).find(
    //                 (entry) => entry?.ProductName === row?.ProductName
    //             ) || { OilBalance: 0 };

    //             console.log("yesterdayEntry : ",yesterdayEntry.OilBalance);
    //             console.log("twoDaysAgoEntry : ",twoDaysAgoEntry.OilBalance);

    //             const downHoleValue = downHole
    //                 ? (downHole.find((item) => item?.ProductName === row?.ProductName)?.DownHole || gasStation?.Products?.[row?.ProductName] || 0)
    //                 : (isFirstStation
    //                     ? gasStation?.Products?.[row?.ProductName] || 0
    //                     : sharedDownHole || 0);

    //             return {
    //                 ProductName: row?.ProductName || "",
    //                 Capacity: row?.Capacity || 0,
    //                 Color: row?.Color || "",
    //                 Volume: yesterdayEntry.OilBalance || 0,
    //                 Squeeze: squeeze,
    //                 Delivered: 0,
    //                 Pending1: 0,
    //                 Pending2: 0,
    //                 EstimateSell: 0,
    //                 Period: 0,
    //                 DownHole: downHoleValue,
    //                 YesterDay: (Number(twoDaysAgoEntry.OilBalance) + Number(yesterdayEntry.Delivered)) || 0,
    //                 Sell: 0,
    //                 TotalVolume: 0,
    //                 OilBalance: 0
    //             };
    //         });
    //         setValues(updatedValues);
    //     }
    //     setUpdate(false);
    // };    

    const handleInputChange = (index, field, value) => {
        console.log("Before update:", { index, field, value, currentValue: values[index]?.[field] });
        const updatedValues = [...values];

        // ตรวจสอบการเพิ่มข้อมูลครั้งแรก
        if (!updatedValues[index]) {
            updatedValues[index] = {
                ProductName: "",
                Capacity: 0,
                Color: "",
                Volume: 0,
                Squeeze: squeeze,
                Delivered: 0,
                Volume: 0,
                Pending1: 0,
                Pending2: 0,
                EstimateSell: 0,
                Period: 0,
                // ใช้ค่า DownHole เริ่มต้นจาก gasStation ถ้าค่าใน downHole ไม่มี
                DownHole: 0,
                YesterDay: 0,
                Sell: 0,
                TotalVolume: 0,
                OilBalance: 0
            };
        }

        // updatedValues[index][field] = value === "" ? 0 : parseFloat(value);

        // const newValue = value === "" || isNaN(value) ? 0 : parseFloat(value);
        updatedValues[index][field] = value;

        // ตรวจสอบว่า DownHole ถูกตั้งค่าแล้วหรือยัง
        const downHoleValue = downHole
            ? downHole.find(item => item?.ProductName === updatedValues[index]?.ProductName)?.DownHole
            : gasStation?.Products?.[updatedValues[index]?.ProductName] || 0;

        // กำหนด Pending2 ใหม่ตามค่า totalVolumes
        // const productName = updatedValues[index]?.ProductName;
        // updatedValues[index].Pending2 = totalVolumes[productName] ?? 0;

        updatedValues[index].Period = calculatePeriod(updatedValues[index]);
        updatedValues[index].DownHole = downHoleValue; // ใช้ค่าจากการตรวจสอบ
        updatedValues[index].Sell = calculateSell(updatedValues[index]);
        updatedValues[index].DownHole = calculateDownHole(updatedValues[index]);
        updatedValues[index].TotalVolume = calculateTotalVolume(updatedValues[index]);

        console.log("Updated value:", updatedValues[index]);

        setValues(prevValues => {
            const newValues = [...prevValues];
            newValues[index] = updatedValues[index];
            return newValues;
        });
    };

    // ฟังก์ชันคำนวณผลรวม
    const calculatePeriod = (row) => {
        const estimateSell = parseFloat(row.EstimateSell) || 0;
        const Delivered = parseFloat(row.Delivered) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const squeezeoil = parseFloat(row.Squeeze) || squeeze;
        const volume = parseFloat(row.Volume) || 0;

        console.log("ProductName:", row.ProductName, "Pending2:", Pending2);

        if (estimateSell === 0) {
            return ((volume + Delivered + Pending1 + Pending2) - squeezeoil).toFixed(2);
        } else {
            return (((volume + Delivered + Pending1 + Pending2) - squeezeoil) / estimateSell).toFixed(2);
        }
    };

    const calculateDownHole = (row) => {
        console.log("Before calculateDownHole:", row);

        const Delivered = parseFloat(row.Delivered) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const downHole = parseFloat(row.DownHole) || 0;
        const volume = parseFloat(row.Volume) || 0;

        // console.log("downHole :",downHole);
        // console.log("value :",value);
        // return ((value + Delivered + Pending1 + Pending2)).toFixed(2);

        console.log("ProductName:", row.ProductName, "Pending2:", Pending2);

        if (downHole !== 0) {
            return ((volume + Delivered + Pending1 + Pending2)).toFixed(2);
        }
        else {
            return ((volume + Delivered + Pending1 + Pending2 + downHole)).toFixed(2);
        }
    };

    const calculateSell = (row) => {
        const yesterDay = parseFloat(row.YesterDay) || 0;
        const volume = parseFloat(row.Volume) || 0;
        return ((yesterDay - volume)).toFixed(2); // ผลรวมในรูปทศนิยม 2 ตำแหน่ง
    };

    const calculateTotalVolume = (row) => {
        const downHole = parseFloat(row.DownHole) || 0;
        const estimateSell = parseFloat(row.EstimateSell) || 0;
        return ((downHole - estimateSell)).toFixed(2); // ผลรวมในรูปทศนิยม 2 ตำแหน่ง
    };

    console.log(values);

    const handleUpdate = () => {
        // อัพเดทค่า Driver1 และ Driver2 ใน values
        const updatedValues = values.map((item, index) => ({
            ...item,
            Driver1: driver1,
            Driver2: driver2
        }));

        database
            .ref("/depot/gasStations/" + (gasStation.id - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(updatedValues) // อัพเดท values ทั้งหมด
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data updated successfully");
                setUpdate(true);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    }

    console.log("driversData : ", driversData);
    console.log("truckDriver : ", truckDriver);
    // console.log("totalVolumes : ", totalVolumes);

    return (
        <React.Fragment>
            {/* <Grid container marginBottom={1}>
                <Grid item xs={6.5} sm={9} md={6} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="subtitle1" textAlign="right" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>{name + " / " + shortName}</Typography>

                    <TextField
                        fullWidth
                        variant="standard"
                        value={name + " / " + shortName}
                        InputProps={{
                            sx: {
                                textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                                color: "#000", // สีดำ
                                fontWeight: "bold", // ทำให้ตัวหนังสือหนา
                            },
                            inputProps: {
                                style: {
                                    textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                                    color: "#000", // สีดำเข้ม
                                    fontWeight: "bold", // ทำให้ตัวหนังสือหนา
                                    fontSize: "16px", // ปรับขนาดตัวอักษร
                                },
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={5.5} sm={3} md={2} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="subtitle1" textAlign="right" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>จำนวนหลุม</Typography>
                    <TextField
                        fullWidth
                        variant="standard"
                        value={number}
                        InputProps={{
                            sx: {
                                textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                                color: "#000", // สีดำ
                                fontWeight: "bold", // ทำให้ตัวหนังสือหนา
                            },
                            inputProps: {
                                style: {
                                    textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                                    color: "#000", // สีดำเข้ม
                                    fontWeight: "bold", // ทำให้ตัวหนังสือหนา
                                    fontSize: "16px", // ปรับขนาดตัวอักษร
                                },
                            },
                        }}
                        />
                </Grid>
                <Grid item xs={12} sm={4} md={3} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="subtitle1" textAlign="right" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>คลังสต็อก</Typography>
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
                <Grid item xs={12} sm={12} md={4} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="subtitle1" textAlign="right" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ที่อยู่</Typography>
                    <TextField 
                    fullWidth 
                    variant="standard" 
                    value={gasStation.Address} 
                    InputProps={{
                        sx: {
                            textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                            color: "#000", // สีดำ
                            fontWeight: "bold", // ทำให้ตัวหนังสือหนา
                        },
                        inputProps: {
                            style: {
                                textAlign: "center", // จัดข้อความให้อยู่กึ่งกลางแนวนอน
                                color: "#000", // สีดำเข้ม
                                fontWeight: "bold", // ทำให้ตัวหนังสือหนา
                                fontSize: "16px", // ปรับขนาดตัวอักษร
                            },
                        },
                    }}
                    />
                </Grid>
            </Grid> */}
            <Box textAlign="center"
                sx={{
                    backgroundColor:
                        gasStation.Stock === "แม่โจ้" ? "#92D050"
                            : gasStation.Stock === "สันกลาง" ? "#B1A0C7"
                                : gasStation.Stock === "สันทราย" ? "#B7DEE8"
                                    : gasStation.Stock === "บ้านโฮ่ง" ? "#FABF8F"
                                        : gasStation.Stock === "ป่าแดด" ? "#B1A0C7"
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
                <Table stickyHeader size="small" sx={{ width: 1200 }}>
                    <TableHead>
                        {/* <TableRow sx={{ height: 28 }}>
                            <TablecellHeader sx={{ padding: "2px 8px", lineHeight: 1 }} colSpan={11}>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    {driversData.map((row, index) => (
                                        <Paper
                                            key={index}
                                            component="form"
                                            sx={{
                                                width: "100%", // กำหนดความกว้างของ Paper
                                                height: "25px",
                                                marginRight: 1
                                            }}
                                        >
                                            <Grid container>
                                                <Grid item xs={5} sx={{ borderRight: "2px solid " + theme.palette.panda.light }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: 14, whiteSpace: "nowrap" }}>{row.driverName.split("นาย")[1]?.split(" ")[0]}</Typography>
                                                </Grid>
                                                <Grid item xs={3.5}>
                                                    <FormControl variant="standard" fullWidth>
                                                        <Select
                                                            labelId="demo-simple-select-standard-label"
                                                            id="demo-simple-select-standard"
                                                            value={row.product}
                                                            onChange={(e) => handleChange(index, "product", e.target.value)}
                                                            label="สินค้า"
                                                            fullWidth
                                                            sx={{
                                                                fontSize: "12px",
                                                                fontWeight: "bold",
                                                                backgroundColor: row.product === "G91" ? "#92D050" :
                                                                    row.product === "G95" ? "#FFC000" :
                                                                        row.product === "B7" ? "#FFFF99" :
                                                                            row.product === "B95" ? "#B7DEE8" :
                                                                                row.product === "B10" ? "#32CD32" :
                                                                                    row.product === "B20" ? "#228B22" :
                                                                                        row.product === "E20" ? "#C4BD97" :
                                                                                            row.product === "E85" ? "#0000FF" :
                                                                                                row.product === "PWD" ? "#F141D8" :
                                                                                                    "#FFFFFF"
                                                            }}
                                                        >
                                                            {
                                                                gasStation.Products &&
                                                                Object.entries(gasStation.Products)
                                                                    .sort(([keyA], [keyB]) => {
                                                                        // เปรียบเทียบ key ของแต่ละข้อมูลตามลำดับใน customOrder
                                                                        const indexA = customOrder.indexOf(keyA);
                                                                        const indexB = customOrder.indexOf(keyB);
                                                                        return indexA - indexB;  // เรียงลำดับจาก customOrder
                                                                    }).map(([key, value], index) => (
                                                                        stock.map((row, index) => (
                                                                            row.ProductName === key &&
                                                                            <MenuItem value={row.ProductName} sx={{ fontSize: "12px", fontWeight: "bold", minWidth: "50px", backgroundColor: row.Color }}>{row.ProductName}</MenuItem>
                                                                        ))
                                                                    ))
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={3.5}>
                                                    <TextField variant="standard" type="number" InputProps={{
                                                        sx: { fontSize: "12px", fontWeight: "bold", width: "50px", marginLeft: 0.5 } // ปรับขนาดตัวอักษรและ padding ภายในช่องป้อนข้อมูล
                                                    }} fullWidth value={row.volume} onChange={(e) => handleChange(index, "volume", e.target.value)} />
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </Box>
                            </TablecellHeader>
                        </TableRow> */}
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
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 300 }}>
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
                                                freeSolo // อนุญาตให้พิมพ์เองได้
                                                options={truckDriver.map((row) => row.Driver.split("นาย")[1]?.split(" ")[0])} // เอาเฉพาะชื่อ
                                                filterOptions={filterOptions} // ใช้ฟังก์ชันกรองตัวเลือก
                                                value={driver1}
                                                onChange={(event, newValue) => setDriver1(newValue)}
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
                                                freeSolo // อนุญาตให้พิมพ์เองได้
                                                options={truckDriver.map((row) => row.Driver.split("นาย")[1]?.split(" ")[0])} // เอาเฉพาะชื่อ
                                                filterOptions={filterOptions} // ใช้ฟังก์ชันกรองตัวเลือก
                                                value={driver2}
                                                onChange={(event, newValue) => setDriver2(newValue)}
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
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 100 }}>
                                ขาย/วัน
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
                            <TablecellHeader sx={{ backgroundColor: theme.palette.panda.main, width: 100 }} rowSpan={productsLength}>
                                {/* <Paper component="form" sx={{ height: "25px", paddingTop: -0.5 }}>
                                    {
                                        // update ?
                                        //     <IconButton color="inherit" size="small" fullWidth onClick={handleEditVolume}>
                                        //         <DriveFileRenameOutlineIcon fontSize="small" color="warning" />
                                        //     </IconButton>
                                        //     :
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
                                </Paper> */}
                            </TablecellHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            // update ?
                            //     gasStation.Report ?
                            //         (gasStation.Report[dayjs(selectedDate).format("DD-MM-YYYY")] ?
                            //             Object.entries(gasStation.Report[dayjs(selectedDate).format("DD-MM-YYYY")])
                            //                 .sort(([keyA, valueA], [keyB, valueB]) => {
                            //                     // เปรียบเทียบตาม customOrder
                            //                     const indexA = customOrder.indexOf(valueA?.ProductName);
                            //                     const indexB = customOrder.indexOf(valueB?.ProductName);
                            //                     return indexA - indexB;
                            //                 })
                            //                 .map(([key, value]) => (
                            //                     <TableRow key={key}>
                            //                         <TablecellHeader
                            //                             sx={{
                            //                                 backgroundColor: value.Color,
                            //                                 width: 50,
                            //                                 color: "black",
                            //                                 position: "sticky",
                            //                                 left: 0,
                            //                                 zIndex: 1, // กำหนด z-index เพื่อให้อยู่ด้านบน
                            //                             }}
                            //                         >
                            //                             {value.ProductName}
                            //                         </TablecellHeader>
                            //                         <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.Capacity)}</TableCell>
                            //                         <TableCell sx={{ textAlign: "center",color: value.Volume < 0 ? "#d50000" : "black", fontWeight: "bold", }}>{new Intl.NumberFormat("en-US").format(value.Volume)}</TableCell>
                            //                         <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.Squeeze)}</TableCell>
                            //                         <TableCell sx={{ textAlign: "center" }}>
                            //                             <Grid container>
                            //                                 <Grid item xs={4}>
                            //                                     {new Intl.NumberFormat("en-US").format(value.Delivered)}
                            //                                 </Grid>
                            //                                 <Grid item xs={0.5}>
                            //                                     |
                            //                                 </Grid>
                            //                                 <Grid item xs={3.5}>
                            //                                     {new Intl.NumberFormat("en-US").format(value.Pending1)}
                            //                                 </Grid>
                            //                                 <Grid item xs={0.5}>
                            //                                     |
                            //                                 </Grid>
                            //                                 <Grid item xs={3.5}>
                            //                                     {new Intl.NumberFormat("en-US").format(value.Pending2)}
                            //                                 </Grid>
                            //                             </Grid>
                            //                         </TableCell>
                            //                         <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(value.EstimateSell)}</TableCell>
                            //                         <TableCell sx={{ textAlign: "center",backgroundColor: "#81d4fa", color: value.Period < 0 ? "#d50000" : "black",fontWeight: "bold" }}>{new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value.Period)}</TableCell>
                            //                         <TableCell sx={{ textAlign: "center",backgroundColor: "#a5d6a7", color: (value.Capacity - value.DownHole) < 0 ? "#d50000" : "black",fontWeight: "bold" }}>{new Intl.NumberFormat("en-US").format(value.Capacity - value.DownHole)}</TableCell>
                            //                         <TableCell sx={{ textAlign: "center",color: value.YesterDay < 0 ? "#d50000" : "black", fontWeight: "bold", }}>{new Intl.NumberFormat("en-US").format(value.YesterDay)}</TableCell>
                            //                         <TableCell sx={{ textAlign: "center",color: value.Sell < 0 ? "#d50000" : "black", fontWeight: "bold", }}>{new Intl.NumberFormat("en-US").format(value.Sell)}</TableCell>
                            //                     </TableRow>
                            //                 ))
                            //             :
                            //             gasStation.Products &&
                            //             Object.entries(gasStation.Products)
                            //                 .sort(([keyA], [keyB]) => {
                            //                     // เปรียบเทียบ key ของแต่ละข้อมูลตามลำดับใน customOrder
                            //                     const indexA = customOrder.indexOf(keyA);
                            //                     const indexB = customOrder.indexOf(keyB);
                            //                     return indexA - indexB;  // เรียงลำดับจาก customOrder
                            //                 })
                            //                 .map(([key, value], index) => (
                            //                     <React.Fragment key={index}>
                            //                         {
                            //                             stock.map((row, index) => (
                            //                                 row.ProductName === key &&
                            //                                 <TableRow key={row.id}>
                            //                                     <TablecellHeader
                            //                                         sx={{
                            //                                             backgroundColor: row.Color,
                            //                                             width: 50,
                            //                                             color: "black",
                            //                                             position: "sticky",
                            //                                             left: 0,
                            //                                             zIndex: 1, // กำหนด z-index เพื่อให้อยู่ด้านบน 
                            //                                         }}
                            //                                     >
                            //                                         {row.ProductName}
                            //                                     </TablecellHeader>
                            //                                     <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.Capacity)}</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>
                            //                                         <Grid container>
                            //                                             <Grid item xs={4}>
                            //                                                 0
                            //                                             </Grid>
                            //                                             <Grid item xs={0.5}>
                            //                                                 |
                            //                                             </Grid>
                            //                                             <Grid item xs={3.5}>
                            //                                                 0
                            //                                             </Grid>
                            //                                             <Grid item xs={0.5}>
                            //                                                 |
                            //                                             </Grid>
                            //                                             <Grid item xs={3.5}>
                            //                                                 0
                            //                                             </Grid>
                            //                                         </Grid>
                            //                                     </TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center", backgroundColor: "#81d4fa",fontWeight: "bold" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center", backgroundColor: "#a5d6a7",fontWeight: "bold" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                 </TableRow>
                            //                             ))
                            //                         }
                            //                     </React.Fragment>
                            //                 ))
                            //         )
                            //         :
                            //         (
                            //             gasStation.Products &&
                            //             Object.entries(gasStation.Products)
                            //                 .sort(([keyA], [keyB]) => {
                            //                     // เปรียบเทียบ key ของแต่ละข้อมูลตามลำดับใน customOrder
                            //                     const indexA = customOrder.indexOf(keyA);
                            //                     const indexB = customOrder.indexOf(keyB);
                            //                     return indexA - indexB;  // เรียงลำดับจาก customOrder
                            //                 })
                            //                 .map(([key, value], index) => (
                            //                     <React.Fragment key={index}>
                            //                         {
                            //                             stock.map((row, index) => (
                            //                                 row.ProductName === key &&
                            //                                 <TableRow key={row.id}>
                            //                                     <TablecellHeader
                            //                                         sx={{
                            //                                             backgroundColor: row.Color,
                            //                                             width: 50,
                            //                                             color: "black",
                            //                                             position: "sticky",
                            //                                             left: 0,
                            //                                             zIndex: 1, // กำหนด z-index เพื่อให้อยู่ด้านบน 
                            //                                         }}
                            //                                     >
                            //                                         {row.ProductName}
                            //                                     </TablecellHeader>
                            //                                     <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.Capacity)}</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>
                            //                                         <Grid container>
                            //                                             <Grid item xs={4}>
                            //                                                 0
                            //                                             </Grid>
                            //                                             <Grid item xs={0.5}>
                            //                                                 |
                            //                                             </Grid>
                            //                                             <Grid item xs={3.5}>
                            //                                                 0
                            //                                             </Grid>
                            //                                             <Grid item xs={0.5}>
                            //                                                 |
                            //                                             </Grid>
                            //                                             <Grid item xs={3.5}>
                            //                                                 0
                            //                                             </Grid>
                            //                                         </Grid>
                            //                                     </TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center", backgroundColor: "#81d4fa",fontWeight: "bold" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center", backgroundColor: "#a5d6a7",fontWeight: "bold" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                     <TableCell sx={{ textAlign: "center" }}>0</TableCell>
                            //                                 </TableRow>
                            //                             ))
                            //                         }
                            //                     </React.Fragment>
                            //                 ))
                            //         )
                            //     :
                            gasStation.Products &&
                            Object.entries(gasStation.Products)
                                .sort(([keyA], [keyB]) => {
                                    // เปรียบเทียบ key ของแต่ละข้อมูลตามลำดับใน customOrder
                                    const indexA = customOrder.indexOf(keyA);
                                    const indexB = customOrder.indexOf(keyB);
                                    return indexA - indexB;  // เรียงลำดับจาก customOrder
                                }).map(([key, value], index) => (
                                    <React.Fragment key={index}>
                                        {
                                            stock.map((row, indexProduct) => (
                                                row.ProductName === key &&
                                                <TableRow key={row.ProductName}>
                                                    <TablecellHeader
                                                        sx={{
                                                            backgroundColor: values[index]?.Color || row.Color,
                                                            width: 50,
                                                            color: "black",
                                                            position: "sticky",
                                                            left: 0,
                                                            zIndex: 1, // กำหนด z-index เพื่อให้อยู่ด้านบน
                                                            borderBottom: "2px solid white" 
                                                        }}
                                                    >
                                                        {values[index]?.ProductName || row.ProductName}
                                                    </TablecellHeader>
                                                    <TableCell sx={{
                                                        textAlign: "center",
                                                        backgroundColor: values[index]?.Color
                                                            ? `${values[index].Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                            : `${row.Color}4A`,
                                                        fontWeight: "bold",
                                                        borderBottom: "2px solid white"
                                                    }}>{new Intl.NumberFormat("en-US").format(values[index]?.Capacity || row.Capacity)}</TableCell>
                                                    <TableCell sx={{
                                                        textAlign: "center", backgroundColor: values[index]?.Color
                                                            ? `${values[index].Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                            : `${row.Color}4A`, color: values[index]?.Volume < 0 ? "#d50000" : "black", 
                                                            fontWeight: "bold",
                                                            borderBottom: "2px solid white"
                                                    }}>{new Intl.NumberFormat("en-US").format(Math.round(values[index]?.Volume || 0))}</TableCell>
                                                    <TableCell sx={{
                                                        textAlign: "center", backgroundColor: values[index]?.Color
                                                            ? `${values[index].Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                            : `${row.Color}4A`,
                                                            borderBottom: "2px solid white"
                                                    }}>
                                                        <TextField
                                                            style={{ display: 'none' }}
                                                            inputProps={{ readOnly: true }}
                                                            value={values[index]?.Volume || 0}
                                                        />
                                                        <TextField
                                                            style={{ display: 'none' }}
                                                            inputProps={{ readOnly: true }}
                                                            value={values[index]?.Color || ""}
                                                        />
                                                        <Paper sx={{ width: "100%" }}>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '12px',
                                                                    },
                                                                }}
                                                                value={values[index]?.Squeeze || squeeze} // ถ้าค่าว่างให้เป็น 0
                                                                onChange={(e) => handleInputChange(index, "Squeeze", e.target.value)}
                                                                onFocus={(e) => {
                                                                    if (e.target.value === "0") {
                                                                        handleInputChange(index, "Squeeze", ""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (e.target.value === "") {
                                                                        handleInputChange(index, "Squeeze", 0); // ถ้าค่าว่างให้เป็น 0
                                                                    }
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
                                                        </Paper>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            gap: 1, // เพิ่มระยะห่างระหว่าง TextField
                                                            backgroundColor: values[index]?.Color
                                                                ? `${values[index].Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                                : `${row.Color}4A`,
                                                                borderBottom: "2px solid white"
                                                        }}
                                                    >
                                                        <Paper sx={{ width: "100%" }}>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                // InputProps={{
                                                                //     startAdornment: (
                                                                //         <InputAdornment position="start">สต็อก</InputAdornment>
                                                                //     ),
                                                                // }}
                                                                label="ลงจริงไปแล้ว"
                                                                value={values[index]?.Delivered === "" ? "" : values[index]?.Delivered || 0}
                                                                onChange={(e) => {
                                                                    let newValue = e.target.value;

                                                                    // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                                                    if (newValue === "") {
                                                                        handleInputChange(index, "Delivered", ""); // ให้เป็นค่าว่างชั่วคราว
                                                                    } else {
                                                                        handleInputChange(index, "Delivered", newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                                                    }
                                                                }}
                                                                onFocus={(e) => {
                                                                    if (e.target.value === "0") {
                                                                        handleInputChange(index, "Delivered", ""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (e.target.value === "") {
                                                                        handleInputChange(index, "Delivered", 0); // ถ้าค่าว่างให้เป็น 0
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    let currentValue = parseInt(values[index]?.Delivered || 0, 10);

                                                                    if (e.key === "ArrowUp") {
                                                                        e.preventDefault();
                                                                        handleInputChange(index, "Delivered", currentValue + 1000);
                                                                    } else if (e.key === "ArrowDown") {
                                                                        e.preventDefault();
                                                                        handleInputChange(index, "Delivered", Math.max(0, currentValue - 1000));
                                                                    }
                                                                }}
                                                                InputProps={{
                                                                    inputProps: {
                                                                        min: 0,
                                                                        step: 1000, // ทำให้ปุ่มลูกศรเพิ่มลดทีละ 1000
                                                                    },
                                                                }}
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '12px',
                                                                        fontWeight: "bold"
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
                                                        </Paper>
                                                        <Paper sx={{ width: "100%" }}>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                // InputProps={{
                                                                //     startAdornment: (
                                                                //         <InputAdornment position="start">สต็อก</InputAdornment>
                                                                //     ),
                                                                // }}
                                                                label={driver1}
                                                                value={values[index]?.Pending1 === "" ? "" : values[index]?.Pending1 || 0}
                                                                // onChange={(e) =>
                                                                //     handleInputChange(index, "Pending1", parseFloat(e.target.value) || 0)
                                                                // }
                                                                onChange={(e) => {
                                                                    let newValue = e.target.value;

                                                                    // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                                                    if (newValue === "") {
                                                                        handleInputChange(index, "Pending1", ""); // ให้เป็นค่าว่างชั่วคราว
                                                                    } else {
                                                                        handleInputChange(index, "Pending1", newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                                                    }
                                                                }}
                                                                onFocus={(e) => {
                                                                    if (e.target.value === "0") {
                                                                        handleInputChange(index, "Pending1", ""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (e.target.value === "") {
                                                                        handleInputChange(index, "Pending1", 0); // ถ้าค่าว่างให้เป็น 0
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    let currentValue = parseInt(values[index]?.Pending1 || 0, 10);

                                                                    if (e.key === "ArrowUp") {
                                                                        e.preventDefault();
                                                                        handleInputChange(index, "Pending1", currentValue + 1000);
                                                                    } else if (e.key === "ArrowDown") {
                                                                        e.preventDefault();
                                                                        handleInputChange(index, "Pending1", Math.max(0, currentValue - 1000));
                                                                    }
                                                                }}
                                                                InputProps={{
                                                                    inputProps: {
                                                                        min: 0,
                                                                        step: 1000, // ทำให้ปุ่มลูกศรเพิ่มลดทีละ 1000
                                                                    },
                                                                }}
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '12px',
                                                                        fontWeight: "bold"
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
                                                        </Paper>
                                                        <Paper sx={{ width: "100%" }}>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                // InputProps={{
                                                                //     startAdornment: (
                                                                //         <InputAdornment position="start">สต็อก</InputAdornment>
                                                                //     ),
                                                                // }}
                                                                label={driver2}
                                                                value={values[index]?.Pending2 === "" ? "" : values[index]?.Pending2 || 0}
                                                                onChange={(e) => {
                                                                    let newValue = e.target.value;

                                                                    // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                                                    if (newValue === "") {
                                                                        handleInputChange(index, "Pending2", ""); // ให้เป็นค่าว่างชั่วคราว
                                                                    } else {
                                                                        handleInputChange(index, "Pending2", newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                                                    }
                                                                }}
                                                                onFocus={(e) => {
                                                                    if (e.target.value === "0") {
                                                                        handleInputChange(index, "Pending2", ""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (e.target.value === "") {
                                                                        handleInputChange(index, "Pending2", 0); // ถ้าค่าว่างให้เป็น 0
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    let currentValue = parseInt(values[index]?.Pending2 || 0, 10);

                                                                    if (e.key === "ArrowUp") {
                                                                        e.preventDefault();
                                                                        handleInputChange(index, "Pending2", currentValue + 1000);
                                                                    } else if (e.key === "ArrowDown") {
                                                                        e.preventDefault();
                                                                        handleInputChange(index, "Pending2", Math.max(0, currentValue - 1000));
                                                                    }
                                                                }}
                                                                InputProps={{
                                                                    inputProps: {
                                                                        min: 0,
                                                                        step: 1000, // ทำให้ปุ่มลูกศรเพิ่มลดทีละ 1000
                                                                    },
                                                                }}
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '12px',
                                                                        fontWeight: "bold"
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
                                                        </Paper>
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        textAlign: "center", backgroundColor: values[index]?.Color
                                                            ? `${values[index].Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                            : `${row.Color}4A`,
                                                            borderBottom: "2px solid white"
                                                    }}>
                                                        <Paper sx={{ width: "100%" }}>
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
                                                                        fontWeight: "bold"
                                                                    },
                                                                }}
                                                                value={values[index]?.EstimateSell === "" ? "" : values[index]?.EstimateSell || 0}
                                                                onChange={(e) => {
                                                                    let newValue = e.target.value;

                                                                    // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                                                    if (newValue === "") {
                                                                        handleInputChange(index, "EstimateSell", ""); // ให้เป็นค่าว่างชั่วคราว
                                                                    } else {
                                                                        handleInputChange(index, "EstimateSell", newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                                                    }
                                                                }}
                                                                onFocus={(e) => {
                                                                    if (e.target.value === "0") {
                                                                        handleInputChange(index, "EstimateSell", ""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (e.target.value === "") {
                                                                        handleInputChange(index, "EstimateSell", 0); // ถ้าค่าว่างให้เป็น 0
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    let currentValue = parseInt(values[index]?.EstimateSell || 0, 10);

                                                                    if (e.key === "ArrowUp") {
                                                                        e.preventDefault();
                                                                        handleInputChange(index, "EstimateSell", currentValue + 1000);
                                                                    } else if (e.key === "ArrowDown") {
                                                                        e.preventDefault();
                                                                        handleInputChange(index, "EstimateSell", Math.max(0, currentValue - 1000));
                                                                    }
                                                                }}
                                                                InputProps={{
                                                                    inputProps: {
                                                                        min: 0,
                                                                        step: 1000, // ทำให้ปุ่มลูกศรเพิ่มลดทีละ 1000
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
                                                        </Paper>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center",borderBottom: "2px solid white", backgroundColor: "#92CDDC", color: values[index]?.Period < 0 ? "#d50000" : "black", fontWeight: "bold" }}>{new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(values[index]?.Period || (values[index]?.Volume - values[index]?.Squeeze))}</TableCell>
                                                    <TableCell sx={{ textAlign: "center",borderBottom: "2px solid white", backgroundColor: "#a5d6a7", color: values[index]?.Capacity < 0 ? "#d50000" : "black", fontWeight: "bold" }}>{new Intl.NumberFormat("en-US").format(Math.round((values[index]?.Capacity || 0)) - Math.round((values[index]?.DownHole || 0)))}</TableCell>
                                                    {/* <TableCell sx={{ textAlign: "center",color: values[index]?.YesterDay < 0 ? "#d50000" : "black", fontWeight: "bold" }}>
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
                                                        </TableCell> */}
                                                    <TableCell sx={{
                                                        textAlign: "center", backgroundColor: values[index]?.Color
                                                            ? `${values[index].Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                            : `${row.Color}4A`, color: values[index]?.YesterDay < 0 ? "#d50000" : "black",
                                                            fontWeight: "bold",
                                                            borderBottom: "2px solid white"
                                                    }}>{new Intl.NumberFormat("en-US").format(Math.round(values[index]?.YesterDay || 0))}</TableCell>
                                                    <TableCell sx={{
                                                        textAlign: "center", backgroundColor: values[index]?.Color
                                                            ? `${values[index].Color}4A` // ลดความเข้มของสีด้วย Transparency (B3 = 70% opacity)
                                                            : `${row.Color}4A`, color: values[index]?.Sell < 0 ? "#d50000" : "black",
                                                            fontWeight: "bold",
                                                            borderBottom: "2px solid white"
                                                    }}>{new Intl.NumberFormat("en-US").format(Math.round(values[index]?.Sell || 0))}</TableCell>
                                                    {/* ถ้าเป็นแถวแรก (index === 0) ให้เพิ่ม rowSpan, แถวอื่นไม่ต้องแสดง cell นี้ */}
                                                    {index === 0 ? (
                                                        <TableCell rowSpan={productsLength}>
                                                            <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.success.main }}>
                                                                <Button
                                                                    color="inherit"
                                                                    fullWidth
                                                                    onClick={handleUpdate}
                                                                    sx={{ flexDirection: "column", gap: 0.5 }}
                                                                >
                                                                    <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                                                    <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                                        บันทึก
                                                                    </Typography>
                                                                </Button>
                                                            </Paper>
                                                        </TableCell>
                                                    ) : null}
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
