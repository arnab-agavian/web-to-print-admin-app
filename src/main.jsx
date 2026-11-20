import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import App from './App';
import muiTheme from './muiTheme';
import store from './redux/store';
import './adminStyles.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <Provider store={store}><App /></Provider>
    </ThemeProvider>
  </React.StrictMode>,
);

