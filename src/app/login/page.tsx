"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [stage, setStage] = useState<'request'|'verify'>('request');
  const router = useRouter();

  async function requestOtp() {
    const res = await fetch('/api/auth/request-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || undefined, phone: phone || undefined }),
    });
    const data = await res.json();
    if (data.ok) {
      setSentCode(data.code);
      setStage('verify');
    }
  }

  async function verifyOtp() {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || undefined, phone: phone || undefined, code }),
    });
    const data = await res.json();
    if (data.ok) {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded p-4 space-y-3">
      <h1 className="text-lg font-semibold">Login / Sign up</h1>
      <p className="text-sm text-gray-600">Use email or mobile. Demo shows OTP here.</p>
      <input className="w-full border rounded px-2 py-1" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <div className="text-center text-sm text-gray-500">or</div>
      <input className="w-full border rounded px-2 py-1" placeholder="Phone (e.g., +15551234567)" value={phone} onChange={e => setPhone(e.target.value)} />
      {stage === 'request' ? (
        <button className="w-full bg-black text-white rounded py-2" onClick={requestOtp}>Request OTP</button>
      ) : (
        <>
          {sentCode && (
            <div className="text-xs text-gray-600">Demo OTP: <span className="font-mono">{sentCode}</span></div>
          )}
          <input className="w-full border rounded px-2 py-1" placeholder="Enter 6-digit code" value={code} onChange={e => setCode(e.target.value)} />
          <button className="w-full bg-black text-white rounded py-2" onClick={verifyOtp}>Verify</button>
        </>
      )}
    </div>
  );
}
