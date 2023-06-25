import { connect } from "react-redux";
import { Link } from "react-router-dom";
import NavMenuItem from "ui/NavMenuItem";

import { APP_NAME } from "src/constants";
import { ACCOUNT_PATH, LANDING_PATH, LOGIN_PATH } from "src/constants/routes";
import { authSelectors, logout } from "src/services/auth";
import { User } from "src/services/auth/auth.types";

import styles from "./Header.module.css";

type HeaderProps = {
  user: User;
  logout: () => {};
};
function Header({ user, logout }: HeaderProps) {
  const isAuthenticated = !!user;
  const btnClassName =
    "btn bg-blue-600 border-none min-h-0 h-10 text-white ml-4";
  return (
    <header className="flex items-center justify-between py-2 px-4">
      <NavMenuItem>
        <Link to={LANDING_PATH} className={styles.appName}>
          {APP_NAME}
        </Link>
      </NavMenuItem>
      <div>
        {isAuthenticated && (
          <NavMenuItem>
            <Link to={ACCOUNT_PATH} className="font-semibold">
              Account
            </Link>
          </NavMenuItem>
        )}
        {isAuthenticated ? (
          <NavMenuItem onClick={logout}>
            <span className={btnClassName}>Log Out</span>
          </NavMenuItem>
        ) : (
          <NavMenuItem>
            <Link to={LOGIN_PATH} className={btnClassName}>
              Log In
            </Link>
          </NavMenuItem>
        )}
      </div>
    </header>
  );
}

const mapStateToProps = (state) => ({
  user: authSelectors.getUser(state),
});

const mapDispatchToProps = {
  logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
