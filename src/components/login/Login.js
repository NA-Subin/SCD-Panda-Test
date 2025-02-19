import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
  ShowError,
  ShowInfo,
  ShowSuccess,
  ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, database, googleProvider } from "../../server/firebase";
import Cookies from 'js-cookie';
import UpdateDatabase from "../dashboard/test";

function createData(No, Email, Password, Position) {
  return {
    No,
    Email,
    Password,
    Position,
  };
}

const Login = () => {
  const navigate = useNavigate();

// ตั้งค่า Token

  useEffect(() => {
    const token = Cookies.get('user'); // ตรวจสอบว่ามี Cookie ที่ชื่อ 'auth_token' หรือไม่
    if (token) {
      if (token){
        database
              .ref("/employee/officers/")
              .orderByChild("User")
              .equalTo(token)
              .on("value", (snapshot) => {
                const datas = snapshot.val();
                const dataList = [];
                for (let id in datas) {
                    if(datas[id].Position === "พนักงานขายหน้าลาน"){
                      navigate("/gasstation-attendant", { 
                        state: { Employee: datas[id] } 
                      });
                    }else{
                      navigate("/choose");
                    }
                }
              });
      }
      else{
        navigate('/');
      }
    }
  }, []);

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // const handleSubmit = async () => {
  //   await HTTP.get("/employee?Email="+user)
  //       .then(res => {
  //           if(res.data.length <= 0 || res.data === undefined){
  //           console.log("ไม่มีข้อมูล");
  //           ShowError("ไม่มีอีเมลนี้ในระบบ")
  //           }else{
  //           res.data.map((row) => (
  //             row.Password === password ?
  //             (
  //               Cookies.set('token', row.Email.split('@')[0]+"#"+dayjs(new Date())+"?"+row.Position, { expires: 7 }),
  //               // navigate("/"+user.split('@')[0]+"/dashboard/")
  //               navigate("/choose")
  //             )
  //             : ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง")
  //           ))
  //           }
  //       })
  //       .catch(e => {
  //           console.log(e);
  //       });
  // }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Sign-in Success:", result.user);
    } catch (error) {
      console.error("Error during Google Sign-in:", error);
    }
  };

  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วย Email และ Password
  const loginUser = async (event) => {
    event.preventDefault();
    if(user !== "" && password !== ""){
      signInWithEmailAndPassword(auth, (user+"@gmail.com"), password)
          .then((userCredential) => {
            database
  .ref("/employee/officers")
  .orderByChild("User")
  .equalTo(user)
  .once("value")
  .then((snapshot) => {
    const datas = snapshot.val();
    if (datas) {
      // พบข้อมูลใน "/employee/officers"
      const dataList = [];
      for (let id in datas) {
        dataList.push({ id, ...datas[id] });
        if (datas[id].Password === password) {
          Cookies.set("user", user, {
            expires: 30,
            secure: true,
            sameSite: "Lax",
          });

          Cookies.set(
            "sessionToken",
            user + "$" + datas[id].id,
            {
              expires: 30,
              secure: true,
              sameSite: "Lax",
            }
          );

          if (datas[id].Position === "พนักงานขายหน้าลาน") {
            navigate("/gasstation-attendant", {
              state: { Employee: datas[id] },
            });
          } else {
            navigate("/choose");
          }
        } else {
          ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง");
        }
      }
    } else {
      // ไม่พบข้อมูลใน "/employee/officers"
      return database
        .ref("/employee/creditors")
        .orderByChild("User")
        .equalTo(user)
        .once("value");
    }
  })
  .then((snapshot) => {
    if (snapshot) {
      const datas = snapshot.val();
      if (datas) {
        // พบข้อมูลใน "/employee/creditor"
        const dataList = [];
        for (let id in datas) {
          dataList.push({ id, ...datas[id] });
          if (datas[id].Password === password) {
            Cookies.set("user", user, {
              expires: 30,
              secure: true,
              sameSite: "Lax",
            });

            Cookies.set(
              "sessionToken",
              user.split("@")[0] + "$" + datas[id].id,
              {
                expires: 30,
                secure: true,
                sameSite: "Lax",
              }
            );

            // ตัวอย่างเพิ่มเติมเงื่อนไขอื่น
            navigate("/trade-payable", {
              state: { Creditor: datas[id] },
            });
          } else {
            ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง");
          }
        }
      } else {
        // ไม่พบข้อมูลในทั้งสองฐานข้อมูล
        ShowError("ไม่พบ User ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง");
      }
    }
  })
  .catch((error) => {
    console.error("Error:", error);
    ShowError("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
  });
          })
          .catch((error) => {
            ShowError("User หรือ Pasword ไม่ถูกต้อง");
            console.log(error);
          })
    }
    else{
      ShowWarning("กรุณากรอก User และ Password");
    }
  };

  // const loginUser = async (user, password) => {
  //   try {
  //     const userCredential = await signInWithEmailAndPassword(auth, user, password);
  //     const user = userCredential.user;

  //     // ดึงตำแหน่ง (Position) ของพนักงานจาก Realtime Database
  //     const dbRef = ref(database);
  //     const snapshot = await get(child(dbRef, `employee/${user.uid}`));

  //     if (snapshot.exists()) {
  //       const userData = snapshot.val();
  //       const position = userData.Position;

  //       // แสดงข้อมูลตำแหน่ง
  //       console.log('Position:', position);

  //       // ตรวจสอบสิทธิ์การเข้าถึง
  //       if (position === "1") {
  //         console.log('User is admin. Can view and edit data.');
  //         Cookies.set('token', user.split('@')[0]+"#"+dayjs(new Date())+"?"+position, { expires: 7 }),
  //         navigate("/choose")
  //       } else {
  //         console.log('User is regular employee. Can only view data.');
  //         Cookies.set('token', user.split('@')[0]+"#"+dayjs(new Date())+"?"+position, { expires: 7 }),
  //         navigate("/choose")
  //       }

  //     } else {
  //       console.log('No data available');
  //     }
  //   } catch (error) {
  //     console.error('Error logging in:', error);
  //   }
  // };

  return (
    <Container sx={{ p: { xs: 3, sm: 6, md: 9 }, maxWidth: { xs: "lg", sm: "md", md: "sm" }}}>
      <Paper
        sx={{
          borderRadius: 5,
          boxShadow: "1px 1px 2px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          height={50}
          sx={{
            backgroundColor: theme.palette.panda.main,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        />
        <Box sx={{
    p: { xs: 3, sm: 4, md: 5 },
    marginTop: { xs: -2, sm: -3, md: -4 },
    marginBottom: { xs: -1, sm: -2, md: -3 },
  }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.panda.main}
            gutterBottom
          >
            ยินดีต้อนรับเข้าสู่ระบบ
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginTop={-1}
          >
            <img src={Logo} width="150" />
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginLeft={-4.7}
              marginTop={3.7}
            >
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.error.main}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                S
              </Typography>
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.warning.light}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                C
              </Typography>
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.info.dark}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                D
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={2} marginTop={-2} component="form"
      onSubmit={loginUser}>
            <Grid item xs={12}>
              <TextField
                label="User"
                size="small"
                type="user"
                variant="filled"
                fullWidth
                defaultValue={user}
                onChange={(e) => setUser(e.target.value)}
                sx={{ backgroundColor: theme.palette.primary.contrastText }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                size="small"
                type="password"
                variant="filled"
                fullWidth
                defaultValue={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ backgroundColor: theme.palette.primary.contrastText }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Button variant="contained" color="info" type="submit">
                เข้าสู่ระบบ
              </Button>
            </Grid>
            {/* <Grid item xs={3} textAlign="left"></Grid>
              <Grid item xs={12}><Divider/></Grid>
              <Grid item xs={3} textAlign="left"></Grid>
              <Grid item xs={6} textAlign="center">
                <Button variant="contained" color="info" onClick={handleGoogleSignIn}>เข้าสู่ระบบด้วย Google</Button>
              </Grid>
              <Grid item xs={3} textAlign="left"></Grid> */}
          </Grid>
        </Box>
        <Box
          height={50}
          sx={{
            backgroundColor: theme.palette.panda.light,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        />
      </Paper>
      {/* <UpdateDatabase /> */}
    </Container>
  );
};

export default Login;
