export const gateAdapter = {
  approve: async (issueNumber: number, command: string): Promise<{ success: boolean }> => {
    return Promise.resolve({ success: issueNumber > 0 && command.length > 0 })
  }
}