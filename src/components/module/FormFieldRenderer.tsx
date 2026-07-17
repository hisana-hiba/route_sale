import { TextField, MenuItem } from '@mui/material'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { FormFieldDef } from '@/types/module'
import { ImageUploadField } from '@/components/module/ImageUploadField'

const BATCH_STOCK_MAP: Record<string, { count: number; date: string }> = {
  B1001: { count: 240, date: '2025-03-15' },
  B1002: { count: 180, date: '2025-04-02' },
  B1003: { count: 520, date: '2025-05-10' },
  B1004: { count: 95, date: '2025-05-18' },
}

interface FormFieldRendererProps<T extends FieldValues> {
  field: FormFieldDef
  control: Control<T>
  setValue?: (name: string, value: string) => void
}

export function FormFieldRenderer<T extends FieldValues>({ field, control, setValue }: FormFieldRendererProps<T>) {
  return (
    <Controller
      name={field.name as Path<T>}
      control={control}
      render={({ field: formField }) => {
        if (field.type === 'image') {
          return (
            <ImageUploadField
              label={field.label}
              helperText={field.helperText}
              value={formField.value}
              onChange={formField.onChange}
            />
          )
        }

        if (field.type === 'readonly') {
          return (
            <TextField
              label={field.label}
              value={formField.value || '—'}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true } }}
              helperText={field.helperText}
            />
          )
        }

        if (field.type === 'select') {
          return (
            <TextField
              {...formField}
              select
              label={field.label}
              fullWidth
              required={field.required}
              helperText={field.helperText}
              onChange={(e) => {
                formField.onChange(e)
                if (field.name === 'batch' && setValue) {
                  const batch = BATCH_STOCK_MAP[e.target.value]
                  if (batch) {
                    setValue('batchStockCount', String(batch.count))
                    setValue('batchDate', batch.date)
                  }
                }
              }}
            >
              {field.options?.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
          )
        }

        return (
          <TextField
            {...formField}
            type={field.type}
            label={field.label}
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 3 : undefined}
            fullWidth
            required={field.required}
            helperText={field.helperText}
          />
        )
      }}
    />
  )
}

export { BATCH_STOCK_MAP }
