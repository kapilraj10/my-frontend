import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const [now, setNow] = useState(new Date());
  const [currentBg, setCurrentBg] = useState(0);

  const images = useMemo(
    () => Array.from({ length: 20 }, (_, i) => `/wallpapers/${i + 1}.jpg`),
    []
  );

  const [input, setInput] = useState('');

  const { login, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const bgInterval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(bgInterval);
  }, [images.length]);

  const time = format(now, 'HH:mm');
  const dayOfWeek = format(now, 'eeee');
  const date = format(now, 'dd MMMM yyyy').toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) return;
    const ok = await login(input.trim());
    if (ok) navigate('/dashboard', { replace: true });
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {images.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out ${
              idx === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${src}')`, filter: 'grayscale(80%) brightness(0.4)' }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4 w-full">
        {/* Time & Day */}
        <div className="relative mb-6">
          <h1 className="text-8xl sm:text-9xl font-bold text-gray-200/60 tabular-nums leading-none -tracking-wider">
            {time}
          </h1>
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-6xl md:text-7xl font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            {dayOfWeek}
          </h2>
        </div>

        {/* Date */}
        <div className="mb-10 flex flex-col items-center">
          <p className="text-lg tracking-widest mt-2">{date}</p>
        </div>

        {/* Password input (press Enter to submit) */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-3">
          <input
            type="password"
            placeholder="Enter Password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-md text-center text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/80 focus:border-transparent backdrop-blur-sm transition disabled:opacity-50"
          />
          {/* Hidden submit to allow Enter key without a visible button */}
          <input type="submit" hidden />
          <p className="text-sm mt-1 h-5 text-center">
            {error && <span className="text-red-400">{error}</span>}
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
