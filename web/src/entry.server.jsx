import App from './App'
import { Document } from './Document'
import OgImageMiddleware from './lib/OgImageMiddleware'

export const middleware = (req, _res, options) => {
  const mw = new OgImageMiddleware(req, options)
  return mw.invoke()
  // renderExtension(req, options)
}

// in the future,you can create a component to register any extension, .json, .xml,etc.
const renderExtension = async (req, { route }) => {
  console.log('Rendering extension:')
  console.log('🚀 ~ renderExtension ~ req:', route)
}

export const ServerEntry = ({ css, meta }) => {
  return (
    <Document css={css} meta={meta}>
      <App />
    </Document>
  )
}
