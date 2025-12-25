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
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`min-h-[140px] resize-none shadow-sm transition-all duration-300 border-primary/10 focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:shadow-[0_0_10px_rgba(59,130,246,0.1)] ${isOverLimit ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20' : ''
          }`}
        maxLength={hasLimit ? maxLength + 50 : undefined}
      />
      <div className="flex justify-end pr-1">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/50 ${isOverLimit ? 'text-destructive bg-destructive/5' : 'text-muted-foreground'}`}>
          {characterCount}{hasLimit ? ` / ${maxLength}` : ' characters'}
        </span>
      </div>
      {isOverLimit && (
        <p className="text-[10px] text-destructive mt-1 font-medium italic">
          텍스트가 너무 깁니다. {maxLength}자 이내로 입력해주세요.
        </p>
      )}
    </div>
  )
}

export default React.memo(TextInput)
