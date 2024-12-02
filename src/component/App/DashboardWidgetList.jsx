import React from 'react';
import DeviceCard from '../DashboardWidgetCard.jsx';

function DeviceWidgetList(props) {
  const { datos, setDatos, cambiarEstado, handleMouseOver }=props;
  return (
    <>
    
      {datos.map((device, index) => (
        <DeviceCard
          key={index}
          device={device}
          index={index}
          cambiarEstado={cambiarEstado}
          datos={datos}
          setDatos={setDatos}
          handleMouseOver={handleMouseOver}
        />
      ))}
    </>
  );
}

export default DeviceWidgetList;