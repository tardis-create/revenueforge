'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FormInput, FormTextarea, FormSelect, FormSection, FormActions } from '@/app/components';

interface FormData {
  // Contact Information
  name: string;
  email: string;
  phone: string;
  company: string;
  
  // Product Requirements
  productCategory: string;
  productName: string;
  quantity: string;
  unit: string;
  
  // Delivery Requirements
  deliveryDate: string;
  deliveryLocation: string;
  
  // Additional Details
  specifications: string;
  budget: string;
  additionalNotes: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  productCategory: '',
  productName: '',
  quantity: '',
  unit: 'pieces',
  deliveryDate: '',
  deliveryLocation: '',
  specifications: '',
  budget: '',
  additionalNotes: '',
};

const productCategories = [
  { value: '', label: 'Select a category' },
  { value: 'industrial-machinery', label: 'Industrial Machinery' },
  { value: 'electrical-equipment', label: 'Electrical Equipment' },
  { value: 'safety-equipment', label: 'Safety Equipment' },
  { value: 'hand-tools', label: 'Hand Tools' },
  { value: 'power-tools', label: 'Power Tools' },
  { value: 'fasteners', label: 'Fasteners & Hardware' },
  { value: 'pneumatic', label: 'Pneumatic Components' },
  { value: 'hydraulic', label: 'Hydraulic Components' },
  { value: 'raw-materials', label: 'Raw Materials' },
  { value: 'other', label: 'Other' },
];

const units = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'sets', label: 'Sets' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'tons', label: 'Metric Tons' },
  { value: 'meters', label: 'Meters' },
  { value: 'liters', label: 'Liters' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'rolls', label: 'Rolls' },
];

export default function RFQPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.productCategory) {
      newErrors.productCategory = 'Please select a product category';
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    if (!formData.deliveryLocation.trim()) {
      newErrors.deliveryLocation = 'Delivery location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - in production, this would send to backend
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In production, submit to API:
      // const response = await fetch('/api/rfq', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      setIsSuccess(true);
      setFormData(initialFormData);
    } catch (error) {
      setErrors({ submit: 'Failed to submit RFQ. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        {/* Background effects */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-lg w-full relative z-10">
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-zinc-100 mb-3">
              RFQ Submitted Successfully!
            </h1>
            
            <p className="text-zinc-400 mb-2">
              Thank you for your Request for Quotation.
            </p>
            
            <p className="text-zinc-500 text-sm mb-6">
              Our team will review your requirements and get back to you within 24-48 hours 
              with a detailed quotation.
            </p>

            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 mb-6">
              <p className="text-xs text-zinc-500 mb-1">Reference Number</p>
              <p className="text-lg font-mono text-zinc-200">
                RFQ-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsSuccess(false)}
                className="px-6 py-3 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Submit Another RFQ
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background effects */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                Request for Quotation
              </h1>
              <p className="text-zinc-400">
                Fill out the form below and we&apos;ll get back to you within 24-48 hours
              </p>
            </div>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-24 lg:pb-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6">
            <FormSection 
              title="Contact Information" 
              description="How can we reach you?"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                />
                
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="john@company.com"
                  required
                  disabled={isSubmitting}
                />
                
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+91 98765 43210"
                  required
                  disabled={isSubmitting}
                />
                
                <FormInput
                  label="Company Name"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  error={errors.company}
                  placeholder="Acme Industries"
                  disabled={isSubmitting}
                  helpText="Optional"
                />
              </div>
            </FormSection>
          </div>

          {/* Product Requirements */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6">
            <FormSection 
              title="Product Requirements" 
              description="What are you looking for?"
            >
              <div className="space-y-4">
                <FormSelect
                  label="Product Category"
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleChange}
                  error={errors.productCategory}
                  options={productCategories}
                  required
                  disabled={isSubmitting}
                />
                
                <FormInput
                  label="Product Name / Description"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  error={errors.productName}
                  placeholder="e.g., Industrial Air Compressor 50HP"
                  required
                  disabled={isSubmitting}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    error={errors.quantity}
                    placeholder="100"
                    required
                    disabled={isSubmitting}
                  />
                  
                  <FormSelect
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    error={errors.unit}
                    options={units}
                    disabled={isSubmitting}
                  />
                </div>
                
                <FormTextarea
                  label="Technical Specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  error={errors.specifications}
                  placeholder="Include any technical requirements, dimensions, materials, certifications needed, etc."
                  rows={3}
                  disabled={isSubmitting}
                  helpText="Optional - Add any specific technical requirements"
                />
              </div>
            </FormSection>
          </div>

          {/* Delivery Requirements */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6">
            <FormSection 
              title="Delivery Requirements" 
              description="When and where do you need it?"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Required Delivery Date"
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  error={errors.deliveryDate}
                  disabled={isSubmitting}
                  helpText="Optional - When do you need delivery?"
                />
                
                <FormInput
                  label="Delivery Location"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  error={errors.deliveryLocation}
                  placeholder="Mumbai, Maharashtra"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </FormSection>
          </div>

          {/* Additional Information */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6">
            <FormSection 
              title="Additional Information" 
              description="Anything else we should know?"
            >
              <div className="space-y-4">
                <FormInput
                  label="Budget Range"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  error={errors.budget}
                  placeholder="e.g., ₹50,000 - ₹1,00,000"
                  disabled={isSubmitting}
                  helpText="Optional - Helps us provide accurate quotes"
                />
                
                <FormTextarea
                  label="Additional Notes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  error={errors.additionalNotes}
                  placeholder="Any other requirements, questions, or comments..."
                  rows={4}
                  disabled={isSubmitting}
                  helpText="Optional"
                />
              </div>
            </FormSection>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <FormActions>
            <Link
              href="/"
              className="px-6 py-3 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit RFQ'
              )}
            </button>
          </FormActions>
        </form>

        {/* Mobile back button */}
        <div className="sm:hidden mt-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
