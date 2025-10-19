import { useState, useEffect } from "react";
import { Influencer } from "@/data/types";

interface UseInfluencersReturn {
  influencers: Influencer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  syncFromGoogle: () => Promise<void>;
}

export function useInfluencers(): UseInfluencersReturn {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/influencers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "데이터를 가져오는데 실패했습니다.");
      }

      setInfluencers(data.influencers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      console.error("인플루언서 데이터 조회 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncFromGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/influencers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "구글 API 동기화에 실패했습니다.");
      }

      // 동기화 후 데이터 다시 조회
      await fetchInfluencers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "구글 API 동기화 중 오류가 발생했습니다.");
      console.error("구글 API 동기화 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  return {
    influencers,
    loading,
    error,
    refetch: fetchInfluencers,
    syncFromGoogle,
  };
}
