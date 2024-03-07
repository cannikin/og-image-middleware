import path from 'node:path'

import { createElement } from 'react'

import mime from 'mime-types'
import { renderToString } from 'react-dom/server'

import { getPaths } from '@redwoodjs/project-config'
import { LocationProvider, matchPath } from '@redwoodjs/router'
import { MiddlewareResponse } from '@redwoodjs/vite/middleware'

import App from '../App'
import { Document } from '../Document'

import { OGIMAGE_DEFAULTS } from './hooks'

export default class OgImageMiddleware {
  supportedExtensions = ['jpg', 'png']

  constructor(req, options) {
    this.req = req
    this.options = options
    this.url = new URL(req.url)
    this.route = options.route
    this.parsedParams = matchPath(this.routeWithExtension, this.url.pathname)
    this.extension = this.parsedParams.params.extension
    this.routeParams = {
      ...Object.fromEntries(this.url.searchParams.entries()),
      ...(this.parsedParams.params || {}),
    }
    this.imageProps = {
      width: parseInt(this.routeParams.width || OGIMAGE_DEFAULTS.width),
      height: parseInt(this.routeParams.height || OGIMAGE_DEFAULTS.height),
      quality: this.routeParams.quality
        ? parseInt(this.routeParams.quality)
        : OGIMAGE_DEFAULTS.quality,
    }

    this.debug = !!this.routeParams.debug
  }

  async invoke() {
    const { pathname, origin } = this.url

    // if not an og image request, bail
    if (!this.supportedExtensions.includes(pathname.split('.').pop())) {
      return null
    }

    const screenshotOptions = {
      viewport: {
        width: this.imageProps.width,
        height: this.imageProps.height,
      },
      format: {
        png: { type: 'png' },
        jpg: {
          type: 'jpeg',
          quality: this.imageProps.quality,
        },
      },
    }
    const { chromium } = await import('playwright')
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: screenshotOptions.viewport })

    const ogImgFilePath = path.join(
      getPaths().web.src,
      this.route.relativeFilePath.replace(/\.([jt]sx)/, `.${this.extension}.$1`)
    )

    const { data, Component } = await this.importComponent(ogImgFilePath)

    const dataOut = await data(this.routeParams)

    const htmlOutput = renderToString(
      createElement(
        LocationProvider,
        {
          location: this.url,
        },
        createElement(
          Document,
          {
            css: this.options.cssPaths.map((file) => `${origin}${file}`),
            meta: [],
          },
          createElement(
            App,
            {},
            this.componentElements({ Component, data: dataOut })
          )
        )
      )
    )

    const mwResponse = new MiddlewareResponse()

    if (this.debug) {
      mwResponse.headers.append('Content-Type', 'text/html')
      mwResponse.body = htmlOutput
    } else {
      await page.setContent(htmlOutput)
      const image = await page.screenshot(
        screenshotOptions.format[this.extension]
      )
      await browser.close()

      mwResponse.headers.append('Content-Type', mime.lookup(this.extension))
      mwResponse.body = image
    }

    return mwResponse
  }

  get routeWithExtension() {
    if (this.route.pathDefinition === '/') {
      // Because /.{extension} not possible
      return '/index.{extension}'
    } else {
      // /user/{id}.{extension}
      return this.route.pathDefinition + '.{extension}'
    }
  }

  get debugElement() {
    return createElement(
      'div',
      {
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          border: '1px dashed red',
          pointerEvents: 'none',
          width: this.imageProps.width,
          height: this.imageProps.height,
        },
      },
      createElement(
        'div',
        {
          style: {
            position: 'absolute',
            left: '0',
            right: '0',
            bottom: '-1.5rem',
            textAlign: 'center',
            color: 'red',
            fontWeight: 'normal',
          },
        },
        `${this.imageProps.width} x ${this.imageProps.height}`
      )
    )
  }

  componentElements({ Component, data }) {
    const element = createElement(Component, {
      data,
      ...this.routeParams,
    })

    if (this.debug) {
      return [
        createElement(
          'div',
          {
            style: { width: this.imageProps.width },
          },
          element
        ),
        this.debugElement,
      ]
    } else {
      return element
    }
  }

  async importComponent(filePath) {
    console.info(filePath)

    try {
      const { data, output } = await import(
        /* @vite-ignore */
        filePath
      )
      return { data, Component: output }
    } catch (e) {
      console.error(`OG Image component import failed: ${filePath}`)
      console.error(e)
    }
  }
}
