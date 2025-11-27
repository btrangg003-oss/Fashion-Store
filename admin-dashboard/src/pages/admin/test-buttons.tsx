import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { FiCheck, FiX } from 'react-icons/fi';

export default function TestButtons() {
  const router = useRouter();
  const [result, setResult] = useState('');

  const tests = [
    {
      name: 'Alert Test',
      action: () => {
        alert('Alert hoạt động!');
        setResult('✅ Alert OK');
      }
    },
    {
      name: 'Console Test',
      action: () => {
        console.log('Console test');
        setResult('✅ Console OK (check F12)');
      }
    },
    {
      name: 'State Test',
      action: () => {
        setResult('✅ State update OK');
      }
    },
    {
      name: 'Router Test',
      action: () => {
        setResult('✅ Router ready: ' + router.pathname);
      }
    },
    {
      name: 'Navigate Test',
      action: () => {
        router.push('/admin');
      }
    },
    {
      name: 'Fetch Test',
      action: async () => {
        try {
          const res = await fetch('/api/products');
          const data = await res.json();
          setResult(`✅ Fetch OK: ${data.data?.length || 0} products`);
        } catch (error) {
          setResult('❌ Fetch Error: ' + error);
        }
      }
    },
    {
      name: 'Download CSV Test',
      action: () => {
        const csv = 'Test,Data\n1,2';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test.csv';
        a.click();
        setResult('✅ Download OK');
      }
    }
  ];

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Title>🧪 Test Buttons - Kiểm tra chức năng</Title>
        
        <ResultBox>
          <strong>Kết quả:</strong> {result || 'Chưa test'}
        </ResultBox>

        <TestGrid>
          {tests.map((test, index) => (
            <TestButton key={index} onClick={test.action}>
              {test.name}
            </TestButton>
          ))}
        </TestGrid>

        <Instructions>
          <h3>Hướng dẫn:</h3>
          <ol>
            <li>Click từng nút để test</li>
            <li>Xem kết quả hiển thị ở trên</li>
            <li>Mở Console (F12) để xem log</li>
            <li>Nếu tất cả OK → Các nút khác cũng sẽ hoạt động</li>
          </ol>
        </Instructions>

        <BackButton onClick={() => router.push('/admin')}>
          ← Quay lại Dashboard
        </BackButton>
      </Container>
    </ResponsiveAdminLayout>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1f2937;
`;

const ResultBox = styled.div`
  padding: 1.5rem;
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-size: 1.125rem;
`;

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TestButton = styled.button`
  padding: 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Instructions = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;

  h3 {
    margin-top: 0;
    color: #1f2937;
  }

  ol {
    margin: 0;
    padding-left: 1.5rem;
    color: #6b7280;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;
