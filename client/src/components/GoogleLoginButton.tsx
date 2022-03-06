import React from "react";

const GoogleLoginButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-start dark:bg-blue-600 hover:shadow-sm rounded text-lg hover:ring-2 w-full h-12 border border-gray-200 dark:border-0">
    <div className="w-12 h-full flex justify-center items-center bg-white rounded-tl rounded-bl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/google_logo.svg" height={20} width={20} alt="google logo" />
    </div>
    <p className="text-gray-600 dark:text-white ml-2 pt-2 pb-2 pr-2">Sign in with Google</p>
  </button>
);

export default GoogleLoginButton;
