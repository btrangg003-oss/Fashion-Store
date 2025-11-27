import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const Header = styled.div`
  background: #f5f5f5;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 20px;
`

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ee4d2d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
`

const UserInfo = styled.div`
  h2 {
    margin: 0 0 5px 0;
    font-size: 1.2rem;
    color: #333;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }
`

const ProfileHeader = () => {
  const { user } = useAuth()
  
  if (!user) {
    return null
  }

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
  }

  return (
    <Header>
      <Container>
        <Avatar>
          {getInitials(user.firstName, user.lastName)}
        </Avatar>
        <UserInfo>
          <h2>{user.firstName} {user.lastName}</h2>
          <p>{user.email}</p>
        </UserInfo>
      </Container>
    </Header>
  )
}

export default ProfileHeader