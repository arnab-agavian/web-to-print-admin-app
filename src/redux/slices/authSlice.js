import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginRequest, logoutRequest, signupRequest } from '../api/authApi';
import { getUserFromAccessToken, getValidAccessToken, removeAccessToken, saveAccessToken } from '../api/tokenCookie';

function apiError(error) {
  return error.response?.data?.message
    || error.response?.data?.error?.message
    || error.message
    || 'Something went wrong. Please try again.';
}

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const result = await loginRequest(credentials);
    const accessToken = result.session?.accessToken;
    if (!accessToken) return rejectWithValue('The server did not return an access token.');
    saveAccessToken(accessToken, result.session.expiresIn);
    return result;
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const signupUser = createAsyncThunk('auth/signup', async (account, { rejectWithValue }) => {
  try {
    const result = await signupRequest(account);
    if (result.session?.accessToken) saveAccessToken(result.session.accessToken, result.session.expiresIn);
    return result;
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    return await logoutRequest();
  } catch {
    return { message: 'Signed out locally.' };
  } finally {
    removeAccessToken();
  }
});

const existingAccessToken = getValidAccessToken();
const existingUser = getUserFromAccessToken(existingAccessToken);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: existingUser,
    accessToken: existingAccessToken,
    isAuthenticated: Boolean(existingAccessToken),
    loginStatus: 'idle',
    signupStatus: 'idle',
    logoutStatus: 'idle',
    loginError: null,
    signupError: null,
    logoutError: null,
    signupMessage: '',
  },
  reducers: {
    clearLoginFeedback(state) {
      state.loginError = null;
    },
    clearSignupFeedback(state) {
      state.signupError = null;
      state.signupMessage = '';
    },
    sessionExpired(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loginStatus = 'idle';
      state.logoutStatus = 'idle';
      state.loginError = 'Your session expired. Please sign in again.';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = 'loading';
        state.loginError = null;
        state.logoutStatus = 'idle';
        state.logoutError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, session } = action.payload;
        const accessToken = session?.accessToken;
        const tokenUser = getUserFromAccessToken(accessToken);
        state.user = tokenUser ? { ...(user || {}), ...tokenUser } : user || null;
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        state.loginStatus = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.loginError = action.payload || 'Unable to sign in.';
      })
      .addCase(signupUser.pending, (state) => {
        state.signupStatus = 'loading';
        state.signupError = null;
        state.signupMessage = '';
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        const { user, session, message } = action.payload;
        const accessToken = session?.accessToken;
        const tokenUser = getUserFromAccessToken(accessToken);
        state.user = tokenUser ? { ...(user || {}), ...tokenUser } : user || null;
        state.signupStatus = 'succeeded';
        state.signupMessage = message || 'Account created successfully.';
        if (accessToken) {
          state.accessToken = accessToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.signupStatus = 'failed';
        state.signupError = action.payload || 'Unable to create your account.';
      })
      .addCase(logoutUser.pending, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.logoutStatus = 'loading';
        state.logoutError = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.loginStatus = 'idle';
        state.signupStatus = 'idle';
        state.logoutStatus = 'succeeded';
        state.loginError = null;
        state.signupError = null;
        state.logoutError = null;
        state.signupMessage = '';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutStatus = 'failed';
        state.logoutError = action.payload || 'Unable to sign out.';
      });
  },
});

export const { clearLoginFeedback, clearSignupFeedback, sessionExpired } = authSlice.actions;
export default authSlice.reducer;
