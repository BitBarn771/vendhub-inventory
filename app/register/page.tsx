'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { supabase } from '@/lib/supabase';
import { registerSchema } from '@/shared/validationSchemas';
import { yupResolver } from '@hookform/resolvers/yup';
import AuthCard from '@/shared/AuthCard';
import Button from '@/shared/Button';
import Input from '@/shared/Input';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterPage = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: FormData) => {
    setSuccessMessage("");
    setServerError("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (error) {
      setServerError(error.message);
    } else {
      setSuccessMessage("Account created! Check your email to confirm.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-200 px-4">
      <AuthCard
        title="Create an Account"
        bottomText="Already have an account?"
        bottomLink="/login"
        bottomLinkText="Log in"
      >
        {successMessage ? (
          <div className="bg-green-100 text-green-800 p-4 rounded mb-4 text-center">
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                placeholder="Last Name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
            <Input
              type="email"
              placeholder="Email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              type="password"
              placeholder="Password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            {serverError && (
              <p className="text-red-600 text-sm mt-1">{serverError}</p>
            )}
            <Button type="submit" loading={isSubmitting} fullWidth>
              Sign Up
            </Button>
          </form>
        )}
      </AuthCard>
    </div>
  );
};

export default RegisterPage;
