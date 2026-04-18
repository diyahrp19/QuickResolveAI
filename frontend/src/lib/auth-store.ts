import { useSyncExternalStore } from "react";
import { api } from "./api";
import { AUTH_TOKEN_KEY, type AuthUser, type LoginPayload, type SignupPayload } from "./auth";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  hydrated: boolean;
};

const listeners = new Set<() => void>();

function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function writeToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

let state: AuthState = {
  token: readToken(),
  user: null,
  loading: false,
  hydrated: false,
};

let loadPromise: Promise<AuthUser | null> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(next: Partial<AuthState>) {
  state = {
    ...state,
    ...next,
  };
  emit();
}

async function bootstrap() {
  if (!state.token) {
    if (!state.hydrated) {
      setState({ hydrated: true });
    }
    return null;
  }

  if (state.user || state.loading) {
    return state.user;
  }

  if (!loadPromise) {
    setState({ loading: true });
    loadPromise = api.auth
      .me()
      .then((user) => {
        setState({ user, loading: false, hydrated: true });
        return user;
      })
      .catch(() => {
        writeToken(null);
        setState({ token: null, user: null, loading: false, hydrated: true });
        return null;
      })
      .finally(() => {
        loadPromise = null;
      });
  }

  return loadPromise;
}

function setSession(token: string, user: AuthUser) {
  writeToken(token);
  setState({ token, user, loading: false, hydrated: true });
}

export const authStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    void bootstrap();
    return () => listeners.delete(listener);
  },
  bootstrap,
  login: async (payload: LoginPayload) => {
    const response = await api.auth.login(payload);
    setSession(response.access_token, response.user);
    return response;
  },
  signup: async (payload: SignupPayload) => api.auth.signup(payload),
  logout: () => {
    writeToken(null);
    setState({ token: null, user: null, loading: false, hydrated: true });
  },
  hasToken: () => Boolean(state.token),
};

export function useAuth() {
  return useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);
}
