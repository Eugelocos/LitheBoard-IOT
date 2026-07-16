import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
  Menu,
} from "@mui/material";
import { Logout, Settings, Notifications } from "@mui/icons-material";
import {
  AccountCircle,
  MenuRounded as MenuRoundedIcon,
  MoreVert as MoreVertIcon,
  NotificationImportantRounded as NotificationImportantRoundedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import config from "@config";
import api from "../../../services/api"

function TopMenu({
  user,
  toggleMenu,
  handleSwitchSection,
  alarms,
  all_notifications,
  setAllNotifications,
  unseen_notifications,
  setUnseenNotifications
}) {
  const navigate = useNavigate();
  const [user_panel_open, setUserPanelOpen] = useState(false);
  const [notifications_menu_open, setNotificationsMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const user_panel_ref = useRef(null);

  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  const toggleUserPanel = () => {
    setUserPanelOpen(!user_panel_open);
  };

  const handleLogout = async () => {
    try {
      await api.post(
        `${base_url}/api/clients/logout`,
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
        user_panel_ref.current &&
        !user_panel_ref.current.contains(event.target)
      ) {
        setUserPanelOpen(false);
      }
    };

    if (user_panel_open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user_panel_open]);

  const handleNotificationsClick = (event) => {
    setNotificationsMenuOpen(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsMenuOpen(null);
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };



  const handleMarkAsRead = (notification_id) => {
    api
      .post(
        `${base_url}/api/notification/${notification_id}/read`
      )
      .then(() => {
        setAllNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.notification_id === notification_id
              ? { ...notification, visto: 1 }
              : notification
          )
        );
        setUnseenNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.notification_id !== notification_id
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
          boxShadow: 'none'
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
                <span className="hidden md:inline">Welcome, {user.name}</span>
                <div className="black md:hidden"></div>
                <div className="flex items-center">
                  <div className="mx-1">
                    <IconButton
                      size="large"
                      color="inherit"
                      onClick={handleNotificationsClick}
                    >
                      <Badge
                        badgeContent={unseen_notifications.length}
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
              <span>Loading...</span>
            )}
          </div>
        </Toolbar>
        <div className="notifications-menu">
          <Menu
            id="notifications-menu"
            anchorEl={notifications_menu_open}
            open={Boolean(notifications_menu_open)}
            onClose={handleNotificationsClose}
          >
            <div className="max-w-xs max-h-[500px] overflow-y-auto p-2">
              {unseen_notifications.length > 0 ? (
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
                      {unseen_notifications.map((notification) => (
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
                              fontWeight: "bold",
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
                            The value of the key{" "}
                            <strong>{notification.alarm_key}</strong> of the
                            device <strong>{notification.device_name}</strong>{" "}
                            has exceeded{" "}
                            <strong>{notification.alarm_value}</strong> and
                            reached <strong>{notification.data}</strong>.
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
                      No new notifications.
                    </Typography>
                  </MenuItem>
                </div>
              )}
              <div className="mt-1">
                <MenuItem onClick={handleToggle}>
                  <Typography
                    variant="body2"
                    sx={{ flexGrow: 1 }}
                    color="textSecondary"
                  >
                    Notifications
                  </Typography>
                  {expanded ? (
                    <ExpandLessIcon color="disabled" />
                  ) : (
                    <ExpandMoreIcon color="disabled" />
                  )}
                </MenuItem>
              </div>

              <Collapse in={expanded}>
                <List>
                  {all_notifications.length > 0 ? (
                    all_notifications
                      .filter((notification) => notification.visto === 1)
                      .map((notification) => (
                        <ListItem
                          key={notification.notification_id}
                          button
                          onClick={() => {
                            handleMarkAsRead(notification.id);
                            handleClose();
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
                            The value of the key{" "}
                            <strong>{notification.alarm_key}</strong> of the
                            device <strong>{notification.device_name}</strong>{" "}
                            has exceeded{" "}
                            <strong>{notification.alarm_value}</strong> and
                            reached <strong>{notification.data}</strong>.
                          </Typography>
                        </ListItem>
                      ))
                  ) : (
                    <ListItem sx={{ padding: "16px", textAlign: "center" }}>
                      <Typography variant="body2" color="textSecondary">
                        No notifications
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
                  <Tooltip title="Log out">
                    <IconButton onClick={handleLogout}>
                      <Logout color="error" />
                    </IconButton>
                  </Tooltip>
                </div>
                <div className="mr-10">
                  <Tooltip title="Settings">
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
