import { Typography, useTheme } from '@mui/material'
import FlexBetween from 'components/FlexBetween'
import WidgetWrapper from 'components/WidgetWrapper'

const AdvertWidget4 = () => {
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
        src="./assets/borderx.jpeg"
        style={{ borderRadius: '0.75rem', margin: '0.75rem 0' }}
      />
      <FlexBetween>
        <Typography color={main}>Border X Money Exchange</Typography>
        <Typography color={medium}>https://borderxchangemoney.com/login/</Typography>
      </FlexBetween>
      <Typography color={medium} m="0.5rem 0">
      "Border X Your Favorite Money Exchange on the San Ysidro Border"
      </Typography>
    </WidgetWrapper>
  )
}

export default AdvertWidget4
