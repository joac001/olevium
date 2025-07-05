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
    },
    typography: {
        // light: 400, regular: 500, semibold: 600, bold: 700
        h1: {
            fontWeight: 600,
            fontSize: '30px',
        },
        h2: {
            fontWeight: 500,
            fontSize: '30px',
        },
        money: {
            fontSize: '30px',
            fontWeight: 600,
            textTransform: 'uppercase',
        },
        olevium: {
            fontWeight: 400,
            fontSize: '40px',
        },
        primaryLink: {
            fontWeight: 600,
            fontSize: '20px',
            textTransform: 'uppercase',
        },
        labelHint: {
            fontSize: '15px',
            fontWeight: 500,
        },
        primaryButton: {
            fontSize: '20px',
            fontWeight: 600,
            textTransform: 'uppercase',
        },
        columnes: {
            fontSize: '25px',
            fontWeight: 600,
        },
    },
});

export default theme;