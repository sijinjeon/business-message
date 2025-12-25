import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
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
  isDefaultSelected = false
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const label = TONE_LABELS[tone]

  const handleCopy = async () => {
    try {
      await onCopy(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <Card className={`group relative transition-all duration-300 rounded-2xl border-zinc-100 ${
        isDefaultSelected 
          ? 'bg-zinc-50/50 border-zinc-200' 
          : 'bg-white hover:bg-zinc-50/30 hover:border-zinc-200 shadow-none'
      }`}>
      <CardHeader className="pb-3 px-5 pt-4">
        <CardTitle className="text-[15px] font-bold flex items-center justify-between text-zinc-800">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isDefaultSelected ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
            {label}
          </span>
          <div className="flex items-center gap-2">
            {isDefaultSelected && (
              <span className="text-[12px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/50">
                기본 설정
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-zinc-400" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="text-[16px] leading-[1.6] text-zinc-600 break-words break-keep-all whitespace-pre-wrap">
          {text}
        </div>
      </CardContent>
    </Card>
  )
}

export default React.memo(ResultCard)
