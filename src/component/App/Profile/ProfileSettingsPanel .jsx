import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';

const MyTextField = styled(TextField)({
  "& .MuiFilledInput-underline:after": {
    borderBottomColor: "#232939",
  },
  "& .MuiFilledInput-label:after": {
    color: "#232939",
  },
  "& .css-md26zr-MuiInputBase-root-MuiOutlinedInput-root": {},
});

const MyButtonDark = styled(Button)(({ theme }) => ({
  backgroundColor: "#232939",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#333c54",
  },
}));
const MyButtonLighter = styled(Button)(({ theme }) => ({
  backgroundColor: "#f5253696",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#F52536",
  },
}));

const ProfileSettingsPanel = ({ user, handleLogout }) => {
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [message, setMessage] = useState({ text: '', isError: false });


  const handleSave = async () => {
    try {
      const response = await axios.put('http://localhost:3001/api/user/update', {
        id: user.id,
        name,
        email,
      });
      setMessage({ text: response.data.message, isError: false });
    } catch (error) {
      setMessage({ text: 'Error al actualizar el perfil', isError: true });
    }
  };

  return (
    <div className="min-w-fit min-h-fit w-fit h-fit bg-white border border-gray-300 rounded shadow-[0px_0px_10px_rgba(0,0,0,0.1)] m-1/4 overflow-hidden p-4">
      <div className="flex justify-between items-center py-2 px-4">
        <div>
          <h2 className=" font-medium text-gray-900 text-2xl">Perfil</h2>
        </div>
        <h3 className=" font-normal text-gray-500 text-base">{email}</h3>
      </div>
      <div className="mt-3">
        <MyTextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <MyTextField
          label="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          variant="filled"
        />
      </div>

      <div className="buttons mt-10 flex flex-wrap justify-between">
        <MyButtonDark variant="contained" color="primary" onClick={handleSave} startIcon={<SaveIcon/>}>
          Guardar
        </MyButtonDark>
        <MyButtonLighter variant="outlined" color="error" onClick={handleLogout} startIcon={<LogoutIcon/>}>
          Cerrar Sesión
        </MyButtonLighter>
      </div>

      {message.text && (
        <div className={`min-w-full w-full h-fit border border-gray-300 rounded p-2 shadow-[0px_0px_10px_rgba(0,0,0,0.1)] my-3 overflow-hidden ${message.isError ? 'bg-red-400' : 'bg-green-400'}`}>
          <Typography variant="body2" align="center" color={`${message.isError ? 'white' : 'green'}`}>
            {message.text}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default ProfileSettingsPanel;
