import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Code, 
  Rocket, 
  Archive,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface ProjectStatusBadgeProps {
  status: string
  className?: string
}

export function ProjectStatusBadge({ status, className = "" }: ProjectStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "planning":
        return {
          label: "Planejamento",
          icon: Clock,
          className: "bg-blue-100 text-blue-800 border-blue-200",
          description: "Projeto em fase de planejamento"
        }
      case "development":
        return {
          label: "Desenvolvimento", 
          icon: Code,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          description: "Projeto em desenvolvimento ativo"
        }
      case "deployed":
        return {
          label: "Publicado",
          icon: Rocket,
          className: "bg-green-100 text-green-800 border-green-200",
          description: "Projeto publicado e ativo"
        }
      case "archived":
        return {
          label: "Arquivado",
          icon: Archive,
          className: "bg-gray-100 text-gray-800 border-gray-200",
          description: "Projeto arquivado"
        }
      case "testing":
        return {
          label: "Testes",
          icon: CheckCircle,
          className: "bg-purple-100 text-purple-800 border-purple-200",
          description: "Projeto em fase de testes"
        }
      case "paused":
        return {
          label: "Pausado",
          icon: AlertCircle,
          className: "bg-orange-100 text-orange-800 border-orange-200",
          description: "Projeto temporariamente pausado"
        }
      default:
        return {
          label: status,
          icon: Clock,
          className: "bg-gray-100 text-gray-800 border-gray-200",
          description: "Status do projeto"
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge 
      className={`px-3 py-1 flex items-center space-x-2 ${config.className} ${className}`}
      title={config.description}
    >
      <Icon className="w-3 h-3" />
      <span className="font-medium">{config.label}</span>
    </Badge>
  )
}
