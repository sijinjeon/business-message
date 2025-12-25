import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { ResultCardProps } from '@/types'
import { splitIntoSentences } from '@/lib/utils'

const TONE_LABELS = {
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

  // 텍스트를 문장 단위로 분리
  const sentences = splitIntoSentences(text)

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
    <Card className={`relative overflow-hidden transition-all duration-300 ${isDefaultSelected
        ? 'ring-2 ring-primary shadow-lg shadow-primary/10'
        : 'shadow-md hover:shadow-xl hover:-translate-y-1 border-primary/5'
      }`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isDefaultSelected ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            {label}
          </span>
          {isDefaultSelected && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              Default
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm leading-relaxed mb-3 min-h-[60px] space-y-2">
          {sentences.map((sentence, index) => (
            <p key={index} className="text-sm">
              {sentence}
            </p>
          ))}
        </div>
        <div className="flex justify-end border-t border-primary/5 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default React.memo(ResultCard)
