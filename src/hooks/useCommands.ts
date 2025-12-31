import { useState, useEffect } from 'react';

export interface CommandInfo {
  name: string;
  description: string;
  shortcut: string;
}

export function useCommands() {
  const [commands, setCommands] = useState<CommandInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.commands) {
          const allCommands = await chrome.commands.getAll();
          setCommands(allCommands as CommandInfo[]);
        }
      } catch (error) {
        console.error('Failed to fetch commands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, []);

  return { commands, loading };
}






