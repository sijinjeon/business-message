/**
 * 환율 정보를 가져오고 캐싱합니다.
 */

const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';
const CACHE_KEY = 'cached_exchange_rate';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24시간

interface CachedRate {
  rate: number;
  timestamp: number;
}

/**
 * 실시간 환율을 가져옵니다. (USD to KRW)
 */
export async function getExchangeRate(): Promise<number> {
  try {
    // 캐시 확인
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rate, timestamp }: CachedRate = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return rate;
      }
    }

    // API 호출
    const response = await fetch(EXCHANGE_RATE_API);
    const data = await response.json();
    
    if (data && data.rates && data.rates.KRW) {
      const rate = data.rates.KRW;
      
      // 캐시 저장
      const cacheData: CachedRate = {
        rate,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      return rate;
    }

    return 1350; // API 실패 시 기본값 (최근 평균 환율)
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return 1350; // 에러 발생 시 기본값
  }
}

/**
 * USD를 KRW로 변환합니다.
 */
export async function convertToKRW(usdAmount: number): Promise<number> {
  const rate = await getExchangeRate();
  return usdAmount * rate;
}


