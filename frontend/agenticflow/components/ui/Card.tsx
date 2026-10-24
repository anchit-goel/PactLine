import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
  className = "",
  style,
  title,
  action,
  as: Tag = "section",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: ReactNode;
  action?: ReactNode;
  as?: "section" | "div" | "article" | "aside";
  padded?: boolean;
}) {
  return (
    <Tag className={`card ${className}`} style={{ ...(padded ? {} : { padding: 0 }), ...style }}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title && <h2 className="t-title m-0">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </Tag>
  );
}
