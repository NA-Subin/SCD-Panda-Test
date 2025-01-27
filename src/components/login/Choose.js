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
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Cookies from 'js-cookie';
import UpdateDatabase from "../dashboard/test";

const Choose = () => {
  const navigate = useNavigate();


  const handleChooseGasStation = () => {
    navigate("/gasStation-admin");
  }

  const handleChooseDashboard = () => {
    navigate("/dashboard");
  }

  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วย Email และ Password
  return (
    <Container sx={{ p: { xs: 2, sm: 3 }, maxWidth: { xs: "lg", sm: "md" }}}>
      <Grid container spacing={5} sx={{ marginTop: { xs: 2, sm: 4, md: 20} }}>
        <Grid item xs={12}>
            <Typography variant="h3" fontWeight="bold" textAlign="center">กรุณาเลือกหน้าที่ต้องการ</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
            <Button variant="contained" 
            color="error" 
            fullWidth 
            sx={{ height: "20vh", borderRadius: 5,fontSize: 26, fontWeight: "bold" }} 
            onClick={handleChooseGasStation}
            startIcon={
                <LocalGasStationIcon
                    sx={{
                        width: 80,  // ความกว้างที่ต้องการ
                        height: 80, // ความสูงที่ต้องการ
                    }}
                />
            }
            >
                ทดสอบหน้าลาน
            </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
            <Button variant="contained" 
            color="info" 
            fullWidth 
            sx={{ height: "20vh", borderRadius: 5,fontSize: 26, fontWeight: "bold" }} 
            onClick={handleChooseDashboard}
            startIcon={
                <DashboardIcon
                    sx={{
                        width: 80,  // ความกว้างที่ต้องการ
                        height: 80, // ความสูงที่ต้องการ
                    }}
                />
            }>
                หน้าหลัก
            </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Choose;
