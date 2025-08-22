import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@/components/common/GoogleIcon";

export default function SignupPage() {
  const [name,setName]=useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const queryClient=useQueryClient();
  const signupMutation = useMutation({
    mutationFn: (credentials) => createUserWithEmailAndPassword(auth, credentials.email, credentials.password),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["user"] })
    },
    onError: (error) => {
      setError(error.message.replace('Firebase: ', ''));
    }
  });

  const googleSignupMutation = useMutation({
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
    signupMutation.mutate({ email, password });
  };

  const handleGoogleSignup = () => {
     setError(null);
     googleSignupMutation.mutate();
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription className="text-gray-800">
            Create an account to start planning your trips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-4">
              <Label>Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
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
              <Label htmlFor="password">Password</Label>
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
            <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? 'Creating account...' : 'Create an account'}
            </Button>
          </form>
          <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignup} disabled={googleSignupMutation.isPending}>
              <GoogleIcon className="mr-2 h-4 w-4" /> 
              {googleSignupMutation.isPending ? 'Redirecting...' : 'Sign up with Google'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}