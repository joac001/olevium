import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#7BAF8B',
            contrastText: '#FFFFFF',
            button: '#2A649A',
            labelHint: '#A4A4A4',
        },
        secondary: {
            main: '#C4E1C1',
            contrastText: '#446655',
        },
        background: {
            main: '#FFFFFF',
            paper: '#EAE9DA',
        },
        status: {
            error: '#FF0000',
            warning: '#FFA500',
            info: '#0000FF',
            success: '#008000',
        }
    },
    typography: {
        // light: 400, regular: 500, semibold: 600, bold: 700
        h1: {
            fontWeight: 600,
            fontSize: `${30 / 1.5}px`,
        },
        h2: {
            fontWeight: 500,
            fontSize: `${30 / 1.5}px`,
        },
        money: {
            fontSize: `${30 / 1.5}px`,
            fontWeight: 600,
            textTransform: 'uppercase',
        },
        olevium: {
            fontWeight: 400,
            fontSize: `${40 / 1.5}px`,
        },
        primaryLink: {
            fontWeight: 600,
            fontSize: `${20 / 1.5}px`,
            textTransform: 'uppercase',
        },
        primaryButton: {
            fontSize: `${20 / 1.5}px`,
            fontWeight: 600,
            textTransform: 'uppercase',
        },
        navigation: {
            fontSize: `${20 / 1.5}px`,
            fontWeight: 500,
            // textTransform: 'uppercase',
        },
        labelHint: {
            fontSize: `${15 / 1.5}px`,
            fontWeight: 500,
        },
        columns: {
            fontSize: `${25 / 1.5}px`,
            fontWeight: 600,
        },
    },
});

export default theme;