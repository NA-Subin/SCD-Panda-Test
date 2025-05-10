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

const UpdateSmallTruck = (props) => {
    const { truck } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [openTab, setOpenTab] = React.useState(true);

    const { company, drivers } = useData();
    const dataCompany = Object.values(company);
    const dataDrivers = Object.values(drivers);
    const employees = dataDrivers.filter(row => row.Registration && row.Registration === "0:ไม่มี" && row.TruckType === "รถเล็ก");

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const [companies, setCompanies] = React.useState(truck.Company);
    const [driver, setDriver] = React.useState(truck.Driver);
    const [registration, setRegistration] = React.useState(truck.RegHead);
    const [weight, setWeight] = React.useState(truck.Weight);
    const [insurance, setInsurance] = React.useState(truck.Insurance);
    const [vehicleRegistration, setVehicleRegistration] = React.useState(truck.VehicleRegistration);
    const [vehExpirationDate, setVehExpirationDate] = React.useState(truck.VehExpirationDate);

    const handleUpdate = () => {
        database
            .ref("/truck/small/")
            .child(truck.id - 1)
            .update({
                RegHead: registration,
                Weight: weight,
                Insurance: insurance,
                VehicleRegistration: vehicleRegistration,
                VehExpirationDate: vehExpirationDate,
                Company: companies,
                Driver: driver
            })
            .then(() => {
                database
                    .ref("/employee/drivers/")
                    .child(driver.split(":")[0] - 1)
                    .update({
                        Registration: registration,
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

    return (
        <React.Fragment>
            <TableCell sx={{ textAlign: "center" }}>
                <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setOpen(registration)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell>
            <Dialog
                open={open === registration ? true : false}
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
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดรถทะเบียน{registration}</Typography>
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
                                        <TextField fullWidth variant="standard" value={driver === "ไม่มี" ? driver : driver.split(":")[1]} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={driver}
                                                onChange={(e) => setDriver(e.target.value)}
                                            >
                                                <MenuItem value={driver}>{driver === "ไม่มี" ? driver : driver.split(":")[1]}</MenuItem>
                                                {
                                                    driver !== "ไม่มี" &
                                                    <MenuItem value={"ไม่มี"}>ไม่มี</MenuItem>
                                                }
                                                {
                                                    employees.map((row) => (
                                                        row.id !== driver.split(":")[0] &&
                                                        <MenuItem value={row.id + ":" + row.Name}>{row.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <TextField fullWidth variant="standard" value={registration} onChange={(e) => setRegistration(e.target.value)} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>น้ำหนัก</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" value={weight} onChange={(e) => setWeight(e.target.value)} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประกัน</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" value={insurance} onChange={((e) => setInsurance(e.target.value))} disabled={update ? true : false} />
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
                <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    {
                        update ?
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="warning" onClick={() => setUpdate(false)}  sx={{ marginRight: 2 }}>แก้ไข</Button>
                                <Button variant="contained" color="info">พิมพ์</Button>
                            </Box>
                            :
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="error" onClick={() => setUpdate(true)} sx={{ marginRight: 2 }}>ยกเลิก</Button>
                                <Button variant="contained" color="success" onClick={handleUpdate} >บันทึก</Button>
                            </Box>
                    }
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateSmallTruck;
