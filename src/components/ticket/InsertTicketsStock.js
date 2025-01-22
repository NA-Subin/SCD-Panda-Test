import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
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

const InsertTicketsStock = () => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  
      const handleClickOpen = () => {
          setOpen(true);
      };
  
      const handleClose = () => {
          setOpen(false);
      };

  return (
    <React.Fragment>
      <Button variant="contained" color="info" startIcon={<BookOnlineIcon sx={{ transform: "rotate(90deg)" }}/>} onClick={handleClickOpen} fullWidth>เพิ่มตั๋วขายย่อย</Button>
      <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="xl"
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
                        <Grid item xs={3}>
                            <TextField size="small" fullWidth label="รหัสตั๋ว"/>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField size="small" fullWidth label="ชื่อตั๋ว"/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField size="small" fullWidth label="รหัสตั๋ว"/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField size="small" fullWidth label="รหัสตั๋ว"/>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handleClose} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
    </React.Fragment>
  );
};

export default InsertTicketsStock;
