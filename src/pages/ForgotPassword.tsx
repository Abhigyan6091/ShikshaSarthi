import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Header from "@/components/Header";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({
                title: "Error",
                description: "Please enter your registered email address",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email });

            toast({
                title: "OTP Sent",
                description: "If an account exists for this email, an OTP has been sent.",
            });

            // Navigate to reset password page and pass email
            navigate("/reset-password", { state: { email } });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.error || "Failed to process request",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <div className="flex flex-1 items-center justify-center px-4 py-10">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
                        <BookOpen className="h-8 w-8 text-edu-blue" />
                    </div>
                    <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to receive a password reset code
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Registered Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Sending OTP..." : "Request Reset Code"}
                        </Button>
                        <Link to="/login" className="flex items-center text-sm text-edu-blue hover:underline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
