import { useLocation } from '@redwoodjs/router'

import { Document } from 'src/Document'

export const data = async () => {
  return { foo: 'bar' }
}

export const output = ({ data }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { searchParams } = useLocation()

  return (
    <div className="bg-red-500">
      <h1 className="text-sm">OG Image</h1>
      <p>data: {data.foo}</p>
      <p>query: {JSON.stringify(Object.fromEntries(searchParams.entries()))}</p>
    </div>
  )
}
