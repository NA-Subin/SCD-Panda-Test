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
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { database } from "../../server/firebase";
import InsertEmployee from "./InsertEmployee";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const UpdateDriver = (props) => {
    const { driver } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const [openTab, setOpenTab] = React.useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const [name, setName] = React.useState(driver.Name);
    const [idCard, setIDCard] = React.useState(driver.IDCard);
    const [registration, setRegistration] = React.useState(driver.Registration);
    const [bank, setBank] = React.useState(driver.BankName);
    const [bankID, setBankID] = React.useState(driver.BankID);
    const [salary, setSalary] = React.useState(driver.Salary);
    const [tripCost, setTripCost] = React.useState(driver.TripCost);
    const [pointCost, setPointCost] = React.useState(driver.PointCost);
    const [security, setSecurity] = React.useState(driver.Security);
    const [payment, setPayment] = React.useState("");
    const [deposit, setDeposit] = React.useState(driver.Deposit);
    const [loan, setLoan] = React.useState(driver.Loan);
    const [truckType, setTruckType] = React.useState(driver.TruckType);
    const [license, setLicense] = React.useState(driver.DrivingLicense);
    const [expiration, setExpiration] = React.useState(driver.DrivingLicenseExpiration);
    const [picture, setPicture] = React.useState(driver.DrivingLicensePicture);
    const [phone, setPhone] =  React.useState(driver.Phone);
    const [user,setUser] = React.useState(driver.User);
    const [registrationHead, setRegistrationHead] = React.useState([]);
    const [registrationSmallTruck, setRegistrationSmallTruck] = React.useState([]);

    const handleDateChange = (newDate) => {
        setExpiration(newDate);
      };

    console.log("show date : "+dayjs(expiration).format("DD/MM/YYYY"));

    const getRegitration = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegistration = [];
            for (let id in datas) {
                if(datas[id].Driver === "ไม่มี"){
                    dataRegistration.push({ id, ...datas[id] })
                }
            }
            setRegistrationHead(dataRegistration);
        });

        database.ref("/truck/small/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegistration = [];
            for (let id in datas) {
                if(datas[id].Driver === "ไม่มี"){
                    dataRegistration.push({ id, ...datas[id] })
                }
            }
            setRegistrationSmallTruck(dataRegistration);
        });
    };

    useEffect(() => {
        getRegitration();
    }, []);

    const handleUpdate = () => {
        database
            .ref("/employee/drivers/")
            .child(driver.id - 1)
            .update({
                Name: name,
                IDCard: idCard,
                Registration: registration,
                BankName: bank,
                BankID: bankID,
                Salary: salary,
                TripCost: tripCost,
                PointCost: pointCost,
                Security: security,
                Deposit: deposit,
                Loan: loan,
                TruckType: truckType,
                DrivingLicense: license,
                DrivingLicenseExpiration: expiration === "ไม่มี" ? "ไม่มี" : dayjs(expiration).format("DD/MM/YYYY"),
                DrivingLicensePicture: picture
            })
            .then(() => {
                if(truckType === "รถใหญ่"){
                    database
                    .ref("/truck/registration/")
                    .child(driver.Registration.split(":")[0] - 1)
                    .update({
                        Driver: registration.split(":")[1] === "ไม่มี" ? "ไม่มี" : name,
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
                }else if(truckType === "รถเล็ก"){
                    database
                    .ref("/truck/registrationTail/")
                    .child(driver.Registration.split(":")[0] - 1)
                    .update({
                        Driver: registration.split(":")[1] === "ไม่มี" ? "ไม่มี" : name,
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
                }else{

                }
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }


    return (
        <React.Fragment>
            <TableCell sx={{ textAlign: "center" }}>
                <IconButton sx={{ marginTop: -0.5 }} onClick={() => setOpen(driver.id)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell>
            <Dialog
                open={open === driver.id ? true : false}
                keepMounted
                onClose={() => setOpen(false)}
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
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดพนักงานชื่อ{name}</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={() => setOpen(false)}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Paper
                        sx={{ p: 2, border: "1px solid" + theme.palette.grey[600], marginTop: 2, marginBottom: 2 }}
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อ-สกุล</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={name} disabled={update ? true : false} onChange={(e) => setName(e.target.value)} />
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>บัตรประชาชน</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth variant="standard" value={idCard} disabled={update ? true : false} onChange={(e) => setIDCard(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ทะเบียนรถ</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={registration.split(":")[1]} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={registration}
                                                onChange={(e) => setRegistration(e.target.value)}
                                            >
                                                <MenuItem value={registration}>{registration.split(":")[1]}</MenuItem>
                                                <MenuItem value={"0:ไม่มี"}>ไม่มี</MenuItem>
                                                {
                                                    truckType === "รถใหญ่" ?
                                                        registrationHead.map((row) => (
                                                            <MenuItem value={row.id+":"+row.RegHead}>{row.RegHead}</MenuItem>
                                                        ))
                                                        :
                                                        truckType === "รถเล็ก" ?
                                                            registrationSmallTruck.map((row) => (
                                                                <MenuItem value={row.id+":"+row.Registration}>{row.Registration}</MenuItem>
                                                            ))
                                                            : ""
                                                }
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ประเภทรถ</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={truckType} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={truckType}
                                                onChange={(e) => setTruckType(e.target.value)}
                                            >
                                                <MenuItem value={truckType}>{truckType}</MenuItem>
                                                <MenuItem value={"รถใหญ่"}>รถใหญ่</MenuItem>
                                                <MenuItem value={"รถเล็ก"}>รถเล็ก</MenuItem>
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ค่าเที่ยว</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" type="number" value={tripCost} disabled={update ? true : false} onChange={(e) => setTripCost(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ค่าจุด</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" type="number" value={pointCost} disabled={update ? true : false} onChange={(e) => setPointCost(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>User</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" type="number" value={user} disabled/>
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" whiteSpace="nowrap" gutterBottom>เบอร์โทร</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" type="number" value={phone} disabled={update ? true : false} onChange={(e) => setPhone(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} marginTop={2} marginBottom={2}>
                                <Divider>
                                    <Chip label="ข้อมูลการเงินของพนักงานขับรถ" size="small" />
                                </Divider>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เงินเดือน</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" type="number" value={salary} disabled={update ? true : false} onChange={(e) => setSalary(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เลขที่บัญชี</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={bankID} disabled={update ? true : false} onChange={(e) => setBankID(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ชื่อบัญชี</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={bank} disabled={update ? true : false} onChange={(e) => setBank(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>สวัสดิการ</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={security} disabled={update ? true : false} onChange={(e) => setSecurity(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เงินประกัน</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth type="number" variant="standard" value={deposit} disabled={update ? true : false} onChange={(e) => setDeposit(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เงินกู้ยืม</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth type="number" variant="standard" value={loan} disabled={update ? true : false} onChange={(e) => setLoan(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} marginTop={2} marginBottom={2}>
                                <Divider>
                                    <Chip label="ใบอนุญาตการขับขี่รถ" size="small" />
                                </Divider>
                            </Grid>
                            <Grid item xs={2} >
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เลขจดทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth variant="standard" value={license} disabled={update ? true : false} onChange={(e) => setLicense(e.target.value)} />
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>วันหมดอายุ</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {
                                    update ?
                                    <TextField fullWidth variant="standard" value={expiration} disabled />
                                    :
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        openTo="day"
                                        views={["year", "month", "day"]}
                                        value={dayjs(expiration === "ไม่มี" ? new Date : expiration ).locale("th")}
                                        format="DD/MM/YYYY"
                                        slotProps={{ textField: { size: "small",variant:"standard" } }}
                                        sx={{ backgroundColor: theme.palette.primary.contrastText }}
                                        onChange={handleDateChange}
                                    />
                                </LocalizationProvider>
                                }
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รูปภาพใบจดทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={12} textAlign="center">
                                {
                                    picture === "ไม่มี" ?
                                        update ?
                                            <>
                                                <ImageNotSupportedIcon fontSize="small" color="disabled" />
                                                <Typography variant="subtitle2" fontWeight="bold" textAlign="center" gutterBottom>{picture}</Typography>
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
                    {
                        update ?
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="info" sx={{ marginRight: 2 }}>พิมพ์</Button>
                            </Box>
                            :
                            ""
                    }
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    {
                        update ? 
                        <>
                        <Button onClick={() => setOpen(false)} variant="contained" color="error">ยกเลิก</Button>
                        <Button onClick={() => setUpdate(false)} variant="contained" color="warning">แก้ไข</Button>
                        </>
                        : 
                        <>
                        <Button onClick={() => setUpdate(true)} variant="contained" color="error">ยกเลิก</Button>
                        <Button onClick={handleUpdate} variant="contained" color="success">บันทึก</Button>
                        </>
                        
                    }
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateDriver;
