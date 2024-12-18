import React from 'react';
import DeviceCard from './dashboard_widget_card.jsx';
import EditWidgetDrawer from './WidgetForm/Edit/edit_widget_form.jsx'

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