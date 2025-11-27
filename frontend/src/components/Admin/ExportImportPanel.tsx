import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiFile, FiDownload, FiUpload, FiCheck, FiX } from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';

interface ExportImportPanelProps {
  type: 'orders' | 'products' | 'customers';
  onExport?: (format: string, filters?: unknown) => void;
  onImport?: (file: File) => void;
}

const PanelContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 1.5rem;
`;

const PanelTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    border-color: #3182ce;
    background: #f7fafc;
  }
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #4a5568;
`;

const ActionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 1rem;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2c5aa0;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: #e2e8f0;
  color: #4a5568;

  &:hover {
    background: #cbd5e0;
  }
`;

const ImportTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 2px dashed #e2e8f0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.875rem;
  resize: vertical;
  margin: 0.5rem 0;

  &:focus {
    outline: none;
    border-color: #3182ce;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const ImportButton = styled.button`
  background: #48bb78;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #38a169;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: #48bb78;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-top: 1rem;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#f0fff4';
      case 'error': return '#fed7d7';
      case 'info': return '#ebf8ff';
      default: return '#f7fafc';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#276749';
      case 'error': return '#c53030';
      case 'info': return '#2b6cb0';
      default: return '#4a5568';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#9ae6b4';
      case 'error': return '#feb2b2';
      case 'info': return '#90cdf4';
      default: return '#e2e8f0';
    }
  }};
`;

const ExportImportPanel: React.FC<ExportImportPanelProps> = ({ type, onExport, onImport }) => {
  const { success, error, info } = useNotification();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [csvData, setCsvData] = useState('');

  const handleExport = async (format: string = 'csv') => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/admin/export/${type}?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success('Xuất dữ liệu thành công', `File ${type} đã được tải xuống`);
      onExport?.(format);
    } catch (err) {
      error('Lỗi xuất dữ liệu', 'Không thể xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      error('Lỗi nhập dữ liệu', 'Vui lòng nhập dữ liệu CSV');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`/api/admin/import/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData }),
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setImportStatus({
        type: 'success',
        message: `Nhập thành công ${result.data?.imported || 0} mục. ${result.data?.failed || 0} lỗi.`
      });

      success('Nhập dữ liệu thành công', result.message);
      setCsvData('');
      onImport?.(new File([csvData], 'import.csv'));
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Lỗi không xác định'
      });
      error('Lỗi nhập dữ liệu', 'Không thể nhập dữ liệu. Vui lòng kiểm tra dữ liệu và thử lại.');
    } finally {
      setIsImporting(false);
      setTimeout(() => {
        setImportProgress(0);
        setImportStatus(null);
      }, 3000);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/import/${type}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_import_template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      info('Tải template thành công', 'Sử dụng file này để nhập dữ liệu');
    } catch (err) {
      error('Lỗi tải template', 'Không thể tải file mẫu');
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'orders': return 'đơn hàng';
      case 'products': return 'sản phẩm';
      case 'customers': return 'khách hàng';
      default: return 'dữ liệu';
    }
  };

  return (
    <PanelContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PanelHeader>
        <PanelTitle>Xuất / Nhập {getTypeLabel()}</PanelTitle>
      </PanelHeader>

      <ActionGrid>
        {/* Export Section */}
        <ActionCard>
          <ActionIcon>
            <FiDownload size={24} />
          </ActionIcon>
          <ActionTitle>Xuất dữ liệu</ActionTitle>
          <ActionDescription>
            Tải xuống tất cả {getTypeLabel()} dưới dạng file CSV
          </ActionDescription>
          <ActionButton 
            onClick={() => handleExport('csv')} 
            disabled={isExporting}
          >
            {isExporting ? 'Đang xuất...' : 'Xuất CSV'}
          </ActionButton>
        </ActionCard>

        {/* Import Section */}
        <ActionCard>
          <ActionIcon>
            <FiUpload size={24} />
          </ActionIcon>
          <ActionTitle>Nhập dữ liệu</ActionTitle>
          <ActionDescription>
            Tải lên file CSV để nhập {getTypeLabel()} hàng loạt
          </ActionDescription>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
            <SecondaryButton onClick={downloadTemplate}>
              <FiFile size={16} style={{ marginRight: '0.5rem' }} />
              Tải Template
            </SecondaryButton>
          </div>
          <ImportTextarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Dán dữ liệu CSV vào đây hoặc tải template để xem định dạng..."
            disabled={isImporting}
          />
          <ImportButton
            onClick={handleImport}
            disabled={isImporting || !csvData.trim()}
          >
            <FiUpload size={16} style={{ marginRight: '0.5rem' }} />
            {isImporting ? 'Đang nhập...' : 'Nhập dữ liệu'}
          </ImportButton>
        </ActionCard>
      </ActionGrid>

      {/* Import Progress */}
      {isImporting && (
        <div>
          <ProgressBar>
            <ProgressFill
              initial={{ width: '0%' }}
              animate={{ width: `${importProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </ProgressBar>
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#4a5568' }}>
            Đang nhập dữ liệu... {importProgress}%
          </div>
        </div>
      )}

      {/* Import Status */}
      {importStatus && (
        <StatusMessage type={importStatus.type}>
          {importStatus.type === 'success' && <FiCheck size={16} />}
          {importStatus.type === 'error' && <FiX size={16} />}
          {importStatus.type === 'info' && <FiFile size={16} />}
          {importStatus.message}
        </StatusMessage>
      )}
    </PanelContainer>
  );
};

export default ExportImportPanel;