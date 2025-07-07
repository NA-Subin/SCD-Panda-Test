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
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Popover,
    Select,
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
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import theme from "../../../theme/theme";
import { IconButtonError, IconButtonSuccess, IconButtonWarning, RateOils, TablecellHeader } from "../../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { useData } from "../../../server/path";
import { useBasicData } from "../../../server/provider/BasicDataProvider";

const UpdateRegHead = (props) => {
    const { truck } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // const { regtail, company, drivers } = useData();
    const { regtail, company, drivers } = useBasicData();
    const dataregtail = Object.values(regtail || {});
    const dataCompany = Object.values(company || {});
    const dataDrivers = Object.values(drivers || {});
    const registrationTail = dataregtail.filter(row => row.Status === "ยังไม่เชื่อมต่อทะเบียนหัว");
    const employees = dataDrivers.filter(row => row.Registration && row.Registration === "0:ไม่มี" && (row.TruckType === "รถใหญ่" || row.TruckType === "รถใหญ่/รถเล็ก"));

    const [companies, setCompanies] = React.useState(truck.Company);
    const [driver, setDriver] = React.useState(truck.Driver);
    const [regHead, setRegHead] = React.useState(truck.RegHead);
    const [regTail, setRegTail] = React.useState(() => {
        const match = dataregtail.find(item => item.id === Number(truck.RegTail.split(":")[0]));
        return match
            ? `${match.id}:${match.RegTail}:${match.Cap}:${match.Weight}`
            : "";
    });

    const [weight, setWeight] = React.useState(truck.Weight);
    const [insurance, setInsurance] = React.useState(truck.Insurance);
    const [vehicleRegistration, setVehicleRegistration] = React.useState(truck.VehicleRegistration);
    const [vehExpirationDate, setVehExpirationDate] = React.useState(truck.VehExpirationDate);
    console.log("regTail :", regTail);

    const handleUpdate = () => {
        database
            .ref("/truck/registration/")
            .child(truck.id - 1)
            .update({
                RegHead: regHead,
                RegTail: `${regTail.split(":")[0]}:${regTail.split(":")[1]}`,
                Weight: weight,
                TotalWeight: (parseFloat(weight) + parseFloat(regTail.split(":")[3])),
                Insurance: insurance,
                VehicleRegistration: vehicleRegistration || "-",
                VehExpirationDate: vehExpirationDate || "-",
                Company: companies,
                Driver: driver
            })
            .then(() => {
                const regK = regTail?.split?.(":")[0] || "0";
                const regT = truck?.RegTail?.split?.(":")[0] || "0";

                const regIdPart = regT === "0"
                    ? regK
                    : (regK === "0" ? regT : regT);
                const RegistrationId = Number(regIdPart);

                database
                    .ref("/truck/registrationTail/")
                    .child(RegistrationId - 1)
                    .update({
                        Status: regK !== "0" ? "เชื่อมทะเบียนหัวแล้ว" : "ยังไม่ได้เชื่อมต่อทะเบียนหัว",
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });

                const regId = driver?.split?.(":")[0] || "0";
                const drvId = truck?.Driver?.split?.(":")[0] || "0";

                const driverIdPart = drvId === "0"
                    ? regId
                    : (regId === "0" ? drvId : drvId);
                const driverId = Number(driverIdPart);
                database
                    .ref("/employee/drivers/")
                    .child(driverId - 1)
                    .update({
                        Registration: driver !== "0:ไม่มี" ? `${truck.id}:${regHead}` : driver,
                    })
                    .then(() => {
                        ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                        setUpdate(true)
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    console.log("registrationTail :", registrationTail);

    return (
        <React.Fragment>
            <IconButton size="small" sx={{ marginTop: -0.5, marginRight: 1 }} onClick={() => setOpen(truck.id)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            <Dialog
                open={open === truck.id ? true : false}
                keepMounted
                onClose={handleClose}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "800px", // กำหนดความกว้างแบบ Fixed
                        maxWidth: "none", // ปิดการปรับอัตโนมัติ
                    },
                }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดรถทะเบียน{regHead}</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Box marginTop={2} marginBottom={-2}>
                        <Typography variant="subtitle1" fontWeight="bold" color={theme.palette.warning.main} textAlign="right" marginRight={2} gutterBottom>{truck.RepairTruck.split(":")[1]}</Typography>
                    </Box>
                    <Paper
                        sx={{ p: 2, border: "1px solid" + theme.palette.grey[600], marginTop: 2, marginBottom: 2 }}
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อพนักงานขับรถ</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={driver.split(":")[1]} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={driver}
                                                onChange={(e) => setDriver(e.target.value)}
                                            >
                                                <MenuItem value={driver}>{driver.split(":")[1]}</MenuItem>
                                                {
                                                    driver !== "0:ไม่มี" &&
                                                    <MenuItem value={"0:ไม่มี"}>ไม่มี</MenuItem>
                                                }
                                                {
                                                    employees.map((row) => (
                                                        <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ทะเบียนหัว</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <TextField fullWidth variant="standard" value={regHead} disabled={update ? true : false} onChange={(e) => setRegHead(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ทะเบียนหาง</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={regTail.split(":")[1]} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                id="demo-simple-select"
                                                value={regTail}
                                                size="small"
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            '& .MuiMenuItem-root': {
                                                                fontSize: "14px", // ขนาดตัวอักษรในรายการเมนู
                                                            },
                                                        },
                                                    },
                                                }}
                                                sx={{ textAlign: "left", height: 25, fontSize: "14px" }}
                                                onChange={(e) => setRegTail(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={regTail}>
                                                    {regTail.split(":")[1]}
                                                </MenuItem>
                                                {
                                                    regTail !== "0:ไม่มี:0:0" &&
                                                    <MenuItem value={"0:ไม่มี:0:0"}>ไม่มี</MenuItem>
                                                }
                                                {
                                                    registrationTail.map((row) => (
                                                        <MenuItem value={`${row.id}:${row.RegTail}:${row.Cap}:${row.Weight}`}>{row.RegTail}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>น้ำหนัก</Typography>
                            </Grid>
                            <Grid item xs={1}>
                                <TextField fullWidth variant="standard" value={weight} disabled={update ? true : false} onChange={(e) => setWeight(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประกัน</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" value={insurance} disabled={update ? true : false} onChange={(e) => setInsurance(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>บริษัท</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={companies.split(":")[1]} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={companies}
                                                onChange={(e) => setCompanies(e.target.value)}
                                            >
                                                <MenuItem value={companies}>{companies.split(":")[1]}</MenuItem>
                                                {
                                                    dataCompany.map((truck) => (
                                                        (truck.id !== 1 && truck.id !== Number(companies.split(":")[0])) &&
                                                        <MenuItem value={`${truck.id}:${truck.Name}`}>{truck.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={2} display="flex">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" marginRight={0.5} gutterBottom>สถานะ:</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="green" textAlign="center" gutterBottom>{truck.Status}</Typography>
                            </Grid>
                            <Grid item xs={12} marginTop={2} marginBottom={2}>
                                <Divider>
                                    <Chip label="ใบจดทะเบียนรถ" size="small" />
                                </Divider>
                            </Grid>
                            <Grid item xs={2} >
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เลขจดทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth variant="standard" value={vehicleRegistration} disabled={update ? true : false} onChange={(e) => setVehicleRegistration(e.target.value)} />
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>วันหมดอายุ</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField variant="standard" fullWidth value={vehExpirationDate} disabled={update ? true : false} onChange={(e) => setVehExpirationDate(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รูปภาพใบจดทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={12} textAlign="center">
                                {
                                    truck.VehPicture === "ไม่มี" ?
                                        update ?
                                            <>
                                                <ImageNotSupportedIcon fontSize="small" color="disabled" />
                                                <Typography variant="subtitle2" fontWeight="bold" textAlign="center" gutterBottom>{truck.VehPicture}</Typography>
                                            </>
                                            :
                                            <Button variant="contained" color="info" >เพิ่มรูปภาพ</Button>
                                        :
                                        <>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รูปภาพใบจดทะเบียน</Typography>
                                            <Button variant="contained" color="warning" >แก้ไขรูปภาพ</Button>
                                        </>
                                }
                            </Grid>
                        </Grid>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {
                        update ?
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="info" sx={{ marginRight: 2 }}>พิมพ์</Button>
                                <Button variant="contained" color="warning" onClick={() => setUpdate(false)} >แก้ไข</Button>
                            </Box>
                            :
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="error" sx={{ marginRight: 2 }} onClick={() => setUpdate(true)} >ยกเลิก</Button>
                                <Button variant="contained" color="success" onClick={handleUpdate} >บันทึก</Button>
                            </Box>
                    }
                    {/* <Button onClick={handleClose} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button> */}
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateRegHead;
