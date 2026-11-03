import { toFlowGraph, toDefinition } from "../../view_models/rulechain_definition";
import { Paper, Typography, Box } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import NodePalette from "./node_palette";
import "@xyflow/react/dist/style.css";

// Importa nodos personalizados
import InputNode from "./nodes/input_node";
import ProcessingNode from "./nodes/proccesing_node";
import ActionNode from "./nodes/action_node";
import LogicNode from "./nodes/logic_node";
import OutputNode from "./nodes/output_node";
import UtilityNode from "./nodes/utility_node";

const customNodeTypes = {
  input: InputNode,
  processing: ProcessingNode,
  action: ActionNode,
  logic: LogicNode,
  output: OutputNode,
  utility: UtilityNode,
};

const getEntityDataSourceConfig = (entity) => {
  return {
    topic: entity?.datasource_config?.sub_topic || "default/topic",
    qos: 1,
  };
};

function RuleChainEditor({ rulechain, onSave, onCancel }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Callback para actualizar config de un nodo
  const updateNodeConfig = useCallback(
    (nodeId, partialConfig) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          return {
            ...n,
            data: {
              ...n.data,
              config: {
                ...n.data.config,
                ...partialConfig,
              },
              onConfigChange: updateNodeConfig,
            },
          };
        })
      );
    },
    [setNodes]
  );

  // Al cargar desde la BD, reinyecta onConfigChange en cada nodo
  useEffect(() => {
    if (rulechain?.definition) {
      const loaded = toFlowGraph(rulechain.definition);
      const nodesWithCallback = (loaded.nodes || []).map((n) => ({
        ...n,
        data: {
          ...n.data,
          onConfigChange: updateNodeConfig,
        },
      }));
      setNodes(nodesWithCallback);
      setEdges(loaded.edges || []);
    }
  }, [rulechain, setNodes, setEdges, updateNodeConfig]);

  // Conexión de nodos
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        id: `edge-${Date.now()}`,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        ...params,
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges]
  );

  // Drag & drop de nuevos nodos
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const data = e.dataTransfer.getData("application/reactflow");
      if (!data || !reactFlowInstance) return;
      const nd = JSON.parse(data);
      const pos = reactFlowInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      const newNode = {
        id: Date.now().toString(),
        type: nd.type,
        position: pos,
        data: {
          handles: nd.handles,
          label: nd.label,
          color: nd.color,
          fields: nd.fields || [],
          config: {},
          onConfigChange: updateNodeConfig,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, updateNodeConfig, setNodes]
  );

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
    instance.fitView();
  }, []);

  const handleSave = useCallback(async () => {
    onSave({ ...rulechain, definition: toDefinition(nodes, edges) });
  }, [nodes, edges, onSave, rulechain]);

  return (
    <div className="rulechain-list-panel h-full overflow-hidden overflow-x-auto bg-white border border-gray-300 rounded-[12px] p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1)] flex">
      <NodePalette
        onSave={handleSave}
        rulechain={rulechain}
        onCancel={onCancel}
      />
      <Box flex={1} sx={{ position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
          onInit={onInit}
          fitView
          nodeTypes={customNodeTypes}
          style={{ width: "100%", height: "100%" }}
        >
          <Background />
        </ReactFlow>
      </Box>
    </div>
  );
}
export default RuleChainEditor;
