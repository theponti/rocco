import { Link } from "react-router-dom";

import { APP_NAME } from "src/constants";
import { LANDING_PATH, LOGIN_PATH } from "src/constants/routes";

import styles from "./Header.module.css";
import AuthNavMenu from "./AuthNavMenu";
import NavMenuItem from "./NavMenuItem";
import { useAppSelector } from "src/services/hooks";
import { getIsAuthenticated } from "src/services/store";

function Header() {
  const isAuthenticated = useAppSelector(getIsAuthenticated);

  return (
    <header className="flex items-center justify-between py-2 px-4">
      <NavMenuItem>
        <Link to={LANDING_PATH} className={styles.appName}>
          {APP_NAME}
        </Link>
      </NavMenuItem>
      {isAuthenticated ? (
        <AuthNavMenu />
      ) : (
        <NavMenuItem>
          <Link
            to={LOGIN_PATH}
            className="btn bg-blue-600 border-none min-h-0 h-10 text-white ml-4"
          >
            Log In
          </Link>
        </NavMenuItem>
      )}
    </header>
  );
}

export default Header;