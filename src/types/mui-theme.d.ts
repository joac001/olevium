import '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        prim: { main?: string; contrastText?: string; deny?: string; };
        sec: { main?: string; contrastText?: string; };
        bg: { default?: string; paper?: string; secondary?: string };
        glass: { main?: string; paper?: string; sky?: string };
    }
    interface PaletteOptions {
        prim: { main?: string; contrastText?: string; deny?: string; };
        sec: { main?: string; contrastText?: string; };
        bg: { default?: string; paper?: string; secondary?: string };
        glass: { main?: string; paper?: string; sky?: string };
    }


    interface TypographyVariants {
        olevium: React.CSSProperties;
        title: React.CSSProperties;
        title2: React.CSSProperties;
        primaryButton: React.CSSProperties;
        link: React.CSSProperties;
        labelHint: React.CSSProperties;
        columns: React.CSSProperties;
        money: React.CSSProperties;
    }

    // Permite usar estas variantes en el prop `variant` de Typography
    interface TypographyVariantsOptions {
        olevium?: React.CSSProperties;
        title?: React.CSSProperties;
        title2?: React.CSSProperties;
        primaryButton?: React.CSSProperties;
        link?: React.CSSProperties;
        labelHint?: React.CSSProperties;
        columns?: React.CSSProperties;
        money?: React.CSSProperties;
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        olevium: true;
        title: true;
        title2: true;
        primaryButton: true;
        link: true;
        labelHint: true;
        columns: true;
        money: true;
    }
}
