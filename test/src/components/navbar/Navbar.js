import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import HomeIcon from "@mui/icons-material/Home";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import GroupsIcon from "@mui/icons-material/Groups";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Divider,
  Fade,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconButtonOnNavbar, TablecellHeader } from "../../theme/style";
// import Logo from "../../../public/logoPanda.jpg";
import {
  ShowError,
  showLogout,
  ShowSuccess,
  showWelcome,
} from "../sweetalert/sweetalert";
import { auth, database } from "../../server/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
const drawerWidth = 200;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  height: 50,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Navbar() {
  const navigate = useNavigate();
  // const { state } = useLocation();
  // console.log(state.Position);
  // const { email } = useParams();
  // console.log(email);
  // const token = Cookies.get('token');

  let position = "";
  const [data, setData] = useState([]);

  const getData = async () => {
    database.ref("/employee").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataList = [];
      for (let id in datas) {
        dataList.push({ id, ...datas[id] });
      }
      console.log(dataList);
      setData(dataList);
    });
    // await HTTP.get("/employee")
    // .then(res => {
    //     if(res.data.length <= 0){
    //     setData("ไม่มีข้อมูล")
    //     }else{
    //     setData(res.data)
    //     }
    // })
    // .catch(e => {
    //     console.log(e);
    // });
  };

  // data.map((row) => (
  //   row.Email.split('@')[0] === email && (position = row.Position)
  // ))

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        console.log("true");
      } else {
        console.log("false");
        ShowError("กรุณาเข้าสู่ระบบ");
        navigate("/");
        // User is signed out.
      }
    });

    getData();
  }, []);

  // const dataToSend = { position: "admin" };
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [setting, setSetting] = React.useState(false);
  const [show1, setShow1] = React.useState(show1);
  const [show2, setShow2] = React.useState(show2);
  const [logo, setLogo] = React.useState(false);
  const [notify, setNotify] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleSetting = () => {
    setSetting(true);
    setShow1(null);
    setShow2(null);
    navigate("/setting");
  };

  const handleNotify = () => {
    setNotify(true);
  };

  const handleNotifyClose = () => {
    setNotify(false);
  };

  const handleHomepage = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        // Cookies.remove('token');
        navigate("/"); // นำผู้ใช้ไปยังหน้า login
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  // const handleLogout = () => {
  //   showLogout("ออกจากระบบเรียบร้อย"),
  //   Cookies.remove('token');
  //   navigate("/")
  // }

  const [anchorEl, setAnchorEl] = React.useState(null);
  const menu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const UserSignOut = () => {
    withReactContent(Swal)
      .fire({
        title: "ต้องการออกจากระบบใช่หรือไม่",
        icon: "error",
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
        showCancelButton: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          signOut(auth)
            .then(() => {
              navigate("/");
              Swal.fire("ออกจากระบบเรียบร้อย", "", "success");
            })
            .catch((error) => {
              Swal.fire("ไม่สามารถออกจากระบบได้", "", "error");
              console.log(error);
            });
        } else if (result.isDenied) {
          Swal.fire("ออกจากระบบล้มเหลว", "", "error");
          console.log(error);
        }
      });
  };

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: "#44b700",
      color: "#44b700",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(1.5)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  }));

  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{ backgroundColor: theme.palette.panda.dark, height: 60,zIndex: 900 }}
      >
        <Toolbar variant="dense">
          {!open ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginLeft={-3}
              marginTop={logo ? 0 : 0.5}
              sx={{
                backgroundColor: "white",
                borderTopRightRadius: logo ? 35 : 25,
                borderBottomRightRadius: logo ? 35 : 25,
              }}
              onMouseEnter={() => setLogo(true)}
              onMouseLeave={() => setLogo(false)}
            >
              <IconButton
                color={open ? "inherit" : theme.palette.panda.dark}
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                  marginLeft: 2,
                  mr: 1.5,
                  ...(open && { display: "none" }),
                  marginRight: logo ? 3 : 0,
                }}
              >
                <MenuIcon />
              </IconButton>
              <img
                // src={Logo}
                width={logo ? "60" : "50"}
                onClick={handleHomepage}
              />
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                marginTop={1}
                marginLeft={-1.5}
                paddingRight={logo ? 2 : 1}
                onClick={handleHomepage}
              >
                <Typography
                  variant={logo ? "h4" : "h5"}
                  color={theme.palette.error.main}
                  sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                  fontWeight="bold"
                  gutterBottom
                >
                  S
                </Typography>
                <Typography
                  variant={logo ? "h4" : "h5"}
                  color={theme.palette.warning.light}
                  sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                  fontWeight="bold"
                  gutterBottom
                >
                  C
                </Typography>
                <Typography
                  variant={logo ? "h4" : "h5"}
                  color={theme.palette.info.dark}
                  sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                  fontWeight="bold"
                  gutterBottom
                >
                  D
                </Typography>
              </Box>
            </Box>
          ) : (
            ""
          )}
          <Grid container spacing={2} paddingTop={1}>
            <Grid item xs={6}></Grid>
            <Grid
              item
              xs={6}
              justifyContent="right"
              display="flex"
              alignItems="center"
            >
              <Tooltip title="แจ้งเตือน">
                <IconButtonOnNavbar
                  sx={{
                    backgroundColor: !notify
                      ? theme.palette.panda.dark
                      : "white",
                    marginRight: 1,
                    marginLeft: 1,
                  }}
                  color={!notify ? "inherit" : theme.palette.panda.dark}
                  onClick={handleNotify}
                >
                  <Badge
                    badgeContent={20}
                    color="error"
                    max={9}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 11, // ขนาดตัวเลขใน Badge
                        minWidth: 15, // ความกว้างของ Badge
                        height: 15, // ความสูงของ Badge
                        right: -2,
                      },
                    }}
                  >
                    <NotificationsActiveIcon />
                  </Badge>
                  <Snackbar
                    open={notify}
                    onClose={handleNotifyClose}
                    autoHideDuration={5000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Position at top-right
                  >
                    <Alert onClose={handleNotifyClose} severity="info" sx={{ width: "100%", marginTop: 5 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>แจ้งเตือน</Typography>
                      <Divider sx={{ marginTop:1 }}/>
                      <TableContainer
                        component={Paper}
                        style={{ maxHeight: "50vh" }}
                      >
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 14,backgroundColor: theme.palette.panda.dark }}>
                                ลำดับ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 14 }}>
                                แจ้งเตือน
                              </TablecellHeader>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>1</TableCell>
                              <TableCell>มีการอนุมัติเที่ยววิ่งแล้ว</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Alert>
                  </Snackbar>
                </IconButtonOnNavbar>
              </Tooltip>
              <Divider
                orientation="vertical"
                variant="fullWidth"
                flexItem
                sx={{ border: "1px solid white" }}
              />
              <Tooltip title="ตั้งค่า">
                <IconButtonOnNavbar
                  sx={{
                    backgroundColor: !setting
                      ? theme.palette.panda.dark
                      : "white",
                    marginRight: 1,
                    marginLeft: 1,
                  }}
                  color={!setting ? "inherit" : theme.palette.panda.dark}
                  onClick={handleSetting}
                >
                  <SettingsIcon />
                </IconButtonOnNavbar>
              </Tooltip>
              <Divider
                orientation="vertical"
                variant="fullWidth"
                flexItem
                sx={{ border: "1px solid white" }}
              />
              <Tooltip title="ออกจากระบบ">
                <IconButtonOnNavbar
                  sx={{
                    backgroundColor: !menu ? theme.palette.panda.dark : "white",
                    marginRight: 1,
                    marginLeft: 1,
                  }}
                  color={!menu ? "inherit" : theme.palette.panda.dark}
                  id="demo-positioned-button"
                  aria-controls={!menu ? "demo-positioned-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={!menu ? "true" : undefined}
                  onClick={handleClick}
                >
                  <MeetingRoomIcon />
                </IconButtonOnNavbar>
              </Tooltip>
              <Divider
                orientation="vertical"
                variant="fullWidth"
                flexItem
                sx={{ border: "1px solid white" }}
              />
              <Menu
                id="fade-menu"
                MenuListProps={{
                  "aria-labelledby": "fade-button",
                }}
                anchorEl={anchorEl}
                open={menu}
                onClose={handleClose}
                TransitionComponent={Fade}
              >
                <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open} sx={{ zIndex: 800 }}>
        <DrawerHeader sx={{ height: 60 }}>
          <Box display="flex" justifyContent="center" alignItems="center">
            {/* <img src={Logo} width="50" /> */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginTop={1}
              marginLeft={-1.5}
            >
              <Typography
                variant="h5"
                color={theme.palette.error.main}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                S
              </Typography>
              <Typography
                variant="h5"
                color={theme.palette.warning.light}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                C
              </Typography>
              <Typography
                variant="h5"
                color={theme.palette.info.dark}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                D
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleDrawerClose}
            size="small"
            sx={{ marginLeft: 4 }}
          >
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box textAlign="center" marginTop={1} sx={{ opacity: open ? 1 : 0 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {
              // token.split("?")[2] === "meter" ? "รถมิเตอร์" : token.split("?")[2] === "truck" ? "รถช่อง" : ""
            }
          </Typography>
        </Box>
        <Box
          sx={{
            height: open ? 200 : 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: open ? -6 : -3,
          }}
        >
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
          >
            <Avatar
              /*alt={token.split("#")[0]}*/ src="/static/images/avatar/2.jpg"
              sx={{ width: open ? 100 : 40, height: open ? 100 : 40 }}
            />
          </StyledBadge>
        </Box>
        <Box
          textAlign="center"
          marginTop={-4}
          marginBottom={2}
          sx={{ opacity: open ? 1 : 0 }}
        >
          {/* <Typography variant='subtitle2' fontWeight="bold" gutterBottom>
            {
              data.map((row) => (
                row.Email.split('@')[0] === token.split("#")[0] ?
                  row.Email
                : ""
              ))
            }
          </Typography> */}
        </Box>
        <Divider
          sx={!open ? { border: 1, color: theme.palette.primary.contrastText } : {}}
        />
        <List
          sx={
            !open ? {
              backgroundColor: theme.palette.panda.dark,
              color: theme.palette.primary.contrastText,
            }
              : {}
          }
        >
          {["หน้าหลัก", "พนักงาน", "รถบรรทุก"].map((text, index) => (
            <ListItem
              key={text}
              disablePadding
              sx={{
                backgroundColor: show1 === index && theme.palette.panda.dark,
              }}
            >
              <ListItemButton
                component={Link}
                to={
                  index === 0
                    ? "/dashboard"
                    : index === 1 ? "/employee"
                    : index === 2 ? "/trucks"
                      : "/trucks"
                }
                onClick={() => (setShow1(index), setSetting(false))}
                onMouseUp={() => (setShow1(index), setSetting(false))}
                onMouseDown={() => setShow2(null)}
              >
                <ListItemIcon
                  sx={
                    !open || show1 === index
                      ? { color: theme.palette.primary.contrastText }
                      : { color: theme.palette.dark }
                  }
                >
                  {index === 0 ? (
                    <HomeIcon />
                  ) : index === 1 ? (
                    <AccountCircleIcon />
                  ) : index === 2 ? (
                    <LocalShippingIcon />
                  ) : (
                    <LocalShippingIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={
                    show1 === index && {
                      color: theme.palette.primary.contrastText,
                    }
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider
          sx={!open ? { border: 2, color: theme.palette.primary.contrastText } : {}}
        />
        <List
          sx={
            !open ? {
              backgroundColor: theme.palette.panda.main,
              color: theme.palette.primary.contrastText,
            }
              : {}
          }
        >
          {/* {[position === 'แอดมิน' && 'พนักงาน', 'สินค้า', 'ลูกค้า', 'พนักงานขับรถ', 'รถบรรทุก',position !== 'เซลล์' && 'หนี้สิน'].map((text, index) => ( */}
          {["ขายน้ำมัน", "คลัง", "ลูกค้า", "ตั๋วน้ำมัน", "เจ้าหนี้การค้า"].map((text, index) => (
            <ListItem
              key={text}
              disablePadding
              sx={{
                backgroundColor: show2 === index && theme.palette.panda.dark,
              }}
            >
              <ListItemButton
                component={Link}
                onClick={() => (setShow2(index), setSetting(false))}
                onMouseUp={() => (setShow2(index), setSetting(false))}
                onMouseDown={() => setShow1(null)}
                to={
                  index === 0
                    ? "/selling"
                    : index === 1
                      ? "/depots"
                      : index === 2
                        ? "/customer"
                        : index === 3
                          ? "/ticket"
                          : "/creditor"
                }
              >
                <ListItemIcon
                  sx={
                    !open || show2 === index
                      ? { color: theme.palette.primary.contrastText }
                      : { color: theme.palette.dark }
                  }
                >
                  {/* {position === 'แอดมิน' && index === 0 ? <AccountCircleIcon /> : index === 1 ? <StoreMallDirectoryIcon /> : index === 2 ? <GroupsIcon/> : index === 3 ? <EngineeringIcon/> :index === 4 ? <LocalShippingIcon/> : position !== 'เซลล์' && index === 5 ? <AttachMoneyIcon/> : ""} */}
                  {index === 0 ? (
                    <ListAltIcon />
                  ) : index === 1 ? (
                    <StoreMallDirectoryIcon />
                  ) : index === 2 ? (
                    <GroupsIcon />
                  ) : index === 3 ? (
                    <BookOnlineIcon />
                  ) : (
                    <CurrencyExchangeIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={
                    show2 === index && {
                      color: theme.palette.primary.contrastText,
                    }
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}