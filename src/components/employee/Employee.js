import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
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
  MenuItem,
  Paper,
  Popover,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import HailIcon from "@mui/icons-material/Hail";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import InsertEmployee from "./InsertEmployee";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import UpdateDriver from "./UpdateDriver";
import UpdateEmployee from "./UpdateEmployee";
import { fetchRealtimeData } from "../../server/data";
import { useData } from "../../server/path";

const Employee = () => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(1);
  const [openOfficeDetail, setOpenOfficeDetail] = useState(false);

  const handleClose = () => {
    setOpenOfficeDetail(false);
  };

  const { officers, drivers, reghead, small } = useData();
          const dataofficers = Object.values(officers); 
          const datadrivers = Object.values(drivers); 
          const datareghead = Object.values(reghead);
          const datasmall = Object.values(small);

          const registrationHead = datareghead.filter(row => row.Driver && row.Driver === "ไม่มี");
          const registrationSmallTruck = datasmall.filter(row => row.Driver && row.Driver === "ไม่มี");

  const [openTab, setOpenTab] = React.useState(true);

  const isMobile = useMediaQuery("(max-width:1000px)");
  
    const shouldDrawerOpen = React.useMemo(() => {
      if (isMobile) {
        return !openTab; // ถ้าเป็นจอโทรศัพท์ ให้เปิด drawer เมื่อ open === false
      } else {
        return openTab; // ถ้าไม่ใช่จอโทรศัพท์ ให้เปิด drawer เมื่อ open === true
      }
    }, [openTab, isMobile]);
  
    const handleDrawerOpen = () => {
      if (isMobile) {
        // จอเท่ากับโทรศัพท์
        setOpenTab((prevOpen) => !prevOpen);
      } else {
        // จอไม่เท่ากับโทรศัพท์
        setOpenTab((prevOpen) => !prevOpen);
      }
    };

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  const [setting, setSetting] = React.useState("");
  const [truck, setTruck] = React.useState("0:ไม่มี:ไม่มี");

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

  const handlePost = () => {
    database
      .ref("/employee/drivers/")
      .child(setting.split(":")[0] - 1)
      .update({
        Registration: truck.split(":")[0]+":"+truck.split(":")[1],
      })
      .then(() => {
        if (truck.split(":")[2] === "รถใหญ่") {
          database
            .ref("/truck/registration/")
            .child(truck.split(":")[0] - 1)
            .update({
              Driver: setting.split(":")[1],
            })
            .then(() => {
              ShowSuccess("เปลี่ยนทะเบียนสำเร็จ");
              console.log("Data pushed successfully");
              setSetting("");
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error("Error pushing data:", error);
            });
        } else if (truck.split(":")[2] === "รถเล็ก") {
          database
            .ref("/truck/small/")
            .child(truck.split(":")[0] - 1)
            .update({
              Driver: setting.split(":")[1],
            })
            .then(() => {
              ShowSuccess("เปลี่ยนทะเบียนสำเร็จ");
              console.log("Data pushed successfully");
              setSetting("");
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error("Error pushing data:", error);
            });
        } else {

        }
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error("Error pushing data:", error);
      });
  }

  const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleChangeOpen1 = (event) => {
      setOpen(1);
      setPage(0);
    };

    const handleChangeOpen2 = (event) => {
      setOpen(2);
      setPage(0);
    };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        พนักงาน
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />
      <Grid container spacing={3} marginTop={1} marginLeft={-7} sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth-95) : windowWidth <= 600 ? (windowWidth) : (windowWidth-230) }}>
        <Grid item xs={12}>
          <InsertEmployee type={open} driver={datadrivers} officer={dataofficers} truck={registrationHead} smallTruck={registrationSmallTruck} />
        </Grid>
        {shouldDrawerOpen ? (
          <Grid item xs={1.5}>
            <Button
              variant="text"
              color="inherit"
              size="small"
              fullWidth
              sx={{ marginBottom: 1.3, fontWeight: "bold", marginBottom: 1, marginTop: -3 }}
              onClick={handleDrawerOpen}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} textAlign="center">
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประเภท</Typography>
                </Grid>
                <Grid item xs={12} marginTop={-6} textAlign="right">
                  <ArrowCircleLeftIcon />
                </Grid>
              </Grid>
            </Button>
            <Button
              variant="contained"
              color={open === 1 ? "info" : "inherit"}
              size="small"
              fullWidth
              onClick={handleChangeOpen1}
              sx={{ marginBottom: 1.3 }}
            >
              <Badge
                badgeContent={dataofficers.length}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 11, // ขนาดตัวเลขใน Badge
                    minWidth: 13, // ความกว้างของ Badge
                    height: 13, // ความสูงของ Badge
                    top: 12,
                    right: -16,
                    color: open === 1 ? theme.palette.info.main : "white",
                    backgroundColor:
                      open === 1 ? "white" : theme.palette.info.main,
                    fontWeight: "bold",
                  },
                  fontWeight: "bold",
                }}
              >
                พนักงานบริษัท
              </Badge>
            </Button>
            <Button
              variant="contained"
              color={open === 2 ? "info" : "inherit"}
              size="small"
              fullWidth
              onClick={handleChangeOpen2}
              sx={{ marginBottom: 1.3 }}
            >
              <Badge
                badgeContent={datadrivers.length}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 11, // ขนาดตัวเลขใน Badge
                    minWidth: 13, // ความกว้างของ Badge
                    height: 13, // ความสูงของ Badge
                    top: 12,
                    right: -16,
                    color: open === 2 ? theme.palette.info.main : "white",
                    backgroundColor:
                      open === 2 ? "white" : theme.palette.info.main,
                    fontWeight: "bold",
                  },
                  fontWeight: "bold",
                }}
              >
                พนักงานขับรถ
              </Badge>
            </Button>
            <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 10, paddingTop: 3, backgroundColor: theme.palette.panda.main, color: "white", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>พนักงาน</Typography>
              <Typography variant="h5" fontWeight="bold" marginTop={-2} gutterBottom>ทั้งหมด</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" marginTop={-2}>
                <Typography variant="h2" fontWeight="bold" gutterBottom>{dataofficers.length + datadrivers.length}</Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>คน</Typography>
              </Box>
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={0.7} sx={{ borderRight: "1px solid lightgray",
            "@media (max-width: 1100px)": {
              marginTop: -10, // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
            },
            "@media (max-width: 800px)": {
              marginTop: -15, // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
            },
            }}>
            <Tooltip title="แสดงเมนู" placement="left">
              <Button
                variant="contained"
                color="inherit"
                startIcon={<ArrowCircleRightIcon />}
                sx={{ marginBottom: 1, marginTop: -3 }}
                onClick={handleDrawerOpen}
              >
              </Button>
            </Tooltip>
            <Tooltip title="พนักงานบริษัท" placement="left">
              <Button
                variant="contained"
                color={open === 1 ? "info" : "inherit"}
                startIcon={<HailIcon />}
                sx={{ marginBottom: 1 }}
                onClick={() => setOpen(1)}
              >
                <Badge
                  badgeContent={dataofficers.length}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: 12, // ขนาดตัวเลขใน Badge
                      minWidth: 15, // ความกว้างของ Badge
                      height: 15, // ความสูงของ Badge
                      right: -16,
                      color: open === 1 ? theme.palette.panda.main : "white",
                      backgroundColor: open === 1 ? "white" : theme.palette.panda.main,
                      fontWeight: "bold",
                    },
                    fontWeight: "bold",
                  }}
                ></Badge>
              </Button>
            </Tooltip>
            <Tooltip title="พนักงานขับรถ" placement="left">
              <Button
                variant="contained"
                color={open === 2 ? "info" : "inherit"}
                startIcon={<AirlineSeatReclineNormalIcon />}
                sx={{ marginBottom: 1 }}
                onClick={() => setOpen(2)}
              >
                <Badge
                  badgeContent={datadrivers.length}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: 12, // ขนาดตัวเลขใน Badge
                      minWidth: 15, // ความกว้างของ Badge
                      height: 15, // ความสูงของ Badge
                      right: -16,
                      color: open === 2 ? theme.palette.panda.main : "white",
                      backgroundColor: open === 2 ? "white" : theme.palette.panda.main,
                      fontWeight: "bold",
                    },
                    fontWeight: "bold",
                  }}
                ></Badge>
              </Button>
            </Tooltip>
          </Grid>
        )}
        <Grid item xs={openTab ? 10.5 : 11.3}>
          {open === 1 ? (
            <Paper
              sx={{
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                รายชื่อพนักงานภายในบริษัท
              </Typography>
              <Divider sx={{ marginBottom: 1 }} />
              <TableContainer
                component={Paper}
                sx={{ marginTop: 2 }}
              >
                <Table stickyHeader size="small" sx={{ width: "1080px"}}>
                  <TableHead sx={{ height: "7vh" }}>
                    <TableRow>
                      <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                        ลำดับ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ชื่อ-สกุล
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        เบอร์โทร
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ตำแหน่ง
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        UserID
                      </TablecellHeader>
                      <TablecellHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      dataofficers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <TableRow>
                          <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.User}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Phone}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Position}</TableCell>
                          <UpdateEmployee key={row.id} row={row}/>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              {
  dataofficers.length <= 10 ? null :
    <TablePagination
      rowsPerPageOptions={[10, 25, 30]}
      component="div"
      count={dataofficers.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
      labelDisplayedRows={({ from, to, count }) =>
        `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
      }
      sx={{
        overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        '& .MuiTablePagination-toolbar': {
          backgroundColor: "lightgray",
          height: "20px", // กำหนดความสูงของ toolbar
          alignItems: "center",
          paddingY: 0, // ลด padding บนและล่างให้เป็น 0
          overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
          fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
        },
        '& .MuiTablePagination-select': {
          paddingY: 0,
          fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
        },
        '& .MuiTablePagination-actions': {
          '& button': {
            paddingY: 0,
            fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
          },
        },
        '& .MuiTablePagination-displayedRows': {
          fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
        },
        '& .MuiTablePagination-selectLabel': {
          fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
        }
      }}
    />
}

            </Paper>
          ) : open === 2 ? (
            <Paper
              sx={{
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                รายชื่อพนักงานขับรถ
              </Typography>
              <Divider sx={{ marginBottom: 1 }} />
              <TableContainer
                component={Paper}
                sx={{ marginTop: 2 }}
              >
                <Table stickyHeader size="small" sx={{ width: "1200px" }}>
                  <TableHead sx={{ height: "7vh" }}>
                    <TableRow>
                      <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                        ลำดับ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ชื่อ-สกุล
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        เลขประจำตัวผู้เสียภาษี
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ทะเบียนรถ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ประเภทรถ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        เลขที่ธนาคาร
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ธนาคาร
                      </TablecellHeader>
                      <TablecellHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      datadrivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <TableRow >
                          <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.IDCard}</TableCell>
                          {
                            setting === "" || setting === undefined ?
                              <TableCell sx={{ textAlign: "center" }}>
                                {row.Registration.split(":")[1]}
                                {row.Registration.split(":")[1] === "ไม่มี" ?
                                  <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setSetting(row.id + ":" + row.Name)}><SettingsIcon color="warning" fontSize="12px" /></IconButton>
                                  : ""}
                              </TableCell>
                              : setting.split(":")[1] === row.Name ?
                                <TableCell sx={{ textAlign: "center" }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                      <Paper
                                        component="form">
                                        <Select
                                          id="demo-simple-select"
                                          value={truck}
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
                                          onChange={(e) => setTruck(e.target.value)}
                                          fullWidth
                                        >
                                          <MenuItem value={"0:ไม่มี:ไม่มี"}>
                                            เลือกทะเบียน
                                          </MenuItem>
                                          {
                                            row.TruckType === "รถใหญ่" ?
                                              registrationHead.map((head) => (
                                                <MenuItem value={head.id + ":" + head.RegHead + ":รถใหญ่"}>{head.RegHead}</MenuItem>
                                              ))
                                              : row.TruckType === "รถเล็ก" ?
                                                registrationSmallTruck.map((small) => (
                                                  <MenuItem value={small.id + ":" + small.Registration + ":รถเล็ก"}>{small.Registration}</MenuItem>
                                                ))
                                                :
                                                <>
                                                  {registrationHead.map((head) => (
                                                    <MenuItem value={head.id + ":" + head.RegHead}>{head.RegHead}</MenuItem>
                                                  ))
                                                  }{
                                                    registrationSmallTruck.map((small) => (
                                                      <MenuItem value={small.id + ":" + small.Registration}>{small.Registration}</MenuItem>
                                                    ))}
                                                </>
                                          }
                                        </Select>
                                      </Paper>
                                    </Grid>
                                    <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                                      <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setSetting("")}>
                                        <CancelIcon color="error" fontSize="12px" />
                                      </IconButton>
                                      <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setSetting(handlePost)}>
                                        <CheckCircleIcon color="success" fontSize="12px" />
                                      </IconButton>
                                    </Grid>
                                  </Grid>
                                </TableCell>
                                :
                                <TableCell></TableCell>
                          }
                          <TableCell sx={{ textAlign: "center" }}>{row.TruckType}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.BankID}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.BankName}</TableCell>
                          <UpdateDriver key={row.id} driver={row} />
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              {
  datadrivers.length <= 10 ? null :
    <TablePagination
      rowsPerPageOptions={[10, 25, 30]}
      component="div"
      count={datadrivers.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
      labelDisplayedRows={({ from, to, count }) =>
        `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
      }
      sx={{
        overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        '& .MuiTablePagination-toolbar': {
          backgroundColor: "lightgray",
          height: "20px", // กำหนดความสูงของ toolbar
          alignItems: "center",
          paddingY: 0, // ลด padding บนและล่างให้เป็น 0
          overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
          fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
        },
        '& .MuiTablePagination-select': {
          paddingY: 0,
          fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
        },
        '& .MuiTablePagination-actions': {
          '& button': {
            paddingY: 0,
            fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
          },
        },
        '& .MuiTablePagination-displayedRows': {
          fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
        },
        '& .MuiTablePagination-selectLabel': {
          fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
        }
      }}
    />
}

            </Paper>
          ) : ""
          }
        </Grid>
      </Grid>
    </Container>
  );
};

export default Employee;
