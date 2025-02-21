import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { IconButtonError, TablecellHeader } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const InsertTicketsTransport = () => {
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = React.useState(false);
    const [check, setCheck] = React.useState(true);

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
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [ticket, setTicket] = React.useState(0);
    const [ticketsName, setTicketsName] = React.useState("");
    const [rate1, setRate1] = React.useState("");
    const [rate2, setRate2] = React.useState("");
    const [rate3, setRate3] = React.useState("");
    const [bill, setBill] = React.useState("");
    const [code, setCode] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [codeID, setCodeID] = React.useState("");

    const getTicket = async () => {
        database.ref("/customers/transports/").on("value", (snapshot) => {
            const datas = snapshot.val();
            if (datas === null || datas === undefined) {
                setTicket(0);
            } else {
                setTicket(datas.length);
            }
        });
    };

    useEffect(() => {
        getTicket();
    }, []);

    console.log("tickket:", ticket);

    const handlePost = () => {
                database
                    .ref("/customers/transports/")
                    .child(ticket)
                    .update({
                        id: ticket + 1,
                        TicketsName: ticketsName,
                        Status: "ตั๋ว/ผู้รับ",
                        Rate1: rate1,
                        Rate2: rate2,
                        Rate2: rate2,
                        Bill: bill,
                        Code: code,
                        companyName: companyName,
                        CodeID: codeID,
                        Address: 
                            (no === "-" ? "-" : no)+
                            (village === "-" ? "" : ","+village)+
                            (subDistrict === "-" ? "" : ","+subDistrict)+
                            (district === "-" ? "" : ","+district)+
                            (province === "-" ? "" : ","+province)+
                            (zipCode === "-" ? "" : ","+zipCode)
                        ,
                        lat: lat,
                        lng: lng,
                    })
                    .then(() => {
                        ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                        setTicketsName("")
                        setRate1("")
                        setRate2("")
                        setRate3("")
                        setBill("")
                        setCode("")
                        setCompanyName("")
                        setCodeID("")
                        setNo("")
                        setVillage("")
                        setSubDistrict("")
                        setDistrict("")
                        setProvince("")
                        setZipCode("")
                        setLat("")
                        setLng("")
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            };

    return (
        <React.Fragment>
            <Button variant="contained" color="info" startIcon={<BookOnlineIcon sx={{ transform: "rotate(90deg)" }} />} onClick={handleClickOpen} fullWidth>เพิ่มตั๋วขายส่ง</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มตั๋วขายส่ง</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2} marginBottom={2}>
                        <Grid item xs={7} display="flex" justifyContent="center" alignItems="center">
                            <Grid container spacing={2}>
                                <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ชื่อ</Typography>
                                    <TextField size="small" fullWidth value={ticketsName} onChange={(e) => setTicketsName(e.target.value)} />
                                </Grid>
                                <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>รอบการวางบิล</Typography>
                                    <TextField size="small" fullWidth value={bill} onChange={(e) => setBill(e.target.value)} />
                                </Grid>
                                <Grid item xs={12} display="flex" justifyContent="left" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" marginRight={1}>สถานะตั๋ว :</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                // checked={ticketChecked}
                                                // onChange={(e) => setTicketChecked(e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label="ตั๋ว"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                // checked={recipientChecked}
                                                // onChange={(e) => setRecipientChecked(e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label="ผู้รับ"
                                    />
                                </Grid>
                                {/* <Grid item xs={12} display="flex" justifyContent="left" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" marginRight={1}>ประเภทรถ :</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                // checked={ticketChecked}
                                                // onChange={(e) => setTicketChecked(e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label="รถใหญ่"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                // checked={recipientChecked}
                                                // onChange={(e) => setRecipientChecked(e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label="รถเล็ก"
                                    />
                                </Grid> */}
                            </Grid>
                        </Grid>
                        <Grid item xs={5}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังลำปาง"} value={rate1} onChange={(e) => setRate1(e.target.value)} />
                                </Grid>
                                <Grid item xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังพิจิตร"} value={rate2} onChange={(e) => setRate2(e.target.value)} />
                                </Grid>
                                <Grid item xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังสระบุรี/บางปะอิน/IR"} value={rate3} onChange={(e) => setRate3(e.target.value)} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ใบวางบิล/ใบแจ้งหนี้</Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={3} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>รหัส</Typography>
                            <TextField size="small" fullWidth value={code} onChange={(e) => setCode(e.target.value)} />
                        </Grid>
                        <Grid item xs={9} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ชื่อบริษัท</Typography>
                            <TextField size="small" fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>บ้านเลขที่</Typography>
                            <TextField size="small" fullWidth value={no} onChange={(e) => setNo(e.target.value)} />
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ตำบล</Typography>
                            <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} />
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>อำเภอ</Typography>
                            <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} />
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>จังหวัด</Typography>
                            <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} />
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>รหัสไปรณีย์</Typography>
                            <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>เลขผู้เสียภาษี</Typography>
                            <TextField size="small" fullWidth value={codeID} onChange={(e) => setCodeID(e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handlePost} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default InsertTicketsTransport;
