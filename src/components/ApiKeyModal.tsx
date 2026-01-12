import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  currentKey?: string;
}

export function ApiKeyModal({ isOpen, onClose, onSubmit, currentKey }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentKey || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-card rounded-2xl shadow-card p-8 mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Gemini API Key</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground mb-6">
                Enter your Google Gemini API key to enable AI-powered explanations and personalized recommendations.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                    API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Get your free API key
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="flex-1">
                    Save Key
                  </Button>
                </div>
              </form>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
