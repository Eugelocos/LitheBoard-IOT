import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { faBars } from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  IconButton,
  Tooltip,
  Box,
  Typography,
  MenuItem,
  Divider,
  Badge,
  Collapse,
  List,
  ListItem,
  AppBar,
  Toolbar,
  Menu
} from "@mui/material";
import {
  Logout,
  Settings,
  Notifications
} from "@mui/icons-material";
import {
  AccountCircle,
  MenuRounded as MenuRoundedIcon,
  MoreVert as MoreVertIcon,
  NotificationImportantRounded as NotificationImportantRoundedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from "@mui/icons-material";


function TopMenu({ user, toggleMenu, handleSwitchSection, alarms, allNotifications, setAllNotifications, unseenNotifications, setUnseenNotifications, fetchNotifications}) {
  const navigate = useNavigate();
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const userPanelRef = useRef(null);

  const toggleUserPanel = () => {
    setUserPanelOpen(!userPanelOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3001/api/logout",
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userPanelRef.current &&
        !userPanelRef.current.contains(event.target)
      ) {
        setUserPanelOpen(false);
      }
    };

    if (userPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userPanelOpen]);

  const handleNotificationsClick = (event) => {
    setNotificationsMenuOpen(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsMenuOpen(null);
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {


    if (user && alarms.length > 0) {
      fetchNotifications();
    }
  }, [user, alarms]);

  const handleMarkAsRead = (notificationId) => {
    // Call API to mark notification as read
    axios
      .post(
        `http://localhost:3001/api/notifications/markAsRead/${notificationId}`
      )
      .then(() => {
        setAllNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.notification_id === notificationId
              ? { ...notification, visto: 1 }
              : notification
          )
        );
        setUnseenNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.notification_id !== notificationId
          )
        );
      })
      .catch((error) => {
        console.error("Error marking notification as read:", error);
      });
  };

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="w-full top-menu">
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#232939",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <div className="menu-toggle ml-1 mr-3">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleMenu}
            >
              <MenuRoundedIcon />
            </IconButton>
          </div>
          <div className="user-info w-full flex items-center max-[768]:ml-8 justify-end sm:justify-between">
            {user ? (
              <>
                <span className="hidden md:inline">
                  Bienvenido/a, {user.name}
                </span>
                <div className="black md:hidden"></div>
                <div className="flex items-center">
                  <div className="mx-1">
                    <IconButton
                      size="large"
                      color="inherit"
                      onClick={handleNotificationsClick}
                    >
                      <Badge
                        badgeContent={unseenNotifications.length}
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: 9,
                            height: 15,
                            minWidth: 15,
                            padding: 0,
                          },
                        }}
                        max={10}
                        color="error"
                      >
                        <Notifications />
                      </Badge>
                    </IconButton>
                  </div>
                  <div className="mx-1">
                    <AccountCircle fontSize="large" />
                  </div>
                  <div className="mx-1">
                    <span>{user.email}</span>
                  </div>
                  <div>
                    <IconButton
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </div>
                </div>
              </>
            ) : (
              <span>Cargando...</span>
            )}
          </div>
        </Toolbar>
        <div className="notifications-menu">
          <Menu
            id="notifications-menu"
            anchorEl={notificationsMenuOpen}
            open={Boolean(notificationsMenuOpen)}
            onClose={handleNotificationsClose}
          >
            <div className="max-w-xs max-h-[500px] overflow-y-auto p-2">
              {unseenNotifications.length > 0 ? (
                <div
                  className="bg-slate-100 rounded-md "
                  style={{ borderBottom: "1px solid #ddd" }}
                >
                  <div className=" flex justify-between">
                    <div
                      className="flex content-center flex-wrap justify-center p-1"
                      style={{ borderRight: "1px solid #ddd" }}
                    >
                      <NotificationImportantRoundedIcon fontSize="medium" />
                    </div>
                    <div>
                      {unseenNotifications.map((notification) => (
                        <MenuItem
                          key={notification.notification_id}
                          onClick={() =>
                            handleMarkAsRead(notification.notification_id)
                          }
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "8px 16px",
                            borderBottom: "1px solid #ddd",
                            "&:last-of-type": {
                              borderBottom: "none",
                            },
                            "&:hover": {
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="textPrimary"
                            sx={{
                              marginBottom: "4px",
                              fontWeight:"bold",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notification.date}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "normal",
                              marginLeft: "10px",
                            }}
                          >
                            El valor de la clave{" "}
                            <strong>{notification.alarmKey}</strong> del
                            dispositivo{" "}
                            <strong>{notification.deviceName}</strong> ha
                            superado <strong>{notification.alarmValue}</strong>{" "}
                            y llegó hasta <strong>{notification.data}</strong>.
                          </Typography>
                        </MenuItem>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="              bg-slate-100 rounded-md ">
                  <MenuItem
                    sx={{
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      No hay nuevas notificaciones
                    </Typography>
                  </MenuItem>
                </div>
              )}
              <div className="mt-1">
              <MenuItem onClick={handleToggle}>
                <Typography variant="body2" sx={{ flexGrow: 1 }} color="textSecondary">
                  Notificaciones
                </Typography>
                {expanded ? <ExpandLessIcon color="disabled"/> : <ExpandMoreIcon color="disabled"/>}
              </MenuItem>                
              </div>

              <Collapse in={expanded}>
                <List>
                  {allNotifications.length > 0 ? (
                    allNotifications
                      .filter((notification) => notification.visto === 1) // Filtra las notificaciones con visto = 1
                      .map((notification) => (
                        <ListItem
                          key={notification.notification_id}
                          button
                          onClick={() => {
                            handleMarkAsRead(notification.id);
                            handleClose(); // Cierra el menú después de hacer clic
                          }}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "8px 16px",
                            borderBottom: "1px solid #ddd",
                            "&:last-of-type": {
                              borderBottom: "none",
                            },
                            "&:hover": {
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              marginBottom: "4px",
                              fontWeight: "normal",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notification.date}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "normal",
                            }}
                          >
                            El valor de la clave{" "}
                            <strong>{notification.alarmKey}</strong> del
                            dispositivo{" "}
                            <strong>{notification.deviceName}</strong> ha
                            superado <strong>{notification.alarmValue}</strong>{" "}
                            y llegó hasta <strong>{notification.data}</strong>.
                          </Typography>
                        </ListItem>
                      ))
                  ) : (
                    <ListItem sx={{ padding: "16px", textAlign: "center" }}>
                      <Typography variant="body2" color="textSecondary">
                        No hay notificaciones
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </Collapse>
            </div>
          </Menu>
        </div>
        <div>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <div className="flex flex-col items-center p-2">
              <div className="flex flex-col items-center border-b-[1px] border-b-slate-300">
                <Avatar>
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </Avatar>
                <Typography variant="h6">{user?.name}</Typography>
                <Typography variant="body" color="textSecondary">
                  {user?.email}
                </Typography>
                <div className="mb-2"></div>
              </div>

              <div className="flex items-center mt-2 justify-between w-full">
                <div className="ml-10">
                  <Tooltip title="Cerrar sesión">
                    <IconButton onClick={handleLogout}>
                      <Logout color="error" />
                    </IconButton>
                  </Tooltip>
                </div>
                <div className="mr-10">
                  <Tooltip title="Configuración">
                    <IconButton
                      onClick={() => handleSwitchSection("profile-settings")}
                    >
                      <Settings color="primary" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          </Menu>
        </div>
      </AppBar>
    </div>
  );
}
export default TopMenu;
