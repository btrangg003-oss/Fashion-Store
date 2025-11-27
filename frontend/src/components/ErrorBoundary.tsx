import React, { Component, ErrorInfo, ReactNode } from 'react'
import styled from 'styled-components'
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

const ErrorContainer = styled.div`
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8f9fa;
`

const ErrorCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
`

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: #e74c3c;
  margin-bottom: 1.5rem;
`

const ErrorTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`

const ErrorMessage = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
`

const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`

const ErrorButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'secondary' ? `
    background: #f8f9fa;
    color: #667eea;
    border: 1px solid #667eea;
    
    &:hover {
      background: #667eea;
      color: white;
    }
  ` : `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  `}
`

const ErrorDetails = styled.details`
  margin-top: 2rem;
  text-align: left;
  
  summary {
    cursor: pointer;
    color: #667eea;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    font-size: 0.8rem;
    overflow-x: auto;
    color: #666;
  }
`

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorContainer>
          <ErrorCard>
            <ErrorIcon>
              <FiAlertTriangle />
            </ErrorIcon>
            
            <ErrorTitle>Oops! Có lỗi xảy ra</ErrorTitle>
            
            <ErrorMessage>
              Xin lỗi, đã có lỗi không mong muốn xảy ra. Chúng tôi đã ghi nhận sự cố này và sẽ khắc phục sớm nhất có thể.
            </ErrorMessage>
            
            <ErrorActions>
              <ErrorButton onClick={this.handleRetry}>
                <FiRefreshCw />
                Thử lại
              </ErrorButton>
              
              <ErrorButton variant="secondary" onClick={this.handleGoHome}>
                <FiHome />
                Về trang chủ
              </ErrorButton>
            </ErrorActions>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <ErrorDetails>
                <summary>Chi tiết lỗi (Development)</summary>
                <pre>
                  <strong>Error:</strong> {this.state.error.message}
                  {'\n\n'}
                  <strong>Stack:</strong> {this.state.error.stack}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </ErrorDetails>
            )}
          </ErrorCard>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}