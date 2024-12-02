import React from 'react';
import DeviceCard from './DashboardWidgetCard.jsx';
import EditWidgetDrawer from './WidgetForm/Edit/EditWidgetForm.jsx'

function DeviceWidgetList(props) {
  const { datos, setDatos, cambiarEstado, handleMouseOver, openEditor, setEditedWidgetId, setEditedWidgetType}=props;
  

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
          openEditor={openEditor}
          setEditedWidgetId={setEditedWidgetId}
          setEditedWidgetType={setEditedWidgetType}
        />
      ))}
    </>
  );
}

export default DeviceWidgetList;