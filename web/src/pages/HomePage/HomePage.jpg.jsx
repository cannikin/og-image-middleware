import { useLocation } from '@redwoodjs/router'
// import photo from './assets/photo.jpg'

export const data = async () => {
  return { Date: 'Jun 3 2023 11:11am', Copyright: 'Rob Cameron', Camera: 'Fujifilm XT-1', Lens: '16mm', ISO: 200, Aperture: 'f/9', Shutter: '1/350' }
}

export const output = ({ data }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { searchParams } = useLocation()
  const query = Object.fromEntries(searchParams.entries())

  return (
    <div className="p-8 bg-gray-200 h-full">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-start space-x-8">
          <div className="w-8/12">
            <img src="http://localhost:8910/photo.jpg" className="w-full shadow rounded"/>
          </div>

          <div className="w-4/12">
            <table className="metadata">
              <tbody>
                {Object.entries(data).map(([key,value]) => (
                  <tr key={key}>
                    <td>
                      <label>{key}</label>
                      <span>{value}</span>
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
