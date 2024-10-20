import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode palette here
                primary: {
                    main: '#1976d2',
                },
                background: {
                    default: '#f5f5f5',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#333333',
                    secondary: '#666666',
                },
            }
            : {
                // Dark mode palette
                primary: {
                    main: '#90caf9',
                },
                background: {
                    default: '#121212',
                    paper: '#1e1e1e',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#b0bec5',
                },
            }),
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    color: mode === 'dark' ? '#ffffff' : '#333333',
                },
            },
        },
    },
});

// Create and export a default theme
const defaultTheme = createTheme(getDesignTokens('light'));
export default defaultTheme;
