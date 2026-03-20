import { ShieldAlert } from 'lucide-react'
import { Role } from '@/stores/useAuthStore'

export function RestrictedAccess({ requiredRoles }: { requiredRoles: Role[] }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
      <div className="bg-rose-100 p-4 rounded-full">
        <ShieldAlert className="w-10 h-10 text-rose-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Acesso Restrito</h2>
      <p className="text-slate-500 max-w-md">
        Seu perfil atual não tem permissão para acessar ou executar ações nesta área.
      </p>
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-sm text-left max-w-md w-full mt-4 shadow-sm">
        <span className="font-bold text-slate-700 block mb-2">Perfis Autorizados:</span>
        <div className="flex flex-wrap gap-2">
          {requiredRoles.includes('Direcao_Admin') ? (
            requiredRoles.map((r) => (
              <span
                key={r}
                className="bg-white border border-slate-200 px-2 py-1 rounded text-xs font-mono text-slate-600"
              >
                {r}
              </span>
            ))
          ) : (
            <>
              {requiredRoles.map((r) => (
                <span
                  key={r}
                  className="bg-white border border-slate-200 px-2 py-1 rounded text-xs font-mono text-slate-600"
                >
                  {r}
                </span>
              ))}
              <span className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded text-xs font-mono text-emerald-700">
                Direcao_Admin
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
