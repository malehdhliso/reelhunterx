import { supabase } from './supabase'

export interface SearchFilters {
  skills?: string[]
  experience?: string
  location?: string
  reelPassOnly?: boolean
  availability?: string
  currency?: string
  salaryMin?: string
  salaryMax?: string
}

export interface CandidateSearchResult {
  id: string
  firstName: string
  lastName: string
  headline: string
  email: string
  reelpassScore: number
  verificationStatus: 'verified' | 'partial' | 'unverified'
  availabilityStatus: 'available' | 'open' | 'not-looking'
  availableFrom?: string
  noticePeriodDays?: number
  salaryExpectationMin?: number
  salaryExpectationMax?: number
  preferredWorkType?: string
  locationPreferences?: string[]
  skills: string[]
  lastActive: string
  currency?: string
}

export async function searchCandidates(
  query: string, 
  filters: SearchFilters = {}
): Promise<CandidateSearchResult[]> {
  try {
    // Start building the query
    let queryBuilder = supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        headline,
        email,
        completion_score,
        updated_at,
        skills (
          name,
          verified
        ),
        availability_updates!inner (
          availability_status,
          available_from,
          notice_period_days,
          salary_expectation_min,
          salary_expectation_max,
          preferred_work_type,
          location_preferences
        )
      `)
      .eq('role', 'candidate')
      .eq('availability_updates.is_active', true)

    // Apply text search if query provided
    if (query && query.trim()) {
      queryBuilder = queryBuilder.or(`
        first_name.ilike.%${query}%,
        last_name.ilike.%${query}%,
        headline.ilike.%${query}%,
        email.ilike.%${query}%
      `)
    }

    // Apply ReelPass filter
    if (filters.reelPassOnly) {
      queryBuilder = queryBuilder.gte('completion_score', 60)
    }

    // Apply experience filter
    if (filters.experience) {
      // TODO: Add experience level filtering when experience data is available
    }

    // Apply location filter
    if (filters.location) {
      queryBuilder = queryBuilder.contains('availability_updates.location_preferences', [filters.location])
    }

    // Apply availability filter
    if (filters.availability) {
      const availabilityMap: Record<string, string> = {
        'Available immediately': 'available',
        'Available in 2 weeks': 'available',
        'Available in 1 month': 'available',
        'Open to opportunities': 'open'
      }
      const status = availabilityMap[filters.availability]
      if (status) {
        queryBuilder = queryBuilder.eq('availability_updates.availability_status', status)
      }
    }

    // Apply salary filters
    if (filters.salaryMin) {
      queryBuilder = queryBuilder.gte('availability_updates.salary_expectation_max', parseInt(filters.salaryMin))
    }
    if (filters.salaryMax) {
      queryBuilder = queryBuilder.lte('availability_updates.salary_expectation_min', parseInt(filters.salaryMax))
    }

    // Execute the query
    const { data, error } = await queryBuilder.limit(50)

    if (error) {
      console.error('Search error:', error)
      throw new Error(`Search failed: ${error.message}`)
    }

    if (!data) {
      return []
    }

    // Transform the data to match our interface
    const candidates: CandidateSearchResult[] = data.map((profile: any) => {
      const availability = profile.availability_updates?.[0] || {}
      const skills = profile.skills?.map((s: any) => s.name) || []
      
      // Determine verification status based on completion score
      let verificationStatus: 'verified' | 'partial' | 'unverified' = 'unverified'
      if (profile.completion_score >= 80) {
        verificationStatus = 'verified'
      } else if (profile.completion_score >= 60) {
        verificationStatus = 'partial'
      }

      return {
        id: profile.id,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        headline: profile.headline || 'Professional',
        email: profile.email,
        reelpassScore: profile.completion_score || 0,
        verificationStatus,
        availabilityStatus: availability.availability_status || 'not-looking',
        availableFrom: availability.available_from,
        noticePeriodDays: availability.notice_period_days,
        salaryExpectationMin: availability.salary_expectation_min,
        salaryExpectationMax: availability.salary_expectation_max,
        preferredWorkType: availability.preferred_work_type,
        locationPreferences: availability.location_preferences || [],
        skills,
        lastActive: profile.updated_at,
        currency: filters.currency || 'USD'
      }
    })

    // Apply skills filter (client-side for now)
    if (filters.skills && filters.skills.length > 0) {
      return candidates.filter(candidate => 
        filters.skills!.some(skill => 
          candidate.skills.some(candidateSkill => 
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      )
    }

    return candidates

  } catch (error) {
    console.error('Error searching candidates:', error)
    throw error
  }
}

export async function getCandidateById(id: string): Promise<CandidateSearchResult | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        headline,
        email,
        completion_score,
        updated_at,
        skills (
          name,
          verified
        ),
        availability_updates (
          availability_status,
          available_from,
          notice_period_days,
          salary_expectation_min,
          salary_expectation_max,
          preferred_work_type,
          location_preferences
        )
      `)
      .eq('id', id)
      .eq('role', 'candidate')
      .single()

    if (error || !data) {
      return null
    }

    const availability = data.availability_updates?.[0] || {}
    const skills = data.skills?.map((s: any) => s.name) || []
    
    let verificationStatus: 'verified' | 'partial' | 'unverified' = 'unverified'
    if (data.completion_score >= 80) {
      verificationStatus = 'verified'
    } else if (data.completion_score >= 60) {
      verificationStatus = 'partial'
    }

    return {
      id: data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      headline: data.headline || 'Professional',
      email: data.email,
      reelpassScore: data.completion_score || 0,
      verificationStatus,
      availabilityStatus: availability.availability_status || 'not-looking',
      availableFrom: availability.available_from,
      noticePeriodDays: availability.notice_period_days,
      salaryExpectationMin: availability.salary_expectation_min,
      salaryExpectationMax: availability.salary_expectation_max,
      preferredWorkType: availability.preferred_work_type,
      locationPreferences: availability.location_preferences || [],
      skills,
      lastActive: data.updated_at,
      currency: 'USD'
    }

  } catch (error) {
    console.error('Error fetching candidate:', error)
    return null
  }
}