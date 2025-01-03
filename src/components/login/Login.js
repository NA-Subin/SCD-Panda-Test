import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database, googleProvider } from "../../server/firebase";
import theme from "../../theme/theme";
import {
  ShowError,
  ShowWarning
} from "../sweetalert/sweetalert";

function createData(No, Email, Password, Position) {
  return {
    No,
    Email,
    Password,
    Position,
  };
}
const data = [
  createData(1, "admin@gmail.com", "1234567", "admin"),
  createData(2, "sale@gmail.com", "1234567", "sale"),
  createData(3, "finance@gmail.com", "1234567", "finance"),
];

const Login = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const token = Cookies.get('token'); // ตรวจสอบว่ามี Cookie ที่ชื่อ 'auth_token' หรือไม่
  //   if (token) {
  //     if (token.split('?')[2]){
  //       navigate('/dashboard');
  //     }
  //     else{
  //       navigate('/');
  //     }
  //   }
  // }, []);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const handleSubmit = async () => {
  //   await HTTP.get("/employee?Email="+email)
  //       .then(res => {
  //           if(res.data.length <= 0 || res.data === undefined){
  //           console.log("ไม่มีข้อมูล");
  //           ShowError("ไม่มีอีเมลนี้ในระบบ")
  //           }else{
  //           res.data.map((row) => (
  //             row.Password === password ?
  //             (
  //               Cookies.set('token', row.Email.split('@')[0]+"#"+dayjs(new Date())+"?"+row.Position, { expires: 7 }),
  //               // navigate("/"+email.split('@')[0]+"/dashboard/")
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
    email !== "" && password !== ""
      ? signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            database
              .ref("/employee/officers")
              .orderByChild("Email")
              .equalTo(email)
              .on("value", (snapshot) => {
                const datas = snapshot.val();
                const dataList = [];
                for (let id in datas) {
                  dataList.push({ id, ...datas[id] });
                  datas[id].Password === password
                    ? navigate("/dashboard")
                    : // (
                      //   Cookies.set('token', datas[id].Email.split('@')[0]+"#"+dayjs(new Date())+"?"+datas[id].Position, { expires: 7 }),
                      //   navigate("/dashboard"),
                      //   console.log(userCredential)
                      // )
                      ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง");
                }
              });
          })
          .catch((error) => {
            ShowError("Email หรือ Pasword ไม่ถูกต้อง");
            console.log(error);
          })
      : ShowWarning("กรุณากรอก Email และ Password");
  };

  // const loginUser = async (email, password) => {
  //   try {
  //     const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
  //         Cookies.set('token', email.split('@')[0]+"#"+dayjs(new Date())+"?"+position, { expires: 7 }),
  //         navigate("/choose")
  //       } else {
  //         console.log('User is regular employee. Can only view data.');
  //         Cookies.set('token', email.split('@')[0]+"#"+dayjs(new Date())+"?"+position, { expires: 7 }),
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
    <Container maxWidth="sm" sx={{ p: 12 }}>
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
        <Box p={5} marginTop={-2} marginBottom={-3}>
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
            {/* <img src={`${process.env.PUBLIC_URL}/logoPanda.jpg`} alt="Logo" width="150"/> */}
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
                label="Email"
                size="small"
                type="email"
                variant="filled"
                fullWidth
                defaultValue={email}
                onChange={(e) => setEmail(e.target.value)}
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
    </Container>
  );
};

export default Login;
