export declare const Hyperlink: ({ href, children, className, }: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const ScoreTooLowBody: ({ generateSignatureCallback, }: {
    generateSignatureCallback: ((message: string) => Promise<string | undefined>) | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export declare const AddStamps: ({ generateSignatureCallback, onBack, }: {
    generateSignatureCallback: ((message: string) => Promise<string | undefined>) | undefined;
    onBack: () => void;
}) => import("react/jsx-runtime").JSX.Element;
