import React from 'react'

import { Css, Meta } from '@redwoodjs/web'

export const Document = ({ children, css, meta }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <Css css={css} />
        <Meta tags={meta} />
      </head>
      <body>
        <div id="redwood-app">{children}</div>
      </body>
    </html>
  )
}
