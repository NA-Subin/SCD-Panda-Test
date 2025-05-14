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
  InputAdornment,
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
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PasswordIcon from '@mui/icons-material/Password';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { IconButtonError, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import InsertCompany from "./InsertCompany";
import theme from "../../theme/theme";
import Cookies from 'js-cookie';
import { useData } from "../../server/path";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";


const Setting = () => {
  const [open, setOpen] = useState(1);
  const [update, setUpdate] = React.useState(true);
  const [openEditePassword, setOpenEditePassword] = React.useState(false);
  const [openDetailCompany, setOpenDetailCompany] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
    };

    window.addEventListener('resize', handleResize); // เพิ่ม event listener

    // ลบ event listener เมื่อ component ถูกทำลาย
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const userId = Cookies.get("sessionToken");
  const { company, officers } = useData();
  const companyDetail = Object.values(company || {});
  const officersDetail = Object.values(officers || {});

  const userDetail = officersDetail.find((row) => (row.id === Number(userId.split("$")[1])));

  console.log("User : ", userId);
  console.log("User Detail : ", userDetail);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordAgain, setNewPasswordAgian] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((show) => !show);

  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    console.log("Auth : ", auth);
    console.log("User : ", user);

    if (newPassword === newPasswordAgain) {
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        console.log("Credential : ", credential);

        try {
          // 1. ยืนยันตัวตนด้วยรหัสผ่านเดิม
          await reauthenticateWithCredential(user, credential);

          // 2. เปลี่ยนรหัสผ่านใหม่
          await updatePassword(user, newPassword);

          database
            .ref("employee/officers/")
            .child(userDetail.id - 1)
            .update({
              Password: newPassword,
            })
            .then(() => {
              console.log("Data pushed successfully");
              setOpenEditePassword(false)
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error("Error pushing data:", error);
            });

          ShowSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
        } catch (error) {
          ShowError(`เกิดข้อผิดพลาด: ${error.message}`);
        }
      } else {
        ShowError('ไม่พบผู้ใช้ที่เข้าสู่ระบบ');
      }
    } else {
      ShowError('กรูณากรอกรหัสผ่านใหม่อีกครั้ง');
    }


  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  // const [company, setCompany] = useState([]);

  // const getCompany = async () => {
  //   database.ref("/company").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataCompany = [];
  //     const dataTranSport = [];
  //     for (let id in datas) {
  //       dataCompany.push({ id, ...datas[id] })
  //     }
  //     setCompany(dataCompany);
  //   });
  // };
  // useEffect(() => {
  //   getCompany();
  // }, []);

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
      <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 130) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 280) }}>
      <Grid container spacing={2} marginTop={2}>
        <Grid item xs={12} sm={1.5} md={3} />
        <Grid item xs={6} sm={4.5} md={3}>
          <Button variant="contained" color={open === 1 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(1)}>
            <AssignmentIndIcon fontSize="large" />
          </Button>
        </Grid>
        <Grid item xs={6} sm={4.5} md={3}>
          <Button variant="contained" color={open === 2 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(2)}>
            <BusinessIcon fontSize="large" />
          </Button>
        </Grid>
        {/* <Grid item xs={4} sm={3} md={2}>
          <Button variant="contained" color={open === 3 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(3)}>
            <PasswordIcon fontSize="large" />
          </Button>
        </Grid> */}
        <Grid item xs={12} sm={1.5} md={3} />
        <Grid item xs={12} marginTop={3}>
          {
            open === 1 ?
              <Paper sx={{ height: "70vh", borderRadius: 5, padding: 2 }}>
                <Typography variant="h6" fontWeight="bold" textAlign="center">ข้อมูลส่วนตัว</Typography>
                <Divider sx={{ marginTop: 1 }} />
                <Grid container spacing={2} marginTop={2} padding={5}>
                  <Grid item xs={6}>
                    <Box display="flex" textAlign="center" justifyContent="left" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 2 }} gutterBottom>ชื่อ-สกุล : </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{userDetail.Name}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" textAlign="center" justifyContent="left" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 2 }} gutterBottom>ตำแหน่ง : </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{userDetail.Position}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" textAlign="center" justifyContent="left" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 2 }} gutterBottom>User : </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{userDetail.User}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" textAlign="center" justifyContent="left" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 2 }} gutterBottom>เบอร์โทร : </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{userDetail.Phone}</Typography>
                    </Box>
                  </Grid>
                  {
                    !openEditePassword &&
                    <Grid item xs={12}>
                      <Button variant="contained" color="warning" size="small" onClick={() => setOpenEditePassword(true)}>แก้ไขรหัสผ่าน</Button>
                    </Grid>
                  }
                  {
                    openEditePassword &&
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านเดิม</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Paper component="form" >
                            <TextField
                              size="small"
                              type={showPassword ? 'text' : 'password'}
                              fullWidth
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={handleTogglePassword}
                                      edge="end"
                                      aria-label="toggle password visibility"
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านใหม่</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Paper component="form" >
                            <TextField
                              size="small"
                              type={showPassword ? 'text' : 'password'}
                              fullWidth
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={handleTogglePassword}
                                      edge="end"
                                      aria-label="toggle password visibility"
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านใหม่อีกครั้ง</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Paper component="form" >
                            <TextField
                              size="small"
                              type={showPassword ? 'text' : 'password'}
                              fullWidth
                              value={newPasswordAgain}
                              onChange={(e) => setNewPasswordAgian(e.target.value)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={handleTogglePassword}
                                      edge="end"
                                      aria-label="toggle password visibility"
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={12} textAlign="center" marginTop={2}>
                          <Button variant="contained" color="error" size="small" sx={{ marginRight: 2 }} onClick={() => setOpenEditePassword(false)}>ยกเลิก</Button>
                          <Button variant="contained" color="success" size="small" onClick={handleChangePassword}>บันทึก</Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  }

                </Grid>
              </Paper>
              : open === 2 ?
                <Paper sx={{ height: "70vh", borderRadius: 5, padding: 2 }}>
                  <Typography variant="h6" fontWeight="bold" textAlign="center">บริษัท</Typography>
                  <Divider sx={{ marginTop: 1 }} />
                  <InsertCompany />
                  <TableContainer
                    component={Paper}
                    style={{ maxHeight: "90vh" }}
                    sx={{ marginTop: 2 }}
                  >
                    <Table stickyHeader size="small" sx={{ width: "1280px" }}>
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
                          companyDetail.map((row, index) => (
                            <TableRow>
                              <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
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
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>อำเภอ</Typography>
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
                : ""
          }
        </Grid>
      </Grid>
      </Box>
    </Container>
  );
};

export default Setting;
