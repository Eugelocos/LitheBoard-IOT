import React from 'react';
import { Handle } from '@xyflow/react';

export default function InputNode({ data }) {
  const fields = data.fields || [];
  return (
    <div style={{ 
      borderRadius: '4px', 
      backgroundColor: '#2196F3',
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center' }}>{data.label}</div>
      {/* Handle de salida */}
      <Handle
        type="source"
        position="right"
        style={{ background: '#555', width: 10, height: 10 }}
      />
    </div>
  );
}
