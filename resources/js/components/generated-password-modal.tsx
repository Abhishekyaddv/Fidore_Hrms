import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KeyRound, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';

interface GeneratedPasswordModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    email?: string;
    password?: string;
}

export function GeneratedPasswordModal({
    isOpen,
    setIsOpen,
    email,
    password,
}: GeneratedPasswordModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (email && password) {
            navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] p-0 gap-0 rounded-[2rem] border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-slate-50/90 backdrop-blur-3xl overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-300/40 rounded-full blur-[60px] pointer-events-none mix-blend-multiply"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-300/40 rounded-full blur-[60px] pointer-events-none mix-blend-multiply"></div>

                <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 border-4 border-white">
                        <KeyRound className="h-8 w-8 text-white" />
                    </div>
                    
                    <DialogTitle className="text-2xl font-black text-slate-800 mb-2">Account Created!</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mb-6">
                        Please save these auto-generated credentials. The employee will need them to log in.
                    </DialogDescription>

                    <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-inner mb-6 text-left">
                        <div className="mb-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email Address</p>
                            <p className="text-sm font-bold text-slate-800 break-all">{email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Password</p>
                            <p className="text-lg font-black text-indigo-600 tracking-wider font-mono">{password}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <Button
                            onClick={handleCopy}
                            className={`flex-1 h-12 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                copied 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
                                : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-800/20'
                            }`}
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4" /> Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" /> Copy Credentials
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
