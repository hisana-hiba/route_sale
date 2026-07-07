import { useLocation } from 'react-router-dom'
import { getModuleConfig } from '@/config/modules'
import { ModuleLayout } from '@/pages/layouts/ModuleLayout'

export function ModulePage() {
  const location = useLocation()
  const config = getModuleConfig(location.pathname)
  return <ModuleLayout key={config.slug} config={config} />
}
