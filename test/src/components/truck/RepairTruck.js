import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Cookies from "js-cookie";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { database } from "../../server/firebase";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ITEM_HEIGHT = 30;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const RepairTruck = () => {
  const [regHead, setRegHead] = React.useState("");
  const token = Cookies.get("token");
  const handleChange = (event) => {
    setRegHead(event.target.value);
  };

  const [brakeFluid, setBrakeFluid] = useState("");
  const [clutchOil, setClutchOil] = useState("");
  const [leak_B, setLeak_B] = useState("");
  const [leak_BDetail, setLeak_BDetail] = useState("");
  const [brake, setBrake] = useState("");

  const [distilledWater, setDistilledWater] = useState("");
  const [batteryTerminals, setBatteryTerminals] = useState("");
  const [batteryOrther, setBatteryOrther] = useState("");
  const [batteryStrap, setBatteryStrap] = useState("");
  const [strapOther, setStrapOther] = useState("");
  const [light, setLight] = useState("");
  const [horn, setHorn] = useState("");
  const [hornDetail, setHornDetail] = useState("");

  const [radiator, setRadiator] = useState("");
  const [washerFluid, setWasherFluid] = useState("");
  const [radiatorCap, setRadiatorCap] = useState("");
  const [pressure, setPressure] = useState("");
  const [belt, setBelt] = useState("");
  const [radiatorHose, setRadiatorHose] = useState("");
  const [radiatorHoseDetail, setRadiatorHoseDetail] = useState("");

  const [tireSize, setTireSize] = useState("");
  const [tirePressureMax, setTirePressureMax] = useState("");
  const [weightTruck, setWeightTruck] = useState("");
  const [speed, setSpeed] = useState("");
  const [dateTire, setDateTire] = useState("");
  const [treadDepth, setTreadDepth] = useState("");
  const [cheekRubber, setCheekRubber] = useState("");
  const [cheekRubberDetail, setCheekRubberDetail] = useState("");
  const [tirePressure, setTirePressure] = useState("");
  const [tirePressureHigh, setTirePressureHigh] = useState("");
  const [tirePressureLow, setTirePressureLow] = useState("");
  const [airCap, setAirCap] = useState("");

  const [leak_G, setLeak_G] = useState("");
  const [leak_GDetail, setLeak_GDetail] = useState("");
  const [waterFilter, setWaterFilter] = useState("");
  const [airFilter, setAirFilter] = useState("");

  const [engineOil, setEngineOil] = useState("");
  const [powerSteeringOil, setPowersteeringOil] = useState("");
  const [transmissionFluid, setTransmissionFluid] = useState("");
  const [leak_O, setLeak_O] = useState("");
  const [leak_ODetail, setLeak_ODetail] = useState("");

  const [unusualNoise, setUnusualNoise] = useState("");
  const [unusualNoiseDetail, setUnusualNoiseDetail] = useState("");
  const [mountRubber, setMountRubber] = useState("");
  const [mountRubberDetail, setMountRubberDetail] = useState("");
  const [intake, setIntake] = useState("");
  const [intakeDetail, setIntakeDetail] = useState("");

  const [inspection, setInspection] = React.useState([]);
  const [data, setData] = useState([]);
  const [employee, setEmployee] = useState("");
  const [driver, setDriver] = useState("");
  const [regTail, setRegTail] = useState("");
  const [type, setType] = useState("");
  const [repairSmallTruck, setRepairSmallTruck] = React.useState([]);
  const [repairRegHead, setRepairRegHead] = React.useState([]);

  const getTruck = async () => {
    database.ref("/truck/registration/").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataRepair = [];
      for (let id in datas) {
        if(datas[id].RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ"){
          dataRepair.push({ id, ...datas[id] })
        }
      }
      setRepairRegHead(dataRepair);
    });

    database.ref("/truck/small/").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataRepair = [];
      for (let id in datas) {
        if(datas[id].RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ"){
          dataRepair.push({ id, ...datas[id] })
        }
      }
      setRepairSmallTruck(dataRepair);
    });
  };

  const getInspection = async () => {
    database.ref("/inspection").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataList = [];
      for (let id in datas) {
        dataList.push({ id, ...datas[id] });
      }
      setInspection(dataList);
    });
  };

  useEffect(() => {
    getTruck();
    getInspection();
  }, []);

  const handlePost = () => {
    database
      .ref("inspection")
      .child(inspection.length)
      .update({
        id: inspection.length + 1,
        Dates: dayjs(new Date()).locale("th").format("DD/MM/YYYY"),
        RegHead: regHead.split(":")[1],
        RegTail: regTail,
        Type: "รถช่อง",
        Employee: employee,
      })
      .then(() => {
        database
          .ref("inspection/" + inspection.length)
          .child("Brake")
          .update({
            BrakeFluid: brakeFluid,
            ClutchOil: clutchOil,
            Leak_B:
              leak_B === "มีรอยรั่ว"
                ? leak_B + "(" + leak_BDetail + ")"
                : leak_B,
            Brake: brake,
          })
          .then(() => {
            console.log("Brake pushed successfully");
          })
          .catch((error) => {
            console.error("Error pushing Brake:", error);
          });
        database
          .ref("inspection/" + inspection.length)
          .child("Electricity")
          .update({
            DistilledWater: distilledWater,
            BatteryTerminals:
              batteryTerminals === "อื่นๆ"
                ? batteryTerminals + "(" + batteryOrther + ")"
                : batteryTerminals,
            BatteryStrap:
              batteryStrap === "อื่นๆ"
                ? batteryStrap + "(" + strapOther + ")"
                : batteryStrap,
            Light: light,
            Horn: horn === "ใช้ไม่ได้" ? horn + "(" + hornDetail + ")" : horn,
          })
          .then(() => {
            console.log("Electricity pushed successfully");
          })
          .catch((error) => {
            console.error("Error pushing Electricity:", error);
          });
        database
          .ref("inspection/" + inspection.length)
          .child("Water")
          .update({
            Radiator: radiator,
            WasherFluid: washerFluid,
            RadiatorCap:
              radiatorCap === "ความดันสปริงฝาหม้อน้ำ"
                ? radiatorCap + "(" + pressure + ")"
                : radiatorCap,
            Belt: belt,
            RadiatorHose:
              radiatorHose === "ใช้ไม่ได้"
                ? radiatorHose + "(" + radiatorHoseDetail + ")"
                : radiatorHose,
          })
          .then(() => {
            console.log("Water pushed successfully");
          })
          .catch((error) => {
            console.error("Error pushing Water:", error);
          });
        database
          .ref("inspection/" + inspection.length)
          .child("Air")
          .update({
            TireSize: tireSize,
            TirePressureMax: tirePressureMax,
            WeightTruck: weightTruck,
            Speed: speed,
            DateTire: dateTire,
            TreadDepth: treadDepth,
            CheekRubber:
              cheekRubber === "ผิดปรกติ"
                ? cheekRubber + "(" + cheekRubberDetail + ")"
                : cheekRubber,
            TirePressure:
              tirePressure === "สูงไป"
                ? tirePressure + "(" + tirePressureHigh + ")"
                : tirePressure === "ต่ำไป"
                ? tirePressure + "(" + tirePressureLow + ")"
                : tirePressure,
            AirCap: airCap,
          })
          .then(() => {
            console.log("Air pushed successfully");
          })
          .catch((error) => {
            console.error("Error pushing Air:", error);
          });
        database
          .ref("inspection/" + inspection.length)
          .child("Gasoline")
          .update({
            Leak_G:
              leak_G === "มีรอยรั่ว"
                ? leak_G + "(" + leak_GDetail + ")"
                : leak_G,
            WaterFilter: waterFilter,
            AirFilter: airFilter,
          })
          .then(() => {
            console.log("Gasoline pushed successfully");
          })
          .catch((error) => {
            console.error("Error pushing Gasoline:", error);
          });
        database
          .ref("inspection/" + inspection.length)
          .child("Oils")
          .update({
            EngineOil: engineOil,
            PowerSteeringOil: powerSteeringOil,
            TransmissionFluid: transmissionFluid,
            Leak_O:
              leak_O === "มีรอยรั่ว"
                ? leak_O + "(" + leak_ODetail + ")"
                : leak_O,
          })
          .then(() => {
            console.log("Oils pushed successfully");
          })
          .catch((error) => {
            console.error("Error pushing Oils:", error);
          });
        database
          .ref("inspection/" + inspection.length)
          .child("Noise")
          .update({
            UnusualNoise:
              unusualNoise === "มี"
                ? unusualNoise + "(" + unusualNoiseDetail + ")"
                : unusualNoise,
            MountRubber:
              mountRubber === "ควรเปลี่ยน"
                ? mountRubber + "(" + mountRubberDetail + ")"
                : mountRubber,
            Intake:
              intake === "รั่ว" ? intake + "(" + intakeDetail + ")" : intake,
          })
          .then(() => {
            console.log("Noise pushed successfully");
          })
          .catch((error) => {
            console.error("Error pushing Noise:", error);
          });
        database
          .ref("truck")
          .child(regHead.split(":")[0])
          .update({
            RepairTruck:
              dayjs(new Date()).locale("th").format("DD/MM/YYYY") +
              ":ตรวจสอบสภาพรถแล้ว",
          })
          .then(() => {
            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            setRegHead("");
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
  };

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ p: 5 }}>
        <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
          <InputLabel id="demo-select-small-label">เลือกทะเบียนรถ</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={regHead}
            label="เลือกทะเบียนรถ"
            onChange={handleChange}
          >
            <MenuItem value="">เลือกทะเบียนรถ</MenuItem>
            {repairRegHead.map(
              (row) =>
                row.RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ" && (
                  <MenuItem value={row.id - 1 + ":" + row.RegHead + ":รถใหญ่"}>
                    {row.RegHead} : {row.Driver}
                  </MenuItem>
                )
            )}

            {repairSmallTruck.map(
              (row) =>
                row.RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ" && (
                  <MenuItem value={row.id - 1 + ":" + row.Registration +":รถเล็ก"}>
                    {row.Registration} : {row.Driver}
                  </MenuItem>
                )
            )}
          </Select>
        </FormControl>
        {regHead !== "" ? (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            marginTop={1}
            marginBottom={2}
          >
            {
            regHead.split(":")[2] === "รถใหญ่" ?
            repairRegHead.map((row) =>
              row.RegHead === regHead.split(":")[1] ? (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ชื่อ{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={row.Driver}
                    onChange={(e) => setDriver(e.target.value)}
                    disabled
                    sx={{ maxWidth: "20vw", marginLeft: 1 }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ทะเบียนหัว{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={row.RegHead}
                    disabled
                    sx={{ maxWidth: "10vw", marginLeft: 1 }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ทะเบียนหาง{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={row.RegTail}
                    onChange={(e) => setRegTail(e.target.value)}
                    disabled
                    sx={{ maxWidth: "10vw", marginLeft: 1 }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ชนิดรถ{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={regHead.split(":")[2]}
                    onChange={(e) => setType(e.target.value)}
                    disabled
                    sx={{ maxWidth: "10vw", marginLeft: 1 }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    วันที่{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={dayjs(new Date()).locale("th").format("DD/MM/YYYY")}
                    disabled
                    sx={{ maxWidth: "10vw", marginLeft: 1 }}
                  />
                </>
              ) : (
                ""
              )
            )
            : regHead.split(":")[2] === "รถเล็ก" ?
            repairSmallTruck.map((row) =>
              row.Registration === regHead.split(":")[1] ? (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ชื่อ{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={row.Driver}
                    onChange={(e) => setDriver(e.target.value)}
                    disabled
                    sx={{ maxWidth: "20vw", marginLeft: 1 }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ทะเบียน{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={row.Registration}
                    disabled
                    sx={{ maxWidth: "10vw", marginLeft: 1 }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ชนิดรถ{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={regHead.split(":")[2]}
                    onChange={(e) => setType(e.target.value)}
                    disabled
                    sx={{ maxWidth: "10vw", marginLeft: 1 }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    วันที่{" "}
                  </Typography>
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    variant="standard"
                    value={dayjs(new Date()).locale("th").format("DD/MM/YYYY")}
                    disabled
                    sx={{ maxWidth: "10vw", marginLeft: 1 }}
                  />
                </>
              ) : (
                ""
              )
            )
            : ""
            }
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            marginTop={1}
            marginBottom={2}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ชื่อ{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              sx={{ maxWidth: "20vw", marginLeft: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ทะเบียนหัว{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              sx={{ maxWidth: "10vw", marginLeft: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ทะเบียนหาง{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              sx={{ maxWidth: "10vw", marginLeft: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ชนิดรถ{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              sx={{ maxWidth: "10vw", marginLeft: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              วันที่{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              value={dayjs(new Date()).locale("th").format("DD/MM/YYYY")}
              disabled
              sx={{ maxWidth: "10vw", marginLeft: 1 }}
            />
          </Box>
        )}
        <Paper
          sx={{ p: 2, boxShadow: "1px 1px 2px 2px" + theme.palette.grey[600] }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            1).ตรวจสอบระบบเบรก
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 3 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ก.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ระดับน้ำมันเบรก
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={brakeFluid === "สูงไป" ? true : false}
                control={<Checkbox onChange={() => setBrakeFluid("สูงไป")} />}
                label="สูงไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={brakeFluid === "ปกติ" ? true : false}
                control={<Checkbox onChange={() => setBrakeFluid("ปกติ")} />}
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={brakeFluid === "ต่ำไป" ? true : false}
                control={<Checkbox onChange={() => setBrakeFluid("ต่ำไป")} />}
                label="ต่ำไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={brakeFluid === "สภาพใช้ได้" ? true : false}
                control={
                  <Checkbox onChange={() => setBrakeFluid("สภาพใช้ได้")} />
                }
                label="สภาพใช้ได้"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={brakeFluid === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox onChange={() => setBrakeFluid("ควรเปลี่ยน")} />
                }
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={1.5}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 3 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ข.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ระดับน้ำมันคลัตช์
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={clutchOil === "สูงไป" ? true : false}
                control={<Checkbox onChange={() => setClutchOil("สูงไป")} />}
                label="สูงไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={clutchOil === "ปกติ" ? true : false}
                control={<Checkbox onChange={() => setClutchOil("ปกติ")} />}
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={clutchOil === "ต่ำไป" ? true : false}
                control={<Checkbox onChange={() => setClutchOil("ต่ำไป")} />}
                label="ต่ำไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={clutchOil === "สภาพใช้ได้" ? true : false}
                control={
                  <Checkbox onChange={() => setClutchOil("สภาพใช้ได้")} />
                }
                label="สภาพใช้ได้"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={clutchOil === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox onChange={() => setClutchOil("ควรเปลี่ยน")} />
                }
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={1.5}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 3 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ค.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  รอยรั่วซึมตามจุดต่างๆ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={leak_B === "ไม่มี" ? true : false}
                control={<Checkbox onChange={() => setLeak_B("ไม่มี")} />}
                label="ไม่มี"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={leak_B === "มีรอยรั่ว" ? true : false}
                control={<Checkbox onChange={() => setLeak_B("มีรอยรั่ว")} />}
                label="มีรอยรั่ว"
              />
              {leak_B === "มีรอยรั่ว" ? (
                <TextField
                  placeholder="ระบุ"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={leak_BDetail}
                  onChange={(e) => setLeak_BDetail(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={4.5}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 3 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ง.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  เบรกมือ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={brake === "เสียงดัง...คลิ๊ก" ? true : false}
                control={
                  <Checkbox onChange={() => setBrake("เสียงดัง...คลิ๊ก")} />
                }
                label="เสียงดัง...คลิ๊ก"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={brake === "ใช้ได้" ? true : false}
                control={<Checkbox onChange={() => setBrake("ใช้ได้")} />}
                label="ใช้ได้"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={brake === "ควรปรับตั้ง" ? true : false}
                control={<Checkbox onChange={() => setBrake("ควรปรับตั้ง")} />}
                label="ควรปรับตั้ง"
              />
            </Grid>
            <Grid item xs={3}></Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            marginTop: 2,
            boxShadow: "1px 1px 2px 2px" + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            2).ตรวจสอบระบบไฟฟ้า
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ก.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ระดับน้ำกลั่น
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={distilledWater === "สูงไป" ? true : false}
                control={
                  <Checkbox onChange={() => setDistilledWater("สูงไป")} />
                }
                label="สูงไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={distilledWater === "ปกติ" ? true : false}
                control={
                  <Checkbox onChange={() => setDistilledWater("ปกติ")} />
                }
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={distilledWater === "ต่ำไป" ? true : false}
                control={
                  <Checkbox onChange={() => setDistilledWater("ต่ำไป")} />
                }
                label="ต่ำไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={distilledWater === "ควรเติม" ? true : false}
                control={
                  <Checkbox onChange={() => setDistilledWater("ควรเติม")} />
                }
                label="ควรเติม"
              />
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ข.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ขั้วแบตเตอร์รี่
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={
                  batteryTerminals === "แน่นและมีฉนวนหุ่ม" ? true : false
                }
                control={
                  <Checkbox
                    onChange={() => setBatteryTerminals("แน่นและมีฉนวนหุ่ม")}
                  />
                }
                label="แน่นและมีฉนวนหุ่ม"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={batteryTerminals === "ไม่แน่น" ? true : false}
                control={
                  <Checkbox onChange={() => setBatteryTerminals("ไม่แน่น")} />
                }
                label="ไม่แน่น"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={batteryTerminals === "อื่นๆ" ? true : false}
                control={
                  <Checkbox onChange={() => setBatteryTerminals("อื่นๆ")} />
                }
                label="อื่นๆ"
              />
              {batteryTerminals === "อื่นๆ" ? (
                <TextField
                  placeholder="ระบุ"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={batteryOrther}
                  onChange={(e) => setBatteryOrther(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={1.5}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ค.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  สายรัดและแทนรองแบตเตอรี่
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={batteryStrap === "แน่นและมีฉนวนหุ่ม" ? true : false}
                control={
                  <Checkbox
                    onChange={() => setBatteryStrap("แน่นและมีฉนวนหุ่ม")}
                  />
                }
                label="แน่นและมีฉนวนหุ่ม"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={batteryStrap === "ไม่แน่น" ? true : false}
                control={
                  <Checkbox onChange={() => setBatteryStrap("ไม่แน่น")} />
                }
                label="ไม่แน่น"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={batteryStrap === "อื่นๆ" ? true : false}
                control={<Checkbox onChange={() => setBatteryStrap("อื่นๆ")} />}
                label="อื่นๆ"
              />
              {batteryStrap === "อื่นๆ" ? (
                <TextField
                  placeholder="ระบุ"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={strapOther}
                  onChange={(e) => setStrapOther(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={1.5}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ง.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ไฟสูง-ต่ำ/ไฟท้าย/ไฟเบรก/ไฟถอยหลัง
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={light === "ใช้ได้" ? true : false}
                control={<Checkbox onChange={() => setLight("ใช้ได้")} />}
                label="ใช้ได้"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={light === "ควรปรับตั้ง" ? true : false}
                control={<Checkbox onChange={() => setLight("ควรปรับตั้ง")} />}
                label="ควรปรับตั้ง"
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (จ.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  แตร/ที่ปัดน้ำฝน/ที่ฉีดน้ำล้างกระจก
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={horn === "ใช้ได้หมด" ? true : false}
                control={<Checkbox onChange={() => setHorn("ใช้ได้หมด")} />}
                label="ใช้ได้หมด"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={horn === "ใช้ไม่ได้" ? true : false}
                control={<Checkbox onChange={() => setHorn("ใช้ไม่ได้")} />}
                label="ใช้ไม่ได้"
              />
              {horn === "ใช้ไม่ได้" ? (
                <TextField
                  placeholder="ระบุจุด"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={hornDetail}
                  onChange={(e) => setHornDetail(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={4.5}></Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            marginTop: 2,
            boxShadow: "1px 1px 2px 2px" + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            3).ตรวจสอบระบบน้ำหล่อเย็น
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ก.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ระดับน้ำในหม้อน้ำและถังพักน้ำสำรอง
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiator === "สูงไป" ? true : false}
                control={<Checkbox onChange={() => setRadiator("สูงไป")} />}
                label="สูงไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiator === "ปกติ" ? true : false}
                control={<Checkbox onChange={() => setRadiator("ปกติ")} />}
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiator === "ต่ำไป" ? true : false}
                control={<Checkbox onChange={() => setRadiator("ต่ำไป")} />}
                label="ต่ำไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiator === "สภาพใช้ได้" ? true : false}
                control={
                  <Checkbox onChange={() => setRadiator("สภาพใช้ได้")} />
                }
                label="สภาพใช้ได้"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiator === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox onChange={() => setRadiator("ควรเปลี่ยน")} />
                }
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ข.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ระดับน้ำฉีดกระจก
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={washerFluid === "ปกติ" ? true : false}
                control={<Checkbox onChange={() => setWasherFluid("ปกติ")} />}
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={washerFluid === "ควรเติม" ? true : false}
                control={
                  <Checkbox onChange={() => setWasherFluid("ควรเติม")} />
                }
                label="ควรเติม"
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ค.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ฝาปิดหม้อน้ำ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiatorCap === "ใช้ได้" ? true : false}
                control={<Checkbox onChange={() => setRadiatorCap("ใช้ได้")} />}
                label="ใช้ได้"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiatorCap === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox onChange={() => setRadiatorCap("ควรเปลี่ยน")} />
                }
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={4.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiatorCap === "ความดันสปริงฝาหม้อน้ำ" ? true : false}
                control={
                  <Checkbox
                    onChange={() => setRadiatorCap("ความดันสปริงฝาหม้อน้ำ")}
                  />
                }
                label="ความดันสปริงฝาหม้อน้ำ"
              />
              {radiatorCap === "ความดันสปริงฝาหม้อน้ำ" ? (
                <Typography
                  variant="subtile1"
                  sx={{ marginTop: 1 }}
                  gutterBottom
                >
                  <TextField
                    placeholder="กรอก.."
                    size="small"
                    disabled={regHead !== "" ? false : true}
                    value={pressure}
                    onChange={(e) => setPressure(e.target.value)}
                    variant="standard"
                    sx={{ maxWidth: "10vw", marginTop: 1 }}
                  />
                  กก/ชม.2
                </Typography>
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ง.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  สายพานทุกเส้น
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={belt === "ตึง" ? true : false}
                control={<Checkbox onChange={() => setBelt("ตึง")} />}
                label="ตึง"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={belt === "พอดี" ? true : false}
                control={<Checkbox onChange={() => setBelt("พอดี")} />}
                label="พอดี"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={belt === "หย่อน" ? true : false}
                control={<Checkbox onChange={() => setBelt("หย่อน")} />}
                label="หย่อน"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={belt === "สภาพดี" ? true : false}
                control={<Checkbox onChange={() => setBelt("สภาพดี")} />}
                label="สภาพดี"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={belt === "ควรเปลี่ยน" ? true : false}
                control={<Checkbox onChange={() => setBelt("ควรเปลี่ยน")} />}
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (จ.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ท่อยางหม้อน้ำ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiatorHose === "ใช้ได้" ? true : false}
                control={
                  <Checkbox onChange={() => setRadiatorHose("ใช้ได้")} />
                }
                label="ใช้ได้"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={radiatorHose === "ใช้ไม่ได้" ? true : false}
                control={
                  <Checkbox onChange={() => setRadiatorHose("ใช้ไม่ได้")} />
                }
                label="ใช้ไม่ได้"
              />
              {radiatorHose === "ใช้ไม่ได้" ? (
                <TextField
                  placeholder="ระบุจุด"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={radiatorHoseDetail}
                  onChange={(e) => setRadiatorHoseDetail(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={4.5}></Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            marginTop: 2,
            boxShadow: "1px 1px 2px 2px" + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4).ตรวจลมยางและกระทะล้อ
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="left" sx={{ paddingLeft: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ก.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ขนาดยางที่ใช้
                  <TextField
                    placeholder="กรอก.."
                    size="small"
                    disabled={regHead !== "" ? false : true}
                    value={tireSize}
                    onChange={(e) => setTireSize(e.target.value)}
                    variant="standard"
                    sx={{ maxWidth: "5vw", marginLeft: 1 }}
                  />
                  ลมยางสูงสุด
                  <TextField
                    placeholder="กรอก.."
                    size="small"
                    disabled={regHead !== "" ? false : true}
                    value={tirePressureMax}
                    onChange={(e) => setTirePressureMax(e.target.value)}
                    variant="standard"
                    sx={{ maxWidth: "5vw", marginLeft: 1 }}
                  />
                  ปอนด์/ตารางนิ้ว น้ำหนักบรรทุกสูงสุด
                  <TextField
                    placeholder="กรอก.."
                    size="small"
                    disabled={regHead !== "" ? false : true}
                    value={weightTruck}
                    onChange={(e) => setWeightTruck(e.target.value)}
                    variant="standard"
                    sx={{ maxWidth: "5vw", marginLeft: 1 }}
                  />
                  กิโลกรัม/เส้น ความเร็วสูงสุด
                  <TextField
                    placeholder="กรอก.."
                    size="small"
                    disabled={regHead !== "" ? false : true}
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    variant="standard"
                    sx={{ maxWidth: "5vw", marginLeft: 1 }}
                  />
                  กม./ชม. วันผลิตยาง
                  <TextField
                    placeholder="กรอก.."
                    size="small"
                    disabled={regHead !== "" ? false : true}
                    value={dateTire}
                    onChange={(e) => setDateTire(e.target.value)}
                    variant="standard"
                    sx={{ maxWidth: "10vw", marginLeft: 1 }}
                  />
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ข.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ความลึกของดอกยาง
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={treadDepth === "มากกว่า 1.6 มม." ? true : false}
                control={
                  <Checkbox onChange={() => setTreadDepth("มากกว่า 1.6 มม.")} />
                }
                label="มากกว่า 1.6 มม."
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={treadDepth === "น้อยกว่า 1.6 มม." ? true : false}
                control={
                  <Checkbox
                    onChange={() => setTreadDepth("น้อยกว่า 1.6 มม.")}
                  />
                }
                label="น้อยกว่า 1.6 มม."
              />
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ค.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  สภาพแก้มยาง
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={cheekRubber === "ปกติ" ? true : false}
                control={<Checkbox onChange={() => setCheekRubber("ปกติ")} />}
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={cheekRubber === "ผิดปกติ" ? true : false}
                control={
                  <Checkbox onChange={() => setCheekRubber("ผิดปกติ")} />
                }
                label="ผิดปกติ"
              />
              {cheekRubber === "ผิดปกติ" ? (
                <TextField
                  placeholder="ระบุล้อ"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={cheekRubberDetail}
                  onChange={(e) => setCheekRubberDetail(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={4.5}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ง.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ความดันลมยาง
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={tirePressure === "ถูกต้องตามคู่มือรถ" ? true : false}
                control={
                  <Checkbox
                    onChange={() => setTirePressure("ถูกต้องตามคู่มือรถ")}
                  />
                }
                label="ถูกต้องตามคู่มือรถ"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={tirePressure === "สูงไป" ? true : false}
                control={<Checkbox onChange={() => setTirePressure("สูงไป")} />}
                label="สูงไป"
              />
              {tirePressure === "สูงไป" ? (
                <TextField
                  placeholder="ระบุล้อ"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={tirePressureHigh}
                  onChange={(e) => setTirePressureHigh(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={tirePressure === "น้อยไป" ? true : false}
                control={
                  <Checkbox onChange={() => setTirePressure("น้อยไป")} />
                }
                label="น้อยไป"
              />
              {tirePressure === "น้อยไป" ? (
                <TextField
                  placeholder="ระบุล้อ"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={tirePressureLow}
                  onChange={(e) => setTirePressureLow(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (จ.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ฝาปิดจปเติมลม
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={airCap === "มีครบ" ? true : false}
                control={<Checkbox onChange={() => setAirCap("มีครบ")} />}
                label="มีครบ"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={airCap === "มีไม่ครบ" ? true : false}
                control={<Checkbox onChange={() => setAirCap("มีไม่ครบ")} />}
                label="มีไม่ครบ"
              />
            </Grid>
            <Grid item xs={3}></Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            marginTop: 2,
            boxShadow: "1px 1px 2px 2px" + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            5).ตรวจระบบน้ำมันเชื้อเพลิง
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ก.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  รอยรั่วซึมตามจุดต่างๆ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={leak_G === "ไม่มี" ? true : false}
                control={<Checkbox onChange={() => setLeak_G("ไม่มี")} />}
                label="ไม่มี"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={leak_G === "มีรอยรั่ว" ? true : false}
                control={<Checkbox onChange={() => setLeak_G("มีรอยรั่ว")} />}
                label="มีรอยรั่ว"
              />
              {leak_G === "มีรอยรั่ว" ? (
                <TextField
                  placeholder="ระบุจุดที่รั่ว"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={leak_GDetail}
                  onChange={(e) => setLeak_GDetail(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={4.5}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ข.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  กรอกดักน้ำ(รถดีเซล)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={waterFilter === "มีน้ำ" ? true : false}
                control={<Checkbox onChange={() => setWaterFilter("มีน้ำ")} />}
                label="มีน้ำ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={waterFilter === "ไม่มีน้ำ" ? true : false}
                control={
                  <Checkbox onChange={() => setWaterFilter("ไม่มีน้ำ")} />
                }
                label="ไม่มีน้ำ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={waterFilter === "ไม่แน่ใจ" ? true : false}
                control={
                  <Checkbox onChange={() => setWaterFilter("ไม่แน่ใจ")} />
                }
                label="ไม่แน่ใจ"
              />
            </Grid>
            <Grid item xs={4.5}></Grid>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ค.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  กรองอากาศ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={airFilter === "สภาพดี" ? true : false}
                control={<Checkbox onChange={() => setAirFilter("สภาพดี")} />}
                label="สภาพดี"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={airFilter === "พอใช้" ? true : false}
                control={<Checkbox onChange={() => setAirFilter("พอใช้")} />}
                label="พอใช้"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={airFilter === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox onChange={() => setAirFilter("ควรเปลี่ยน")} />
                }
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={3}></Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            marginTop: 2,
            boxShadow: "1px 1px 2px 2px" + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            6).ตรวจน้ำมันหล่อลื่นต่างๆ
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ก.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ระดับน้ำมันเครื่อง
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={engineOil === "สูงไป" ? true : false}
                control={<Checkbox onChange={() => setEngineOil("สูงไป")} />}
                label="สูงไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={engineOil === "ปกติ" ? true : false}
                control={<Checkbox onChange={() => setEngineOil("ปกติ")} />}
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={engineOil === "ต่ำไป" ? true : false}
                control={<Checkbox onChange={() => setEngineOil("ต่ำไป")} />}
                label="ต่ำไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={engineOil === "สภาพใช้ได้" ? true : false}
                control={
                  <Checkbox onChange={() => setEngineOil("สภาพใช้ได้")} />
                }
                label="สภาพใช้ได้"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={engineOil === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox onChange={() => setEngineOil("ควรเปลี่ยน")} />
                }
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={1.5}></Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ข.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ระดับน้ำมันพวงมาลัยพาวเวอร์
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={powerSteeringOil === "สูงไป" ? true : false}
                control={
                  <Checkbox onChange={() => setPowersteeringOil("สูงไป")} />
                }
                label="สูงไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={powerSteeringOil === "ปกติ" ? true : false}
                control={
                  <Checkbox onChange={() => setPowersteeringOil("ปกติ")} />
                }
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={powerSteeringOil === "ต่ำไป" ? true : false}
                control={
                  <Checkbox onChange={() => setPowersteeringOil("ต่ำไป")} />
                }
                label="ต่ำไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={powerSteeringOil === "สภาพใช้ได้" ? true : false}
                control={
                  <Checkbox
                    onChange={() => setPowersteeringOil("สภาพใช้ได้")}
                  />
                }
                label="สภาพใช้ได้"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={powerSteeringOil === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox
                    onChange={() => setPowersteeringOil("ควรเปลี่ยน")}
                  />
                }
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={1.5}></Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ค.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ระดับน้ำเกียร์อัตโนมัติ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={transmissionFluid === "สูงไป" ? true : false}
                control={
                  <Checkbox onChange={() => setTransmissionFluid("สูงไป")} />
                }
                label="สูงไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={transmissionFluid === "ปกติ" ? true : false}
                control={
                  <Checkbox onChange={() => setTransmissionFluid("ปกติ")} />
                }
                label="ปกติ"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={transmissionFluid === "ต่ำไป" ? true : false}
                control={
                  <Checkbox onChange={() => setTransmissionFluid("ต่ำไป")} />
                }
                label="ต่ำไป"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={transmissionFluid === "สภาพใช้ได้" ? true : false}
                control={
                  <Checkbox
                    onChange={() => setTransmissionFluid("สภาพใช้ได้")}
                  />
                }
                label="สภาพใช้ได้"
              />
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={transmissionFluid === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox
                    onChange={() => setTransmissionFluid("ควรเปลี่ยน")}
                  />
                }
                label="ควรเปลี่ยน"
              />
            </Grid>
            <Grid item xs={1.5}></Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ง.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  รอบรั่วซึมตามจุดต่างๆ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={leak_O === "ไม่มี" ? true : false}
                control={<Checkbox onChange={() => setLeak_O("ไม่มี")} />}
                label="ไม่มี"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={leak_O === "มีรอยรั่ว" ? true : false}
                control={<Checkbox onChange={() => setLeak_O("มีรอยรั่ว")} />}
                label="มีรอยรั่ว"
              />
              {leak_O === "มีรอยรั่ว" ? (
                <TextField
                  placeholder="ระบุจุดที่รั่ว"
                  size="small"
                  disabled={regHead !== "" ? false : true}
                  value={leak_ODetail}
                  onChange={(e) => setLeak_ODetail(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={4.5}></Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            marginTop: 2,
            boxShadow: "1px 1px 2px 2px" + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            7).เสียงดังต่างๆ
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ก.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  เสียงดังผิดปรกติอื่นๆ
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={unusualNoise === "ไม่มี" ? true : false}
                control={<Checkbox onChange={() => setUnusualNoise("ไม่มี")} />}
                label="ไม่มี"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={unusualNoise === "มี" ? true : false}
                control={<Checkbox onChange={() => setUnusualNoise("มี")} />}
                label="มี"
              />
              {unusualNoise === "มี" ? (
                <TextField
                  placeholder="ระบุจุด"
                  disabled={regHead !== "" ? false : true}
                  size="small"
                  value={unusualNoiseDetail}
                  onChange={(e) => setUnusualNoiseDetail(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={4.5}></Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ข.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ยางแท่นเครื่อง
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={mountRubber === "ใช้ได้" ? true : false}
                control={<Checkbox onChange={() => setMountRubber("ใช้ได้")} />}
                label="ใช้ได้"
              />
            </Grid>
            <Grid item xs={4.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={mountRubber === "ควรเปลี่ยน" ? true : false}
                control={
                  <Checkbox onChange={() => setMountRubber("ควรเปลี่ยน")} />
                }
                label="ควรเปลี่ยน"
              />
              {mountRubber === "ควรเปลี่ยน" ? (
                <TextField
                  placeholder="ระบุจุด"
                  disabled={regHead !== "" ? false : true}
                  size="small"
                  value={mountRubberDetail}
                  onChange={(e) => setMountRubberDetail(e.target.value)}
                  variant="standard"
                  sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                sx={{ marginTop: 1, paddingLeft: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginRight: 1 }}
                  fontWeight="bold"
                  gutterBottom
                >
                  (ค.){" "}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  ท่อไอเสีย
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={1.5}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={intake === "ไม่รั่ว" ? true : false}
                control={<Checkbox onChange={() => setIntake("ไม่รั่ว")} />}
                label="ไม่รั่ว"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                disabled={regHead !== "" ? false : true}
                checked={intake === "รั่ว" ? true : false}
                control={<Checkbox onChange={() => setIntake("รั่ว")} />}
                label="รั่ว"
              />
              {intake === "รั่ว" ? (
                <TextField
                  placeholder="ระบุจุดที่รั่ว"
                  size="small"
                  value={intakeDetail}
                  onChange={(e) => setIntakeDetail(e.target.value)}
                  variant="standard"
                  disabled={regHead !== "" ? false : true}
                  sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={4.5}></Grid>
          </Grid>
        </Paper>
        {regHead !== "" ? (
          <Grid container spacing={2} marginTop={3}>
            <Grid item xs={9}></Grid>
            <Grid item xs={3} textAlign="center">
              <TextField
                placeholder="ลงชื่อ"
                size="small"
                variant="standard"
                value={employee}
                InputLabelProps={{
                  style: { textAlign: "center", width: "100%" }, // จัดให้ label อยู่ตรงกลาง
                }}
                inputProps={{
                  style: { textAlign: "center" }, // จัดให้ input text อยู่ตรงกลาง (ถ้าต้องการ)
                }}
                disabled
              />
              <Typography
                variant="subtitle1"
                textAlign="center"
                fontWeight="bold"
                gutterBottom
              >
                ลงชื่อผู้ตรวจสภาพรถ
              </Typography>
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Button
                variant="contained"
                size="large"
                color="success"
                onClick={handlePost}
              >
                บันทึก
              </Button>
            </Grid>
          </Grid>
        ) : (
          ""
        )}
      </Container>
    </React.Fragment>
  );
};

export default RepairTruck;
