import { Route, Routes } from "react-router-dom";

import Account from "src/scenes/account";
import Dashboard from "src/scenes/dashboard";
import Invites from "src/scenes/invites";
import List from "src/scenes/list";
import ListInvites from "src/scenes/list/invites";
import Lists from "src/scenes/lists";
import NotFound from "src/scenes/not-found";

import * as ROUTES from "src/constants/routes";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import PlaceModal from "../PlaceModal";
import { useAppSelector } from "src/services/hooks";
import { useRef } from "react";

const AuthenticatedScenes = () => {
  const isMapLoaded = useApiIsLoaded();
  const placeModalState = useAppSelector((state) => state.placeModal);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  return (
    <>
      <Routes>
        <Route
          path={ROUTES.DASHBOARD}
          element={<Dashboard isMapLoaded={isMapLoaded} />}
        />
        <Route path={ROUTES.ACCOUNT} element={<Account />} />
        <Route path={ROUTES.INVITES} element={<Invites />} />
        <Route path={ROUTES.LISTS} element={<Lists />} />
        <Route path={ROUTES.LIST} element={<List />} />
        <Route path={ROUTES.LIST_INVITE} element={<ListInvites />} />
        <Route path={ROUTES.WILDCARD} element={<NotFound />} />
      </Routes>
      <PlaceModal
        isOpen={placeModalState.isOpen}
        place={placeModalState.place}
        onModalClose={placeModalState.onClose}
        ref={modalRef}
      />
    </>
  );
};

export default AuthenticatedScenes;
