import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TableCell,
  TableRow,
  TextField
} from "@mui/material";
import React from "react";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const TicketsDetail = (props) => {
  const { tickets } = props;
  const [setting, setSetting] = React.useState(true);
  const [id, setID] = React.useState(tickets.id);
  const [code, setCode] = React.useState(tickets.Code);
  const [name, setName] = React.useState(tickets.Name);
  const [type, setType] = React.useState(tickets.Type);
  const [employee, setEmployee] = React.useState(tickets.Employee);
  const [note, setNote] = React.useState(tickets.Note);

  const handleUpdate = () => {
    database
        .ref("/tickets")
        .child(tickets.id - 1)
        .update({
            Code: code,
            Name: name,
            Note: note,
            Employee: "ไม่มี",
            Type: type
        })
        .then(() => {
            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            console.log("Data pushed successfully");
            setSetting(true);
        })
        .catch((error) => {
            ShowError("แก้ไขข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        });
};

  return (
    <React.Fragment>
      {
        setting ?
          <TableRow>
            <TableCell sx={{ textAlign: "center" }}>{id}</TableCell>
            <TableCell sx={{ textAlign: "center" }}>{
            code.split(":")[0]+code.split(":")[1]
            }</TableCell>
            <TableCell sx={{ textAlign: "center" }}>{name}</TableCell>
            <TableCell sx={{ textAlign: "center" }}>{type}</TableCell>
            <TableCell sx={{ textAlign: "center" }}>{employee}</TableCell>
            <TableCell sx={{ textAlign: "center" }}>
              <IconButton color="warning" size="small" sx={{ marginTop: -0.5 }} onClick={() => setSetting(false)}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
          :
          <TableRow>
            <TableCell sx={{ textAlign: "center" }}>{id}</TableCell>
            <TableCell sx={{ textAlign: "center" }}>
              <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                <TextField size="small" fullWidth
                  InputLabelProps={{
                    sx: {
                      fontSize: '14px'
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            {code.split(":")[0]}
                        </InputAdornment>
                    ),
                }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '30px',
                      fontSize: "14px" // ปรับความสูงของ TextField
                    },
                  }}
                  value={code.split(":")[1]}
                  onChange={(e) => setCode(e.target.value)}
                />
              </Paper>
            </TableCell>
            <TableCell sx={{ textAlign: "center" }}>
              <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                <TextField size="small" fullWidth
                  InputLabelProps={{
                    sx: {
                      fontSize: '14px'
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '30px',
                      fontSize: "14px" // ปรับความสูงของ TextField
                    },
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Paper>
            </TableCell>
            <TableCell sx={{ textAlign: "center" }}>
              <Paper
                component="form">
                <Select
                  id="demo-simple-select"
                  value={type}
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
                  onChange={(e) => setType(e.target.value)}
                  fullWidth
                >
                  <MenuItem value={"ปั้มน้ำมัน"}>ปั้มน้ำมัน</MenuItem>
                  <MenuItem value={"ขนส่ง"}>ขนส่ง</MenuItem>
                  <MenuItem value={"ขายย่อย"}>ขายย่อย</MenuItem>
                </Select>
              </Paper>
            </TableCell>
            <TableCell sx={{ textAlign: "center" }}>{employee}</TableCell>
            <TableCell sx={{ textAlign: "center" }}>
              <IconButton color="error" size="small" sx={{ marginTop: -0.5 }} onClick={() => setSetting(true)}>
                <CancelIcon fontSize="small" />
              </IconButton>
              <IconButton color="success" size="small" sx={{ marginTop: -0.5 }} onClick={handleUpdate}>
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
      }
    </React.Fragment>
  );
};

export default TicketsDetail;
