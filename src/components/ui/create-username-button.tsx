
'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type ValidationStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid';

export const CreateUsernameButton = () => {
  const [isActive, setIsActive] = useState(false);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const router = useRouter();
  const debouncedUsername = useDebounce(username, 500);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);
  
  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setUsername('');
        setStatus('idle');
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!isActive || !debouncedUsername) {
        setStatus('idle');
        return;
    };

    const checkUsername = async () => {
      if (debouncedUsername.length < 3) {
        setStatus('invalid');
        return;
      }

      setStatus('checking');
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', debouncedUsername)
        .single();

      if (error && error.code !== 'PGRST116') {
        setStatus('idle');
        console.error(error);
      } else if (data) {
        setStatus('unavailable');
      } else {
        setStatus('available');
      }
    };

    checkUsername();
  }, [debouncedUsername, isActive]);

  const handleButtonClick = () => {
    if (!isActive) {
        setIsActive(true);
    }
  };

  const handleDoneClick = () => {
    if (status === 'available') {
      router.push(`/signup?username=${username}`);
    }
  };
  
  const isButtonDisabled = status !== 'available';

  return (
    <div
      ref={containerRef}
      onClick={handleButtonClick}
      className={cn(
        "group relative flex h-12 items-center justify-center overflow-hidden rounded-2xl bg-black text-white shadow-lg transition-all duration-300 ease-in-out",
        isActive ? 'w-80' : 'w-auto hover:w-64 cursor-pointer'
      )}
    >
      {!isActive ? (
        <div className="flex h-full items-center px-6">
            <span className="relative whitespace-nowrap opacity-100 transition-opacity duration-200 group-hover:opacity-0">
                Pegue seu Nits
            </span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="font-medium">Crie seu&nbsp;</span>
                <span className="font-bold">Nits.uno/</span>
            </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center p-1 gap-1">
            <span className="pl-2 pr-1 font-bold text-white">Nits.uno/</span>
            <div className="relative flex-1 h-full">
                <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="h-full w-full rounded-lg bg-neutral-800 px-2 text-white placeholder-neutral-500 focus:outline-none"
                    placeholder="seu-usuario"
                />
            </div>
            <button
                onClick={handleDoneClick}
                disabled={isButtonDisabled}
                className={cn(
                    "ml-1 flex h-full shrink-0 items-center justify-center rounded-xl px-4 font-bold text-white transition-colors duration-300",
                    isButtonDisabled ? "bg-neutral-600 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                )}
            >
                Feito
            </button>
        </div>
      )}
    </div>
  );
};
