import React from 'react';
import { InputBase, MenuItem, Select, TextField } from '@mui/material';

export function AppTextField({ sx, ...props }) {
  return <TextField sx={{ mt: 2.25, ...sx }} {...props} />;
}

export function AppSelectField({ options = [], sx, ...props }) {
  return (
    <TextField select sx={{ mt: 2.25, ...sx }} {...props}>
      {options.map((option) => {
        const value = Array.isArray(option) ? option[0] : option.value ?? option;
        const label = Array.isArray(option) ? option[1] : option.label ?? option;
        return <MenuItem value={value} key={value}>{label}</MenuItem>;
      })}
    </TextField>
  );
}

export function AppSearchInput(props) {
  return <InputBase fullWidth {...props} />;
}

export function AppCompactSelect({ options = [], ...props }) {
  return (
    <Select variant="standard" disableUnderline fullWidth {...props}>
      {options.map((option) => {
        const value = Array.isArray(option) ? option[0] : option.value ?? option;
        const label = Array.isArray(option) ? option[1] : option.label ?? option;
        return <MenuItem value={value} key={value}>{label}</MenuItem>;
      })}
    </Select>
  );
}
