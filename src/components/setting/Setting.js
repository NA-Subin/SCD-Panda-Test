import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BusinessIcon from '@mui/icons-material/Business';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import PasswordIcon from '@mui/icons-material/Password';
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
import React, { useEffect, useState } from "react";
import { database } from "../../server/firebase";
import { IconButtonError, TablecellHeader } from "../../theme/style";
import theme from "../../theme/theme";
import InsertCompany from "./InsertCompany";

const Setting = () => {
  const [open, setOpen] = useState(1);
  const [update,setUpdate] = React.useState(true);
  const [openDetailCompany, setOpenDetailCompany] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const [company, setCompany] = useState([]);

  const getCompany = async () => {
    database.ref("/company").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataCompany = [];
      const dataTranSport = [];
      for (let id in datas) {
        dataCompany.push({ id, ...datas[id] })
      }
      setCompany(dataCompany);
    });
  };
  useEffect(() => {
    getCompany();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        ตั้งค่า
      </Typography>
      <Divider />
      <Grid container spacing={2} marginTop={2}>
        <Grid item xs={3} />
        <Grid item xs={2}>
          <Button variant="contained" color={open === 1 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(1)}>
            <BusinessIcon fontSize="large" />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color={open === 2 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(2)}>
            <AssignmentIndIcon fontSize="large" />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color={open === 3 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(3)}>
            <PasswordIcon fontSize="large" />
          </Button>
        </Grid>
        <Grid item xs={3} />
        <Grid item xs={1} />
        <Grid item xs={10} marginTop={3}>
          {
            open === 1 ?
              <Paper sx={{ height: "70vh", borderRadius: 5, padding: 2 }}>
                <Typography variant="h6" fontWeight="bold" textAlign="center">บริษัท</Typography>
                <Divider sx={{ marginTop: 1 }} />
                <InsertCompany/>
                <TableContainer
                component={Paper}
                style={{ maxHeight: "90vh" }}
                sx={{ marginTop: 2 }}
              >
                <Table stickyHeader size="small">
                  <TableHead sx={{ height: "7vh" }}>
                    <TableRow>
                      <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                        ลำดับ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ชื่อบริษัท
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ที่อยู่
                      </TablecellHeader>
                      <TablecellHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      company.map((row) => (
                        <TableRow>
                          <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Address}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setOpenDetailCompany(row.id)}><InfoIcon color="info" fontSize="12px" /></IconButton>
                          </TableCell>
                          <Dialog
                            open={openDetailCompany === row.id ? true : false}
                            keepMounted
                            onClose={() => setOpenDetailCompany(false)}
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
                                  <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดบริษัท{row.Name}</Typography>
                                </Grid>
                                <Grid item xs={2} textAlign="right">
                                  <IconButtonError onClick={() => setOpenDetailCompany(false)}>
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
                                  <Grid item xs={11}>
                                    <TextField fullWidth variant="standard" value={row.Name} disabled={update ? true : false} />
                                  </Grid>
                                  <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>บ้านเลขที่</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={row.Address.split(",")[0] === undefined ? "-" : row.Address.split(",")[0]} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>หมู่ที่</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={row.Address.split(",")[1] === undefined ? "-" : row.Address.split(",")[1]} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ตำบล</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={row.Address.split(",")[2] === undefined ? "-" : row.Address.split(",")[2]} disabled={update ? true : false} />
                            </Grid>

                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold"gutterBottom>อำเภอ</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={row.Address.split(",")[3] === undefined ? "-" : row.Address.split(",")[3]} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>จังหวัด</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={row.Address.split(",")[4] === undefined ? "-" : row.Address.split(",")[4]} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รหัสไปรษณีย์</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" value={row.Address.split(",")[5] === undefined ? "-" : row.Address.split(",")[5]} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={2.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Latitude(ละติจูด)</Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                <TextField fullWidth variant="standard" value={row.Lat} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={2.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>Longitude(ลองจิจูด)</Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                <TextField fullWidth variant="standard" value={row.Lng} disabled={update ? true : false} />
                            </Grid>
                                </Grid>
                              </Paper>
                              {
                                update ?
                                  <Box marginBottom={2} textAlign="center">
                                    <Button variant="contained" color="info" sx={{ marginRight: 2 }}>พิมพ์</Button>
                                    <Button variant="contained" color="warning" onClick={() => setUpdate(false)} >แก้ไข</Button>
                                  </Box>
                                  :
                                  <Box marginBottom={2} textAlign="center">
                                    <Button variant="contained" color="success" sx={{ marginRight: 2 }} onClick={() => setUpdate(true)} >บันทึก</Button>
                                    <Button variant="contained" color="error" onClick={() => setUpdate(true)} >ยกเลิก</Button>
                                  </Box>
                              }
                            </DialogContent>
                            <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                              <Button onClick={() => setOpenDetailCompany(false)} variant="contained" color="success">บันทึก</Button>
                              <Button onClick={() => setOpenDetailCompany(false)} variant="contained" color="error">ยกเลิก</Button>
                            </DialogActions>
                          </Dialog>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              </Paper>
              : open === 2 ?
                <Paper sx={{ height: "70vh", borderRadius: 5, padding: 2 }}>
                  <Typography variant="h6" fontWeight="bold" textAlign="center">ข้อมูลส่วนตัว</Typography>
                  <Divider sx={{ marginTop: 1 }} />
                  <Grid container spacing={2} marginTop={2} padding={5}>
                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อ-สกุล</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom></Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ที่อยุ่</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom></Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Email</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom></Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เบอร์โทร</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom></Typography>
                    </Grid>
                  </Grid>
                </Paper>
                : open === 3 ?
                  <Paper sx={{ height: "70vh", borderRadius: 5, padding: 2 }}>
                    <Typography variant="h6" fontWeight="bold" textAlign="center">รหัสผ่าน</Typography>
                    <Divider sx={{ marginTop: 1 }} />
                    <Grid container spacing={2} marginTop={2} padding={5}>
                      <Grid item xs={3}>
                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านเดิม</Typography>
                      </Grid>
                      <Grid item xs={9}>
                        <Paper component="form" >
                          <TextField size="small" fullWidth />
                        </Paper>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านใหม่</Typography>
                      </Grid>
                      <Grid item xs={9}>
                        <Paper component="form" >
                          <TextField size="small" fullWidth />
                        </Paper>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านใหม่อีกครั้ง</Typography>
                      </Grid>
                      <Grid item xs={9}>
                        <Paper component="form" >
                          <TextField size="small" fullWidth />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} textAlign="center" marginTop={2}>
                        <Button variant="contained" color="warning" >แก้ไขรหัสผ่าน</Button>
                      </Grid>
                    </Grid>
                  </Paper>
                  : ""
          }
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </Container>
  );
};

export default Setting;
