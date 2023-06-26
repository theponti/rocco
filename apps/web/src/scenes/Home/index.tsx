import PropTypes from "prop-types";

import { APP_NAME } from "src/constants";
import Emoji from "ui/Emoji";

import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.wrap}>
      <Emoji kind="map" size="lg">
        🙋‍♀️
      </Emoji>

      <h1 className={styles.appName}>{APP_NAME}</h1>

      <p className={styles.subtitle}>build something beautiful</p>
    </div>
  );
};

Home.propTypes = {
  path: PropTypes.string,
  caseInsensitive: PropTypes.bool,
};

export default Home;
