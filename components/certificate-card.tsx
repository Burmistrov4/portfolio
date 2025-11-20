import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { motion } from 'framer-motion'

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
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <motion.div variants={cardVariants}>
      <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {certificate.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {certificate.description}
        </CardDescription>

        {certificate.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {certificate.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-lg hover:shadow-blue-500/25 px-6 py-3 text-lg font-semibold"
          >
            <a
              href={certificate.cert_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3"
            >
              <FileText className="w-5 h-5" />
              Ver Certificado
            </a>
          </Button>
        </motion.div>
      </CardContent>
    </Card>
    </motion.div>
  )
}