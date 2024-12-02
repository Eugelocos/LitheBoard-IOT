// DashboardCard.jsx
import React from "react";
import "../dashboardCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
function DashboardCard({ id, nombre, fechaCreacion, onClick, onDelete }) {
  return (
    <div className="dashboard-card blackdrop-blur-lg" onClick={onClick} style={{position:"sticky"}}>
      <t className={id}></t>
      <p className="card-element nombre">{nombre}</p>
      <p className="card-element">{fechaCreacion}</p>

      <div>
        {" "}
        <button onClick={onDelete} className="card-element delete-button">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
}

export default DashboardCard;
