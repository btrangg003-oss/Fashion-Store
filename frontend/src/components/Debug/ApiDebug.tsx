import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const ApiDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const testStatsApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/stats', {
        credentials: 'include'
      })
      const data = await response.json()
      setDebugInfo({
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testOrdersApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include'
      })
      const data = await response.json()
      setDebugInfo({
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testWishlistApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/wishlist', {
        credentials: 'include'
      })
      const data = await response.json()
      setDebugInfo({
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '20px', 
      margin: '20px', 
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h3>🔧 API Debug Panel</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Current User:</strong>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testStatsApi} disabled={loading} style={{ margin: '5px' }}>
          Test Stats API
        </button>
        <button onClick={testOrdersApi} disabled={loading} style={{ margin: '5px' }}>
          Test Orders API
        </button>
        <button onClick={testWishlistApi} disabled={loading} style={{ margin: '5px' }}>
          Test Wishlist API
        </button>
      </div>

      {loading && <div>Loading...</div>}

      {debugInfo && (
        <div>
          <strong>API Response:</strong>
          <pre style={{ 
            background: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default ApiDebug