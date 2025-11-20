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
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="h-full"
    >
      <Card className="h-full flex flex-col border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 bg-card text-card-foreground">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-xl flex items-center gap-2 text-card-foreground">
            <FileText className="w-5 h-5 text-primary" />
            {certificate.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <CardDescription className="text-sm text-muted-foreground line-clamp-3">
            {certificate.description}
          </CardDescription>

          {certificate.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {certificate.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-muted text-muted-foreground border-border">
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              asChild
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-lg hover:shadow-primary/25 px-6 py-3 text-base font-medium transition-all duration-300"
            >
              <a
                href={certificate.cert_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3"
              >
                <FileText className="w-4 h-4" />
                Ver Certificado
              </a>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}