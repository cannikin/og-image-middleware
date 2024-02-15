import { createElement } from 'react'

import { renderToString } from 'react-dom/server'

import { getPaths } from '@redwoodjs/project-config'
import { LocationProvider, matchPath } from '@redwoodjs/router'
import { MiddlewareResponse } from '@redwoodjs/vite/middleware'

import App from './App'
import { Document } from './Document'

export const middleware = (req, res, options) => {
  if (req.url.includes('.png')) {
    return renderOgImage(req, options)
  }
}

export const ServerEntry = ({ css, meta }) => {
  return (
    <Document css={css} meta={meta}>
      <App />
    </Document>
  )
}

/**
 * @param {import('@redwoodjs/vite/middleware').MiddlewareRequest} req
 * @returns {Promise<MiddlewareResponse>}
 */
const renderOgImage = async (req, { route }) => {
  const { pathname, searchParams, origin } = new URL(req.url)

  const parsedParams = matchPath(route.pathDefinition + '.png', pathname)

  const routeParams = {
    ...Object.fromEntries(searchParams.entries()),
    ...(parsedParams.params || {}),
  }

  const { chromium } = await import('playwright')

  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: {
      width: parseInt(routeParams.width || 1200),
      height: parseInt(routeParams.height || 630),
    },
  })

  const ogImgFilePath =
    './' + route.relativeFilePath.replace(/\.([jt]sx)/, '.ogImg.$1')

  const { DATA, output: OgComponent } = await import(ogImgFilePath)
  const { default: AppComponent } = await import(getPaths().web.app)
  const { Document: DocumentComponent } = await import(getPaths().web.document)
  const dataOut = await DATA(routeParams)

  const htmlOutput = renderToString(
    createElement(
      LocationProvider,
      {
        location: new URL(req.url),
      },
      createElement(
        DocumentComponent,
        {
          // @TODO hardcoded index.css
          css: [`${origin}/index.css`],
          meta: [],
        },
        createElement(
          AppComponent,
          {},
          createElement(OgComponent, {
            data: dataOut,
            ...routeParams,
          })
        )
      )
    )
  )

  await page.setContent(htmlOutput)

  const png = await page.screenshot({ type: 'png' })

  await browser.close()

  const mwResponse = new MiddlewareResponse()
  mwResponse.headers.append('Content-Type', 'image/png')
  mwResponse.body = png
  return mwResponse
}
