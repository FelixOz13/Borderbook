import { Typography, useTheme } from '@mui/material'
import FlexBetween from 'components/FlexBetween'
import WidgetWrapper from 'components/WidgetWrapper'

const AdvertWidget2 = () => {
  const { palette } = useTheme()
  const dark = palette.neutral.dark
  const main = palette.neutral.main
  const medium = palette.neutral.medium

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography color={dark} variant="h5" fontWeight="500">
          Patrocinado
        </Typography>
        <Typography color={medium}>Crear Publicacion</Typography>
      </FlexBetween>
      <img
        width="100%"
        height="auto"
        alt="advert"
        src="./assets/mcdonalds.png"
        style={{ borderRadius: '0.75rem', margin: '0.75rem 0' }}
      />
      <FlexBetween>
        <Typography color={main}>McDonalds - San Ysidro</Typography>
        <Typography color={medium}>https://www.mcdonalds.com</Typography>
      </FlexBetween>
      <Typography color={medium} m="0.5rem 0">
      "McDonalds, Comida Rapida y Deliciosa al Cruzar La Frontera en San Ysidro!"
      </Typography>
    </WidgetWrapper>
  )
}

export default AdvertWidget2
