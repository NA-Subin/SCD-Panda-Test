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

const InsertTicketsStock = () => {
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
        const [lat,setLat] = React.useState("");
        const [lng,setLng] = React.useState("");
        const [zipCode, setZipCode] = React.useState("");
        const [ticket,setTicket] = React.useState(0);
        const [ticketsCode,setTicketsCode] = React.useState("");
        const [ticketsName,setTicketsName] = React.useState("");
        const [rate,setRate] = React.useState("");
        const [bill,setBill] = React.useState("");
        const [code,setCode] = React.useState("");
        const [companyName,setCompanyName] = React.useState("");
        const [codeID,setCodeID] = React.useState("");
    
        const getTicket = async () => {
                database.ref("/ticket-stock/").on("value", (snapshot) => {
                    const datas = snapshot.val();
                    if(datas === null || datas === undefined){
                        setTicket(0);
                    }else{
                        setTicket(datas.length); 
                    }
                });
            };
        
            useEffect(() => {
                getTicket();
            }, []);

        console.log("tickket:",ticket);

    const handlePost = () => {
            database
                .ref("/ticket-stock")
                .child(ticket)
                .update({
                    id: ticket + 1,
                    TicketsCode: ticketsCode,
                    TicketsName: ticketsName,
                    Rate: rate,
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
                    setTicketsCode("")
                    setTicketsName("")
                    setRate("")
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
      <Button variant="contained" color="info" startIcon={<BookOnlineIcon sx={{ transform: "rotate(90deg)" }}/>} onClick={handleClickOpen} fullWidth>เพิ่มตั๋วขายย่อย</Button>
      <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มตั๋วขายย่อย</Typography>
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
                        <Grid item xs={2.5} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>รหัสตั๋ว</Typography>
                            <TextField size="small" fullWidth value={ticketsCode} onChange={(e) => setTicketsCode(e.target.value)} />
                        </Grid>
                        <Grid item xs={9.5} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>ชื่อตั๋ว</Typography>
                        <TextField size="small" fullWidth  value={ticketsName} onChange={(e) => setTicketsName(e.target.value)}/>
                        </Grid>
                        <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                        <Checkbox sx={{ marginRight: 1 }} onChange={() => setCheck(!check)}/>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>Rate ค่าขนส่ง</Typography>
                        <TextField size="small" fullWidth disabled={check ? true : false } sx={{ backgroundColor: check ? "lightgray" : "white" }}  value={rate} onChange={(e) => setRate(e.target.value)}/>
                        </Grid>
                        <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>รอบการวางบิล</Typography>
                        <TextField size="small" fullWidth  value={bill} onChange={(e) => setBill(e.target.value)}/>
                        </Grid>
                        <Grid  item xs={12}>
                            <Divider>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap'}} gutterBottom>ใบวางบิล/ใบแจ้งหนี้</Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>รหัส</Typography>
                        <TextField size="small" fullWidth  value={code} onChange={(e) => setCode(e.target.value)}/>
                        </Grid>
                        <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>ชื่อบริษัท</Typography>
                        <TextField size="small" fullWidth  value={companyName} onChange={(e) => setCompanyName(e.target.value)}/>
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>บ้านเลขที่</Typography>
                        <TextField size="small" fullWidth  value={no} onChange={(e) => setNo(e.target.value)}/>
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>ตำบล</Typography>
                        <TextField size="small" fullWidth  value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)}/>
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>อำเภอ</Typography>
                        <TextField size="small" fullWidth  value={district} onChange={(e) => setDistrict(e.target.value)}/>
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>จังหวัด</Typography>
                        <TextField size="small" fullWidth  value={province} onChange={(e) => setProvince(e.target.value)}/>
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>รหัสไปรณีย์</Typography>
                        <TextField size="small" fullWidth  value={zipCode} onChange={(e) => setZipCode(e.target.value)}/>
                        </Grid>
                        <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap',marginRight: 1, marginTop:1 }} gutterBottom>เลขผู้เสียภาษี</Typography>
                        <TextField size="small" fullWidth  value={codeID} onChange={(e) => setCodeID(e.target.value)}/>
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

export default InsertTicketsStock;
