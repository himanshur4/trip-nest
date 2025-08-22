import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@/components/common/GoogleIcon";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const queryClient=useQueryClient();
  const loginMutation = useMutation({
    mutationFn: (credentials) => signInWithEmailAndPassword(auth, credentials.email, credentials.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
    onError: (error) => {
      setError(error.message.replace('Firebase: ', ''));
    }
  });

  const googleLoginMutation = useMutation({
    mutationFn: () => signInWithPopup(auth, googleProvider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
    onError: (error) => {
       setError(error.message.replace('Firebase: ', ''));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
    
  };

  const handleGoogleLogin = () => {
     setError(null);
     googleLoginMutation.mutate();
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Welcome back!</CardTitle>
          <CardDescription className="text-gray-900">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
           <Button variant="outline" className="w-full mt-4" onClick={handleGoogleLogin} disabled={googleLoginMutation.isPending}>
              <GoogleIcon className="mr-2 h-4 w-4" /> 
              {googleLoginMutation.isPending ? 'Redirecting...' : 'Login with Google'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}