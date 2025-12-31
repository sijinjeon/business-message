import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Sparkles } from 'lucide-react'
import { ResultCardProps, ToneType } from '@/types'

const TONE_LABELS: Record<ToneType, string> = {
  formal: '비즈니스 이메일',
  general: '사내 메신저',
  friendly: '캐주얼 채팅'
}

const ResultCard: React.FC<ResultCardProps> = ({
  tone,
  text,
  onCopy,
  isDefaultSelected = false,
  onConvert,
  isLoading = false
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const label = TONE_LABELS[tone]

  const handleCopy = async () => {
    if (!text) return;
    try {
      await onCopy(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <Card className={`group relative transition-all duration-300 rounded-2xl border-zinc-100 shadow-none ${
        isDefaultSelected 
          ? 'bg-zinc-50/80 border-zinc-200' 
          : 'bg-white hover:bg-zinc-50/30 hover:border-zinc-200'
      }`}>
      <CardHeader className="pb-2 px-4 pt-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[13px] font-bold flex items-center gap-2 text-zinc-800">
          <span className={`w-1.5 h-1.5 rounded-full ${isDefaultSelected ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
          {label}
        </CardTitle>
        <div className="flex items-center gap-1">
          {isDefaultSelected && (
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mr-1">
              Default
            </span>
          )}
          {text && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 w-7 p-0 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {text ? (
          <div className="font-sans text-[15px] leading-relaxed text-zinc-600 break-words break-keep-all whitespace-pre-wrap">
            {text}
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl bg-white/50">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={isLoading}
              onClick={() => onConvert?.(tone)}
              className="text-[12px] font-bold text-zinc-400 hover:text-zinc-900 gap-2 h-8 px-3"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {label} 변환
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default React.memo(ResultCard)
