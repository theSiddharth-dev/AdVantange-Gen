import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate()

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      })
    } catch {
      // ignore network errors on logout
    }

    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  return (
    <div style={{padding:32}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h2 style={{margin:0}}>Welcome{user?.username ? `, ${user.username}` : ''}</h2>
          <p style={{margin:0,color:'#556'}}>{user?.email || ''}</p>
        </div>
        <div>
          <button onClick={handleLogout} style={{padding:'8px 12px',borderRadius:8}}>Logout</button>
        </div>
      </header>

      <main style={{marginTop:24}}>
       
      </main>
    </div>
  )
}
