import { useLocation } from '@redwoodjs/router'

import { Document } from 'src/Document'

export const DATA = async () => {
  return { foo: 'bar' }
}

export const output = ({ data }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { searchParams } = useLocation()

  return (
    <Document>
      <div>
        <h1>OG Image</h1>
        <p>{data.foo}</p>
        <p>{JSON.stringify(Object.fromEntries(searchParams.entries()))}</p>
      </div>
    </Document>
  )
}
