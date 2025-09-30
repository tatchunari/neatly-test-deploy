interface ButtonProps {
  loading: boolean;
  text: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}

export const Button = ({ loading, text, onClick, className, type }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      type={type}
      className={`flex items-center justify-center w-30 gap-2 px-4 py-2 rounded-sm transition-colors cursor-pointer ${className}`}
    >
      {text}
    </button>
  );
};
