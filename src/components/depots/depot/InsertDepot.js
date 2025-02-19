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
import "dayjs/locale/th";
import theme from "../../../theme/theme";
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";

const InsertDepot = (props) => {
    const { depot } = props;
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [name, setName] = React.useState("");
    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");

    const handlePost = () => {
        database
            .ref("depot/oils/")
            .child(depot)
            .update({
                id: depot + 1,
                Name: name,
                Address: 
                (no === "-" ? "-" : no)+
                (village === "-" ? "" : ","+village)+
                (subDistrict === "-" ? "" : ","+subDistrict)+
                (district === "-" ? "" : ","+district)+
                (province === "-" ? "" : ","+province)+
                (zipCode === "-" ? "" : ","+zipCode)
                ,
                lat: lat,
                lng: lng
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
                        <Grid item sm={1}  xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ชื่อคลัง</Typography>
                        </Grid>
                        <Grid item sm={11} xs={9}>
                            <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                        </Grid>
                        <Grid item sm={12} xs={12}>
                            <Divider>
                                <Chip label="ที่อยู่" size="small" />
                            </Divider>
                        </Grid>
                        <Grid item sm={1.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>บ้านเลขที่</Typography>
                        </Grid>
                        <Grid item sm={2.5} xs={9}>
                            <TextField size="small" fullWidth value={no} onChange={(e) => setNo(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>หมู่ที่</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={village} onChange={(e) => setVillage(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ตำบล</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>อำเภอ</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>จังหวัด</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} />
                        </Grid>
                        <Grid item sm={1.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>รหัสไปรณีย์</Typography>
                        </Grid>
                        <Grid item sm={2.5} xs={9}>
                            <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                        </Grid>
                        <Grid item sm={12} xs={12}>
                            <Divider>
                                <Chip label="พิกัด" size="small" />
                            </Divider>
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>lat</Typography>
                        </Grid>
                        <Grid item sm={5} xs={9}>
                            <TextField size="small" fullWidth value={lat} onChange={(e) => setLat(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>long</Typography>
                        </Grid>
                        <Grid item sm={5} xs={9}>
                            <TextField size="small" fullWidth value={lng} onChange={(e) => setLng(e.target.value)} />
                        </Grid>
                        <Grid item sm={12} xs={12} marginTop={1} marginBottom={1}>
                            <Divider sx={{ border: "1px solid "+theme.palette.panda.dark }}/>
                        </Grid>
                        <Grid item sm={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Button onClick={handlePost} variant="contained" color="success" sx={{ marginRight: 1 }}>บันทึก</Button>
                            <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                        </Grid>
        </React.Fragment>
    );
};

export default InsertDepot;
