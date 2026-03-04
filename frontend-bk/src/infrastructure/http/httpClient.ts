export const httpGet = async <T>(path: string): Promise<T> => {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return (await response.json()) as T
}