import { supabase } from './supabase'
import type { RecruiterRatingSummary, RecruiterScorecard } from './supabase'

export interface RecruiterRating {
  id: string
  recruiterName: string
  recruiterEmail: string
  totalReviews: number
  avgCommunication: number
  avgProfessionalism: number
  avgRoleAccuracy: number
  overallRating: number
  positiveReviews: number
  negativeReviews: number
  recentFeedback: Array<{
    candidateName: string
    jobTitle: string
    rating: number
    feedback: string
    date: string
  }>
}

export async function getRecruiterRatings(): Promise<RecruiterRating[]> {
  try {
    // Get recruiter ratings summary
    const { data: summaryData, error: summaryError } = await supabase
      .from('recruiter_ratings_summary')
      .select('*')
      .order('overall_rating', { ascending: false })

    if (summaryError) {
      console.error('Error fetching recruiter ratings summary:', summaryError)
      return []
    }

    if (!summaryData || summaryData.length === 0) {
      return []
    }

    // Get recent feedback for each recruiter
    const recruiterIds = summaryData.map(r => r.recruiter_id)
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('recruiter_scorecards')
      .select('recruiter_id, feedback_text, job_title, overall_rating, created_at')
      .in('recruiter_id', recruiterIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (feedbackError) {
      console.error('Error fetching feedback data:', feedbackError)
    }

    // Group feedback by recruiter
    const feedbackByRecruiter = (feedbackData || []).reduce((acc, feedback) => {
      if (!acc[feedback.recruiter_id]) {
        acc[feedback.recruiter_id] = []
      }
      acc[feedback.recruiter_id].push({
        candidateName: 'Anonymous Candidate',
        jobTitle: feedback.job_title || 'Position',
        rating: feedback.overall_rating,
        feedback: feedback.feedback_text || '',
        date: feedback.created_at
      })
      return acc
    }, {} as Record<string, any[]>)

    // Transform to our interface
    return summaryData.map((summary: RecruiterRatingSummary) => ({
      id: summary.recruiter_id,
      recruiterName: `${summary.first_name || ''} ${summary.last_name || ''}`.trim() || 'Unknown Recruiter',
      recruiterEmail: summary.email,
      totalReviews: summary.total_reviews,
      avgCommunication: summary.avg_communication || 0,
      avgProfessionalism: summary.avg_professionalism || 0,
      avgRoleAccuracy: summary.avg_role_accuracy || 0,
      overallRating: summary.overall_rating || 0,
      positiveReviews: summary.positive_reviews,
      negativeReviews: summary.negative_reviews,
      recentFeedback: feedbackByRecruiter[summary.recruiter_id] || []
    }))

  } catch (error) {
    console.error('Error fetching recruiter ratings:', error)
    return []
  }
}

export async function submitRecruiterReview(
  recruiterId: string,
  candidateId: string,
  communicationRating: number,
  professionalismRating: number,
  roleAccuracyRating: number,
  feedbackText: string,
  jobTitle?: string,
  companyName?: string,
  isPublic: boolean = true
): Promise<void> {
  try {
    const { error } = await supabase
      .from('recruiter_scorecards')
      .insert({
        recruiter_id: recruiterId,
        candidate_id: candidateId,
        communication_rating: communicationRating,
        professionalism_rating: professionalismRating,
        role_accuracy_rating: roleAccuracyRating,
        feedback_text: feedbackText,
        job_title: jobTitle || null,
        company_name: companyName || null,
        is_public: isPublic
      })

    if (error) {
      throw new Error(`Failed to submit review: ${error.message}`)
    }
  } catch (error) {
    console.error('Error submitting recruiter review:', error)
    throw error
  }
}

export async function getRecruiterStats(recruiterId: string) {
  try {
    const { data, error } = await supabase
      .from('recruiter_ratings_summary')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .single()

    if (error) {
      console.error('Error fetching recruiter stats:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching recruiter stats:', error)
    return null
  }
}

export async function getRecruiterReviews(recruiterId: string) {
  try {
    const { data, error } = await supabase
      .from('recruiter_scorecards')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recruiter reviews:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching recruiter reviews:', error)
    return []
  }
}