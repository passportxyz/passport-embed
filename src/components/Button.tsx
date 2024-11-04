import styles from "./Button.module.css";

export const Button = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button {...props} className={`${styles.button} ${className}`} />;
};
