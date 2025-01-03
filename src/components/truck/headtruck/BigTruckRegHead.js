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
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import React, { useEffect } from "react";
import { database } from "../../../server/firebase";
import { TablecellHeader } from "../../../theme/style";
import theme from "../../../theme/theme";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import RegHeadDetail from "./RegHeadDetail";

const BigTruckRegHead = (props) => {
  const { truck, repair } = props;

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
        datas[id].Status === "ยังไม่เชื่อมต่อทะเบียนหัว" ?
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
              <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>รถใหญ่</Typography>
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
              รายละเอียดข้อมูลรถใหญ่ทั้งหมด
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
                      ทะเบียนหัว
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ทะเบียนหาง
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
                      <RegHeadDetail key={row.id} truck={row}/>
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

export default BigTruckRegHead;
