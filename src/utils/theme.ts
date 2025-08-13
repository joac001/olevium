import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        prim: {
            main: '#3AA45B',
            contrastText: '#FFFFFF',
            deny: '#8C1818',
        },
        sec: {
            main: '#657E78',
            contrastText: '#000000',
        },
        bg: {
            default: '#00121F',
            paper: '#00121F',
            secondary: '#FFFFFF',
        },
        glass: {
            main: '#80E19D26',
            paper: '#4A5D7626',
            sky: '#05CECE26',
        }
    },
    typography: {
        // light: 300, regular: 400, semibold: 500, bold: 600
        olevium: {
            fontWeight: 400,
            fontSize: '2.25rem', // 36px, título destacado
            textTransform: 'uppercase',
        },
        title: {
            fontWeight: 500,
            fontSize: '1.5rem', // 24px, título medio
        },
        title2: {
            fontWeight: 400,
            fontSize: '1.25rem', // 20px, título pequeño
        },
        primaryButton: {
            fontWeight: 500,
            fontSize: '1rem', // 16px, botón estándar
            textTransform: 'uppercase',
        },
        link: {
            fontWeight: 500,
            fontSize: '1rem', // 16px, link estándar
            textTransform: 'uppercase',
        },
        labelHint: {
            fontWeight: 400,
            fontSize: '0.875rem', // 14px, label pequeño
        },
        columns: {
            fontWeight: 500,
            fontSize: '1.25rem', // 20px, para columnas o valores destacados
        },
        money: {
            fontWeight: 400,
            fontSize: '1.5rem', // 24px, para montos
            textTransform: 'uppercase',
        },
    },

    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',

                    '& fieldset': {
                        borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                        borderColor: '#cccccc',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#4caf50',
                        borderWidth: 2,
                    },

                    '& input': {
                        color: '#000000',
                    },
                    '& .MuiInputAdornment-root': {
                        color: '#000000',
                    },
                },
            },
        },
    }
});

export default theme;