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
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 min-h-0 resize-none p-4 pb-10 rounded-xl bg-zinc-50/50 border-zinc-100 transition-all duration-300 focus-visible:ring-zinc-900/5 focus-visible:ring-offset-0 focus-visible:border-zinc-300 focus-visible:bg-white font-sans text-[14px] leading-relaxed ${
            isOverLimit ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10' : ''
          }`}
          maxLength={hasLimit ? maxLength + 50 : undefined}
        />
      </div>
      {/* Character count - positioned outside textarea */}
      <div className="flex items-center justify-between mt-2 px-1">
        {isOverLimit ? (
          <p className="text-[11px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
            {maxLength}자 이내로 줄여주세요
          </p>
        ) : (
          <span />
        )}
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 ${
          isOverLimit ? 'text-destructive bg-destructive/10' : 'text-zinc-400'
        }`}>
          {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default React.memo(TextInput)
