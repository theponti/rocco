import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import api from "./api";
import { setUser } from "./auth";
import type { RootState, AppDispatch } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const feedback = {
  connection: "There was an issue connection to the server",
  server: "There was an issue on the server. Our bad",
};

interface Transaction {
  id: string;
  amount: number;
  payee: number;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

export const useMountedState = () => {
  const isMountedRef = useRef<Boolean>(false);
  const isMounted = useCallback(() => isMountedRef.current, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMounted;
};

export const useAccounts = () => {
  return useQuery<Account[], Error | null>("getAccounts", () =>
    api.get("accounts").then((d) => d.data)
  );
};

export const useProfile = () => {
  const reqRef = useRef<Boolean>(false);
  const [error, setError] = useState<String | null>(null);
  const [loading, setLoading] = useState<Boolean>(false);
  const [data, setData] = useState<Transaction[] | null>(null);
  const dispatch = useDispatch();

  const getProfile = useCallback(async () => {
    if (reqRef.current) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      reqRef.current = true;
      const response = await api.get("/me");
      dispatch(setUser(response.data));
      setData(response.data);
    } catch (err: any) {
      setError(err.statusCode === 0 ? feedback.connection : feedback.server);
    } finally {
      reqRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, []);

  return { loading, error, data, getProfile };
};
