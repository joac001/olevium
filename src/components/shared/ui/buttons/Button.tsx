import { ColorKey } from "@/types/ColorKey";
export interface ButtonProps {
    type?: ColorKey;
    text: string;
    disabled?: boolean;
    onClick?: () => void;
    htmlType?: 'button' | 'submit' | 'reset';
}

export default function Button({
    type,
    text,
    disabled = false,
    onClick,
    htmlType = 'button',
}: ButtonProps) {
    return (
        <button
            type={htmlType}
            data-variant={type ?? undefined}
            className={`
        flex w-fit h-fit backdrop-blur-md
        ${type ? 'bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] text-[color:var(--btn-foreground,var(--text-primary))]' : 'bg-transparent text-[color:var(--text-primary)]'}
        ${type ? 'bg-[image:var(--btn-bg-gradient)]' : ''}
        rounded-full px-3 py-2 md:px-3 md:py-1
        transition-all duration-100 ease-in-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
            onClick={onClick}
            disabled={disabled}
        >
            <span className="font-medium text-md md:text-lg text-pretty">{text}</span>
        </button>
    );
}
