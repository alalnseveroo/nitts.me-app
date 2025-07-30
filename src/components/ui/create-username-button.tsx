
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

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const checkUsername = async () => {
      if (debouncedUsername.length < 3) {
        if (debouncedUsername.length > 0) {
          setStatus('invalid');
        } else {
          setStatus('idle');
        }
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
    setIsActive(true);
  };

  const handleDoneClick = () => {
    if (status === 'available') {
      router.push(`/signup?username=${username}`);
    }
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case 'available':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'unavailable':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'invalid':
         return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (!isActive) {
    return (
      <button
        onClick={handleButtonClick}
        className="group relative flex h-12 items-center justify-center overflow-hidden rounded-2xl bg-black px-6 text-white shadow-lg transition-all duration-300 ease-in-out hover:w-64"
      >
        <span className="relative whitespace-nowrap opacity-100 transition-opacity duration-200 group-hover:opacity-0">
          Pegue seu Nits
        </span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="font-medium">Crie seu&nbsp;</span>
          <span className="font-bold">Nits.uno/</span>
        </div>
      </button>
    );
  }

  return (
    <div className="relative flex h-12 w-80 items-center rounded-2xl bg-black p-1 shadow-lg transition-all duration-300">
        <span className="pl-2 pr-1 font-bold text-white">Nits.uno/</span>
        <div className="relative flex-1">
            <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="h-full w-full rounded-lg bg-neutral-800 px-2 text-white placeholder-neutral-500 focus:outline-none"
                placeholder="seu-usuario"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
                {renderStatusIcon()}
            </div>
        </div>
        <button
            onClick={handleDoneClick}
            disabled={status !== 'available'}
            className={cn(
                "ml-2 flex h-9 shrink-0 items-center justify-center rounded-xl px-4 font-bold text-white transition-colors",
                status === 'available' ? "bg-green-500 hover:bg-green-600" : "bg-neutral-600 cursor-not-allowed"
            )}
        >
            Feito
        </button>
    </div>
  );
};
