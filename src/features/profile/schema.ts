import { z } from 'zod'

export const profileFormSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Informe o nome de exibição'),
    username: z
      .string()
      .trim()
      .min(3, 'Use pelo menos 3 caracteres')
      .regex(/^[a-z0-9_]+$/i, 'Use apenas letras, números e _'),
    email: z.email('Informe um e-mail válido'),
    ensSuffix: z.string().min(1, 'Selecione o sufixo'),
    ensName: z
      .string()
      .trim()
      .min(1, 'Informe o nome ENS')
      .regex(/^[a-z0-9-]+$/i, 'Use apenas letras, números e hífen'),
    walletNickname: z.string().trim().min(2, 'Informe o apelido da carteira'),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmNewPassword: z.string(),
  })
  .superRefine((v, ctx) => {
    if (!v.currentPassword && !v.newPassword && !v.confirmNewPassword) return
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })

    if (!v.currentPassword) issue('currentPassword', 'Informe a senha atual')
    if (v.newPassword.length < 8) issue('newPassword', 'Use pelo menos 8 caracteres')
    else if (!/[A-Za-z]/.test(v.newPassword) || !/\d/.test(v.newPassword)) issue('newPassword', 'Use letras e números')
    else if (v.newPassword === v.currentPassword) issue('newPassword', 'A nova senha deve ser diferente da atual')
    if (v.confirmNewPassword !== v.newPassword) issue('confirmNewPassword', 'As senhas não coincidem')
  })

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const ENS_SUFFIXES = ['.eth'] as const
