import React from 'react'
import { Button } from '@/components/ui/button'
import { RotateCw, Settings, Clipboard } from 'lucide-react'
import { ActionBarProps } from '@/types'

const ActionBar: React.FC<ActionBarProps> = ({
  onRegenerate,
  onReadClipboard,
  remainingCount,
  isLoading,
  onOpenSettings
}) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReadClipboard}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Clipboard className="h-4 w-4" />
          클립보드 읽기
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading || remainingCount <= 0}
          className="flex items-center gap-2"
        >
          <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          다시 생성
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="flex items-center gap-1"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {remainingCount > 0 ? (
          <>오늘 남은 횟수: <span className="font-medium">{remainingCount}/50</span></>
        ) : (
          <span className="text-destructive font-medium">오늘 사용량을 모두 사용하셨습니다</span>
        )}
      </div>
    </div>
  )
}

export default React.memo(ActionBar)
