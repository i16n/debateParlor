declare namespace JSX {
  interface IntrinsicElements {
    "wired-input": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        placeholder?: string;
        value?: string;
        disabled?: boolean;
      },
      HTMLElement
    >;
    "wired-button": React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLElement> & {
        elevation?: string;
        disabled?: boolean;
      },
      HTMLElement
    >;
  }
}
