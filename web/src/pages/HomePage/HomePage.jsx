import { Metadata } from '@redwoodjs/web'

import { useOgImage } from 'src/lib/hooks'

export const DATA = {
  Date: 'Jun 3 2023 11:11am',
  Copyright: 'Rob Cameron',
  Camera: 'Fujifilm XT-1',
  Lens: '16mm',
  ISO: 200,
  Aperture: 'f/9',
  Shutter: '1/350',
}

const HomePage = () => {
  const { url, ogProps } = useOgImage({ extension: 'jpg' })

  return (
    <>
      <Metadata title="Home" description="A photo" og={ogProps} />

      <div className="h-full bg-neutral-800 p-8">
        <div className="relative mx-auto max-w-screen-lg">
          <img
            src={`${origin}/photo.jpg`}
            className="w-full rounded shadow"
            alt="blah"
          />
        </div>

        <ul className="metadata mt-1 flex w-full items-center justify-center space-x-8">
          {Object.entries(DATA).map(([key, value]) => (
            <li key={key}>
              <div>
                <label className="text-sm text-gray-400">{key}</label>
                <span className="-mt-1 block font-semibold text-white">
                  {value}
                </span>
              </div>
            </li>
          ))}
          <li>
            <a
              href={`${url}?reference=123dy18d4`}
              className="text-neutral-600 underline transition duration-150 hover:text-neutral-100"
            >
              og:image
            </a>
          </li>
          <li>
            <a
              href={`${url}?debug=1&reference=123dy18d4`}
              className="text-neutral-600 underline transition duration-150 hover:text-neutral-100"
            >
              debug
            </a>
          </li>
        </ul>
      </div>
    </>
  )
}

export default HomePage
