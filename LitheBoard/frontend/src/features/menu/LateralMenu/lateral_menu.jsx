import React, { useState } from "react";
import {
  Collapse,
  IconButton,
  List,
  Tooltip,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import ProfileSettingsPanel from "../../profile/profile_settings_panel ";
import DashboardIcon from "@mui/icons-material/DashboardRounded";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DevicesIcon from "@mui/icons-material/Devices";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import GroupIcon from "@mui/icons-material/Group";
import RuleIcon from "@mui/icons-material/Rule";

function LateralMenu({ handleSwitchSection, dashboards, user }) {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List>
      {/* Sección Dashboards */}
      <ListItemButton
        onClick={() => {
          handleSwitchSection("dashboard-list");
          handleClick();
        }}
        sx={{ py: 2 }} // más alto
      >
        <ListItemIcon>
          <DashboardCustomizeRoundedIcon
            sx={{ color: "white", fontSize: 24 }} // icono más grande
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" color="white">
              Dashboards
            </Typography>
          }
        />
        {open ? (
          <ExpandLess sx={{ color: "rgba(231,229,229,0.8)" }} />
        ) : (
          <ExpandMore sx={{ color: "rgba(231,229,229,0.8)" }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {dashboards.map((dashboard) => (
          <ListItemButton
            key={dashboard.dashboard_id}
            sx={{ pl: 4, py: 1.5 }} // ítems hijos con padding
            onClick={() => handleSwitchSection("dashboards", dashboard)}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: "white", fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="white">
                  {dashboard.name}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </Collapse>

      {/* Divider agrupador */}
      <Divider sx={{ my: 1, borderColor: "rgba(248,248,248,0.1)" }} />

      {/* Sección Entities */}
      <ListItemButton
        sx={{ py: 2 }}
        onClick={() => handleSwitchSection("devices-list")}
      >
        <ListItemIcon>
          <DevicesIcon sx={{ color: "white", fontSize: 24 }} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" color="white">
              Entities
            </Typography>
          }
        />
      </ListItemButton>

      <Divider sx={{ my: 1, borderColor: "rgba(248,248,248,0.1)" }} />

      {/* Sección Alarms */}
      <ListItemButton
        sx={{ py: 2 }}
        onClick={() => handleSwitchSection("alarms-list")}
      >
        <ListItemIcon>
          <AccessAlarmIcon sx={{ color: "white", fontSize: 24 }} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" color="white">
              Alarms
            </Typography>
          }
        />
      </ListItemButton>

      <Divider sx={{ my: 1, borderColor: "rgba(248,248,248,0.1)" }} />

      {/* Sección Rulechain */}
      <ListItemButton
        sx={{ py: 2 }}
        onClick={() => handleSwitchSection("rulechain-editor")}
      >
        <ListItemIcon>
          <RuleIcon sx={{ color: "white", fontSize: 24 }} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" color="white">
              Rulechain
            </Typography>
          }
        />
      </ListItemButton>

      {/* Y así sucesivamente para las demás secciones... */}

      {user?.role === "admin" ? (
        <>
      <Divider sx={{ my: 1, borderColor: "rgba(248,248,248,0.1)" }} />
          <ListItemButton
                  sx={{ py: 2 }}
            onClick={() => handleSwitchSection("clients-settings")}
          >
            <ListItemIcon>
              <GroupIcon sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body1" style={{ color: "#FFFFFF" }}>
                  Associated clients
                </Typography>
              }
            />
          </ListItemButton>
        </>
      ) : (
        <></>
      )}

      <Divider sx={{ my: 1, borderColor: "rgba(248,248,248,0.1)" }} />
      <ListItemButton sx={{ py: 2 }} onClick={() => handleSwitchSection("profile-settings")}>
        <ListItemIcon>
          <ManageAccountsIcon sx={{ color: "white" }} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" style={{ color: "#FFFFFF" }}>
              Profile
            </Typography>
          }
        />
      </ListItemButton>
    </List>
  );
}

export default LateralMenu;
