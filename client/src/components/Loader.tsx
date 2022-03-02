import React from "react";
import styles from "styles/Loader.module.css";
import { classnames } from "../utils/classnames";

const Loader: React.FC = () => (
  <div className={classnames(styles.loader, "text-gray-800 dark:text-white")}>Loading...</div>
);

export default Loader;
