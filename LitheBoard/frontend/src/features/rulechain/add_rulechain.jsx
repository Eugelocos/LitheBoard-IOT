import React, { useRef, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  FormControl,
  Toolbar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StatusBadge from "../../component/status_badge";
import config from "@config";
import api from "../../services/api"


const defaultNode = {"id": "1784176385630", "data": {"color": "#2196F3", "label": "Input", "config": {}, "fields": [], "handles": {"outputs": ["right"]}}, "type": "input", "measured": {"width": 150, "height": 40}, "position": {"x": 153.56836551686078, "y": 281.2903338737692}}

function AddRulechain({ onAddRulechain, showRulechainList, setRulechains, user }) {
  const nameRef = useRef();
  const descRef = useRef();
  const [status, setStatus] = useState(0); // 0: initial, 1: loading, 2: success, 3: error
  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  const handleAdd = async () => {
    setStatus(1);
    const name = nameRef.current.value?.trim();
    const description = descRef.current.value?.trim();
    if (!name) {
      setStatus(3);
      return;
    }
    
    console.log(user);
    const new_rulechain = {
      user_id: user.id,
      name,
      description: description || null,
      rulechain: { nodes: [defaultNode], edges: [] },
      entities_ids: []
    };

    try {
      const { data } = await api.post(
        `${base_url}/api/rulechain`,
        new_rulechain
      );
      setStatus(2);
      onAddRulechain(data.data.rulechain);
      nameRef.current.value = "";
      descRef.current.value = "";
      showRulechainList(false);
    } catch (error) {
      console.error("Error creating rulechain:", error);
      setStatus(3);
    }
  };

  const handleReturn = () => {
    showRulechainList(false);
  };

  return (
    <div className="max-h-fit bg-white border border-gray-300 rounded p-4 shadow-md py-10 w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <IconButton onClick={handleReturn}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" className="flex-grow text-center">
          Crear Rulechain
        </Typography>
      </div>
      <div className="space-y-4">
        <FormControl fullWidth>
          <TextField
            label="Nombre"
            variant="outlined"
            inputRef={nameRef}
            fullWidth
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Descripción"
            variant="outlined"
            inputRef={descRef}
            fullWidth
            multiline
            rows={3}
          />
        </FormControl>
      </div>
      <div className="mt-6 flex flex-col items-center">
        <Button
          variant="contained"
          onClick={handleAdd}
          className="w-4/5"
        >
          Crear
        </Button>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export default AddRulechain;
