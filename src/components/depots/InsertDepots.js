import CancelIcon from '@mui/icons-material/Cancel';
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import {
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    Typography
} from "@mui/material";
import "dayjs/locale/th";
import React from "react";
import { IconButtonError } from "../../theme/style";
import theme from "../../theme/theme";
import InsertDepot from "./depot/InsertDepot";
import InsertGasStations from "./gasstations/InsertGasStations";
import InsertStock from "./stock/InsertStock";

const InserDepots = (props) => {
    const { show,depot,stock,gasStation } = props;
    const [check, setCheck] = React.useState(show);
    const [menu, setMenu] = React.useState(0);
        const [open, setOpen] = React.useState(false);
    
        const handleClickOpen = () => {
            setOpen(true);
        };
    
        const handleClose = () => {
            setOpen(false);
        };
    
        // console.log("จำนวนปั้ม "+gasStation);
        // console.log("จำนวนคลังสต็อกน้ำมัน "+stock);
        // console.log("จำนวนคลังรับน้ำมัน "+depot);

    return (
        <React.Fragment>
            <Button variant="contained" color="info" onClick={handleClickOpen} sx={{ height: 50, borderRadius: 3 }} 
            endIcon={
                show === 1 ? <LocalGasStationIcon/>
                : show === 2 ? <WaterDropIcon />
                : <OilBarrelIcon/>
            }>
                {
                    show === 1 ? "เพิ่มปั้มน้ำมัน" : show === 2 ? "เพิ่มคลังสต็อกน้ำมัน" : "เพิ่มคลังรับน้ำมัน"
                }
            </Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
                sx={{zIndex: 1000}}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >{
                                show === 1 ? "เพิ่มปั้มน้ำมัน" : show === 2 ? "เพิ่มคลังสต็อกน้ำมัน" : "เพิ่มคลังรับน้ำมัน"
                            }</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2}>
                        <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                            <FormGroup row >
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom marginRight={2} marginTop={1}>เลือกข้อมูลที่ต้องการเพิ่ม</Typography>
                                <FormControlLabel control={<Checkbox onClick={() => setCheck(1)} checked={check ===  1 ? true : false}
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            fontSize: 20, // ปรับขนาด Checkbox
                                        },
                                    }} />}
                                    label="ปั้มน้ำมัน"
                                    sx={{
                                        "& .MuiFormControlLabel-label": {
                                            fontSize: "14px",
                                            fontWeight: "bold"
                                        },
                                    }} />
                                <Divider orientation="vertical" flexItem sx={{ marginRight: 2, height: 30 }} />
                                <FormControlLabel control={<Checkbox onClick={() => setCheck(2)} checked={check === 2 ? true : false}
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            fontSize: 20, // ปรับขนาด Checkbox
                                        },
                                    }} />}
                                    label="คลังสต็อกน้ำมัน"
                                    sx={{
                                        "& .MuiFormControlLabel-label": {
                                            fontSize: "14px",
                                            fontWeight: "bold"
                                        },
                                    }} />
                                    <Divider orientation="vertical" flexItem sx={{ marginRight: 2, height: 30 }} />
                                    <FormControlLabel control={<Checkbox onClick={() => setCheck(3)} checked={check === 3 ? true : false}
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            fontSize: 20, // ปรับขนาด Checkbox
                                        },
                                    }} />}
                                    label="คลังรับน้ำมัน"
                                    sx={{
                                        "& .MuiFormControlLabel-label": {
                                            fontSize: "14px",
                                            fontWeight: "bold"
                                        },
                                    }} />
                            </FormGroup>
                        </Grid>
                        {
                            check === 1 ?
                            <InsertGasStations gasStation={gasStation} />
                            : check === 2 ?
                            <InsertStock stock={stock} />
                            :
                            <InsertDepot depot={depot} />
                        }
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default InserDepots;
