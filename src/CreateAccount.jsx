import React, { useState, useContext } from 'react';
import { useUser } from '../context/UserContext'; // Assuming UserContext is in a sibling directory
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL; // Your Flask server URL

function CreateAccount() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Verified
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useUser();
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setMessage({ text: 'Please enter your email address.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${API_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP.');
            }

            setMessage({ text: data.message, type: 'success' });
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 10000);
            setStep(2); // Move to OTP verification step
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setMessage({ text: 'Please enter a valid 6-digit OTP.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed.');
            }

            setMessage({ text: data.message, type: 'success' });
            setStep(3); // Move to the final step

            // Automatically log in the user after successful OTP verification
            const userName = email.split('@')[0]; // Derive a simple username from email
            login({ email: email, name: userName }, userName, email);
            localStorage.setItem('user_email', email);
            localStorage.setItem('user_name', userName);

            // Redirect to home or dashboard after successful signup/login
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

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {step === 1 && (
                <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>
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
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            maxLength="6"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                    </button>
                </form>
            )}

            {step === 3 && (
                <div className="registration-form">
                    <h3>Account Verified!</h3>
                    <p>You can now complete your registration.</p>
                    {/* This part might not be reached if redirected */}
                </div>
            )}
        </div>
    );
}

export default CreateAccount;