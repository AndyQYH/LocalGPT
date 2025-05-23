'use server'
import RegisterForm from '@/components/ui/register-form';
import { FormEvent } from 'react'
import { signOut } from "@/auth"
import Image from 'next/image';

export default async function SignOutPage() {
  //const router = useRouter()
  return (
    <>
      <Image
          src="/DataON.webp"
          alt="SCU BG"
          className="opacity-15"
          sizes="100vw"
          fill
        />
        <main className="flex items-center justify-center md:h-screen">
          <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
            <div className="flex h-20 w-full items-end rounded-lg bg-yellow-400 p-3 md:h-30">
              <div className="w-32 text-white md:w-36">
                DataON Azure Local AI Playground
              </div>
            </div>
            <RegisterForm/>
          </div>
        </main>
    
    </>
    
  );
}
