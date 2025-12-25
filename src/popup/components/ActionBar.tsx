import React from 'react'
import { Button } from '@/components/ui/button'
import { RotateCw, Settings, Clipboard } from 'lucide-react'
import { ActionBarProps } from '@/types'

const ActionBar: React.FC<ActionBarProps> = ({
  onRegenerate,
  onReadClipboard,
  isLoading,
  onOpenSettings,
  activeTab
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-y border-zinc-100 my-2">
      <div className="flex items-center gap-3 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={onReadClipboard}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium border-zinc-200 hover:bg-zinc-50 transition-all rounded-xl h-10"
        >
          <Clipboard className="h-4 w-4" />
          붙여넣기
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex-[1.5] flex items-center justify-center gap-2 text-sm font-bold bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-all rounded-xl h-10 shadow-none"
        >
          <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? (activeTab === 'tone' ? '변환 중...' : '번역 중...') : (activeTab === 'tone' ? '메시지 변환' : '전문 번역 실행')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="h-10 w-10 p-0 rounded-xl hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200"
        >
          <Settings className="h-4 w-4 text-zinc-500" />
        </Button>
      </div>
    </div>
  )
}

export default React.memo(ActionBar)
