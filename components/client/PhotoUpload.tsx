'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/shared/Button'
import Image from 'next/image'

interface PhotoUploadProps {
  onUploadComplete: () => void
}

export function PhotoUpload({ onUploadComplete }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [previewWithoutBg, setPreviewWithoutBg] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image')
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('L\'image doit faire moins de 5MB')
      return
    }

    setFile(selectedFile)
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
      // Process background removal
      processBackgroundRemoval(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
      processBackgroundRemoval(droppedFile)
    }
  }

  const processBackgroundRemoval = async (imageFile: File) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('previewOnly', 'true')

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.urlWithoutBg) {
        setPreviewWithoutBg(data.urlWithoutBg)
      }
    } catch (err) {
      console.error('Background removal preview failed:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = async () => {
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erreur lors de l\'upload')
        setIsUploading(false)
        return
      }

      // Reset
      setFile(null)
      setPreview(null)
      setPreviewWithoutBg(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onUploadComplete()
    } catch (err) {
      setError('Une erreur est survenue')
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setPreview(null)
    setPreviewWithoutBg(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!preview && (
        <div
          ref={dragRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-accent rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors min-h-[200px] flex flex-col items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            capture="environment"
          />
          <p className="text-text/60 mb-4">
            Cliquez ou glissez-déposez une image ici
          </p>
          <p className="text-sm text-text/40">
            Ou utilisez l&apos;appareil photo de votre mobile
          </p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-text mb-2">Original</h3>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-accent">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {previewWithoutBg && (
              <div>
                <h3 className="text-sm font-medium text-text mb-2">Sans fond</h3>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-accent bg-white">
                  <Image
                    src={previewWithoutBg}
                    alt="Preview sans fond"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="col-span-2 text-center py-4">
                <p className="text-text/60">Suppression du fond en cours...</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleConfirm} isLoading={isUploading} className="flex-1">
              Confirmer l&apos;upload
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

