import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { database } from "../../../server/firebase";
import { TablecellHeader } from "../../../theme/style";
import theme from "../../../theme/theme";
import UpdateSmallTruck from "./UpdateSmallTruck";

const SmallTruck = (props) => {
  const { truck,repair } = props;
  const [openTab, setOpenTab] = React.useState(true);
  const [openMenu, setOpenMenu] = React.useState(false);
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(false);
  const [companies,setCompanies] = React.useState(0);
  const [company,setCompany] = React.useState([]);
  const [employees, setEmployees] = React.useState(0);
  const [employee, setEmployee] = React.useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  const getCompany = async () => {
    database.ref("/company").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataCompany = [];
      for (let id in datas) {
          dataCompany.push({ id, ...datas[id] })
      }
      setCompany(dataCompany);
    });

    database.ref("/employee/driver").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataRegistration = [];
      for (let id in datas) {
          datas[id].Registration === "ไม่มี" && datas[id].TruckType === "รถเล็ก" &&
          dataRegistration.push({ id, ...datas[id] })
      }
      setEmployee(dataRegistration);
    });
  };

  useEffect(() => {
    getCompany();
  }, []);

  return (
    <React.Fragment>
      <Grid container spacing={3} marginTop={1} marginLeft={-7}>
        {openTab ? (
          <Grid item xs={1.5}>
            <Button
              variant="text"
              color="inherit"
              size="small"
              fullWidth
              endIcon={<ArrowCircleLeftIcon />}
              sx={{ marginBottom: 1.3, fontWeight: "bold", marginBottom: 1, marginTop: -1, backgroundColor: theme.palette.panda.contrastText }}
              onClick={toggleDrawer(false)}
            >
              ซ่อนแถบ
            </Button>
            <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 2, paddingTop: 3, backgroundColor: theme.palette.panda.main, color: "white", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>รถเล็ก</Typography>
              <Typography variant="h5" fontWeight="bold" marginTop={-2} gutterBottom>ทั้งหมด</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" marginTop={-2}>
                <Typography variant="h2" fontWeight="bold" gutterBottom>{truck.length}</Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>คัน</Typography>
              </Box>
            </Paper>
            {
              repair === 0 ?
              <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 2, paddingTop: 4, backgroundColor: theme.palette.success.main, color: "white", borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>ตรวจสภาพรถ</Typography>
            <Typography variant="h2" fontWeight="bold" marginTop={-3} gutterBottom>ครบ</Typography>
            <Typography variant="h5" fontWeight="bold" marginTop={-5} marginLeft={3} gutterBottom>ทุกคัน</Typography>
            </Paper>
            :
              <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 2, paddingTop: 3, backgroundColor: theme.palette.warning.main, color: "white", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>ไม่ตรวจ</Typography>
              <Typography variant="h5" fontWeight="bold" marginTop={-2} gutterBottom>สภาพรถ</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" marginTop={-2}>
                <Typography variant="h2" fontWeight="bold" gutterBottom>{repair}</Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>คัน</Typography>
              </Box>
            </Paper>
            }
          </Grid>
        ) : (
          <Grid item xs={0.7} sx={{ borderRight: "1px solid lightgray" }}>
            <Tooltip title="ซ่อนแถบ" placement="left">
              <Button
                variant="contained"
                color="inherit"
                startIcon={<ArrowCircleRightIcon />}
                sx={{ marginBottom: 1, marginTop: -3 }}
                onClick={toggleDrawer(true)}
              >
              </Button>
            </Tooltip>
          </Grid>
        )}
        <Grid item xs={openTab ? 10.5 : 11.3}>
            <Paper
              sx={{
                p: 2,
                height: "70vh"
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                รายละเอียดข้อมูลรถเล็กทั้งหมด
              </Typography>
              <Divider sx={{ marginBottom: 1 }} />
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
                        ทะเบียน
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        เลขจดทะเบียนรถ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        ตรวจสอบสภาพรถ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        สถานะ
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        บริษัท
                      </TablecellHeader>
                      <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                        พนักงานขับรถ
                      </TablecellHeader>
                      <TablecellHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      truck.map((row) => (
                        <TableRow>
                          <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Registration}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.VehicleRegistration}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.RepairTruck.split(":")[1]}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Status}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Company}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{row.Driver}</TableCell>
                          <UpdateSmallTruck key={row.id} truck={row}/>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default SmallTruck;
