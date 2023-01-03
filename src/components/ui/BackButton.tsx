import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import styles from "./BackButton.module.css";

export const BackButton = () => {
  return (
    <Link className={styles.link} to="/">
      <FaArrowLeft className={styles.button} size={25} />
    </Link>
  );
};
