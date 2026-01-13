import { type ReactNode } from "react";
import { Icon } from "@components/ui/Icon";
import styles from "./Button.module.css";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "small" | "medium" | "large";
  href?: string;
  onClick?: () => void;
  icon?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
}

export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  href,
  onClick,
  icon,
  disabled = false,
  className = "",
  ariaLabel,
  type = "button",
}: ButtonProps): React.ReactElement => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && <Icon name={icon} size="sm" className={styles.icon} />}
      {children}
    </>
  );

  if (href) {
    // When disabled, render as span to prevent all interaction
    if (disabled) {
      return (
        <span
          className={classNames}
          aria-label={ariaLabel}
          aria-disabled="true"
          role="link"
        >
          {content}
        </span>
      );
    }

    return (
      <a
        href={href}
        className={classNames}
        aria-label={ariaLabel}
        onClick={onClick}
        {...(href.startsWith("http") && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
