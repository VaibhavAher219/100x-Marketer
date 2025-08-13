import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import JobListings from '@/components/jobs/JobListings'

export const metadata = {
  title: 'Explore Opportunities - 100x Marketers',
  description: 'Browse all available AI marketing jobs with powerful filters and search.',
}

export default function ExploreJobsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20">
        <JobListings />
      </main>
      <Footer />
    </div>
  )
}



