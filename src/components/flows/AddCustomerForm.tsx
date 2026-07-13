import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Grid, Stack, Alert, CircularProgress } from '@mui/material'
import { FormFieldRenderer } from '@/components/module/FormFieldRenderer'
import { createItem } from '@/api/client'

interface CustomerFormData {
  businessName: string
  customerName: string
  phoneNumber: string
  route: string
  creditLimit: string
  shopCategory: string
}

interface AddCustomerFormProps {
  onSuccess?: () => void
}

export function AddCustomerForm({ onSuccess }: AddCustomerFormProps) {
  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<CustomerFormData>({
    defaultValues: {
      businessName: '',
      customerName: '',
      phoneNumber: '',
      route: '',
      creditLimit: '',
      shopCategory: '',
    },
  })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setSubmitError(null)
      setSubmitSuccess(false)

      await createItem('/customers-customer-list', {
        name: data.customerName,
        businessName: data.businessName,
        phone: data.phoneNumber,
        route: data.route,
        creditLimit: parseFloat(data.creditLimit),
        shopCategory: data.shopCategory,
      })

      setSubmitSuccess(true)
      reset()
      onSuccess?.()

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to add customer')
    }
  }

  const formFields = [
    { name: 'businessName', label: 'Business Name', type: 'text' as const, required: true },
    { name: 'customerName', label: 'Customer Name', type: 'text' as const, required: true },
    { name: 'phoneNumber', label: 'Phone Number', type: 'text' as const, required: true },
    { name: 'route', label: 'Route', type: 'select' as const, required: true, options: [
      { value: 'route-a', label: 'Route A - North' },
      { value: 'route-b', label: 'Route B - South' },
      { value: 'route-c', label: 'Route C - East' },
      { value: 'route-d', label: 'Route D - West' },
      { value: 'route-e', label: 'Route E - Central' },
    ]},
    { name: 'creditLimit', label: 'Credit Limit', type: 'number' as const, required: true },
    { name: 'shopCategory', label: 'Shop Category', type: 'select' as const, required: true, options: [
      { value: 'traditional', label: 'Traditional' },
      { value: 'supermarket', label: 'Supermarket' },
    ]},
  ]

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {submitError && (
          <Alert severity="error">{submitError}</Alert>
        )}
        {submitSuccess && (
          <Alert severity="success">Customer added successfully!</Alert>
        )}

        <Grid container spacing={2}>
          {formFields.map((field) => (
            <Grid key={field.name} item xs={12} sm={6}>
              <FormFieldRenderer
                field={field}
                control={control}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              reset()
              setSubmitError(null)
            }}
          >
            Clear
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? <CircularProgress size={20} /> : 'Add Customer'}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
