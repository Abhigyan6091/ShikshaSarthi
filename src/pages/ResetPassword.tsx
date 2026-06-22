import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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

const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: "Error",
                description: "Password must be at least 8 characters long",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            await axios.post(`${API_URL}/api/auth/reset-password`, {
                email,
                otp,
                newPassword
            });

            toast({
                title: "Success",
                description: "Password has been reset successfully. Please login.",
            });

            navigate("/login");
        } catch (error: any) {
            toast({
                title: "Reset Failed",
                description: error?.response?.data?.error || "Invalid OTP or request",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
                        <BookOpen className="h-8 w-8 text-edu-blue" />
                    </div>
                    <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter the 6-digit code sent to your email
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="registered@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code (OTP)</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Min 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                        <Link to="/login" className="flex items-center text-sm text-edu-blue hover:underline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ResetPassword;
