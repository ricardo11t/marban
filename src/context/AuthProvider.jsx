import React, { useContext } from 'react'

const AuthProvider = (children) => {
    const [isAuthenticated, setIsAuthenticated] = useContext(false);

    const fetchUsers = async () => {
        const response = fetch('/api/modules/users.controllers')
    }


  return (
    <AuthProvider.provider value={{}}>
        {children}
    </AuthProvider.provider>
  )
}

export default AuthProvider