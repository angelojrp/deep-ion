import { gateAdapter } from '@infrastructure/api/adapters/gateAdapter'

export const approveGateUseCase = async (issueNumber: number, command: string): Promise<boolean> => {
  const result = await gateAdapter.approve(issueNumber, command)
  return result.success
}