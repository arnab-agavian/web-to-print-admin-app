import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import productReducer from "../slices/productSlice";
import templateReducer from "../slices/templateSlice";
import orderReducer from "../slices/orderSlice";
import customerReducer from "../slices/customerSlice";
import notificationReducer from "../slices/notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    templates: templateReducer,
    orders: orderReducer,
    customers: customerReducer,
    notifications: notificationReducer,
  },
});

export default store;
