import React, { useRef, useState } from "react";
import {
  Alert,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
} from "@mui/material";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createEntity } from "../../services/entities_service";
import { getApiErrorMessage } from "../../services/api_errors";
import StatusBadge from "../../component/status_badge";

function AddDevice({ onAddDevice, showDeviceList, setDevicesList, user, rulechains}) {
  const name_ref = useRef();
  const sub_topic_ref = useRef();
  const pub_topic_ref = useRef();
  const heartbeat_timeout_ref = useRef();

  const api_url_ref = useRef();
  const api_method_ref = useRef();
  const api_polling_interval_ref = useRef();
  const api_query_params_ref = useRef();
  const api_headers_ref = useRef();
  const api_request_body_ref = useRef();
  const api_data_key_ref = useRef();


  const [rulechainId, setRulechainId] = useState("");
  const [datasourceType, setDatasourceType] = useState("mqtt");
  const [status, setStatus] = useState(0); // 0: initial, 1: loading, 2: success, 3: error

  const [error, setError] = useState("");
  const handleAddDevice = () => {
    if (status === 1) return;
    setError("");
    if (!name_ref.current.value.trim()) {
      setError("Entity name is required.");
      return;
    }
    setStatus(1);
    const name = name_ref.current.value;
    const rulechain = rulechainId;
    let datasourceConfig = {};

    if (datasourceType === "mqtt") {
      datasourceConfig = {
        sub_topic: sub_topic_ref.current.value,
        pub_topic: pub_topic_ref.current.value,
        ...(heartbeat_timeout_ref.current.value ? { heartbeat_timeout_s: Number(heartbeat_timeout_ref.current.value) } : {})
      };
    } else if (datasourceType === "api") {
      // FIX: los inputRef.current.value de MUI TextField son SIEMPRE
      // strings (incluso "" si el campo quedó vacío), pero el backend
      // valida estos campos como objetos (Joi.object()). Antes se mandaba
      // el string crudo tal cual, lo que tiraba
      // "query_params/headers/request_body must be of type object".
      // Acá parseamos cada campo si tiene contenido, y lo omitimos por
      // completo si el usuario lo dejó vacío (en vez de mandar "").
      const parseJsonField = (rawValue, fieldLabel) => {
        const trimmed = (rawValue || "").trim();
        if (!trimmed) return undefined;
        try {
          return JSON.parse(trimmed);
        } catch {
          throw new Error(
            `El campo "${fieldLabel}" debe ser un JSON válido (ej: {"clave": "threshold"}).`
          );
        }
      };

      try {
        const queryParams = parseJsonField(
          api_query_params_ref.current.value,
          "Query Params"
        );
        const headers = parseJsonField(api_headers_ref.current.value, "Headers");
        const requestBody = parseJsonField(
          api_request_body_ref.current.value,
          "Request Body"
        );

        datasourceConfig = {
          base_url: api_url_ref.current.value,
          method: api_method_ref.current.value,
          ...(api_polling_interval_ref.current.value
            ? { polling_interval_ms: Number(api_polling_interval_ref.current.value) }
            : {}),
          ...(queryParams !== undefined ? { query_params: queryParams } : {}),
          ...(headers !== undefined ? { headers } : {}),
          ...(requestBody !== undefined ? { request_body: requestBody } : {}),
        };
      } catch (parseError) {
        setStatus(3);
        setError(parseError.message);
        return;
      }
    }

    if (name && datasourceConfig) {
      const entity = {
        client_id: user.client_id,
        name: name,
        datasource_type: datasourceType,
        datasource_config: datasourceConfig,
        // El backend valida rulechain_id como número: sin rulechain se omite.
        rulechain_id: rulechain || undefined
      };
      console.log("entity:", entity)
      createEntity(entity)
        .then((new_entity) => {
          setStatus(2);

          onAddDevice(new_entity);
          name_ref.current.value = "";
          if (datasourceType === "mqtt") {
            sub_topic_ref.current.value = "";
            pub_topic_ref.current.value = "";
            heartbeat_timeout_ref.current.value = "";
          } else if (datasourceType === "api") {
            api_url_ref.current.value = "";
            api_method_ref.current.value = "";
            api_polling_interval_ref.current.value = "";
            api_query_params_ref.current.value = "";
            api_headers_ref.current.value = "";
            api_request_body_ref.current.value = "";
          }
          setRulechainId("");
          showDeviceList(true);
        })
        .catch((error) => {
          setStatus(3);
          setError(getApiErrorMessage(error, "Could not create entity. Please try again."));
        });
    }
  };

  const handleReturn = () => {
    showDeviceList(true);
  };

  return (
    <div className="max-h-fit bg-white border border-gray-300 rounded p-4 shadow-[0px_0px_10px_rgba(0,0,0,0.1)] py-10 w-full max-w-full lg:max-w-[500px] lg:w-4/6">
      <div className="flex m-auto flex-wrap justify-center">
        <div className="flex justify-between items-center py-2 w-full">
          <IconButton onClick={handleReturn} style={{ marginLeft: 10 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            className="text-center"
            style={{ flexGrow: 1 }}
          >
            Add Entity
          </Typography>
        </div>

        <div className="flex m-auto flex-wrap justify-center my-10 overflow-y-auto max-h-[400px]">
          <FormControl fullWidth margin="normal">
            <TextField
              label="Entity Name"
              variant="outlined"
              inputRef={name_ref}
              fullWidth
            />
          </FormControl>

            <FormControl fullWidth>
              <InputLabel id="rulechain-label">Rulechain Assigned</InputLabel>
              <Select
                labelId="rulechain-label"
                value={rulechainId}
                label="Rulechain Assigned"
                onChange={e => setRulechainId(e.target.value)}
              >
                <MenuItem value="">Default: store received data</MenuItem>
                {rulechains.map(rc => (
                  <MenuItem key={rc.rulechain_id} value={rc.rulechain_id}>{rc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="datasourceType-label">Datasource Type</InputLabel>
            <Select
              labelId="datasourceType-label"
              id="datasourceType"
              value={datasourceType}
              onChange={(e) => setDatasourceType(e.target.value)}
            >
              <MenuItem value="mqtt">MQTT</MenuItem>
              <MenuItem value="api">API</MenuItem>
            </Select>
          </FormControl>

          {datasourceType === "mqtt" && (
            <>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Subscribe Topic"
                  variant="outlined"
                  inputRef={sub_topic_ref}
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Publish Topic"
                  variant="outlined"
                  inputRef={pub_topic_ref}
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Heartbeat Timeout (s)"
                  variant="outlined"
                  inputRef={heartbeat_timeout_ref}
                  fullWidth
                />
              </FormControl>
            </>
          )}

          {datasourceType === "api" && (
            <>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Base URL"
                  variant="outlined"
                  inputRef={api_url_ref}
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="HTTP Method"
                  variant="outlined"
                  inputRef={api_method_ref}
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Polling Interval (ms)"
                  variant="outlined"
                  inputRef={api_polling_interval_ref}
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Query Params"
                  variant="outlined"
                  inputRef={api_query_params_ref}
                  placeholder='{"latitude": "-34.60"}'
                  helperText="Opcional. JSON válido, o dejar vacío."
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Headers"
                  variant="outlined"
                  inputRef={api_headers_ref}
                  placeholder='{"Authorization": "Bearer ..."}'
                  helperText="Opcional. JSON válido, o dejar vacío."
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Request Body"
                  variant="outlined"
                  inputRef={api_request_body_ref}
                  placeholder='{"key": "value"}'
                  helperText="Opcional. JSON válido, o dejar vacío."
                  fullWidth
                />
              </FormControl>
            </>
          )}
        </div>

        <div className="w-full flex justify-center flex-wrap">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddDevice}
            disabled={status === 1}
            style={{ width: "80%", marginTop: 20 }}
          >
            Add Device
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

export default AddDevice;