import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  changePassword,
  fetchProfile,
  removeAvatar,
  updateProfile,
  uploadAvatar,
  type Profile,
} from '@/api/profile'
import { useOwner } from '@/features/auth/session'

export const profileKeys = { of: (owner: string) => ['profile', owner] as const }

export function useProfile() {
  const owner = useOwner()
  return useQuery({
    queryKey: profileKeys.of(owner),
    queryFn: ({ signal }) => fetchProfile(signal),
    staleTime: 60_000,
    retry: (count, error) => count < 2 && !(isAxiosError(error) && error.response && error.response.status < 500),
  })
}

function useProfileCache() {
  const queryClient = useQueryClient()
  const owner = useOwner()
  return (profile: Profile) => queryClient.setQueryData(profileKeys.of(owner), profile)
}

export function useUpdateProfile() {
  return useMutation({ mutationFn: updateProfile, onSuccess: useProfileCache() })
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword })
}

export function useUploadAvatar() {
  return useMutation({ mutationFn: uploadAvatar, onSuccess: useProfileCache() })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()
  const key = profileKeys.of(useOwner())
  const setProfile = useProfileCache()
  return useMutation({
    mutationFn: removeAvatar,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Profile>(key)
      if (previous) queryClient.setQueryData<Profile>(key, { ...previous, avatarUrl: null })
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSuccess: setProfile,
  })
}
