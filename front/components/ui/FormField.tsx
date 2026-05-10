import type { ReactNode } from 'react'

type FormFieldProps = {
  label: string
  children: ReactNode
}

export default function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}
