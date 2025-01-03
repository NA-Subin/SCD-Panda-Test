import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Popover,
  Stack,
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
import { RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
// import Logo from "../../../public/logoPanda.jpg";
import { borderRadius, keyframes, width } from "@mui/system";
import { database } from "../../server/firebase";
import { BarChart, PieChart, SparkLineChart } from "@mui/x-charts";

const slideOutRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  80% {
    transform: translateX(-20%);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const [slideOut, setSlideOut] = useState(true);

  const pieParams = {
    width: 290,
    height: 160,
    margin: { right: 5 },
    slotProps: { legend: { hidden: true } },
  };

  const [office, setOffice] = useState([]);
  const [driver, setDriver] = useState([]);
  const [creditor, setCreditor] = useState([]);

  const getEmployee = async () => {
    database.ref("/employee/officers").on("value", (snapshot) => {
      const datas = snapshot.val();
      setOffice(datas);
    });
  };

  const getDriver = async () => {
    database.ref("/employee/drivers").on("value", (snapshot) => {
      const datas = snapshot.val();
      setDriver(datas);
    });
  };

  const getCreditor = async () => {
    database.ref("/employee/creditors").on("value", (snapshot) => {
      const datas = snapshot.val();
      setCreditor(datas);
    });
  };

  useEffect(() => {
    getEmployee();
    getDriver();
    getCreditor()
  }, []);

  // useEffect(() => {
  //     const token = Cookies.get('token'); // ตรวจสอบว่ามี Cookie ที่ชื่อ 'auth_token' หรือไม่
  //     if (!token) {
  //       navigate('/');
  //     }
  // }, []);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 10, marginBottom: 5 }}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          animation: slideOut ? `${slideOutRight} 0.8s forwards` : "none",
          position: "relative",
        }}
      >
        {/* <img src={Logo} width="200" /> */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginLeft={-6}
          marginTop={5}
        >
          <Typography
            variant="h1"
            color={theme.palette.error.main}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            S
          </Typography>
          <Typography
            variant="h1"
            color={theme.palette.warning.light}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            C
          </Typography>
          <Typography
            variant="h1"
            color={theme.palette.info.dark}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            D
          </Typography>
          <Typography
            variant="h2"
            color={theme.palette.panda.dark}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          ></Typography>
          <Typography
            variant="h2"
            color={theme.palette.panda.light}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          ></Typography>
        </Box>
      </Box>
      <Divider />
      <Grid container spacing={4} marginTop={2}>
        <Grid item xs={3}>
          <Paper sx={{ height: "30vh",borderRadius:5,backgroundColor: theme.palette.warning.light,color: "white",paddingTop:5 }}>
          <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box textAlign="right">
                      <Typography marginTop={-2} variant="h5" gutterBottom>
                        Gasohol
                      </Typography>
                      <Typography
                        marginTop={-2}
                        variant="subtitle1"
                        gutterBottom
                      >
                        เบนซินแก๊สโซฮอล์
                      </Typography>
                    </Box>
                    <Typography variant="h3" gutterBottom>
                      G95
                    </Typography>
                  </Box>
                  <Divider
                    sx={{
                      backgroundColor: theme.palette.primary.contrastText,
                      marginTop: -1,
                    }}
                  />
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography
                      variant="h2"
                      textAlign="center"
                      fontWeight="bold"
                      gutterBottom
                    >
                      40.45
                    </Typography>
                  </Box>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ height: "30vh",backgroundColor: theme.palette.success.light,borderRadius:5,color: "white",paddingTop:5 }}>
          <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box textAlign="right">
                      <Typography marginTop={-2} variant="h5" gutterBottom>
                        Gasohol
                      </Typography>
                      <Typography
                        marginTop={-2}
                        variant="subtitle1"
                        gutterBottom
                      >
                        เบนซินแก๊สโซฮอล์
                      </Typography>
                    </Box>
                    <Typography variant="h3" gutterBottom>
                      G91
                    </Typography>
                  </Box>
                  <Divider
                    sx={{
                      backgroundColor: theme.palette.primary.contrastText,
                      marginTop: -1,
                    }}
                  />
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography
                      variant="h2"
                      textAlign="center"
                      fontWeight="bold"
                      gutterBottom
                    >
                      40.18
                    </Typography>
                  </Box>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ height: "30vh",backgroundColor: theme.palette.primary.light,borderRadius:5,color: "white",paddingTop:5 }}>
          <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography variant="h5" gutterBottom>
                      ดีเซล
                    </Typography>
                    <Typography variant="h3" gutterBottom>
                      DieSel
                    </Typography>
                  </Box>
                  <Divider
                    sx={{
                      backgroundColor: theme.palette.primary.contrastText,
                      marginTop: -1,
                    }}
                  />
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography
                      variant="h2"
                      textAlign="center"
                      fontWeight="bold"
                      gutterBottom
                    >
                      31.94
                    </Typography>
                  </Box>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ height: "30vh",backgroundColor: theme.palette.panda.contrastText,borderRadius:5 }}>
            <Box sx={{ backgroundColor: theme.palette.panda.main, borderTopLeftRadius: 15, borderTopRightRadius: 15, color: "white" }}>
              <Typography variant="subtitle1" textAlign="center" fontWeight="bold" gutterBottom>จำนวนพนักงาน( ทั้งหมด {office.length+driver.length+creditor.length} คน)</Typography> 
            </Box>
            <Box sx={{ backgroundColor: "white",marginTop: -0.5, marginLeft: 0.5, marginRight:0.5 , paddingBottom: 0.5 }}>
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: office.length, label: 'พนักงานบริษัท',color: theme.palette.success.main },
                    { id: 1, value: driver.length, label: 'พนักงานขับรถ',color: theme.palette.primary.main },
                    { id: 2, value: creditor.length, label: 'เจ้าหนี้การค้า',color: theme.palette.warning.main },
                  ],
                  innerRadius: 30,
                },
              ]}
              {...pieParams}
            />
            </Box>
            <Box sx={{ backgroundColor: theme.palette.panda.main, borderBottomLeftRadius: 15,height:30, borderBottomRightRadius: 15, color: "white",display:"flex" ,justifyContent: "center" ,alignItems:"center" }}>
              <Box sx={{ backgroundColor: theme.palette.success.main,height:15,width:15,border: "2px solid white",marginRight:0.5 }}/>
              <Typography fontSize="12px" textAlign="center" fontWeight="bold" marginRight={1} gutterBottom>พนักงานบริษัท</Typography> 
              <Box sx={{ backgroundColor: theme.palette.primary.main,height:15,width:15,border: "2px solid white",marginRight:0.5 }}/>
              <Typography fontSize="12px" textAlign="center" fontWeight="bold" marginRight={1} gutterBottom>พนักงานขับรถ</Typography> 
              <Box sx={{ backgroundColor: theme.palette.warning.main,height:15,width:15,border: "2px solid white",marginRight:0.5 }}/>
              <Typography fontSize="12px" textAlign="center" fontWeight="bold" gutterBottom>เจ้าหนี้การค้า</Typography> 
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Paper sx={{ height: "60vh",backgroundColor: theme.palette.panda.contrastText,borderRadius:5,p:1 }}>
          <Stack direction="row" sx={{ width: '100%',backgroundColor: "white",height: 420, borderRadius:5,paddingTop:1,paddingLeft:2,paddingRight:2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <SparkLineChart
          data={[1, 4, 2, 5, 7, 2, 4, 6]}
          xAxis={{
            scaleType: 'time',
            data: [
              new Date(2024, 11, 1),
              new Date(2024, 11, 2),
              new Date(2024, 11, 5),
              new Date(2024, 11, 6),
              new Date(2024, 11, 7),
              new Date(2024, 11, 8),
              new Date(2024, 11, 11),
              new Date(2024, 11, 12),
            ],
            valueFormatter: (value) => value.toISOString().slice(0, 10),
          }}
          height={400}
          showTooltip
          showHighlight
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
      <BarChart
      series={[
        { data: [4], color: '#FF5733', label: '4' }, // สีแดง
        { data: [3], color: '#33FF57', label: '3' }, // สีเขียว
        { data: [5], color: '#3357FF', label: '5' }, // สีน้ำเงิน
      ]}
      width={500}
      height={300}
      margin={{ top: 20, bottom: 50 }} // เพิ่มพื้นที่ด้านล่างสำหรับ label
      barCategoryGap={50} // เพิ่มช่องว่างระหว่างแท่ง
    />
      </Box>
    </Stack>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ height: "60vh",backgroundColor: theme.palette.panda.contrastText,borderRadius:5 }}></Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
