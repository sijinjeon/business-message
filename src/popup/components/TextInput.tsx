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
  const isOverLimit = characterCount > maxLength
  
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`min-h-[120px] resize-none ${
          isOverLimit ? 'border-destructive focus:border-destructive' : ''
        }`}
        maxLength={maxLength + 50} // 약간의 여유 공간
      />
      <div className="flex justify-end">
        <span className={`text-xs ${
          isOverLimit ? 'text-destructive' : 'text-muted-foreground'
        }`}>
          {characterCount}/{maxLength}
        </span>
      </div>
      {isOverLimit && (
        <p className="text-xs text-destructive">
          텍스트가 너무 깁니다. {maxLength}자 이내로 입력해주세요.
        </p>
      )}
    </div>
  )
}

export default React.memo(TextInput)
