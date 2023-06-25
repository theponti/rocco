import { ReactNode } from "react";

type EmojiSizes = "sm" | "md" | "lg";

const SIZES = {
  sm: "16px",
  md: "24px",
  lg: "48px",
};

type EmojiProps = {
  children: ReactNode;
  kind: string;
  size: EmojiSizes;
};

function Emoji({ children, kind, size }: EmojiProps) {
  return (
    <span aria-label={kind} role="img" style={{ fontSize: SIZES[size] }}>
      {children}
    </span>
  );
}

export default Emoji;
