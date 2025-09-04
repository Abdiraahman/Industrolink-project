import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resendVerificationEmail } from '@/services/api/auth';

interface EmailVerificationStatusProps {
  email: string;
  isVerified: boolean;
  onVerificationUpdate?: () => void;
}

const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({
  email,
  isVerified,
  onVerificationUpdate
}) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage('');
    setMessageType('');
    
    try {
      const response = await resendVerificationEmail(email);
      setMessage('Verification email sent successfully! Please check your inbox.');
      setMessageType('success');
      if (onVerificationUpdate) {
        onVerificationUpdate();
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to send verification email');
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your email address is verified.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Please verify your email address to access all features.
        </AlertDescription>
      </Alert>

      {message && (
        <Alert className={messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {messageType === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{email}</span>
        </div>
        <Button
          onClick={handleResendVerification}
          disabled={isResending}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          {isResending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          <span>{isResending ? 'Sending...' : 'Resend'}</span>
        </Button>
      </div>
    </div>
  );
};

export default EmailVerificationStatus;
