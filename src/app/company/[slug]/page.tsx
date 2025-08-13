import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { companyProfileService } from '@/lib/services/company-profile';
import { CompanyProfilePage } from '@/components/company/CompanyProfilePage';
import { getServerSession } from '@/lib/auth-server';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const company = await companyProfileService.getBySlug(params.slug);
    
    if (!company) {
      return {
        title: 'Company Not Found',
        description: 'The requested company profile could not be found.',
      };
    }

    const title = `${company.companyName} - Company Profile`;
    const description = company.description 
      ? `${company.description.substring(0, 155)}...`
      : `Learn about ${company.companyName}, a ${company.industry || 'company'} with ${company.companySize || 'multiple'} employees. View jobs and company culture.`;

    return {
      title,
      description,
      keywords: ([
        company.companyName,
        company.industry,
        'jobs',
        'careers',
        'company profile',
        company.companySize,
      ].filter((v): v is string => Boolean(v))),
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/company/${company.slug}`,
        images: company.logoUrl ? [
          {
            url: company.logoUrl,
            width: 400,
            height: 400,
            alt: `${company.companyName} logo`,
          }
        ] : [],
        siteName: 'Job Portal',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: company.logoUrl ? [company.logoUrl] : [],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/company/${company.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Company Profile',
      description: 'View company profile and available job opportunities.',
    };
  }
}

// Generate structured data for SEO
function generateStructuredData(company: {
  companyName: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  createdAt: string;
  companySize?: string;
  industry?: string;
  locations?: Array<{
    isHeadquarters?: boolean;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  }>;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.companyName,
    description: company.description,
    url: company.websiteUrl,
    logo: company.logoUrl,
    foundingDate: company.createdAt,
    numberOfEmployees: company.companySize,
    industry: company.industry,
    address: company.locations?.find((loc) => loc.isHeadquarters) ? {
      '@type': 'PostalAddress',
      streetAddress: company.locations.find((loc) => loc.isHeadquarters)?.address,
      addressLocality: company.locations.find((loc) => loc.isHeadquarters)?.city,
      addressRegion: company.locations.find((loc) => loc.isHeadquarters)?.state,
      addressCountry: company.locations.find((loc) => loc.isHeadquarters)?.country,
      postalCode: company.locations.find((loc) => loc.isHeadquarters)?.postalCode,
    } : undefined,
    sameAs: [
      company.websiteUrl,
    ].filter(Boolean),
  };

  return structuredData;
}

export default async function CompanyPage({ params }: PageProps) {
  try {
    const { session } = await getServerSession();
    const company = await companyProfileService.getWithDetails(
      params.slug,
      session?.user?.id
    );

    if (!company) {
      notFound();
    }

    const structuredData = generateStructuredData(company);

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* Main Company Profile Component */}
        <CompanyProfilePage 
          company={company} 
          currentUserId={session?.user?.id}
        />
      </>
    );
  } catch (error) {
    console.error('Error loading company profile:', error);
    notFound();
  }
}