'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/shared/validationSchemas';
import AuthCard from '@/shared/AuthCard';
import Button from '@/shared/Button';
import Input from '@/shared/Input';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(error.message);
    } else {
      router.push("/dashboard");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-200 px-4">
      <AuthCard
        title="Sign in to your account"
        bottomText="Don’t have an account?"
        bottomLink="/register"
        bottomLinkText="Register"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          {serverError && (
            <p className="text-red-600 text-sm mt-1">{serverError}</p>
          )}
          <Button type="submit" loading={isSubmitting} fullWidth>
            Log In
          </Button>
        </form>
      </AuthCard>
    </div>
  );
};

export default LoginPage;
