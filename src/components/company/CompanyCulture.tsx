'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CompanyProfileWithDetails } from '@/types/company';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon as QuoteIcon } from '@heroicons/react/24/solid';

interface CompanyCultureProps {
  company: CompanyProfileWithDetails;
  showTestimonials?: boolean;
  showCulture?: boolean;
}

export function CompanyCulture({ 
  company, 
  showTestimonials = true, 
  showCulture = true 
}: CompanyCultureProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (testimonialId: string) => {
    setImageErrors(prev => ({ ...prev, [testimonialId]: true }));
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === company.testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? company.testimonials.length - 1 : prev - 1
    );
  };

  return (
    <div className="space-y-8">
      {/* Culture Information */}
      {showCulture && (company.mission || company.values?.length || company.cultureDescription) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Our Culture & Values</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Mission */}
            {company.mission && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Mission</h4>
                <p className="text-gray-700 leading-relaxed">{company.mission}</p>
              </div>
            )}

            {/* Values */}
            {company.values && company.values.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Values</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {company.values.map((value, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"
                    >
                      <div className="text-sm font-medium text-blue-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Culture Description */}
            {company.cultureDescription && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Culture</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {company.cultureDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employee Testimonials */}
      {showTestimonials && company.testimonials.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">What Our Team Says</h3>
          </div>
          
          <div className="p-6">
            {company.testimonials.length === 1 ? (
              // Single testimonial
              <TestimonialCard 
                testimonial={company.testimonials[0]}
                imageError={imageErrors[company.testimonials[0].id]}
                onImageError={() => handleImageError(company.testimonials[0].id)}
              />
            ) : (
              // Testimonial carousel
              <div className="relative">
                <TestimonialCard 
                  testimonial={company.testimonials[currentTestimonial]}
                  imageError={imageErrors[company.testimonials[currentTestimonial].id]}
                  onImageError={() => handleImageError(company.testimonials[currentTestimonial].id)}
                />
                
                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={prevTestimonial}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Dots indicator */}
                  <div className="flex space-x-2">
                    {company.testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentTestimonial 
                            ? 'bg-blue-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextTestimonial}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Testimonials Grid (for culture tab) */}
      {showCulture && company.testimonials.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Team Testimonials</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {company.testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  imageError={imageErrors[testimonial.id]}
                  onImageError={() => handleImageError(testimonial.id)}
                  compact
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TestimonialCardProps {
  testimonial: any;
  imageError: boolean;
  onImageError: () => void;
  compact?: boolean;
}

function TestimonialCard({ testimonial, imageError, onImageError, compact = false }: TestimonialCardProps) {
  return (
    <div className={`${compact ? 'text-sm' : ''}`}>
      {/* Quote */}
      <div className="relative">
        <QuoteIcon className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-blue-600 mb-4`} />
        <blockquote className={`text-gray-700 leading-relaxed ${compact ? 'text-sm' : 'text-base'}`}>
          "{testimonial.testimonial}"
        </blockquote>
      </div>
      
      {/* Author */}
      <div className={`flex items-center space-x-3 ${compact ? 'mt-3' : 'mt-6'}`}>
        <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0`}>
          {testimonial.employeePhotoUrl && !imageError ? (
            <Image
              src={testimonial.employeePhotoUrl}
              alt={testimonial.employeeName}
              fill
              className="object-cover"
              onError={onImageError}
            />
          ) : (
            <UserCircleIcon className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} text-gray-400`} />
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {testimonial.employeeName}
          </div>
          <div className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            {testimonial.employeeRole}
          </div>
        </div>
      </div>
    </div>
  );
}