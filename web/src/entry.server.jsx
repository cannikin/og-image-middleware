import fs from 'fs'
import path from 'node:path'

import { createElement } from 'react'

import { renderToString } from 'react-dom/server'

import { getPaths } from '@redwoodjs/project-config'
import { LocationProvider, matchPath } from '@redwoodjs/router'
import { MiddlewareResponse } from '@redwoodjs/vite/middleware'

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

const renderExtension = async (req, { route }) => {
  console.log('Rendering extension:')
  console.log('🚀 ~ renderExtension ~ req:', route)
}

/**
 * @param {import('@redwoodjs/vite/middleware').MiddlewareRequest} req
 * @returns {Promise<MiddlewareResponse>}
 */
const renderOgImage = async (req, { route }) => {
  if (!req.url.includes('.png')) {
    return null
  }

  const { pathname, searchParams, origin } = new URL(req.url)

  const parsedParams = matchPath(
    route.pathDefinition + '.{extension}',
    pathname
  )

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
