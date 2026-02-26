"use client"

import { motion, AnimatePresence } from "framer-motion"

interface FormErrorProps {
  error?: string | string[] | null
  id?: string
}

interface FormFieldProps {
  label: string
  name: string
  error?: string | null
  children: React.ReactNode
  required?: boolean
  helpText?: string
}

/**
 * Form Field Wrapper - Combines label, input, error message, and help text
 * 
 * Usage:
 * <FormField 
 *   label="Email" 
 *   name="email" 
 *   error={errors.email}
 *   required
 * >
 *   <input type="email" ... />
 * </FormField>
 */
export function FormField({
  label,
  name,
  error,
  children,
  required = false,
  helpText,
}: FormFieldProps) {
  const errorId = `${name}-error`
  const helpId = helpText ? `${name}-help` : undefined

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-300"
      >
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div
        className={error ? "rounded-lg ring-2 ring-red-500/50" : ""}
      >
        {children}
      </div>
      <FormError error={error} id={errorId} />
      {helpText && (
        <p id={helpId} className="text-xs text-zinc-500">
          {helpText}
        </p>
      )}
    </div>
  )
}

/**
 * Inline Form Error - Displays validation errors for form fields
 * 
 * Usage:
 * <FormError error={errors.email} id="email-error" />
 */
export function FormError({ error, id }: FormErrorProps) {
  if (!error) return null

  const errors = Array.isArray(error) ? error : [error]

  return (
    <AnimatePresence mode="wait">
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          id={id}
          className="flex items-start gap-1.5 text-red-400"
          role="alert"
          aria-live="polite"
        >
          <ErrorIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            {errors.map((err, i) => (
              <p key={i} className="text-sm">
                {err}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Form Input with built-in error styling
 * 
 * Usage:
 * <FormInput 
 *   label="Email" 
 *   name="email" 
 *   type="email"
 *   error={errors.email}
 *   required
 * />
 */
interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string
  name: string
  error?: string | null
  helpText?: string
}

export function FormInput({
  label,
  name,
  error,
  helpText,
  required,
  className = "",
  ...props
}: FormInputProps) {
  const inputId = name
  const errorId = error ? `${name}-error` : undefined
  const helpId = helpText ? `${name}-help` : undefined

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      helpText={helpText}
    >
      <input
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={[errorId, helpId].filter(Boolean).join(" ") || undefined}
        className={`
          w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-zinc-100 
          placeholder:text-zinc-500
          focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? "border-red-500/50" : "border-zinc-700/50 hover:border-zinc-600/50"}
          ${className}
        `}
        {...props}
      />
    </FormField>
  )
}

/**
 * Form Textarea with built-in error styling
 */
interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  label: string
  name: string
  error?: string | null
  helpText?: string
}

export function FormTextarea({
  label,
  name,
  error,
  helpText,
  required,
  className = "",
  ...props
}: FormTextareaProps) {
  const inputId = name
  const errorId = error ? `${name}-error` : undefined
  const helpId = helpText ? `${name}-help` : undefined

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      helpText={helpText}
    >
      <textarea
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={[errorId, helpId].filter(Boolean).join(" ") || undefined}
        className={`
          w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-zinc-100 
          placeholder:text-zinc-500
          focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors resize-none
          ${error ? "border-red-500/50" : "border-zinc-700/50 hover:border-zinc-600/50"}
          ${className}
        `}
        {...props}
      />
    </FormField>
  )
}

/**
 * Form Select with built-in error styling
 */
interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  label: string
  name: string
  error?: string | null
  helpText?: string
  options: { value: string; label: string }[]
}

export function FormSelect({
  label,
  name,
  error,
  helpText,
  required,
  options,
  className = "",
  ...props
}: FormSelectProps) {
  const inputId = name
  const errorId = error ? `${name}-error` : undefined
  const helpId = helpText ? `${name}-help` : undefined

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      helpText={helpText}
    >
      <div className="relative">
        <select
          id={inputId}
          name={name}
          aria-invalid={!!error}
          aria-describedby={[errorId, helpId].filter(Boolean).join(" ") || undefined}
          className={`
            w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-zinc-100 
            appearance-none
            focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${error ? "border-red-500/50" : "border-zinc-700/50 hover:border-zinc-600/50"}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </FormField>
  )
}

/**
 * Form Section - Groups related form fields with a title
 */
interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        {description && <p className="text-sm text-zinc-400 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

/**
 * Form Actions - Container for form buttons
 */
interface FormActionsProps {
  children: React.ReactNode
  className?: string
}

export function FormActions({ children, className = "" }: FormActionsProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 ${className}`}>
      {children}
    </div>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
