import PropTypes from "prop-types";
import Emoji from "ui/Emoji";
import styles from "./Home.module.css";
import { APP_NAME } from "src/constants";

const Home = () => {
  return (
    <div className={styles.wrap}>
      <Emoji kind="map" size="lg">
        🙋‍♀️
      </Emoji>

      <h1>{APP_NAME}</h1>

      <p className={styles.subtitle}>build something beautiful</p>
    </div>
  );
};

Home.propTypes = {
  path: PropTypes.string,
  caseInsensitive: PropTypes.bool,
};

export default Home;
