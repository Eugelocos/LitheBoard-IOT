import React, { useState } from 'react';
import { NODE_TYPES } from '../../../data/node_schemas';
import {
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  List,
  ListItem,
  Divider,
  Typography
} from '@mui/material';

const NodePalette = ({ onSave, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState('');

  // Extraer categorías únicas
  const categories = [...new Set(NODE_TYPES.map(nt => nt.type))];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const filteredNodes = selectedCategory
    ? NODE_TYPES.filter(nt => nt.type === selectedCategory)
    : NODE_TYPES;

  const handleDragStart = (event, n_t) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(n_t));
    event.dataTransfer.effectAllowed = 'move';
  };

  let lastType = null;

  return (
    <Box sx={{ width: 250, height: '90vh', background: '#f5f5f5', p: 2, borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="node-category-label" sx={{ color: '#232939' }}>Tipo de nodo</InputLabel>
        <Select
          labelId="node-category-label"
          value={selectedCategory}
          label="Tipo de nodo"
          onChange={handleCategoryChange}
          sx={{
            color: '#232939',
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#232939' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#232939' }
          }}
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value="">Todos</MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        <List>
          {filteredNodes.map((n_t, index) => {
            const showDivider = !selectedCategory && n_t.type !== lastType;
            const divider = showDivider ? (
              <Box key={`div-${n_t.type}`}>
                {index !== 0 && <Divider sx={{ my: 1 }} />}
                <Typography variant="subtitle1" sx={{ px: 1, color: '#232939' }}>
                  {n_t.type.charAt(0).toUpperCase() + n_t.type.slice(1)}
                </Typography>
              </Box>
            ) : null;
            lastType = n_t.type;
            return (
              <React.Fragment key={n_t.label}>
              {divider}
              <ListItem
                button
                draggable
                onDragStart={(e) => handleDragStart(e, n_t)}
                sx={{
                  mb: 1,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  p: 0,            // reset padding
                }}
              >
                {/* Colored tab */}
                <Box sx={{
                  width: 8,
                  alignSelf: 'stretch',  // fill full height
                  backgroundColor: n_t.color,
                  borderRadius: '4px 0 0 4px'
                }} />
                {/* Content */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  px: 2,         // horizontal padding
                  py: 1          // vertical padding
                }}>
                  <span style={{ marginRight: 8 }}>{n_t.icon}</span>
                  {n_t.label}
                </Box>
              </ListItem>
            </React.Fragment>
            );
          })}
        </List>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            backgroundColor: '#232939',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#1f2736' }
          }}
        >Save</Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderColor: '#232939',
            color: '#232939',
            '&:hover': { backgroundColor: '#f0f0f0', borderColor: '#1f2736' }
          }}
        >Cancel</Button>
      </Box>
    </Box>
  );
};

export default NodePalette;
