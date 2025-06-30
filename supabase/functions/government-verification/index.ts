import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Type definitions
interface VerificationRequest {
  verificationType: 'identity' | 'education' | 'employment' | 'license' | 'security_clearance' | 'background_check'
  agency: 'ssa' | 'dhs' | 'dol' | 'education' | 'state_licensing' | 'irs'
  verificationData: Record<string, any>
}

interface GovernmentAPIResponse {
  success: boolean
  verificationId: string
  status: 'verified' | 'failed' | 'pending'
  verifiedData?: Record<string, any>
  score?: number
  expiryDate?: string
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req)
    
    // Parse and validate request
    const verificationRequest = await parseRequest(req)
    
    // Initialize Supabase client
    const supabase = createSupabaseClient()
    
    // Get user's profile
    const profile = await getUserProfile(supabase, user.id)
    
    // Create verification request record
    const requestRecord = await createVerificationRequest(
      supabase, 
      profile.id, 
      verificationRequest
    )
    
    // Call appropriate government API
    const verificationResult = await callGovernmentAPI(verificationRequest)
    
    // Save verification result
    const verification = await saveVerificationResult(
      supabase,
      profile.id,
      verificationRequest,
      verificationResult,
      requestRecord.id
    )
    
    // Update profile ReelPass status
    await updateReelPassStatus(supabase, profile.id)
    
    return createSuccessResponse({
      verificationId: verification.id,
      status: verificationResult.status,
      score: verificationResult.score,
      message: 'Verification request processed successfully'
    })
    
  } catch (error) {
    return createErrorResponse(error)
  }
})

// Authentication helper
async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing authorization header')
  }

  const supabase = createSupabaseClient()
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

// Request parsing helper
async function parseRequest(req: Request): Promise<VerificationRequest> {
  const body = await req.json()
  
  const { verificationType, agency, verificationData } = body
  
  if (!verificationType || !agency || !verificationData) {
    throw new Error('Missing required fields: verificationType, agency, verificationData')
  }
  
  return { verificationType, agency, verificationData }
}

// Supabase client factory
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Get user profile
async function getUserProfile(supabase: any, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return profile
}

// Create verification request record
async function createVerificationRequest(
  supabase: any, 
  profileId: string, 
  request: VerificationRequest
) {
  const { data: requestRecord, error } = await supabase
    .from('verification_requests')
    .insert({
      profile_id: profileId,
      verification_type: request.verificationType,
      agency: request.agency,
      request_data: request.verificationData,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create verification request: ${error.message}`)
  }

  return requestRecord
}

// Call government API based on agency
async function callGovernmentAPI(request: VerificationRequest): Promise<GovernmentAPIResponse> {
  switch (request.agency) {
    case 'ssa':
      return await callSSAAPI(request)
    case 'education':
      return await callEducationAPI(request)
    case 'state_licensing':
      return await callStateLicensingAPI(request)
    case 'dhs':
      return await callDHSAPI(request)
    default:
      throw new Error(`Unsupported agency: ${request.agency}`)
  }
}

// Social Security Administration API
async function callSSAAPI(request: VerificationRequest): Promise<GovernmentAPIResponse> {
  // In production, integrate with SSA's SSNVS (Social Security Number Verification Service)
  console.log('Calling SSA API for identity verification:', request.verificationData)
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock response based on verification data
  const { ssn, firstName, lastName, dateOfBirth } = request.verificationData
  
  if (!ssn || !firstName || !lastName || !dateOfBirth) {
    return {
      success: false,
      verificationId: `ssa-${Date.now()}`,
      status: 'failed'
    }
  }
  
  return {
    success: true,
    verificationId: `ssa-${Date.now()}`,
    status: 'verified',
    verifiedData: {
      name_match: true,
      ssn_valid: true,
      death_master_file_hit: false
    },
    score: 95
  }
}

// Department of Education API (National Student Clearinghouse)
async function callEducationAPI(request: VerificationRequest): Promise<GovernmentAPIResponse> {
  console.log('Calling Education API for degree verification:', request.verificationData)
  
  // Simulate API call to National Student Clearinghouse
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const { studentId, institutionName, degreeType, graduationDate } = request.verificationData
  
  return {
    success: true,
    verificationId: `nsc-${Date.now()}`,
    status: 'verified',
    verifiedData: {
      degree_confirmed: true,
      institution_match: true,
      graduation_date_match: true,
      enrollment_status: 'graduated'
    },
    score: 90
  }
}

// State Professional Licensing API
async function callStateLicensingAPI(request: VerificationRequest): Promise<GovernmentAPIResponse> {
  console.log('Calling State Licensing API:', request.verificationData)
  
  // Simulate API call to state licensing board
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const { licenseNumber, licenseType, state } = request.verificationData
  
  return {
    success: true,
    verificationId: `license-${Date.now()}`,
    status: 'verified',
    verifiedData: {
      license_active: true,
      license_type_match: true,
      no_disciplinary_actions: true
    },
    score: 85,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
  }
}

// Department of Homeland Security API (E-Verify)
async function callDHSAPI(request: VerificationRequest): Promise<GovernmentAPIResponse> {
  console.log('Calling DHS E-Verify API:', request.verificationData)
  
  // Simulate E-Verify API call
  await new Promise(resolve => setTimeout(resolve, 2500))
  
  return {
    success: true,
    verificationId: `dhs-${Date.now()}`,
    status: 'verified',
    verifiedData: {
      work_authorized: true,
      document_valid: true,
      identity_confirmed: true
    },
    score: 100
  }
}

// Save verification result to database
async function saveVerificationResult(
  supabase: any,
  profileId: string,
  request: VerificationRequest,
  result: GovernmentAPIResponse,
  requestId: string
) {
  // Save to government_verifications table
  const { data: verification, error: verificationError } = await supabase
    .from('government_verifications')
    .insert({
      profile_id: profileId,
      verification_type: request.verificationType,
      agency: request.agency,
      verification_id: result.verificationId,
      status: result.status,
      verified_data: result.verifiedData || {},
      verification_date: result.status === 'verified' ? new Date().toISOString() : null,
      expiry_date: result.expiryDate || null,
      verification_score: result.score || null
    })
    .select()
    .single()

  if (verificationError) {
    throw new Error(`Failed to save verification: ${verificationError.message}`)
  }

  // Update verification request status
  await supabase
    .from('verification_requests')
    .update({
      status: result.status,
      external_request_id: result.verificationId,
      completed_at: new Date().toISOString()
    })
    .eq('id', requestId)

  // Save specific verification type data
  if (result.status === 'verified') {
    await saveSpecificVerificationData(supabase, profileId, request, result, verification.id)
  }

  return verification
}

// Save specific verification data to appropriate tables
async function saveSpecificVerificationData(
  supabase: any,
  profileId: string,
  request: VerificationRequest,
  result: GovernmentAPIResponse,
  verificationId: string
) {
  switch (request.verificationType) {
    case 'education':
      await supabase
        .from('education_verifications')
        .insert({
          profile_id: profileId,
          institution_name: request.verificationData.institutionName,
          degree_type: request.verificationData.degreeType,
          field_of_study: request.verificationData.fieldOfStudy,
          graduation_date: request.verificationData.graduationDate,
          verification_status: 'verified',
          clearinghouse_id: result.verificationId,
          verification_id: verificationId
        })
      break

    case 'license':
      await supabase
        .from('professional_licenses')
        .insert({
          profile_id: profileId,
          license_type: request.verificationData.licenseType,
          license_number: request.verificationData.licenseNumber,
          issuing_authority: request.verificationData.issuingAuthority,
          state_code: request.verificationData.state,
          issue_date: request.verificationData.issueDate,
          expiry_date: result.expiryDate,
          status: 'verified',
          verification_id: verificationId
        })
      break

    case 'employment':
      await supabase
        .from('employment_verifications')
        .insert({
          profile_id: profileId,
          employer_name: request.verificationData.employerName,
          job_title: request.verificationData.jobTitle,
          start_date: request.verificationData.startDate,
          end_date: request.verificationData.endDate,
          employment_type: request.verificationData.employmentType,
          verification_status: 'verified',
          verification_method: 'government_records',
          verification_id: verificationId
        })
      break
  }
}

// Update ReelPass status
async function updateReelPassStatus(supabase: any, profileId: string) {
  // Calculate new ReelPass score
  const { data: reelpassData, error } = await supabase
    .rpc('calculate_reelpass_score', { candidate_profile_id: profileId })

  if (error) {
    console.error('Failed to calculate ReelPass score:', error)
    return
  }

  const reelpassScore = reelpassData || 0
  const isVerified = reelpassScore >= 80

  // Update profile with new ReelPass status
  await supabase
    .from('profiles')
    .update({
      completion_score: reelpassScore,
      // Add reelpass_verified field if it doesn't exist
      // reelpass_verified: isVerified
    })
    .eq('id', profileId)
}

// Response helpers
function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function createErrorResponse(error: any) {
  console.error('Error in government-verification:', error)
  
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}