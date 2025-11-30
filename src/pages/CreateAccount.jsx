import React, { useState, useContext } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function CreateAccount() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useUser();
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to send OTP.');
            setMessage({ text: data.message, type: 'success' });
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 10000);
            setStep(2);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Verification failed.');
            setMessage({ text: data.message, type: 'success' });
            setStep(3);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const response = await fetch(`${API_URL}/auth/email-signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Account creation failed.');
            
            login(data.user, data.user.name, data.user.email);
            localStorage.setItem('user_email', data.user.email);
            localStorage.setItem('user_name', data.user.name);
            
            setMessage({ text: data.message, type: 'success' });
            navigate('/');
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Create Your Account</h2>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            
            {step === 1 && (
                <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                    </div>
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send OTP'}</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                    <p>An OTP has been sent to <strong>{email}</strong>.</p>
                    <p style={{ color: 'red', fontSize: '0.9em' }}>
                        Sometimes Mails go to Spam Folder. Please Check Your Spam Folder.
                    </p>
                    <div className="form-group">
                        <label htmlFor="otp">Enter 6-Digit OTP</label>
                        <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" maxLength="6" required />
                    </div>
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify OTP'}</button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleCreateAccount}>
                    <h3>Account Verified! Set up your profile.</h3>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required />
                    </div>
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</button>
                </form>
            )}
        </div>
    );
}

export default CreateAccount;