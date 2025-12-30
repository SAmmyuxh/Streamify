import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import { toast } from "react-hot-toast";

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Login failed. Please try again."
      );
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;