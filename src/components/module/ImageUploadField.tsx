import { useRef } from 'react'
import { Box, Typography, Button, Avatar, alpha } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import { colors } from '@/theme/palette'

interface ImageUploadFieldProps {
  value?: string
  onChange: (value: string) => void
  label?: string
  helperText?: string
}

export function ImageUploadField({ value, onChange, label, helperText }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <Box>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{label}</Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          borderRadius: '12px',
          border: `1px dashed ${colors.borderStrong}`,
          bgcolor: alpha(colors.primary, 0.02),
        }}
      >
        <Avatar
          src={value || undefined}
          variant="rounded"
          sx={{ width: 64, height: 64, bgcolor: alpha(colors.primary, 0.08), color: colors.primary }}
        >
          {!value && <CloudUploadOutlinedIcon />}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => inputRef.current?.click()}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Choose Image
          </Button>
          {helperText && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {helperText}
            </Typography>
          )}
          {value && (
            <Button size="small" color="error" onClick={() => onChange('')} sx={{ mt: 0.5, textTransform: 'none' }}>
              Remove
            </Button>
          )}
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </Box>
    </Box>
  )
}
