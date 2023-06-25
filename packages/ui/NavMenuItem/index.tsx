import PropTypes, { InferProps } from "prop-types";
import styles from "./NavMenuItem.module.css";

function NavMenuItem({
  children,
  onClick,
}: InferProps<typeof NavMenuItem.propTypes>) {
  return (
    <div className={styles.menuItem} {...(onClick && { onClick })}>
      {children}
    </div>
  );
}

NavMenuItem.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};

export default NavMenuItem;
