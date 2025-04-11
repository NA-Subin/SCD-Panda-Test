import React, { useContext, useEffect, useMemo, useState } from "react";
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
  InputLabel,
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
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import theme from "../../../theme/theme";
import { IconButtonError, IconButtonSuccess, IconButtonWarning, RateOils, TablecellHeader } from "../../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import UpdateRegHead from "./UpdateRegHead";
import TruckRepair from "./TruckRepair";
import { fetchRealtimeData } from "../../../server/data";
import { useData } from "../../../server/path";

const RegHeadDetail = (props) => {
  const { truck } = props;

  const [openTab, setOpenTab] = React.useState(true);
  const [setting, setSetting] = React.useState("0:0");
  const [tail, setTail] = React.useState("ไม่มี:::");

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  // const [registrationTail, setRegistrationTail] = React.useState([]);
  const [regTailLength, setRegTailLength] = React.useState("");

  // const getRegitrationTail = async () => {
  //   database.ref("/truck/registrationTail/").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataRegistrationTail = [];
  //     for (let id in datas) {
  //       if(datas[id].Status === "ยังไม่เชื่อมต่อทะเบียนหัว" && datas[id].Company === truck.Company){
  //         dataRegistrationTail.push({ id, ...datas[id] })
  //       }
  //     }
  //     setRegTailLength(datas.length);
  //     setRegistrationTail(dataRegistrationTail);
  //   });
  // };

  const { regtail } = useData();
        const dataregtail = Object.values(regtail); 
  const registrationTail = dataregtail.filter(row => row.Status && row.Status === "ยังไม่เชื่อมต่อทะเบียนหัว");

  // useEffect(() => {
  //   getRegitrationTail();
  // }, []);

  const handlePost = () => {
    database
      .ref("/truck/registration/")
      .child(setting.split(":")[0] - 1)
      .update({
        RegTail: tail.split(":")[1],
        TotalWeight: (parseFloat(truck.Weight) + parseFloat(tail.split(":")[3])),
      })
      .then(() => {
        database
          .ref("/truck/registrationTail/")
          .child(tail.split(":")[0] - 1)
          .update({
            Status: "เชื่อมทะเบียนหัวแล้ว",
          })
          .then(() => {
            ShowSuccess("เชื่อมทะเบียนหางสำเร็จ");
            console.log("Data pushed successfully");
            setSetting("");
          })
          .catch((error) => {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
          });
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error("Error pushing data:", error);
      });
  }

  return (
    <React.Fragment>
                      <TableRow key={truck.id}>
                        <TableCell sx={{ textAlign: "center" }}>{truck.id}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.RegHead}</TableCell>
                        {
                          setting.split(":")[1] === truck.RegTail ?
                            <TableCell sx={{ textAlign: "center" }}>
                              <Grid container spacing={2}>
                                <Grid item xs={8}>
                                  <Paper
                                    component="form">
                                    <Select
                                      id="demo-simple-select"
                                      value={tail}
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
                                      onChange={(e) => setTail(e.target.value)}
                                      fullWidth
                                    >
                                      <MenuItem value={"ไม่มี:::"}>
                                        เลือกทะเบียน
                                      </MenuItem>
                                      {
                                        registrationTail.map((row) => (
                                          <MenuItem value={row.id + ":" + row.RegTail + ":" + row.Cap + ":" + row.Weight}>{row.RegTail}</MenuItem>
                                        ))
                                      }
                                    </Select>
                                  </Paper>
                                </Grid>
                                <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                                  <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setSetting("")}>
                                    <CancelIcon color="error" fontSize="12px" />
                                  </IconButton>
                                  <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={handlePost}>
                                    <CheckCircleIcon color="success" fontSize="12px" />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </TableCell>
                            :
                            <TableCell sx={{ textAlign: "center" }}>
                              {truck.RegTail}
                              {truck.RegTail === "ไม่มี" ?
                                <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setSetting(truck.id + ":" + truck.RegTail)}><SettingsIcon color="warning" fontSize="12px" /></IconButton>
                                : ""}
                            </TableCell>
                        }
                        <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(truck.Weight)}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.VehicleRegistration}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.RepairTruck.split(":")[1]}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.Status}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.Company}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.Driver.split(":")[1]}</TableCell>
                        <UpdateRegHead key={truck.id} truck={truck}/>
                        <TruckRepair key={truck.RepairTruck.split(":")[1]} row={truck} />
                      </TableRow>
    </React.Fragment>
  );
};

export default RegHeadDetail;
