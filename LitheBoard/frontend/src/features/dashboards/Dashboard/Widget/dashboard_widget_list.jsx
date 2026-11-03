import React from 'react';
import DeviceCard from './dashboard_widget_card.jsx';

function DeviceWidgetList(props) {
  const { devices_list, setDevicesList, toggleSwitchState, handleMouseOver, openWidgetEditor, setEditedWidgetId, setEditedWidgetType}=props;
  
  console.log("devices", devices_list)
  return (
    <>
    
      {devices_list.map((device, index) => (
        <DeviceCard
          key={index}
          device={device}
          index={index}
          toggleSwitchState={toggleSwitchState}
          devices_list={devices_list}
          setDevicesList={setDevicesList}
          handleMouseOver={handleMouseOver}
          openWidgetEditor={openWidgetEditor}
          setEditedWidgetId={setEditedWidgetId}
          setEditedWidgetType={setEditedWidgetType}
        />
      ))}
    </>
  );
}

export default DeviceWidgetList;