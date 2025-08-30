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
        className={`min-h-[120px] resize-none ${
          isOverLimit ? 'border-destructive focus:border-destructive' : ''
        }`}
        maxLength={hasLimit ? maxLength + 50 : undefined} // 제한이 있을 때만 적용
      />
      {hasLimit && (
        <>
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
        </>
      )}
      {!hasLimit && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {characterCount}자
          </span>
        </div>
      )}
    </div>
  )
}

export default React.memo(TextInput)
