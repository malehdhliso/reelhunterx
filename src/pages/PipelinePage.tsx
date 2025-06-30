import React from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import DragDropPipeline from '../components/pipeline/DragDropPipeline'

const PipelinePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <DragDropPipeline />
      </div>
    </DashboardLayout>
  )
}

export default PipelinePage