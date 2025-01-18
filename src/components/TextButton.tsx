import styles from "./TextButton.module.css";

// This is a button that looks similar to a hyperlink
export const TextButton = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button {...props} className={`${styles.textButton} ${className}`} />;
};
