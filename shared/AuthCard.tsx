import React from 'react';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
  bottomText: string;
  bottomLink: string;
  bottomLinkText: string;
}

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  children,
  bottomText,
  bottomLink,
  bottomLinkText,
}) => (
  <div className="p-8 max-w-md w-full bg-white shadow-xl rounded-2xl">
    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
      {title}
    </h1>
    {children}
    <p className="mt-4 text-sm text-center text-gray-500">
      {bottomText}{" "}
      <a
        href={bottomLink}
        className="text-indigo-600 hover:underline cursor-pointer"
      >
        {bottomLinkText}
      </a>
    </p>
  </div>
);

export default AuthCard;
