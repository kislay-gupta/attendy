import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { router } from "expo-router";
import useLoader from "../hooks/use-loader";
import Loader from "../components/Loader";

const Root = () => {
  const { startLoading, stopLoading, isLoading } = useLoader();

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    startLoading();
    if (isAuthenticated) {
      router.replace("/(root)/");
      stopLoading();
    }
  }, [isAuthenticated]);
  if (isLoading) {
    return <Loader />;
  }

  return <Redirect href={"/login"} />;
};
export default Root;
