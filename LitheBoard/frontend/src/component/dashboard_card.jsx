// DashboardCard.jsx
import React from "react";
import "../dashboardCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
function DashboardCard({ id, name, creation_date, onClick, onDelete }) {
  return (
    <div className="dashboard-card blackdrop-blur-lg" onClick={onClick} style={{position:"sticky"}}>
      <t className={id}></t>
      <p className="card-element name">{name}</p>
      <p className="card-element">{creation_date}</p>

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
