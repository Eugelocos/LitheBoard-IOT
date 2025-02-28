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
  Box
} from "@mui/material";
import ProfileSettingsPanel from "../../Profile/profile_settings_panel ";
import DashboardIcon from "@mui/icons-material/DashboardRounded";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DevicesIcon from "@mui/icons-material/Devices";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import GroupIcon from '@mui/icons-material/Group';


function LateralMenu({ handleSwitchSection, dashboards, user}) {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (

    <List>
      <ListItemButton
        onClick={() => {
          handleSwitchSection("dashboard-list");
          handleClick();
        }}
      >
        <ListItemIcon>
          <DashboardCustomizeRoundedIcon sx={{ color: "white" }} />
        </ListItemIcon>
        <ListItemText primary={<Typography variant="body1" style={{ color: '#FFFFFF' }}>Dashboards</Typography>}/>
        {open ? <ExpandLess style={{ color: 'rgba(231, 229, 229, 0.81)' }} /> : <ExpandMore style={{ color: 'rgba(231, 229, 229, 0.81)' }}/>}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {dashboards.map((dashboard) => (
          <List component="div" disablePadding key={dashboard.dashboard_id}>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => handleSwitchSection("dashboards", dashboard)}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary={<Typography variant="body2" style={{ color: '#FFFFFF' }}>{dashboard.name}</Typography>}/>
            </ListItemButton>
          </List>
        ))}
      </Collapse>
      <Divider sx={{ borderColor: "rgb(248 248 248 / 5%)" }} />
      <ListItemButton onClick={() => handleSwitchSection("devices-list")}>
        <ListItemIcon>
          <DevicesIcon sx={{ color: "white" }} />
        </ListItemIcon>
        <ListItemText primary={<Typography variant="body1" style={{ color: '#FFFFFF' }}>Entities</Typography>}/>
      </ListItemButton>
      <Divider sx={{ borderColor: "rgb(248 248 248 / 5%)" }} />
      <ListItemButton onClick={() => handleSwitchSection("alarms-list")}>
        <ListItemIcon>
          <AccessAlarmIcon sx={{ color: "white" }} />
        </ListItemIcon>
        <ListItemText primary={<Typography variant="body1" style={{ color: '#FFFFFF' }}>Alarms</Typography>}/>
      </ListItemButton>
      {user?.access_level_id==1 ? (
        <>
      <Divider sx={{ borderColor: "rgb(248 248 248 / 5%)" }} />
      <ListItemButton onClick={() => handleSwitchSection("clients-settings")}>
        <ListItemIcon>
          <GroupIcon sx={{ color: "white" }} />
        </ListItemIcon>
        <ListItemText primary={<Typography variant="body1" style={{ color: '#FFFFFF' }}>Associated clients</Typography>}/>
      </ListItemButton>          
        </>
      
      ):(<></>)}

      <Divider sx={{ borderColor: "rgb(248 248 248 / 5%)" }} />
      <ListItemButton onClick={() => handleSwitchSection("profile-settings")}>
        <ListItemIcon>
          <ManageAccountsIcon sx={{ color: "white" }} />
        </ListItemIcon>
        <ListItemText primary={<Typography variant="body1" style={{ color: '#FFFFFF' }}>Profile</Typography>}/>
      </ListItemButton>
    </List>
  );
}

export default LateralMenu;
