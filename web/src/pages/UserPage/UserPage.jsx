import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

const UserPage = () => {
  return (
    <>
      <Metadata title="User" description="User page" />

      <h1 className="text-red-500">UserPage</h1>
      <p>
        Find me in <code>./web/src/pages/UserPage/UserPage.jsx</code>
      </p>
      <p>
        My default route is named <code>user</code>, link to me with `
      </p>
    </>
  )
}

export default UserPage
