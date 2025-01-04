import React, { useState } from "react";
import axios from "axios";

function CreateDashboardForm({ dashboards, setDashboards }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/dashboards/set", {
        name,
        description,
        client_id: user.id,
      });
      const new_dashboard = response.data;
      setDashboards([...dashboards, new_dashboard]);
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error creating dashboard:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Dashboard
        </button>
      </form>
    </div>
  );
}

export default CreateDashboardForm;