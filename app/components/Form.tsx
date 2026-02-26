"use client"

import { ReactNode } from "react"

interface FormFieldProps {
  label?: string
  name: string
  error?: string
  required?: boolean
  helpText?: string
  children: ReactNode
}

export function FormField({ label, name, error, required, helpText, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm text-zinc-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-400" id={`${name}-error`}>{error}</p>}
      {helpText && !error && (
        <p className="text-sm text-zinc-500" id={`${name}-help`}>{helpText}</p>
      )}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export function FormInput({ label, error, helpText, className = "", ...props }: FormInputProps) {
  return (
    <FormField label={label} name={props.name || ""} error={error} required={props.required} helpText={helpText}>
      <input
        {...props}
        className={`
          w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-zinc-100 
          placeholder:text-zinc-500
          focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? "border-red-500/50" : "border-zinc-700/50 hover:border-zinc-600/50"}
          ${className}
        `}
      />
    </FormField>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
}

export function FormTextarea({ label, error, helpText, className = "", ...props }: FormTextareaProps) {
  return (
    <FormField label={label} name={props.name || ""} error={error} required={props.required} helpText={helpText}>
      <textarea
        {...props}
        className={`
          w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-zinc-100 
          placeholder:text-zinc-500
          focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors resize-none
          ${error ? "border-red-500/50" : "border-zinc-700/50 hover:border-zinc-600/50"}
          ${className}
        `}
      />
    </FormField>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  )
}

export function FormSection({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-zinc-400">{description}</p>
      )}
      {children}
    </div>
  )
}

export function FormActions({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center gap-4 pt-4 ${className}`}>{children}</div>
}
