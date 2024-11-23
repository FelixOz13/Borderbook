import { Typography, useTheme } from '@mui/material'
import FlexBetween from 'components/FlexBetween'
import WidgetWrapper from 'components/WidgetWrapper'

const AdvertWidget5 = () => {
  const { palette } = useTheme()
  const dark = palette.neutral.dark
  const main = palette.neutral.main
  const medium = palette.neutral.medium

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography color={dark} variant="h5" fontWeight="500">
          Patrocinado por
        </Typography>
        <Typography color={medium}>Crear Publicacion</Typography>
      </FlexBetween>
      <img
        width="100%"
        height="auto"
        alt="advert"
        src="./assets/montedepiedad.jpeg"
        style={{ borderRadius: '0.75rem', margin: '0.75rem 0' }}
      />
      <FlexBetween>
        <Typography color={main}>Monte De Piedad</Typography>
        <Typography color={medium}>+1(619)428-3343</Typography>
      </FlexBetween>
      <Typography color={medium} m="0.5rem 0">
      "Tu Casa de Empeño de Mayor Confianza – Monte De Piedad!"
      </Typography>
    </WidgetWrapper>
  )
}

export default AdvertWidget5
