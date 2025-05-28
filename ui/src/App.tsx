import { createTheme, styled, ThemeProvider, useMediaQuery } from '@mui/material'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import ApplicationsPage from './pages/ApplicationsPage'
import ApplicationDetailsPage, { loader as ApplicationDetailsLoader } from './pages/ApplicationDetailsPage'
import SettingsPage from './pages/SettingsPage'
import WorkloadsPage from './pages/WorkloadsPage'
import { AuthProvider } from './AuthContext'
import { Layout } from './Layout'
import { useMemo } from 'react'
import { MaterialDesignContent, SnackbarProvider } from 'notistack'

const themeOptions = (mode: 'light' | 'dark' = 'light') => {
  return {
    components: {
      MuiButton: {
        styleOverrides: {
          root: 'line-height: initial;'
        }
      },
      MuiCardActionArea: {
        styleOverrides: {
          focusHighlight: {
            backgroundColor: 'transparent'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          labelSmall: {
            fontSize: '0.75rem'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            color: 'gray'
          },
          body: {
            fontSize: '0.75rem'
          }
        }
      }
    },
    typography: {
      fontFamily: ['Poppins'].join(','),
      code: {
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        lineHeight: '18px',
      },
      h1: {
        fontSize: '2rem',
        fontWeight: 'bold',
        lineHeight: '38px',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: '400',
        lineHeight: '30px',
        '+ h5, + h6': {
          marginTop: '6px'
        }
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: '400',
        lineHeight: '26px',
        '+ h5, + h6': {
          marginTop: '6px'
        }
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: '400',
        lineHeight: '24px',
        '+ h5, + h6': {
          marginTop: '6px'
        }
      },
      h5: {
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '22px',
        color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        margin: undefined
      },
      h6: {
        fontSize: '0.875rem',
        fontWeight: '400',
        lineHeight: '20px',
        color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        margin: undefined
      },
      body1: {
        fontSize: '0.875rem',
        lineHeight: '20px',
      },
      body2: {
        lineHeight: '20px'
      },
      caption: {
        lineHeight: '18px'
      }
    },
    palette: {
      mode: mode,
      ochre: {
        main: '#D3D026',
        light: '#E9DB5D',
        dark: '#A29415',
        contrastText: '#242105',
      },
      primary: {
        dark: '#2453ff',
        light: '#3d98d3',
        main: '#2453ff'
      },
      secondary: {
        main: '#30BA78',
      },
      fog: {
        main: '#efefef',
        light: '#efefef',
        dark: '#efefef',
        contrastText: '#000000',
      }
    }
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    ochre: true;
    fog: true;
  }
}

declare module '@mui/material/styles' {
  interface Palette {
    ochre: Palette['primary'];
    fog: Palette['primary'];
  }

  interface PaletteOptions {
    ochre?: PaletteOptions['primary'];
    fog?: PaletteOptions['primary'];
  }

  interface TypographyVariants {
    code: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    code?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true;
  }
}

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent': {
    fontFamily: 'Poppins',
  },
}))

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        element: <ApplicationsPage />,
        index: true
      },
      {
        path: 'applications/:slugName',
        element: <ApplicationDetailsPage />,
        loader: ApplicationDetailsLoader
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'workloads',
        element: <WorkloadsPage />
      }
    ]
  },
])

export function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () => createTheme(themeOptions(prefersDarkMode ? 'dark' : 'light')),
    [prefersDarkMode],
  )
  
  return (
    <ThemeProvider theme={ theme }>
      <SnackbarProvider maxSnack={ 3 } Components={ { default: StyledMaterialDesignContent } }>
        <AuthProvider>
          <RouterProvider router={ router } />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}
