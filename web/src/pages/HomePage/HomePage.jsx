import { Metadata } from '@redwoodjs/web'

import { useOgImage } from 'src/lib/hooks'

const HomePage = () => {
  const { ogProps } = useOgImage({ extension: 'jpg' })
  return (
    <>
      <Metadata title="Home" description="My awesome homepage" og={ogProps} />

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
