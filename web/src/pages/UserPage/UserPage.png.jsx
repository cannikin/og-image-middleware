import { useLocation } from '@redwoodjs/router'

import { Document } from 'src/Document'

export const data = async () => {
  return { foo: 'bar' }
}

export const output = ({ data, id }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { searchParams } = useLocation()

  return (
    <Document>
      <div>
        <h1>User OG Image</h1>
        <p>data: {data.foo}</p>
        <p>props: {id}</p>
        <p>
          query: {JSON.stringify(Object.fromEntries(searchParams.entries()))}
        </p>
      </div>
    </Document>
  )
}
