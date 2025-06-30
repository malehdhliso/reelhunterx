import { supabase } from './supabase'
import type { PipelineStage, CandidatePipelinePosition, Profile } from './supabase'

export interface PipelineCandidate {
  id: string
  name: string
  email: string
  avatar: string
  addedAt: string
  notes?: string
  lastCommunication?: string
}

export interface PipelineStageWithCandidates extends PipelineStage {
  candidates: PipelineCandidate[]
}

export async function loadPipelineData(recruiterId: string): Promise<PipelineStageWithCandidates[]> {
  try {
    // Get pipeline stages
    const { data: stages, error: stagesError } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('is_active', true)
      .order('stage_order')

    if (stagesError) {
      throw new Error(`Failed to fetch pipeline stages: ${stagesError.message}`)
    }

    if (!stages || stages.length === 0) {
      return []
    }

    // Get candidate positions with profile data
    const { data: positions, error: positionsError } = await supabase
      .from('candidate_pipeline_positions')
      .select(`
        *,
        profiles!candidate_id (
          id,
          first_name,
          last_name,
          email,
          headline
        )
      `)
      .eq('recruiter_id', recruiterId)

    if (positionsError) {
      throw new Error(`Failed to fetch candidate positions: ${positionsError.message}`)
    }

    // Get latest communications for each candidate
    const { data: communications, error: communicationsError } = await supabase
      .from('candidate_communications')
      .select('candidate_id, sent_at')
      .eq('recruiter_id', recruiterId)
      .order('sent_at', { ascending: false })

    if (communicationsError) {
      console.error('Failed to fetch communications:', communicationsError)
    }

    // Group communications by candidate
    const latestCommunicationByCandidate = (communications || []).reduce((acc, comm) => {
      if (!acc[comm.candidate_id] || new Date(comm.sent_at) > new Date(acc[comm.candidate_id])) {
        acc[comm.candidate_id] = comm.sent_at
      }
      return acc
    }, {} as Record<string, string>)

    // Group candidates by stage
    const candidatesByStage = (positions || []).reduce((acc, position) => {
      const stageId = position.current_stage_id
      if (!acc[stageId]) {
        acc[stageId] = []
      }

      const profile = position.profiles as Profile
      if (profile) {
        acc[stageId].push({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
          email: profile.email,
          avatar: `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'UN',
          addedAt: position.created_at,
          notes: position.notes || undefined,
          lastCommunication: latestCommunicationByCandidate[profile.id]
        })
      }

      return acc
    }, {} as Record<string, PipelineCandidate[]>)

    // Combine stages with their candidates
    return stages.map(stage => ({
      ...stage,
      candidates: candidatesByStage[stage.id] || []
    }))

  } catch (error) {
    console.error('Error loading pipeline data:', error)
    throw error
  }
}

export async function moveCandidateToStage(
  candidateId: string,
  fromStageId: string,
  toStageId: string,
  recruiterId: string,
  notes?: string
): Promise<void> {
  try {
    // Check if candidate is already in the pipeline
    const { data: existingPosition, error: checkError } = await supabase
      .from('candidate_pipeline_positions')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('recruiter_id', recruiterId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error(`Failed to check candidate position: ${checkError.message}`)
    }

    if (existingPosition) {
      // Update existing position
      const { error } = await supabase
        .from('candidate_pipeline_positions')
        .update({
          previous_stage_id: fromStageId,
          current_stage_id: toStageId,
          moved_at: new Date().toISOString(),
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPosition.id)

      if (error) {
        throw new Error(`Failed to update candidate position: ${error.message}`)
      }
    } else {
      // Insert new position
      const { error } = await supabase
        .from('candidate_pipeline_positions')
        .insert({
          recruiter_id: recruiterId,
          candidate_id: candidateId,
          current_stage_id: toStageId,
          moved_at: new Date().toISOString(),
          notes: notes || null
        })

      if (error) {
        throw new Error(`Failed to insert candidate position: ${error.message}`)
      }
    }
  } catch (error) {
    console.error('Error moving candidate:', error)
    throw error
  }
}

export async function addCandidateToPipeline(
  candidateId: string,
  recruiterId: string,
  stageId: string,
  notes?: string
): Promise<void> {
  try {
    // Check if candidate is already in the pipeline
    const { data: existingPosition, error: checkError } = await supabase
      .from('candidate_pipeline_positions')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('recruiter_id', recruiterId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error(`Failed to check candidate position: ${checkError.message}`)
    }

    if (existingPosition) {
      throw new Error('Candidate is already in your pipeline')
    }

    // Insert new position
    const { error } = await supabase
      .from('candidate_pipeline_positions')
      .insert({
        recruiter_id: recruiterId,
        candidate_id: candidateId,
        current_stage_id: stageId,
        moved_at: new Date().toISOString(),
        notes: notes || null
      })

    if (error) {
      throw new Error(`Failed to add candidate to pipeline: ${error.message}`)
    }
  } catch (error) {
    console.error('Error adding candidate to pipeline:', error)
    throw error
  }
}

export async function removeCandidateFromPipeline(
  candidateId: string,
  recruiterId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('candidate_pipeline_positions')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('recruiter_id', recruiterId)

    if (error) {
      throw new Error(`Failed to remove candidate from pipeline: ${error.message}`)
    }
  } catch (error) {
    console.error('Error removing candidate from pipeline:', error)
    throw error
  }
}

export async function getDefaultPipelineStage(recruiterId: string): Promise<string | null> {
  try {
    // Get the "Applied" stage or the first stage
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('recruiter_id', recruiterId)
      .eq('is_active', true)
      .or('stage_name.eq.Applied,stage_order.eq.1')
      .order('stage_order')
      .limit(1)
      .single()

    if (error) {
      console.error('Failed to get default pipeline stage:', error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error('Error getting default pipeline stage:', error)
    return null
  }
}