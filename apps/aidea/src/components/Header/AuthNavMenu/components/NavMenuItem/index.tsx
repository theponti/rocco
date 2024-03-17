import React, { PropsWithChildren } from "react";

import styles from "./NavMenuItem.module.css";

function NavMenuItem({ children, ...props }: PropsWithChildren) {
  return (
    <div className={styles.menuItem} {...props}>
      {children}
    </div>
  );
}

export default NavMenuItem;
