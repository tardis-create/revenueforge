"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface FormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productRequirements: string;
  quantity: string;
  unit: string;
  deliveryTimeline: string;
  additionalNotes: string;
}

interface FormErrors {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  productRequirements?: string;
  quantity?: string;
  unit?: string;
  deliveryTimeline?: string;
}

const initialFormData: FormData = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  productRequirements: "",
  quantity: "",
  unit: "",
  deliveryTimeline: "",
  additionalNotes: "",
};

export default function RFQForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.productRequirements.trim()) {
      newErrors.productRequirements = "Product requirements are required";
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity";
    }

    if (!formData.unit) {
      newErrors.unit = "Please select a unit";
    }

    if (!formData.deliveryTimeline.trim()) {
      newErrors.deliveryTimeline = "Delivery timeline is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/rfq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData(initialFormData);
      } else {
        const errorData = await response.json() as { message?: string };
        setSubmitStatus("error");
        setErrorMessage(errorData.message || "Failed to submit RFQ. Please try again.");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Request for Quotation
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Tell us about your requirements and we&apos;ll get back to you with a competitive quote
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 shadow-xl rounded-2xl p-8 space-y-6">
          {/* Success Message */}
          {submitStatus === "success" && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Your RFQ has been submitted successfully! We&apos;ll contact you shortly.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 dark:text-red-200 font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Company Information Section */}
          <div className="border-b border-zinc-200 dark:border-zinc-700 pb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.companyName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
                  } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="Acme Corporation"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>
                )}
              </div>

              {/* Contact Person */}
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.contactPerson
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
                  } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="John Doe"
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactPerson}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
                  } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="john@acme.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
                  } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Requirements Section */}
          <div className="border-b border-zinc-200 dark:border-zinc-700 pb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Product Requirements
            </h2>

            {/* Product Requirements Text */}
            <div className="mb-4">
              <label htmlFor="productRequirements" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Describe Your Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                id="productRequirements"
                name="productRequirements"
                value={formData.productRequirements}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.productRequirements
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
                } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 transition-colors resize-none`}
                placeholder="Please describe the products or services you're looking for, including specifications, materials, certifications, etc."
              />
              {errors.productRequirements && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.productRequirements}</p>
              )}
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.quantity
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
                  } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="100"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.unit
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
                  } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 transition-colors`}
                >
                  <option value="">Select a unit</option>
                  <option value="pieces">Pieces</option>
                  <option value="units">Units</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tons">Metric Tons</option>
                  <option value="liters">Liters</option>
                  <option value="meters">Meters</option>
                  <option value="square_meters">Square Meters</option>
                  <option value="cubic_meters">Cubic Meters</option>
                  <option value="sets">Sets</option>
                  <option value="cartons">Cartons</option>
                  <option value="pallets">Pallets</option>
                  <option value="containers">Containers</option>
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unit}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline and Additional Information */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Timeline & Additional Information
            </h2>

            {/* Delivery Timeline */}
            <div className="mb-4">
              <label htmlFor="deliveryTimeline" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Desired Delivery Timeline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="deliveryTimeline"
                name="deliveryTimeline"
                value={formData.deliveryTimeline}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.deliveryTimeline
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
                } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="e.g., Within 2 weeks, By end of Q2, ASAP"
              />
              {errors.deliveryTimeline && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deliveryTimeline}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Additional Notes <span className="text-zinc-400">(Optional)</span>
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                placeholder="Any additional requirements, certifications, packaging preferences, or special instructions"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                isSubmitting
                  ? "bg-zinc-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Request for Quotation"
              )}
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Have questions? Contact us at{" "}
            <a href="mailto:support@revenueforge.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@revenueforge.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
