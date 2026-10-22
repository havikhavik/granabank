"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { login } from "@/lib/actions";

const inputClass =
  "mt-3 h-[54px] w-full rounded-xl bg-white px-4 text-sm text-ink shadow-[0_4px_16px_rgba(0,0,0,0.06)] outline-none placeholder:text-muted focus:ring-2 focus:ring-granate/30";

// Client Component porque useActionState necesita estado en el navegador:
// guarda lo que devolvió la Server Action (el error) y si está pendiente.
export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    // noValidate: sin la validación nativa del navegador (su aviso casi no se ve),
    // el formulario siempre se envía y la Server Action explica qué está mal.
    <form action={formAction} noValidate className="mt-16 flex flex-1 flex-col">
      <label className="font-medium text-[#4c5869]">
        Email
        <input
          name="email"
          type="email"
          required
          maxLength={255}
          autoComplete="email"
          placeholder="Ingresa tu email"
          defaultValue={state?.email}
          className={inputClass}
        />
      </label>

      <label className="mt-7 font-medium text-[#4c5869]">
        Contraseña
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            maxLength={128}
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            className={`${inputClass} pr-12`}
          />
          {/* type="button" para que no envíe el formulario */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute bottom-0 right-0 flex h-[54px] items-center px-4 text-muted"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </label>

      <label className="mt-4 flex items-center gap-2 text-sm text-[#a9a9a9]">
        <input name="remember" type="checkbox" className="size-[18px] rounded accent-granate" />
        Recordarme
      </label>

      {state?.error && (
        <p role="alert" className="mt-6 rounded-xl bg-cash-in-bg px-4 py-3 text-sm text-granate">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-auto h-[60px] w-full rounded-2xl bg-granate font-semibold text-white transition-opacity disabled:opacity-70"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
