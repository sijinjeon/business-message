import { useState, useEffect } from 'react';
import { getExchangeRate } from '@/utils/exchange';

/**
 * 비용 표시를 위한 환율 훅
 */
export function useCurrency() {
  const [exchangeRate, setExchangeRate] = useState<number>(1350);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getExchangeRate().then(rate => {
      setExchangeRate(rate);
      setLoading(false);
    });
  }, []);

  /**
   * 달러 금액을 원화와 달러가 혼합된 형식으로 포맷팅합니다.
   * 예: ₩1,234.56 ($0.9142)
   */
  const formatCost = (usdAmount: number) => {
    const krw = usdAmount * exchangeRate;
    const krwFormatted = new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(krw);

    const usdFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(usdAmount);

    return {
      krw: krwFormatted,
      usd: usdFormatted,
      combined: `${krwFormatted} (${usdFormatted})`
    };
  };

  return { exchangeRate, loading, formatCost };
}

