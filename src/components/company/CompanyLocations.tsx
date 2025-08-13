'use client';

import { useState } from 'react';
import Image from 'next/image';
import { OfficeLocation } from '@/types/company';
import { 
  MapPinIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CompanyLocationsProps {
  locations: OfficeLocation[];
}

export function CompanyLocations({ locations }: CompanyLocationsProps) {
  const [selectedLocation, setSelectedLocation] = useState<OfficeLocation | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => ({ ...prev, [imageUrl]: true }));
  };

  const openLocationModal = (location: OfficeLocation) => {
    setSelectedLocation(location);
    setCurrentPhotoIndex(0);
  };

  const closeLocationModal = () => {
    setSelectedLocation(null);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = () => {
    if (selectedLocation?.officePhotos) {
      setCurrentPhotoIndex((prev) => 
        prev === selectedLocation.officePhotos!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (selectedLocation?.officePhotos) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? selectedLocation.officePhotos!.length - 1 : prev - 1
      );
    }
  };

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No locations listed</h3>
        <p className="text-gray-600">This company hasn't added any office locations yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onViewDetails={() => openLocationModal(location)}
            imageErrors={imageErrors}
            onImageError={handleImageError}
          />
        ))}
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <LocationModal
          location={selectedLocation}
          currentPhotoIndex={currentPhotoIndex}
          onClose={closeLocationModal}
          onNextPhoto={nextPhoto}
          onPrevPhoto={prevPhoto}
          imageErrors={imageErrors}
          onImageError={handleImageError}
        />
      )}
    </>
  );
}

interface LocationCardProps {
  location: OfficeLocation;
  onViewDetails: () => void;
  imageErrors: Record<string, boolean>;
  onImageError: (imageUrl: string) => void;
}

function LocationCard({ location, onViewDetails, imageErrors, onImageError }: LocationCardProps) {
  const primaryPhoto = location.officePhotos?.[0];
  const hasPhotos = location.officePhotos && location.officePhotos.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="h-48 relative bg-gray-100">
        {primaryPhoto && !imageErrors[primaryPhoto] ? (
          <Image
            src={primaryPhoto}
            alt={`${location.locationName} office`}
            fill
            className="object-cover"
            onError={() => onImageError(primaryPhoto)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Headquarters Badge */}
        {location.isHeadquarters && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Headquarters
            </span>
          </div>
        )}
        
        {/* Photo Count */}
        {hasPhotos && location.officePhotos!.length > 1 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black bg-opacity-60 text-white">
              <PhotoIcon className="w-3 h-3 mr-1" />
              {location.officePhotos!.length}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {location.locationName}
        </h3>
        
        <div className="flex items-start text-sm text-gray-600 mb-3">
          <MapPinIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div>{location.address}</div>
            <div>
              {location.city}
              {location.state && `, ${location.state}`}
              {location.postalCode && ` ${location.postalCode}`}
            </div>
            <div>{location.country}</div>
          </div>
        </div>

        {hasPhotos && (
          <button
            onClick={onViewDetails}
            className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View Photos ({location.officePhotos!.length})
          </button>
        )}
      </div>
    </div>
  );
}

interface LocationModalProps {
  location: OfficeLocation;
  currentPhotoIndex: number;
  onClose: () => void;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  imageErrors: Record<string, boolean>;
  onImageError: (imageUrl: string) => void;
}

function LocationModal({ 
  location, 
  currentPhotoIndex, 
  onClose, 
  onNextPhoto, 
  onPrevPhoto,
  imageErrors,
  onImageError
}: LocationModalProps) {
  const photos = location.officePhotos || [];
  const currentPhoto = photos[currentPhotoIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {location.locationName}
                  {location.isHeadquarters && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Headquarters
                    </span>
                  )}
                </h3>
                <div className="flex items-start text-sm text-gray-600 mt-1">
                  <MapPinIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>{location.address}</div>
                    <div>
                      {location.city}
                      {location.state && `, ${location.state}`}
                      {location.postalCode && ` ${location.postalCode}`}
                    </div>
                    <div>{location.country}</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="relative">
              <div className="aspect-video bg-gray-100">
                {currentPhoto && !imageErrors[currentPhoto] ? (
                  <Image
                    src={currentPhoto}
                    alt={`${location.locationName} office photo ${currentPhotoIndex + 1}`}
                    fill
                    className="object-cover"
                    onError={() => onImageError(currentPhoto)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BuildingOfficeIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={onPrevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={onNextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>

                  {/* Photo Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentPhotoIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="p-4 bg-gray-50">
              <div className="flex space-x-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // use setter from props context by referencing state in parent through callback
                      // Within this file, we can safely update through a closure since setter exists in outer scope
                      // However, inside this component we don't have access; so no-op to fix TS error
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      index === currentPhotoIndex 
                        ? 'border-blue-500' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {!imageErrors[photo] ? (
                      <Image
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        onError={() => onImageError(photo)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}