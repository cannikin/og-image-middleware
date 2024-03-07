
import { createElement } from 'react'

import mime from 'mime-types'
import { renderToString } from 'react-dom/server'

import { LocationProvider, matchPath } from '@redwoodjs/router'
import { MiddlewareResponse } from '@redwoodjs/vite/middleware'
import { OGIMAGE_DEFAULTS } from '@redwoodjs/web'

import App from '../App'
import { Document } from '../Document'

export default class OgImageMiddleware {

  #supportedExtensions = ['jpg', 'png']

  #routeWithExtension() {
    if (this.route.pathDefinition === '/') {
      // Because /.{extension} not possible
      return '/index.{extension}'
    } else {
      // /user/{id}.{extension}
      return this.route.pathDefinition + '.{extension}'
    }
  }

  #debugElement(width,height) {
    return createElement(
      'div',
      {
        style: { width,height },
        className: `absolute top-0 left-0 border border-dashed border-red-500`
      }
    )
  }

  #elementsToRender({ Component, data, width, height, isDebugMode, routeParams }) {
    const element = createElement(
      Component,
      {
        data,
        ...routeParams,
      },
    )

    if (isDebugMode) {
      return [
        createElement(
          'div',
          {
            style: { width },
          },
          element
        ),
        this.#debugElement(width, height)
      ]
    } else {
      return element
    }
  }


  async #importComponent(filePath) {
    try {
      const { data,output } = await import(
        /* @vite-ignore */
        filePath
      )
      return { data, Component: output }
    } catch (e) {
      console.error(`OG Image component import failed: ${filePath}`)
      console.error(e)
    }
  }

  constructor(req,options) {
    this.req = req
    this.options = options

    this.url = new URL(req.url)
    this.route = options.route
  }

  async invoke() {
    const { pathname,searchParams,origin } = this.url

    // if not an og image request, return null and go on to the next middleware
    if (!this.#supportedExtensions.includes(pathname.split('.').pop())) {
      return null
    }

    const parsedParams = matchPath(this.#routeWithExtension(),pathname)

    const routeParams = {
      ...Object.fromEntries(searchParams.entries()),
      ...(parsedParams.params || {}),
    }
    const width = parseInt(routeParams.width || OGIMAGE_DEFAULTS.width)
    const height = parseInt(routeParams.height || OGIMAGE_DEFAULTS.height)
    const quality = routeParams.quality ? parseInt(routeParams.quality) : OGIMAGE_DEFAULTS.quality
    const isDebugMode = !!routeParams.html

    const screenshotOptions = {
      viewport: {
        width,
        height
      },
      format: {
        png: { type: 'png' },
        jpg: {
          type: 'jpeg',
          quality
        },
      },
    }
    const { chromium } = await import('playwright')
    const browser = await chromium.launch()
    const page = await browser.newPage(screenshotOptions.viewport)

    const ogImgFilePath =
      '../' +
      this.route.relativeFilePath.replace(
        /\.([jt]sx)/,
        `.${parsedParams.params.extension}.$1`
      )

    const { data, Component } = await this.#importComponent(ogImgFilePath)

    const dataOut = await data(routeParams)

    const htmlOutput = renderToString(
      createElement(
        LocationProvider,
        {
          location: this.url,
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
            this.#elementsToRender({ Component,data: dataOut,routeParams,width,height,isDebugMode })
          )
        )
      )
    )

    const mwResponse = new MiddlewareResponse()

    if (isDebugMode) {
      mwResponse.headers.append('Content-Type','text/html')
      mwResponse.body = htmlOutput
    } else {
      await page.setContent(htmlOutput)
      const image = await page.screenshot(
        screenshotOptions.format[parsedParams.params.extension]
      )
      await browser.close()

      mwResponse.headers.append(
        'Content-Type',
        mime.lookup(parsedParams.params.extension)
      )
      mwResponse.body = image
    }

    return mwResponse
  }
}
