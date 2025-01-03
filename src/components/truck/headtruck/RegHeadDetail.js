import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TableCell,
  TableRow
} from "@mui/material";
import React, { useEffect } from "react";
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import UpdateRegHead from "./UpdateRegHead";

const RegHeadDetail = (props) => {
  const { truck } = props;

  const [openTab, setOpenTab] = React.useState(true);
  const [setting, setSetting] = React.useState("0:0");
  const [tail, setTail] = React.useState(0);

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  const [registrationTail, setRegistrationTail] = React.useState([]);
  const [regTailLength, setRegTailLength] = React.useState("");

  const getRegitrationTail = async () => {
    database.ref("/truck/registrationTail/").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataRegistrationTail = [];
      for (let id in datas) {
        datas[id].Status === "ยังไม่เชื่อมต่อทะเบียนหัว" && datas[id].Company === truck.Company ?
          dataRegistrationTail.push({ id, ...datas[id] })
          : ""
      }
      setRegTailLength(datas.length);
      setRegistrationTail(dataRegistrationTail);
    });
  };

  useEffect(() => {
    getRegitrationTail();
  }, []);

  const handlePost = () => {
    database
      .ref("/truck/registration/")
      .child(setting.split(":")[0] - 1)
      .update({
        RegTail: tail.split(":")[1],
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
                      <TableRow>
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
                                      <MenuItem value={0}>
                                        เลือกทะเบียน
                                      </MenuItem>
                                      {
                                        registrationTail.map((row) => (
                                          <MenuItem value={row.id + ":" + row.RegTail + ":" + row.Cap}>{row.RegTail}</MenuItem>
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
                        <TableCell sx={{ textAlign: "center" }}>{truck.VehicleRegistration}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.RepairTruck.split(":")[1]}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.Status}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.Company}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{truck.Driver}</TableCell>
                        <UpdateRegHead key={truck.id} truck={truck}/>
                      </TableRow>
    </React.Fragment>
  );
};

export default RegHeadDetail;
