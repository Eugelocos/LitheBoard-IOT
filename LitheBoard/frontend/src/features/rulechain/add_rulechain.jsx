import { getApiErrorMessage } from "../../services/api_errors";
import { createRulechain } from "../../services/rulechains_service";
import React, { useRef, useState } from "react";
import {
  Alert,
  TextField,
  Button,
  Typography,
  FormControl,
  Toolbar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StatusBadge from "../../component/status_badge";


const defaultNode = { node_id: "input", node_type: "input", node_config: {}, position: { x: 0, y: 0 } };

function AddRulechain({ onAddRulechain, showRulechainList, setRulechains, user }) {
  const nameRef = useRef();
  const descRef = useRef();
  const [status, setStatus] = useState(0); // 0: initial, 1: loading, 2: success, 3: error

  const [error, setError] = useState("");
  const handleAdd = async () => {
    if (status === 1) return;
    setError("");
    setStatus(1);
    const name = nameRef.current.value?.trim();
    const description = descRef.current.value?.trim();
    if (!name) {
      setError("Name is required.");
      setStatus(3);
      return;
    }
    
    console.log(user);
    const new_rulechain = {
      client_id: user.client_id,
      name,
      description: description || null,
      definition: { nodes: [defaultNode], edges: [] },
      entity_ids: []
    };

    try {
      const created_rulechain = await createRulechain(new_rulechain);
      setStatus(2);
      onAddRulechain(created_rulechain);
      nameRef.current.value = "";
      descRef.current.value = "";
      showRulechainList(false);
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not create rulechain. Please try again."));
      setStatus(3);
    }
  };

  const handleReturn = () => {
    showRulechainList(false);
  };

  return (
    <div className="max-h-fit bg-white border border-gray-300 rounded p-4 shadow-md py-10 w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <IconButton disabled={status === 1} onClick={handleReturn}>
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
          disabled={status === 1} onClick={handleAdd}
          className="w-4/5"
        >
          Crear
        </Button>
        {error && <Alert severity="error">{error}</Alert>}
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export default AddRulechain;
