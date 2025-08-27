import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ value, onChange, placeholder = "Add tags...", className, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("")

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim()
      if (trimmedTag && !value.includes(trimmedTag)) {
        onChange([...value, trimmedTag])
      }
      setInputValue("")
    }

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter(tag => tag !== tagToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        addTag(inputValue)
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value[value.length - 1])
      }
    }

    return (
      <div className={cn("flex flex-wrap gap-2 p-2 border rounded-md bg-background", className)}>
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue)
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          {...props}
        />
      </div>
    )
  }
)
TagInput.displayName = "TagInput"