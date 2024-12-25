import React, { useRef } from "react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { setDevice } from "../../database_data_functions";

const MyTextField = styled(TextField)({
  "& .MuiFilledInput-underline:after": {
    borderBottomColor: "#232939",
  },
  "& .MuiFilledInput-label:after": {
    borderBottomColor: "#232939",
  },
});

const MyButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#232939",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#333c54",
  },
}));

function AddDevice({ onAddDevice, showDeviceList, setDevicesList, user}) {
  const disp_name_ref = useRef();
  const sub_topic_ref = useRef();
  const pub_topic_ref = useRef();

  const handleAddDevice = () => {
    const dispName = disp_name_ref.current.value;
    const subTopic = sub_topic_ref.current.value;
    const pubTopic = pub_topic_ref.current.value;

    if (dispName && subTopic && pubTopic) {
      const device = {
        client_id: user.id,
        disp_name: dispName,
        sub_topic: subTopic,
        pub_topic: pubTopic,
      };
      setDevice(device)
        .then((response) => {
          console.log("Device added successfully:", response.data);
          const new_device = { ...device, entity_id: response.data.entity_id };
          onAddDevice(new_device); // Llamar a la función de callback si es necesario
          // Limpiar campos del formulario
          disp_name_ref.current.value = "";
          sub_topic_ref.current.value = "";
          pub_topic_ref.current.value = "";
          showDeviceList(true); // Mostrar panel principal
        })
        .catch((error) => {
          console.error("Error adding device:", error);
        });
    }
  };

  const handleReturn = () => {
    showDeviceList(true);
  };

  return (
    <div className=" max-h-fit bg-white border border-gray-300 rounded p-4 shadow-[0px_0px_10px_rgba(0,0,0,0.1)] py-10 w-full max-w-full lg:max-w-[500px] lg:w-4/6">
      <div className="flex m-auto flex-wrap justify-center">
        <div className="flex justify-between items-center py-2 w-full">
          <button
            onClick={handleReturn}
            id="show-add-device-panel"
            className="left-0 w-12 h-10 ml-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-200/75 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="" />
          </button>
          <div className="flex justify-center items-center py-2 w-full">
            <h2 className=" font-medium text-gray-900 text-xl pr-10">
              Add entity
            </h2>
          </div>
        </div>

        <div className="flex m-auto flex-wrap justify-center my-10">
          <div className="mb-6 w-full mx-10">
            <MyTextField
              id="dispName filled-basic"
              label="Entity Name"
              variant="filled"
              inputRef={disp_name_ref}
              InputLabelProps={{ style: { color: "#232939" } }}
              InputProps={{ style: { color: "#232939" } }}
              autoComplete="off"
              fullWidth
            />
          </div>

          <div className="w-full mb-6 mx-10">
            <MyTextField
              id="subTopic filled-basic"
              label="Subscribe Topic"
              variant="filled"
              inputRef={sub_topic_ref}
              InputLabelProps={{ style: { color: "#232939" } }}
              InputProps={{ style: { color: "#232939" } }}
              autoComplete="off"
              fullWidth
            />
          </div>

          <div className="w-full mb-6 mx-10">
            <MyTextField
              id="pubTopic filled-basic"
              label="Publish Topic"
              variant="filled"
              inputRef={pub_topic_ref}
              InputLabelProps={{ style: { color: "#232939" } }}
              InputProps={{ style: { color: "#232939" } }}
              autoComplete="off"
              fullWidth
            />
          </div>
        </div>

        <div className="w-full flex justify-center flex-wrap">
          <MyButton
            variant="contained"
            color="primary"
            onClick={handleAddDevice}
          >
            Add
          </MyButton>
        </div>
      </div>
    </div>
  );
}

export default AddDevice;
