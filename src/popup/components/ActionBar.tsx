import React from 'react'
import { Button } from '@/components/ui/button'
import { RotateCw, Settings, Clipboard } from 'lucide-react'
import { ActionBarProps } from '@/types'

const ActionBar: React.FC<ActionBarProps> = ({
  onRegenerate,
  onReadClipboard,
  isLoading,
  onOpenSettings
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-y border-primary/5 my-2">
      <div className="flex items-center gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={onReadClipboard}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 text-xs font-medium border-primary/10 hover:bg-primary/5 transition-all"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Paste
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex-[1.5] flex items-center justify-center gap-2 text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Converting...' : 'Transform'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="h-9 w-9 p-0 rounded-full hover:bg-accent hover:rotate-45 transition-all"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default React.memo(ActionBar)
