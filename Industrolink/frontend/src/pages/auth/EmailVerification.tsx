import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '@/services/api/auth';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setToken(tokenParam);
      handleVerification(emailParam, tokenParam);
    }
  }, [searchParams]);

  const handleVerification = async (email: string, token: string) => {
    setVerificationStatus('verifying');
    try {
      const response = await verifyEmail(email, token);
      setVerificationStatus('success');
      setMessage(response.message);
    } catch (error: any) {
      setVerificationStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed');
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    setResendStatus('sending');
    try {
      const response = await resendVerificationEmail(email);
      setResendStatus('success');
      setMessage('Verification email sent successfully. Please check your inbox.');
    } catch (error: any) {
      setResendStatus('error');
      setMessage(error.response?.data?.error || 'Failed to send verification email');
    }
  };

  const handleManualVerification = async () => {
    if (!email || !token) {
      setMessage('Please enter both email and token');
      return;
    }
    await handleVerification(email, token);
  };

  const renderVerificationForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="token" className="text-sm font-medium text-gray-700">Verification Token</Label>
        <Input
          id="token"
          value={token}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
          placeholder="Enter verification token"
          className="w-full"
        />
      </div>
      <Button 
        onClick={handleManualVerification}
        disabled={verificationStatus === 'verifying'}
        className="w-full"
        variant="default"
        size="default"
      >
        {verificationStatus === 'verifying' ? 'Verifying...' : 'Verify Email'}
      </Button>
    </div>
  );

  const renderResendSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resend-email" className="text-sm font-medium text-gray-700">Email</Label>
        <Input
          id="resend-email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full"
        />
      </div>
      <Button 
        onClick={handleResendVerification}
        disabled={resendStatus === 'sending'}
        variant="outline"
        size="default"
        className="w-full"
      >
        {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Email'}
      </Button>
    </div>
  );

  const renderStatusMessage = () => {
    if (verificationStatus === 'success') {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {message}
          </AlertDescription>
        </Alert>
      );
    }

    if (resendStatus === 'success') {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      );
    }

    if (resendStatus === 'error') {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {message}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verify your email address to complete your registration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              Enter the verification token sent to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStatusMessage()}
            
            {verificationStatus === 'idle' && (
              <>
                {renderVerificationForm()}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Didn't receive the email?</h3>
                  {renderResendSection()}
                </div>
              </>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center space-y-4">
                <p className="text-green-600 font-medium">{message}</p>
                <Button onClick={() => navigate('/login')} className="w-full" variant="default" size="default">
                  Continue to Login
                </Button>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-4">
                <p className="text-red-600 text-center">{message}</p>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Need a new verification email?</h3>
                  {renderResendSection()}
                </div>
                <Button 
                  onClick={() => setVerificationStatus('idle')} 
                  variant="outline" 
                  size="default"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
