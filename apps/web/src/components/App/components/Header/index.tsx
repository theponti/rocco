import { Link } from "react-router-dom";

import { APP_NAME } from "src/constants";
import { LANDING, LOGIN } from "src/constants/routes";
import { useAppSelector } from "src/services/hooks";
import { getIsAuthenticated } from "src/services/store";

import AuthNavMenu from "./AuthNavMenu";
import NavMenuItem from "./NavMenuItem";
import Emoji from "ui/Emoji";

function Header() {
  const isAuthenticated = useAppSelector(getIsAuthenticated);

  return (
    <header className="navbar flex flex-row justify-between items-center border-b py-4">
      <NavMenuItem>
        <Link to={LANDING} className="font-extrabold lowercase text-4xl">
          <Emoji kind="map" size="md" className="animate-spin-slow mr-2">
            🌎
          </Emoji>
          {APP_NAME}
        </Link>
      </NavMenuItem>
      {isAuthenticated ? (
        <AuthNavMenu />
      ) : (
        <NavMenuItem>
          <Link to={LOGIN} className="btn btn-primary text-white">
            Log In
          </Link>
        </NavMenuItem>
      )}
    </header>
  );
}

export default Header;
