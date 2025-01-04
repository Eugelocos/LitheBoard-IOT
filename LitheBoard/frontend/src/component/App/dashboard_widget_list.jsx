import React from 'react';
import DeviceCard from '../DashboardWidgetCard.jsx';

function DeviceWidgetList(props) {
  const { devices_list, setDevicesList, toggleSwitchState, handleMouseOver }=props;
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
        />
      ))}
    </>
  );
}

export default DeviceWidgetList;