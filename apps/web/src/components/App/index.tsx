import { useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "ui/Loading";

import * as ROUTES from "src/constants/routes";
import Account from "src/scenes/Account";
import Authenticate from "src/scenes/Authenticate";
import Dashboard from "src/scenes/Dashboard";
import Home from "src/scenes/Home";
import Login from "src/scenes/Login";
import NotFound from "src/scenes/NotFound";
import Invites from "src/scenes/invites";
import List from "src/scenes/list";
import ListInvites from "src/scenes/list/invites";
import Lists from "src/scenes/lists";
import { loadAuth } from "src/services/auth";
import { useAppDispatch, useAppSelector } from "src/services/hooks";
import { getIsAuthenticated, getIsLoadingAuth } from "src/services/store";

import styles from "./App.module.scss";
import Header from "./components/Header";

const { VITE_GOOGLE_API_KEY } = import.meta.env;

const LIBRARIES = ["places"];

function App() {
  const authRef = useRef<boolean>(false);
  const isLoadingAuth = useAppSelector(getIsLoadingAuth);
  const isAuthenticated = useAppSelector(getIsAuthenticated);
  const dispatch = useAppDispatch();
  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: VITE_GOOGLE_API_KEY,
    libraries: LIBRARIES as any, // eslint-disable-line
  });

  useEffect(() => {
    if (authRef.current === false) {
      authRef.current = true;
      dispatch(loadAuth());
    }
  }, []); // eslint-disable-line

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center max-w-[300px] mx-auto min-h-screen">
        <Loading size="xl" />
      </div>
    );
  }

  return (
    <div id="app" className={`h-100 flex flex-col ${styles.wrap}`}>
      <Header />
      <main className="flex flex-1 sm:mt-4 md:mt-8" data-testid="app-main">
        <Routes>
          <Route path={ROUTES.AUTHENTICATE} element={<Authenticate />} />
          {isAuthenticated ? (
            <>
              <Route
                path={ROUTES.DASHBOARD}
                element={<Dashboard isMapLoaded={isMapLoaded} />}
              />
              <Route path={ROUTES.ACCOUNT} element={<Account />} />
              <Route path={ROUTES.INVITES} element={<Invites />} />
              <Route path={ROUTES.LISTS} element={<Lists />} />
              <Route path={ROUTES.LIST} element={<List />} />
              <Route path={ROUTES.LIST_INVITE} element={<ListInvites />} />
            </>
          ) : (
            <>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.LANDING} element={<Home />} />
            </>
          )}
          <Route path={ROUTES.WILDCARD} element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
