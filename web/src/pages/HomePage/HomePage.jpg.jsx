import { useLocation } from '@redwoodjs/router'

// import photo from './assets/photo.jpg'
import { DATA } from './HomePage'

export const data = async () => {
  return DATA
}

export const output = ({ data }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { origin, searchParams } = useLocation()
  const query = Object.fromEntries(searchParams.entries())

  return (
    <div className="h-full p-8">
      <div className="rounded-lg bg-neutral-700 p-8 shadow-lg">
        <div className="flex items-start space-x-8">
          <div className="relative w-[750px]">
            <img
              src={`${origin}/photo.jpg`}
              className="w-full rounded shadow"
              alt="blah"
            />
            <h1 className="absolute inset-x-0 top-8 text-center text-7xl font-semibold text-white">
              OG Image Middleware
            </h1>
          </div>

          <div className="">
            <table className="-mt-2">
              <tbody>
                {Object.entries(data).map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-2">
                      <label className="text-lg text-gray-400">{key}</label>
                      <span className="-mt-1 block text-2xl font-semibold text-white">
                        {value}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-center">
        Query String Parameters: {JSON.stringify(query)}
      </div>
    </div>
  )
}
