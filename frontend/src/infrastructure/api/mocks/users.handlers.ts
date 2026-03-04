import { http, HttpResponse } from 'msw'
import data from './fixtures/users.json'

export const usersHandlers = [
  // List all users
  http.get('/api/users', () => {
    const summaries = data.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles,
      status: u.status,
      inviteStatus: u.inviteStatus,
      photoUrl: u.profile?.photoUrl ?? null,
      createdAt: u.createdAt,
    }))
    return HttpResponse.json(summaries)
  }),

  // Get user detail
  http.get('/api/users/:id', ({ params }) => {
    const user = data.users.find((u) => u.id === params.id)
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(user)
  }),

  // Get available roles
  http.get('/api/users/roles', () => {
    return HttpResponse.json(data.availableRoles)
  }),

  // Create user (admin) — sends invite email
  http.post('/api/users', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newUser = {
      id: `usr-${String(data.users.length + 1).padStart(3, '0')}`,
      name: body.name as string,
      email: body.email as string,
      roles: body.roles as string[],
      status: 'pending',
      inviteStatus: 'pending',
      inviteSentAt: new Date().toISOString(),
      inviteAcceptedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: null,
    }
    return HttpResponse.json(
      { ...newUser, inviteEmailSent: true },
      { status: 201 },
    )
  }),

  // Resend invite email
  http.post('/api/users/:id/resend-invite', ({ params }) => {
    const user = data.users.find((u) => u.id === params.id)
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({ success: true, email: user.email })
  }),

  // Get current user profile (self)
  http.get('/api/profile', () => {
    // Simulates the logged-in user (first user)
    const currentUser = data.users[0]
    return HttpResponse.json(currentUser)
  }),

  // Update profile (self)
  http.put('/api/profile', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const currentUser = data.users[0]
    const updatedProfile = {
      ...currentUser.profile,
      ...body,
      userId: currentUser.id,
      updatedAt: new Date().toISOString(),
      completedAt: currentUser.profile?.completedAt ?? new Date().toISOString(),
    }
    return HttpResponse.json({
      ...currentUser,
      profile: updatedProfile,
      updatedAt: new Date().toISOString(),
    })
  }),

  // Upload photo (returns URL)
  http.post('/api/profile/photo', async () => {
    return HttpResponse.json({
      photoUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${Date.now()}`,
    })
  }),

  // Delete user
  http.delete('/api/users/:id', ({ params }) => {
    const user = data.users.find((u) => u.id === params.id)
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
