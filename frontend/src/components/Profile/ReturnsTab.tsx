import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiPlus, FiPackage, FiAlertCircle } from 'react-icons/fi'
import { Return, RETURN_STATUSES } from '@/models/returns'
import ReturnRequestModal from './ReturnRequestModal'
import ReturnCard from './ReturnCard'

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const TitleIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`

const TitleContent = styled.div``

const Title = styled.h2`
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  color: #111827;
  font-weight: 700;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
`

const AddButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.1rem;
  }
`

const FilterTabs = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 12px;
`

const FilterTab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.25rem;
  border: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#667eea' : '#6b7280'};
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(102, 126, 234, 0.15)' : 'none'};

  &:hover {
    background: white;
    color: #667eea;
    border-color: #667eea;
  }
`

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 20px;
  border: 2px dashed #d1d5db;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
`

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  color: #d1d5db;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`

const EmptyTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 700;
`

const EmptyText = styled.p`
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`

const ReturnsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
`

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const Message = styled(motion.div)<{ type: 'success' | 'error' }>`
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  background: ${props => props.type === 'success' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.type === 'success' ? '#065f46' : '#991b1b'};
  border: 2px solid ${props => props.type === 'success' ? '#a7f3d0' : '#fecaca'};
  box-shadow: 0 2px 8px ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};

  svg {
    font-size: 1.25rem;
    flex-shrink: 0;
  }
`

const ReturnsTab: React.FC = () => {
    const [returns, setReturns] = useState<Return[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchReturns()
    }, [filter])

    const fetchReturns = async () => {
        try {
            const params = new URLSearchParams()
            if (filter !== 'all') params.append('status', filter)

            const response = await fetch(`/api/returns?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                setReturns(data.returns)
            }
        } catch (error) {
            console.error('Fetch returns error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSuccess = () => {
        setShowModal(false)
        setMessage({ type: 'success', text: 'Tạo yêu cầu trả hàng thành công' })
        fetchReturns()
        setTimeout(() => setMessage(null), 3000)
    }

    const handleCancel = async (id: string) => {
        if (!confirm('Bạn có chắc muốn hủy yêu cầu này?')) return

        try {
            const response = await fetch(`/api/returns/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ action: 'cancel' })
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Hủy yêu cầu thành công' })
                fetchReturns()
                setTimeout(() => setMessage(null), 3000)
            } else {
                setMessage({ type: 'error', text: data.message || 'Hủy yêu cầu thất bại' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Không thể hủy yêu cầu' })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa yêu cầu này? Hành động này không thể hoàn tác.')) return

        try {
            const response = await fetch(`/api/returns/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Xóa yêu cầu thành công' })
                fetchReturns()
                setTimeout(() => setMessage(null), 3000)
            } else {
                setMessage({ type: 'error', text: data.message || 'Xóa yêu cầu thất bại' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Không thể xóa yêu cầu' })
        }
    }

    if (loading) {
        return (
            <Container>
                <LoadingState>
                    <Spinner />
                    <div style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: '500' }}>
                        Đang tải danh sách trả hàng...
                    </div>
                </LoadingState>
            </Container>
        )
    }

    return (
        <Container>
            {message && (
                <Message
                    type={message.type}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FiAlertCircle />
                    {message.text}
                </Message>
            )}

            <Header>
                <TitleSection>
                    <TitleIcon>🔄</TitleIcon>
                    <TitleContent>
                        <Title>Đổi & Trả Hàng</Title>
                        <Subtitle>Quản lý yêu cầu đổi trả sản phẩm của bạn</Subtitle>
                    </TitleContent>
                </TitleSection>
                <AddButton
                    onClick={() => setShowModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FiPlus />
                    Yêu cầu trả hàng
                </AddButton>
            </Header>

            <FilterTabs>
                <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
                    Tất cả ({returns.length})
                </FilterTab>
                {Object.entries(RETURN_STATUSES).map(([key, value]) => (
                    <FilterTab key={key} active={filter === key} onClick={() => setFilter(key)}>
                        {value.icon} {value.label}
                    </FilterTab>
                ))}
            </FilterTabs>

            {returns.length === 0 ? (
                <EmptyState
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <EmptyIcon><FiPackage /></EmptyIcon>
                    <EmptyTitle>Chưa có yêu cầu trả hàng</EmptyTitle>
                    <EmptyText>
                        Bạn chưa có yêu cầu đổi trả nào. Nếu sản phẩm có vấn đề, hãy tạo yêu cầu để được hỗ trợ.
                    </EmptyText>
                    <AddButton
                        onClick={() => setShowModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiPlus />
                        Tạo yêu cầu đầu tiên
                    </AddButton>
                </EmptyState>
            ) : (
                <ReturnsList>
                    {returns.map((returnItem, index) => (
                        <ReturnCard
                            key={returnItem.id}
                            return={returnItem}
                            onCancel={handleCancel}
                            onDelete={handleDelete}
                            delay={index * 0.05}
                        />
                    ))}
                </ReturnsList>
            )}

            {showModal && (
                <ReturnRequestModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </Container>
    )
}

export default ReturnsTab
