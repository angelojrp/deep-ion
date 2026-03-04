let accessToken: string | null = null

export const tokenService = {
  getAccessToken: (): string | null => accessToken,
  setAccessToken: (token: string): void => {
    accessToken = token
  },
  clear: (): void => {
    accessToken = null
  }
}