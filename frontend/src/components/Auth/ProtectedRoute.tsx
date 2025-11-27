import { useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  flex-direction: column;
  gap: 1rem;
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const LoadingText = styled.p`
  color: #666;
  font-size: 1rem;
`

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
  loadingComponent
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Save current path for redirect after login
        const currentPath = router.asPath
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
        router.replace(redirectUrl)
      } else if (!requireAuth && user) {
        // If user is logged in but accessing auth pages, redirect to profile
        router.replace('/profile')
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Show loading while checking authentication
  if (loading) {
    return loadingComponent || (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Đang kiểm tra đăng nhập...</LoadingText>
      </LoadingContainer>
    )
  }

  // If auth is required but user is not logged in, don't render anything
  // (redirect will happen in useEffect)
  if (requireAuth && !user) {
    return null
  }

  // If auth is not required but user is logged in, don't render anything
  // (redirect will happen in useEffect)
  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute