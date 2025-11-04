import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: File | Buffer, folder: string): Promise<{ public_id: string; secure_url: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
          })
        }
      }
    )

    if (file instanceof File) {
      // Convert File to Buffer
      file.arrayBuffer().then(buffer => {
        uploadStream.end(Buffer.from(buffer))
      }).catch(reject)
    } else {
      uploadStream.end(file)
    }
  })
}

export async function removeBackground(imageUrl: string): Promise<string> {
  try {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const urlParts = imageUrl.split('/upload/')
    if (urlParts.length < 2) {
      throw new Error('Invalid Cloudinary URL')
    }
    
    const afterUpload = urlParts[1]
    // Remove version and extension to get public_id
    const publicId = afterUpload.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '')
    
    // Use Cloudinary's background removal transformation
    const url = cloudinary.url(publicId, {
      effect: 'e_background_removal',
      format: 'png',
    })
    return url
  } catch (error) {
    console.error('Cloudinary background removal failed:', error)
    // Fallback: return original URL if removal fails
    return imageUrl
  }
}

export { cloudinary }

