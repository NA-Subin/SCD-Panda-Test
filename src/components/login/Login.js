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
import CryptoJS from "crypto-js";

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
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // ฟังก์ชันสำหรับเข้ารหัสรหัสผ่าน
  const encryptPassword = (password) => {
    const encrypted = CryptoJS.AES.encrypt(password, 'your-secret-key').toString();
    return encrypted;
  };

  // ฟังก์ชันสำหรับถอดรหัสรหัสผ่าน
  const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, 'your-secret-key');
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    return originalPassword;
  };

  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วย Email และ Password
  const loginUser = async (event) => {
    event.preventDefault();

    if (!user || !password) {
      ShowWarning("กรุณากรอก User และ Password");
      return;
    }

    try {
      // เข้ารหัสรหัสผ่านก่อนเก็บใน Cookie
      const encryptedPassword = encryptPassword(password);

      // เข้าสู่ระบบ Firebase ด้วยรหัสผ่านที่เข้ารหัส
      const userCredential = await signInWithEmailAndPassword(
        auth,
        `${user}@gmail.com`,
        password // ใช้รหัสผ่านที่ไม่ได้เข้ารหัสสำหรับ Firebase
      );

      const snapshot = await database
        .ref("/employee/officers")
        .orderByChild("User")
        .equalTo(user)
        .once("value");

      const datas = snapshot.val();

      if (datas) {
        for (let id in datas) {
          if (datas[id].Password === password) {
            // บันทึก Cookies โดยใช้รหัสผ่านที่เข้ารหัส
            Cookies.set("user", user, { expires: 30, secure: true, sameSite: "Lax" });
            Cookies.set("sessionToken", `${user}$${datas[id].id}`, { expires: 30, secure: true, sameSite: "Lax" });
            Cookies.set("password", encryptedPassword, { expires: 30, secure: true, sameSite: "Lax" });

            if (datas[id].Position === "พนักงานขายหน้าลาน") {
              navigate("/gasstation-attendant", { state: { Employee: datas[id] } });
            } else {
              navigate("/choose");
            }
            return;
          }
        }
        ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง");
        return;
      }

      // ถ้าไม่เจอใน officers ให้เช็ค creditors
      const creditorSnapshot = await database
        .ref("/employee/creditors")
        .orderByChild("User")
        .equalTo(user)
        .once("value");

      const creditorDatas = creditorSnapshot.val();
      if (creditorDatas) {
        for (let id in creditorDatas) {
          if (creditorDatas[id].Password === password) {
            // บันทึก Cookies โดยใช้รหัสผ่านที่เข้ารหัส
            Cookies.set("user", user, { expires: 30, secure: true, sameSite: "Lax" });
            Cookies.set("sessionToken", `${user}$${creditorDatas[id].id}`, { expires: 30, secure: true, sameSite: "Lax" });
            Cookies.set("password", encryptedPassword, { expires: 30, secure: true, sameSite: "Lax" });

            navigate("/trade-payable", { state: { Creditor: creditorDatas[id] } });
            return;
          }
        }
        ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง");
        return;
      }

      // ถ้าไม่เจอทั้งสองฐานข้อมูล
      ShowError("ไม่พบ User ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง");
    } catch (error) {
      console.error("Login Error:", error);
      ShowError("User หรือ Password ไม่ถูกต้อง");
    }
  };

  useEffect(() => {
    const token = Cookies.get("user"); // ตรวจสอบว่ามี Cookie ที่ชื่อ 'auth_token' หรือไม่
    const encryptedPassword = Cookies.get("password");

    if (token && encryptedPassword) {
      // ถ้ามี token และรหัสผ่านใน cookies ให้เข้าสู่ระบบ
      const password = decryptPassword(encryptedPassword); // ถอดรหัสรหัสผ่าน
      signInWithEmailAndPassword(auth, `${token}@gmail.com`, password) // ใช้ password ที่ถอดรหัสจาก cookie
        .then((userCredential) => {
          // ตรวจสอบฐานข้อมูล Firebase หลังจากเข้าสู่ระบบสำเร็จ
          database
            .ref("/employee/officers/")
            .orderByChild("User")
            .equalTo(token)
            .once("value") // ใช้ .once เพื่อดึงข้อมูลแค่ครั้งเดียว
            .then((snapshot) => {
              const datas = snapshot.val();
              if (datas) {
                for (let id in datas) {
                  // ตรวจสอบตำแหน่งของผู้ใช้ในระบบ
                  if (datas[id].Position === "พนักงานขายหน้าลาน") {
                    navigate("/gasstation-attendant", {
                      state: { Employee: datas[id] },
                    });
                  } else {
                    navigate("/choose");
                  }
                }
              }
            })
            .catch((error) => {
              console.error("Error fetching employee data:", error);
              navigate("/");
            });
        })
        .catch((error) => {
          console.error("Error signing in:", error);
          navigate("/");
        });
    } else {
      // ถ้าไม่มี cookie 'user' หรือ 'password' ให้ไปหน้า login
      navigate("/");
    }
  }, [navigate]);

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
