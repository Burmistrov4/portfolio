import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

interface Certificate {
  id: string
  title: string
  description: string
  technologies: string[]
  cert_url: string
}

/**
 * @description Component to display a certificate card.
 * @param {Certificate} certificate The certificate data.
 * @returns {JSX.Element} The certificate card.
 */
export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {certificate.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {certificate.description}
        </CardDescription>

        {certificate.technologies && certificate.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {certificate.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        <Button
          asChild
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <a
            href={certificate.cert_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Ver Certificado
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}