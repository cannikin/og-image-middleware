import { createElement } from 'react'

import mime from 'mime-types'
import { renderToString } from 'react-dom/server'

import { LocationProvider, matchPath } from '@redwoodjs/router'
import { MiddlewareResponse } from '@redwoodjs/vite/middleware'
import { OGIMAGE_DEFAULTS } from '@redwoodjs/web'

import App from './App'
import { Document } from './Document'

export const middleware = (req, res, options) => {
  return renderOgImage(req, options)
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

const OG_EXTENSIONS = ['png', 'jpg']

/**
 * @param {import('@redwoodjs/vite/middleware').MiddlewareRequest} req
 * @returns {Promise<MiddlewareResponse>}
 */
const renderOgImage = async (req, { route } = {}) => {
  const { pathname, searchParams, origin } = new URL(req.url)

  // if not an og image request, return null and go on to the next middleware
  if (!OG_EXTENSIONS.includes(pathname.split('.').pop())) {
    return null
  }

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

  const screenshotOptions = {
    viewport: {
      width: parseInt(routeParams.width || OGIMAGE_DEFAULTS.width),
      height: parseInt(routeParams.height || OGIMAGE_DEFAULTS.height),
    },
    format: {
      png: { type: 'png' },
      jpg: {
        type: 'jpeg',
        quality: routeParams.quality
          ? parseInt(routeParams.quality)
          : OGIMAGE_DEFAULTS.quality,
      },
    },
  }

  const browser = await chromium.launch()
  const page = await browser.newPage(screenshotOptions.viewport)

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
    const image = await page.screenshot(
      screenshotOptions.format[parsedParams.params.extension]
    )
    await browser.close()

    const mwResponse = new MiddlewareResponse()
    mwResponse.headers.append(
      'Content-Type',
      mime.lookup(parsedParams.params.extension)
    )
    mwResponse.body = image
    return mwResponse
  } catch (e) {
    console.error(`OG Image component import failed: ${ogImgFilePath}`)
    console.error(e)
  }
}
