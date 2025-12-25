import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { TextInputProps } from '@/types'

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  maxLength,
  placeholder
}) => {
  const characterCount = value.length
  const hasLimit = maxLength > 0
  const isOverLimit = hasLimit && characterCount > maxLength

  return (
    <div className="space-y-3">
      <div className="relative group">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`min-h-[120px] resize-none p-5 rounded-2xl bg-zinc-50/50 border-zinc-100 transition-all duration-300 focus-visible:ring-zinc-900/5 focus-visible:ring-offset-0 focus-visible:border-zinc-300 focus-visible:bg-white text-base leading-relaxed ${
            isOverLimit ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10' : ''
          }`}
          maxLength={hasLimit ? maxLength + 50 : undefined}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <span className={`text-[12px] font-bold px-2 py-1 rounded-md bg-white border border-zinc-200/50 ${
            isOverLimit ? 'text-destructive border-destructive/20 bg-destructive/5' : 'text-zinc-400'
          }`}>
            {characterCount.toLocaleString()}{hasLimit ? ` / ${maxLength}` : ' 자'}
          </span>
        </div>
      </div>
      {isOverLimit && (
        <p className="text-[13px] text-destructive mt-1 font-medium px-1 animate-in fade-in slide-in-from-top-1">
          글자 수가 제한을 초과했습니다. {maxLength}자 이내로 줄여주세요.
        </p>
      )}
    </div>
  )
}

export default React.memo(TextInput)
