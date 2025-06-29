import { useState, useEffect } from 'react';

export interface HotTopic {
  id: string;
  title: string;
  views: number;
  days: number;
  category?: string;
}

interface UseHotTopicsResult {
  hotTopics: HotTopic[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHotTopics(limit: number = 10): UseHotTopicsResult {
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: 之後會替換為真實的後端 API 端點
      // 目前使用占位符 API
      const response = await fetch(`/api/hot-topics?limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setHotTopics(data.data);
      } else {
        setError(data.error || '獲取熱門問題失敗');
      }
    } catch (err) {
      console.error('獲取熱門問題失敗:', err);
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotTopics();
  }, [limit]);

  return {
    hotTopics,
    loading,
    error,
    refetch: fetchHotTopics
  };
}
