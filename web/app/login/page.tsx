import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col px-6 pt-21 pb-9">
      <div className="flex flex-col items-center text-center">
        <Image src="/granabank.svg" alt="" width={49} height={49} priority />
        <h1 className="mt-5 text-[40px] font-medium tracking-tight text-granate">GranaBank</h1>
        <p className="mt-4 text-[17px] text-subtitle">Con cada compra, sumás orgullo granate</p>
      </div>

      <LoginForm />
    </main>
  );
}
