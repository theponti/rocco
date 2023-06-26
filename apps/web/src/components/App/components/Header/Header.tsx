import { connect } from "react-redux";
import { Link } from "react-router-dom";
import NavMenuItem from "ui/NavMenuItem";

import { APP_NAME } from "src/constants";
import { LANDING_PATH, LOGIN_PATH } from "src/constants/routes";
import { authSelectors } from "src/services/auth";
import { User } from "src/services/auth/auth.types";

import styles from "./Header.module.css";
import AuthNavMenu from "./AuthNavMenu";

function Header({ user }: { user: User }) {
  const isAuthenticated = !!user;
  const btnClassName = "btn border-none min-h-0 h-10 text-white ml-4";
  return (
    <header className="flex items-center justify-between py-2 px-4">
      <div>
        <NavMenuItem>
          <Link to={LANDING_PATH} className={styles.appName}>
            {APP_NAME}
          </Link>
        </NavMenuItem>
      </div>
      <div>
        {isAuthenticated ? (
          <AuthNavMenu user={user} />
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

export default connect(mapStateToProps)(Header);
