import { createElement } from 'react'

import { renderToString } from 'react-dom/server'

import { LocationProvider, matchPath } from '@redwoodjs/router'
import { MiddlewareResponse } from '@redwoodjs/vite/middleware'

import App from './App'
import { Document } from './Document'

export const middleware = (req, res, options) => {
  renderOgImage(req, options)
  // renderExtension(req, options)
}

export const ServerEntry = ({ css, meta }) => {
  return (
    <Document css={css} meta={meta}>
      <App />
    </Document>
  )
}

// in the future, you can create a component to register any extension, .json, .xml, etc.
const renderExtension = async (req, { route }) => {
  console.log('Rendering extension:')
  console.log('🚀 ~ renderExtension ~ req:', route)
}

/**
 * @param {import('@redwoodjs/vite/middleware').MiddlewareRequest} req
 * @returns {Promise<MiddlewareResponse>}
 */
const renderOgImage = async (req, { route } = {}) => {
  if (!req.url.includes('.png')) {
    return null
  }

  const { pathname, searchParams, origin } = new URL(req.url)

  const withExtension = (route) => {
    if (route.pathDefinition === '/') {
      // Because /.{extension} not possible
      return '/index.{extension}'
    } else {
      // /user/{id}.{extension}
      return route.pathDefinition + '.{extension}'
    }
  }

  const parsedParams = matchPath(withExtension(route), pathname)

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
    './' +
    route.relativeFilePath.replace(
      /\.([jt]sx)/,
      `.${parsedParams.params.extension}.$1`
    )

  try {
    const { data, output: OgComponent } = await import(
      /* @vite-ignore */
      ogImgFilePath
    )
    const dataOut = await data(routeParams)

    const htmlOutput = renderToString(
      createElement(
        LocationProvider,
        {
          location: new URL(req.url),
        },
        createElement(
          Document,
          {
            // @TODO hardcoded index.css
            css: [`${origin}/index.css`],
            meta: [],
          },
          createElement(
            App,
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
  } catch (e) {
    console.error(`OG Image component import failed: ${ogImgFilePath}`)
    console.error(e)
  }
}
