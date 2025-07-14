import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, XCircle, AlertTriangle, Send } from 'lucide-react';
import { testEmailService } from '../../utils/supabase-setup';
import { supabase } from '../../utils/supabase-setup';

interface EmailServiceTesterProps {
  onStatusChange?: (isWorking: boolean) => void;
}

const EmailServiceTester: React.FC<EmailServiceTesterProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<'checking' | 'working' | 'not-working' | 'unknown'>('unknown');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Check email service on mount
  useEffect(() => {
    checkEmailService();
  }, []);

  // Notify parent component when status changes
  useEffect(() => {
    if (status === 'working' || status === 'not-working') {
      onStatusChange?.(status === 'working');
    }
  }, [status, onStatusChange]);

  const checkEmailService = async () => {
    setStatus('checking');
    try {
      const isWorking = await testEmailService();
      setStatus(isWorking ? 'working' : 'not-working');
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking email service:', error);
      setStatus('not-working');
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setSendResult({
        success: false,
        message: 'Please enter a valid email address'
      });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      // Use password reset as a test mechanism
      const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      // Log the attempt
      try {
        await supabase.rpc('log_password_reset_attempt', { user_email: testEmail });
      } catch (logError) {
        console.error('Failed to log password reset attempt:', logError);
      }

      setSendResult({
        success: true,
        message: `Test email sent to ${testEmail}. Please check your inbox.`
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      setSendResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email'
      });
    } finally {
      setIsSending(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('password_reset_logs')
        .select('*')
        .order('attempted_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching password reset logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Exception fetching logs:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Email Service Status</h3>
        </div>
        <button
          onClick={checkEmailService}
          disabled={status === 'checking'}
          className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          {status === 'checking' && (
            <div className="flex items-center space-x-2 text-slate-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Checking email service...</span>
            </div>
          )}

          {status === 'working' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Email service is properly configured</span>
            </div>
          )}

          {status === 'not-working' && (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span>Email service is not properly configured</span>
            </div>
          )}

          {status === 'unknown' && (
            <div className="flex items-center space-x-2 text-slate-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Email service status unknown</span>
            </div>
          )}
        </div>

        {lastChecked && (
          <p className="text-sm text-slate-500">
            Last checked: {lastChecked.toLocaleString()}
          </p>
        )}
      </div>

      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
        <h4 className="font-medium text-slate-900 mb-3">Send Test Email</h4>
        <div className="flex items-center space-x-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={sendTestEmail}
            disabled={isSending || !testEmail}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>

        {sendResult && (
          <div className={`mt-3 p-3 rounded-lg ${sendResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {sendResult.message}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
      </button>

      {showAdvanced && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-900">Email Delivery Logs</h4>
              <button
                onClick={fetchLogs}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Refresh Logs
              </button>
            </div>

            {logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Attempted At</th>
                      <th className="px-4 py-2 text-left">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-slate-200">
                        <td className="px-4 py-2">{log.email}</td>
                        <td className="px-4 py-2">{new Date(log.attempted_at).toLocaleString()}</td>
                        <td className="px-4 py-2">{log.ip_address || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No logs available</p>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-900 mb-3">Email Configuration Guide</h4>
            <div className="text-sm text-slate-700 space-y-2">
              <p>To configure email for your Supabase project:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to Authentication → Email Templates</li>
                <li>Customize the email templates for password reset, confirmation, etc.</li>
                <li>Go to Authentication → Email Settings</li>
                <li>Configure your SMTP settings or use the default Supabase email service</li>
                <li>Test the configuration using the test button</li>
              </ol>
              <p className="mt-2">
                For production use, we recommend setting up a custom SMTP server with services like SendGrid, Mailgun, or Amazon SES.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailServiceTester;