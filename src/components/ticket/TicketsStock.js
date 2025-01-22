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
import EditNoteIcon from '@mui/icons-material/EditNote';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import InsertTicketsStock from "./InsertTicketsStock";

const TicketsStock = () => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(1);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <React.Fragment>
      <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light }}>
                <Grid container spacing={2}>
                    <Grid item xs={8}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตั๋วขายย่อย</Typography>
                    </Grid>
                    <Grid item xs={2} marginTop={-2}>
                        <InsertTicketsStock />
                    </Grid>
                    <Grid item xs={2} marginTop={-2}>
                        <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} fullWidth>แก้ไขตั๋วขายย่อย</Button>
                    </Grid>
                    <Grid item xs={12} marginTop={-2}>
                        <Divider />
                    </Grid>
                </Grid>
                <TableContainer
                                    component={Paper}
                                    style={{ maxHeight: "70vh" }}
                                    sx={{ marginTop: 2 }}
                                >
                                    <Table stickyHeader size="small">
                                        <TableHead sx={{ height: "7vh" }}>
                                            <TableRow>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                                    รหัสตั๋ว
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                    ชื่อตั๋ว
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                    คลังสต็อก
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ width: 50 }} />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            
                                        </TableBody>
                                    </Table>
                                </TableContainer>
            </Paper>
    </React.Fragment>
  );
};

export default TicketsStock;
