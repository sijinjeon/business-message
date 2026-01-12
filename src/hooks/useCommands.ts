import { useState, useEffect, useCallback } from 'react';

export interface CommandInfo {
  name: string;
  description: string;
  shortcut: string;
}

export function useCommands() {
  const [commands, setCommands] = useState<CommandInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommands = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCommands();

    // 페이지가 다시 보일 때 단축키를 다시 가져옴 (크롬 설정에서 변경 후 돌아올 때)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCommands();
      }
    };

    // 윈도우 포커스를 받을 때도 다시 가져옴
    const handleFocus = () => {
      fetchCommands();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchCommands]);

  // 수동으로 단축키를 다시 가져오는 함수 제공
  const refetch = useCallback(() => {
    setLoading(true);
    fetchCommands();
  }, [fetchCommands]);

  return { commands, loading, refetch };
}








