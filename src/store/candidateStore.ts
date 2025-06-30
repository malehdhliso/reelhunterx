import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Candidate {
  id: string
  full_name: string
  headline: string
  email: string
  reelpass_verified: boolean
  skills: string[]
  projects: Project[]
  match_score?: number
  created_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  tech_stack: string[]
  demo_url?: string
  github_url?: string
}

interface CandidateStore {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  searchResults: Candidate[]
  isLoading: boolean
  error: string | null
  
  // Actions
  searchCandidates: (query: string, filters?: SearchFilters) => Promise<void>
  selectCandidate: (candidate: Candidate) => void
  clearSelection: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export interface SearchFilters {
  techStack?: string[]
  experienceLevel?: string
  reelpassOnly?: boolean
}

export const useCandidateStore = create<CandidateStore>()(
  devtools(
    (set, get) => ({
      candidates: [],
      selectedCandidate: null,
      searchResults: [],
      isLoading: false,
      error: null,

      searchCandidates: async (query: string, filters?: SearchFilters) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Call Supabase Edge Function
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Mock data for now
          const mockResults: Candidate[] = [
            {
              id: '1',
              full_name: 'Sarah Chen',
              headline: 'Senior Full-Stack Developer',
              email: 'sarah.chen@example.com',
              reelpass_verified: true,
              skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
              projects: [
                {
                  id: '1',
                  title: 'E-commerce Platform',
                  description: 'Built a scalable e-commerce solution with React and Node.js',
                  tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
                  demo_url: 'https://demo.example.com',
                  github_url: 'https://github.com/example/project'
                }
              ],
              match_score: 92,
              created_at: '2024-01-15T10:00:00Z'
            },
            {
              id: '2',
              full_name: 'Marcus Rodriguez',
              headline: 'DevOps Engineer & Cloud Architect',
              email: 'marcus.r@example.com',
              reelpass_verified: true,
              skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
              projects: [
                {
                  id: '2',
                  title: 'Microservices Infrastructure',
                  description: 'Designed and implemented cloud-native infrastructure',
                  tech_stack: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
                  demo_url: 'https://infra-demo.example.com'
                }
              ],
              match_score: 87,
              created_at: '2024-01-10T14:30:00Z'
            }
          ]
          
          set({ 
            searchResults: mockResults,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Search failed',
            isLoading: false 
          })
        }
      },

      selectCandidate: (candidate) => {
        set({ selectedCandidate: candidate })
      },

      clearSelection: () => {
        set({ selectedCandidate: null })
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'candidate-store',
    }
  )
)