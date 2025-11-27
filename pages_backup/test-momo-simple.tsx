import React, { useState } from 'react';

export default function TestMoMoSimple() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testMoMo = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/momo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Network error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🧪 Test MoMo API</h1>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginTop: 0 }}>Kiểm tra MoMo Payment Gateway</h2>
        <p style={{ color: '#666' }}>Test xem MoMo API keys có hoạt động không</p>

        <button
          onClick={testMoMo}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading ? '#999' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Đang test...' : '🚀 Test MoMo API'}
        </button>
      </div>

      {result && (
        <div style={{
          background: result.success ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${result.success ? '#86efac' : '#fca5a5'}`,
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: 0 }}>
            {result.success ? '✅ Thành Công!' : '❌ Lỗi!'}
          </h2>

          {result.success ? (
            <div>
              <p><strong>Message:</strong> {result.message}</p>
              
              {result.data && (
                <>
                  <p><strong>Order ID:</strong> {result.data.orderId}</p>
                  <p><strong>Amount:</strong> {parseInt(result.data.amount).toLocaleString('vi-VN')} ₫</p>
                  
                  {result.data.payUrl && (
                    <p>
                      <strong>Payment URL:</strong><br/>
                      <a href={result.data.payUrl} target="_blank" style={{ color: '#2563eb' }}>
                        {result.data.payUrl}
                      </a>
                    </p>
                  )}

                  {result.data.qrCodeUrl && (
                    <div>
                      <strong>QR Code:</strong><br/>
                      <Image src={result.data.qrCodeUrl} alt="MoMo QR" style={{ maxWidth: '300px', marginTop: '1rem', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                    </div>
                  )}
                </>
              )}

              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                  📋 Full Response
                </summary>
                <pre style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'auto', fontSize: '0.875rem' }}>
                  {JSON.stringify(result.fullResponse, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div>
              <p><strong>Message:</strong> {result.message || result.error}</p>
              
              {result.error && typeof result.error === 'object' && (
                <>
                  <p><strong>Result Code:</strong> {result.error.resultCode}</p>
                  <p><strong>Error Message:</strong> {result.error.message}</p>
                  {result.error.localMessage && (
                    <p><strong>Local Message:</strong> {result.error.localMessage}</p>
                  )}
                </>
              )}

              {result.config && (
                <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Configuration Status:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    <li>Partner Code: {result.config.partnerCode ? '✅' : '❌'}</li>
                    <li>Access Key: {result.config.accessKey ? '✅' : '❌'}</li>
                    <li>Secret Key: {result.config.secretKey ? '✅' : '❌'}</li>
                    <li>Endpoint: {result.config.endpoint ? '✅' : '❌'}</li>
                  </ul>
                </div>
              )}

              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                  📋 Full Response
                </summary>
                <pre style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'auto', fontSize: '0.875rem' }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>ℹ️ Thông Tin</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af' }}>
          <li>Test này sẽ tạo một payment request 10,000 VND</li>
          <li>Không thực sự charge tiền</li>
          <li>Chỉ kiểm tra API keys có hợp lệ không</li>
          <li>Nếu thành công, bạn sẽ nhận được payment URL và QR code</li>
        </ul>
      </div>

      <button
        onClick={() => window.location.href = '/'}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        ← Quay lại trang chủ
      </button>
    </div>
  );
}
