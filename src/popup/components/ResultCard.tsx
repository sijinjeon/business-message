import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { ResultCardProps } from '@/types'

const TONE_LABELS = {
  formal: '격식',
  general: '일반',
  friendly: '친근'
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
    <Card className={`relative ${
      isDefaultSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{label}</span>
          {isDefaultSelected && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
              기본 선택
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed mb-3 min-h-[60px]">
          {text}
        </p>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
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
