import styles from "./Button.module.css";

export const Button = ({
  invert,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { invert?: boolean }) => {
  return (
    <button
      {...props}
      className={`${styles.button} ${invert ? styles.invert : ""} ${className}`}
    />
  );
};
