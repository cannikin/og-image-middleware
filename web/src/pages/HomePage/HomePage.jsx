import { Link, routes, useLocation } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

const HomePage = () => {
  const { href } = useLocation()
  // @TODO Implement this!
  // const ogImageUrl = useOgImageUrl()

  const ogImageUrl = href + '.png'

  return (
    <>
      <Metadata
        title="Home"
        description="Home page"
        og={{ image: ogImageUrl }}
      />

      <h1>HomePage</h1>
      <p>
        Find me in <code>./web/src/pages/HomePage/HomePage.jsx</code>
      </p>
      <p>
        My default route is named <code>home</code>, link to me with `
      </p>
    </>
  )
}

export default HomePage
