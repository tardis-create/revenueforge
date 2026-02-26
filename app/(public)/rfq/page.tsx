"use client";

import Link from "next/link";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  Magnet,
  ClickSpark,
  GlareHover
} from '@/app/components';

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Radial glow */}
      <div className="fixed top-1/4 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 border-b border-zinc-800/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/catalog" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Catalog</Link>
            <Link href="/rfq" className="text-zinc-100 text-sm font-medium">Request Quote</Link>
          </div>
        </nav>

        {/* Content */}
        <div className="px-6 lg:px-12 py-12 lg:py-16">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <AnimatedContent>
              <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                  <BlurText text="Request for Quotation" />
                </h1>
                <p className="text-lg text-zinc-400">
                  Tell us about your requirements and we&apos;ll get back to you with a competitive quote
                </p>
              </div>
            </AnimatedContent>

            {/* Form */}
            <AnimatedContent delay={0.2}>
              <GlareHover glareColor="rgba(168, 85, 247, 0.2)" glareSize={400}>
                <div className="p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Success Message */}
                    {submitStatus === "success" && (
                      <FadeContent>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-emerald-400 font-medium text-sm">
                              Your RFQ has been submitted successfully! We&apos;ll contact you shortly.
                            </p>
                          </div>
                        </div>
                      </FadeContent>
                    )}

                    {/* Error Message */}
                    {submitStatus === "error" && (
                      <FadeContent>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-red-400 font-medium text-sm">{errorMessage}</p>
                          </div>
                        </div>
                      </FadeContent>
                    )}

                    {/* Company Information Section */}
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">
                        Company Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name */}
                        <div>
                          <label htmlFor="companyName" className="block text-sm text-zinc-400 mb-2">
                            Company Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                              errors.companyName
                                ? "border-red-500/50"
                                : "border-zinc-700/50 focus:border-purple-500/50"
                            } text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors`}
                            placeholder="Acme Corporation"
                          />
                          {errors.companyName && (
                            <p className="mt-1.5 text-sm text-red-400">{errors.companyName}</p>
                          )}
                        </div>

                        {/* Contact Person */}
                        <div>
                          <label htmlFor="contactPerson" className="block text-sm text-zinc-400 mb-2">
                            Contact Person <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            id="contactPerson"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                              errors.contactPerson
                                ? "border-red-500/50"
                                : "border-zinc-700/50 focus:border-purple-500/50"
                            } text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors`}
                            placeholder="John Doe"
                          />
                          {errors.contactPerson && (
                            <p className="mt-1.5 text-sm text-red-400">{errors.contactPerson}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="email" className="block text-sm text-zinc-400 mb-2">
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                              errors.email
                                ? "border-red-500/50"
                                : "border-zinc-700/50 focus:border-purple-500/50"
                            } text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors`}
                            placeholder="john@acme.com"
                          />
                          {errors.email && (
                            <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label htmlFor="phone" className="block text-sm text-zinc-400 mb-2">
                            Phone Number <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                              errors.phone
                                ? "border-red-500/50"
                                : "border-zinc-700/50 focus:border-purple-500/50"
                            } text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors`}
                            placeholder="+1 (555) 123-4567"
                          />
                          {errors.phone && (
                            <p className="mt-1.5 text-sm text-red-400">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Requirements Section */}
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">
                        Product Requirements
                      </h2>

                      {/* Product Requirements Text */}
                      <div className="mb-4">
                        <label htmlFor="productRequirements" className="block text-sm text-zinc-400 mb-2">
                          Describe Your Requirements <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          id="productRequirements"
                          name="productRequirements"
                          value={formData.productRequirements}
                          onChange={handleChange}
                          rows={4}
                          className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                            errors.productRequirements
                              ? "border-red-500/50"
                              : "border-zinc-700/50 focus:border-purple-500/50"
                          } text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors resize-none`}
                          placeholder="Please describe the products or services you're looking for, including specifications, materials, certifications, etc."
                        />
                        {errors.productRequirements && (
                          <p className="mt-1.5 text-sm text-red-400">{errors.productRequirements}</p>
                        )}
                      </div>

                      {/* Quantity and Unit */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Quantity */}
                        <div>
                          <label htmlFor="quantity" className="block text-sm text-zinc-400 mb-2">
                            Quantity <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                              errors.quantity
                                ? "border-red-500/50"
                                : "border-zinc-700/50 focus:border-purple-500/50"
                            } text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors`}
                            placeholder="100"
                          />
                          {errors.quantity && (
                            <p className="mt-1.5 text-sm text-red-400">{errors.quantity}</p>
                          )}
                        </div>

                        {/* Unit */}
                        <div>
                          <label htmlFor="unit" className="block text-sm text-zinc-400 mb-2">
                            Unit <span className="text-red-400">*</span>
                          </label>
                          <select
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                              errors.unit
                                ? "border-red-500/50"
                                : "border-zinc-700/50 focus:border-purple-500/50"
                            } text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors`}
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
                            <p className="mt-1.5 text-sm text-red-400">{errors.unit}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline and Additional Information */}
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">
                        Timeline and Additional Information
                      </h2>

                      {/* Delivery Timeline */}
                      <div className="mb-4">
                        <label htmlFor="deliveryTimeline" className="block text-sm text-zinc-400 mb-2">
                          Desired Delivery Timeline <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          id="deliveryTimeline"
                          name="deliveryTimeline"
                          value={formData.deliveryTimeline}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                            errors.deliveryTimeline
                              ? "border-red-500/50"
                              : "border-zinc-700/50 focus:border-purple-500/50"
                          } text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors`}
                          placeholder="e.g., Within 2 weeks, By end of Q2, ASAP"
                        />
                        {errors.deliveryTimeline && (
                          <p className="mt-1.5 text-sm text-red-400">{errors.deliveryTimeline}</p>
                        )}
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <label htmlFor="additionalNotes" className="block text-sm text-zinc-400 mb-2">
                          Additional Notes <span className="text-zinc-600">(Optional)</span>
                        </label>
                        <textarea
                          id="additionalNotes"
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors resize-none"
                          placeholder="Any additional requirements, certifications, packaging preferences, or special instructions"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <ClickSpark sparkColor="#a855f7" sparkCount={10}>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-4 rounded-lg font-medium transition-all ${
                            isSubmitting
                              ? "opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-400"
                              : "bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-white hover:border-purple-400/50"
                          }`}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </span>
                          ) : (
                            "Submit Request for Quotation"
                          )}
                        </button>
                      </ClickSpark>
                    </div>

                    {/* Helper Text */}
                    <p className="text-sm text-zinc-500 text-center">
                      Fields marked with <span className="text-red-400">*</span> are required
                    </p>
                  </form>
                </div>
              </GlareHover>
            </AnimatedContent>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-zinc-500">
                Have questions? Contact us at{" "}
                <a href="mailto:support@revenueforge.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  support@revenueforge.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
