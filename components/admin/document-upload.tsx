"use client"

import { useState } from "react"
import { FileUpload } from "@/components/ui/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"

interface DocumentUploadProps {
  title: string
  description: string
  documents: any[]
  onDocumentsChange: (documents: any[]) => void
  folder: string
  required?: boolean
  acceptedTypes?: string
}

export function DocumentUpload({
  title,
  description,
  documents = [],
  onDocumentsChange,
  folder,
  required = false,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png",
}: DocumentUploadProps) {
  const [uploadedDocs, setUploadedDocs] = useState(documents)

  const handleUpload = (files: any[]) => {
    const newDocs = files.map((file) => ({
      name: file.name,
      url: file.url,
      publicId: file.publicId,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }))
    setUploadedDocs(newDocs)
    onDocumentsChange(newDocs)
  }

  const openDocument = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {required && <Badge variant="destructive">Required</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          onUpload={handleUpload}
          accept={acceptedTypes}
          multiple={true}
          maxSize={10}
          folder={folder}
          type="document"
        />

        {uploadedDocs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Documents</h4>
            <div className="grid gap-2">
              {uploadedDocs.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openDocument(doc.url)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => window.open(doc.url)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
