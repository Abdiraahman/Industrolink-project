import React, { useState } from 'react';
import { Shield, Smartphone, Key, CheckCircle, XCircle } from 'lucide-react';

interface MFASetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState<'choose' | 'setup' | 'verify'>('choose');
  const [method, setMethod] = useState<'sms' | 'app' | null>(null);
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleMethodSelect = async (selectedMethod: 'sms' | 'app') => {
    setMethod(selectedMethod);
    setError('');

    try {
      if (selectedMethod === 'app') {
        // Generate QR code for authenticator app
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/mfa/setup/app/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setQrCode(data.qr_code);
          setSecret(data.secret);
          setStep('setup');
        } else {
          setError('Failed to generate QR code');
        }
      } else {
        setStep('setup');
      }
    } catch (error) {
      setError('Failed to setup MFA');
    }
  };

  const handleSendSMSCode = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/mfa/setup/sms/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        credentials: 'include',
        body: JSON.stringify({ phone_number: phoneNumber })
      });

      if (response.ok) {
        setError('');
        setStep('verify');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send SMS code');
      }
    } catch (error) {
      setError('Failed to send SMS code');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/mfa/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          code: verificationCode,
          method,
          ...(method === 'sms' && { phone_number: phoneNumber }),
          ...(method === 'app' && { secret })
        })
      });

      if (response.ok) {
        onComplete();
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Set Up Two-Factor Authentication</h2>
          <p className="text-slate-400 mt-2">
            Add an extra layer of security to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {step === 'choose' && (
          <div className="space-y-4">
            <button
              onClick={() => handleMethodSelect('app')}
              className="w-full p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-white font-medium">Authenticator App</h3>
                  <p className="text-slate-400 text-sm">Use Google Authenticator or similar</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('sms')}
              className="w-full p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <Key className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-white font-medium">SMS Verification</h3>
                  <p className="text-slate-400 text-sm">Receive codes via text message</p>
                </div>
              </div>
            </button>

            <button
              onClick={onSkip}
              className="w-full text-slate-400 hover:text-white transition-colors mt-4"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 'setup' && method === 'app' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-white font-medium mb-4">Scan QR Code</h3>
              {qrCode ? (
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              ) : (
                <div className="bg-slate-700 w-48 h-48 mx-auto rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <p className="text-slate-400 text-sm mt-2">
                Scan this QR code with your authenticator app
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Manual Entry Code
              </label>
              <input
                type="text"
                value={secret}
                readOnly
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm font-mono"
              />
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'setup' && method === 'sms' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>

            <button
              onClick={handleSendSMSCode}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Verification Code
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-lg font-mono"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={isVerifying}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </button>

            {method === 'sms' && (
              <button
                onClick={handleSendSMSCode}
                className="w-full text-slate-400 hover:text-white transition-colors text-sm"
              >
                Resend Code
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MFASetup; 