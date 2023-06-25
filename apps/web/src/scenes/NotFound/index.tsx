import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <div className={styles.wrap}>
      <h1>You lost, buddy?</h1>
      <p>The requested URL was not found on the server.</p>
    </div>
  );
}

NotFound.propTypes = {};

export default NotFound;
