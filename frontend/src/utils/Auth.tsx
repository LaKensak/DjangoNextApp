// utils/Auth.tsx
"use client";

import React, { useEffect, ComponentType } from "react";
import { useRouter } from "next/navigation";

// Définir le type générique pour WrappedComponent
const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  return (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        router.push("/login"); // Redirection si pas connecté
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
