// Fallback background removal using remove.bg API
// Only used if Cloudinary background removal fails

export async function removeBackgroundWithRemoveBg(imageUrl: string): Promise<string> {
  const apiKey = process.env.REMOVE_BG_API_KEY
  
  if (!apiKey) {
    throw new Error('REMOVE_BG_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        image_url: imageUrl,
      }),
    })

    if (!response.ok) {
      throw new Error('Remove.bg API error')
    }

    const blob = await response.blob()
    // Convert blob to data URL or upload to Cloudinary
    // For now, return the original URL if this fails
    return imageUrl
  } catch (error) {
    console.error('Remove.bg fallback failed:', error)
    throw error
  }
}

