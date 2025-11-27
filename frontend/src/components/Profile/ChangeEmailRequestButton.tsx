import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface ChangeEmailRequestButtonProps {
  currentEmail: string;
  onSuccess?: () => void;
}

const ChangeEmailRequestButton: React.FC<ChangeEmailRequestButtonProps> = ({
  currentEmail,
  onSuccess
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/customer/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email_change',
          data: {
            currentEmail,
            newEmail
          },
          reason
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setNewEmail('');
          setReason('');
          onSuccess?.();
        }, 2000);
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Không thể gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RequestButton onClick={() => setShowModal(true)}>
        <FiMail /> Yêu cầu đổi email
      </RequestButton>

      <AnimatePresence>
        {showModal && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowModal(false)}
            />
            <Modal
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <ModalHeader>
                <ModalTitle>Yêu cầu đổi email</ModalTitle>
                <CloseButton onClick={() => !loading && setShowModal(false)}>
                  <FiX size={24} />
                </CloseButton>
              </ModalHeader>

              {success ? (
                <SuccessMessage>
                  <FiCheck size={48} />
                  <h3>Đã gửi yêu cầu thành công!</h3>
                  <p>Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.</p>
                </SuccessMessage>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <ModalBody>
                    {error && (
                      <ErrorMessage>
                        <FiAlertCircle />
                        {error}
                      </ErrorMessage>
                    )}

                    <FormGroup>
                      <Label>Email hiện tại</Label>
                      <Input type="email" value={currentEmail} disabled />
                    </FormGroup>

                    <FormGroup>
                      <Label>Email mới <Required>*</Required></Label>
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Nhập email mới"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Lý do đổi email <Required>*</Required></Label>
                      <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Vui lòng cho biết lý do bạn muốn đổi email..."
                        rows={4}
                        required
                      />
                    </FormGroup>

                    <HelpText>
                      ℹ️ Yêu cầu sẽ được admin xem xét. Bạn sẽ nhận được thông báo qua email hiện tại.
                    </HelpText>
                  </ModalBody>

                  <ModalFooter>
                    <CancelButton type="button" onClick={() => setShowModal(false)} disabled={loading}>
                      Hủy
                    </CancelButton>
                    <SubmitButton type="submit" disabled={loading}>
                      {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </SubmitButton>
                  </ModalFooter>
                </Form>
              )}
            </Modal>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Styled Components
const RequestButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  backdrop-filter: blur(4px);
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) !important;
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  overflow: hidden;
  margin: 0 !important;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const Form = styled.form``;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #059669;
  
  svg {
    margin-bottom: 1rem;
  }
  
  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
  }
  
  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Required = styled.span`
  color: #ef4444;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const HelpText = styled.p`
  margin: 0;
  font-size: 0.813rem;
  color: #6b7280;
  line-height: 1.5;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #f9fafb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default ChangeEmailRequestButton;
