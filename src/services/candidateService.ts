import { supabase } from './supabase'
import type { LiveCandidateAvailability } from './supabase'

export interface SearchFilters {
  skills?: string[]
  experience?: string
  location?: string
  reelPassOnly?: boolean
  availability?: string
  currency?: string
  salaryMin?: string
  salaryMax?: string
  province?: string
  beeLevel?: string
  languages?: string[]
  workPermitRequired?: boolean
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
  province?: string
  beeStatus?: string
  languages?: string[]
}

export async function searchCandidates(
  query: string, 
  filters: SearchFilters = {}
): Promise<CandidateSearchResult[]> {
  try {
    // Use the live_candidate_availability view for optimized search
    let queryBuilder = supabase
      .from('live_candidate_availability')
      .select('*')

    // Apply text search if query provided
    if (query && query.trim()) {
      queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,headline.ilike.%${query}%,email.ilike.%${query}%`)
    }

    // Apply ReelPass filter
    if (filters.reelPassOnly) {
      queryBuilder = queryBuilder.gte('reelpass_score', 60)
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
        queryBuilder = queryBuilder.eq('availability_status', status)
      }
    }

    // Apply salary filters
    if (filters.salaryMin) {
      queryBuilder = queryBuilder.gte('salary_expectation_max', parseInt(filters.salaryMin))
    }
    if (filters.salaryMax) {
      queryBuilder = queryBuilder.lte('salary_expectation_min', parseInt(filters.salaryMax))
    }

    // Apply location filter
    if (filters.location) {
      queryBuilder = queryBuilder.contains('location_preferences', [filters.location])
    }

    // Apply province filter (SA specific)
    if (filters.province) {
      queryBuilder = queryBuilder.eq('province', filters.province.toLowerCase().replace(' ', '_'))
    }

    // Apply BEE level filter (SA specific)
    if (filters.beeLevel) {
      const beeLevel = filters.beeLevel.toLowerCase().replace(/\s+/g, '_')
      queryBuilder = queryBuilder.eq('bee_status', beeLevel)
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

    // Get skills for each candidate
    const candidateIds = data.map(candidate => candidate.candidate_id)
    const { data: skillsData } = await supabase
      .from('skills')
      .select('profile_id, name, verified')
      .in('profile_id', candidateIds)

    // Group skills by profile_id
    const skillsByProfile = skillsData?.reduce((acc, skill) => {
      if (!acc[skill.profile_id]) {
        acc[skill.profile_id] = []
      }
      acc[skill.profile_id].push(skill.name)
      return acc
    }, {} as Record<string, string[]>) || {}

    // Transform the data to match our interface
    const candidates: CandidateSearchResult[] = data.map((candidate: LiveCandidateAvailability) => {
      const skills = skillsByProfile[candidate.candidate_id] || []
      
      return {
        id: candidate.candidate_id,
        firstName: candidate.first_name || '',
        lastName: candidate.last_name || '',
        headline: candidate.headline || 'Professional',
        email: candidate.email,
        reelpassScore: candidate.reelpass_score || 0,
        verificationStatus: candidate.verification_status,
        availabilityStatus: candidate.availability_status || 'not-looking',
        availableFrom: candidate.available_from || undefined,
        noticePeriodDays: candidate.notice_period_days || undefined,
        salaryExpectationMin: candidate.salary_expectation_min || undefined,
        salaryExpectationMax: candidate.salary_expectation_max || undefined,
        preferredWorkType: candidate.preferred_work_type || undefined,
        locationPreferences: candidate.location_preferences || [],
        skills,
        lastActive: candidate.availability_updated_at || new Date().toISOString(),
        currency: filters.currency || 'USD',
        province: candidate.province || undefined,
        beeStatus: candidate.bee_status || undefined
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

    // Apply languages filter (client-side for now)
    if (filters.languages && filters.languages.length > 0) {
      return candidates.filter(candidate => 
        candidate.languages && 
        filters.languages!.some(lang => 
          candidate.languages!.includes(lang as any)
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
        province,
        bee_status,
        languages,
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
          location_preferences,
          is_active
        )
      `)
      .eq('id', id)
      .eq('role', 'candidate')
      .eq('availability_updates.is_active', true)
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
      currency: 'USD',
      province: data.province || undefined,
      beeStatus: data.bee_status || undefined,
      languages: data.languages || []
    }

  } catch (error) {
    console.error('Error fetching candidate:', error)
    return null
  }
}