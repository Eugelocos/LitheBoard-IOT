import React, { useRef, useState } from "react";
import {
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
import { setDevice } from "../../component/database_data_functions";
import StatusBadge from "../../component/status_badge";

function AddDevice({ onAddDevice, showDeviceList, setDevicesList, user, rulechains}) {
  const disp_name_ref = useRef();
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
  const [datasourceType, setDatasourceType] = useState("MQTT");
  const [status, setStatus] = useState(0); // 0: initial, 1: loading, 2: success, 3: error

  const handleAddDevice = () => {
    setStatus(1);
    const dispName = disp_name_ref.current.value;
    const rulechain = rulechainId;
    let datasourceConfig = {};

    if (datasourceType === "MQTT") {
      datasourceConfig = {
        sub_topic: sub_topic_ref.current.value,
        pub_topic: pub_topic_ref.current.value,
        heartbeat_timeout: heartbeat_timeout_ref.current.value
      };
    } else if (datasourceType === "API") {
      datasourceConfig = {
        base_url: api_url_ref.current.value,
        method: api_method_ref.current.value,
        polling_interval: api_polling_interval_ref.current.value,
        query_params: api_query_params_ref.current.value,
        headers: api_headers_ref.current.value,
        request_body: api_request_body_ref.current.value,
      };
    }

    if (dispName && datasourceConfig) {
      const entity = {
        client_id: user.id,
        disp_name: dispName,
        datasource_type: datasourceType,
        datasource_config: datasourceConfig,
        rulechain_id: rulechain.rulechain_id
      };
      console.log("entity:", entity)
      setDevice(entity)
        .then((response) => {
          setStatus(2);
          console.log("Entity added successfully:", response.data);

          const new_entity = { ...entity, entity_id: response.data.entity_id };
          onAddDevice(new_entity);
          disp_name_ref.current.value = "";
          if (datasourceType === "MQTT") {
            sub_topic_ref.current.value = "";
            pub_topic_ref.current.value = "";
            heartbeat_timeout_ref.current.value = "";
          } else if (datasourceType === "API") {
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
          console.error("Error adding entity:", error);
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
              inputRef={disp_name_ref}
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
                {rulechains.map((rc, idx) => (
                  <MenuItem key={rc.id ?? idx} value={rc.id ?? rc}> {rc.name ?? rc} </MenuItem>
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
              <MenuItem value="MQTT">MQTT</MenuItem>
              <MenuItem value="API">API</MenuItem>
            </Select>
          </FormControl>

          {datasourceType === "MQTT" && (
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
                  label="Heartbeat Timeout"
                  variant="outlined"
                  inputRef={heartbeat_timeout_ref}
                  fullWidth
                />
              </FormControl>
            </>
          )}

          {datasourceType === "API" && (
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
                  label="Polling Interval"
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
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Headers"
                  variant="outlined"
                  inputRef={api_headers_ref}
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Request Body"
                  variant="outlined"
                  inputRef={api_request_body_ref}
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
            style={{ width: "80%", marginTop: 20 }}
          >
            Add Device
          </Button>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

export default AddDevice;
