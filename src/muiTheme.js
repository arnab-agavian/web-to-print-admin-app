import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#17191d' },
    secondary: { main: '#a8e600' },
    error: { main: '#c84a33' },
    text: { primary: '#17191d', secondary: '#6f7571' },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    button: { fontFamily: 'Space Grotesk, Inter, sans-serif', fontWeight: 700 },
  },
  components: {
    MuiTextField: {
      defaultProps: { fullWidth: true, size: 'small', variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 50,
          backgroundColor: '#fff',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8c918e' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#17191d',
            borderWidth: 1,
            boxShadow: '0 0 0 3px rgba(23, 25, 29, .06)',
          },
        },
        notchedOutline: { borderColor: '#d5d7d2' },
        input: { fontSize: 14, padding: '13px 14px' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 13, fontWeight: 600 },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginLeft: 0, fontSize: 11, lineHeight: 1.35 } },
    },
    MuiCheckbox: {
      styleOverrides: { root: { color: '#8c918e', '&.Mui-checked': { color: '#17191d' } } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { fontSize: 14 } },
    },
  },
});

export default muiTheme;
