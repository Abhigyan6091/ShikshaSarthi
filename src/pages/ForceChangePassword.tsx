import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Lock, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Header from "@/components/Header";

const API_URL = import.meta.env.VITE_API_URL;

const ForceChangePassword: React.FC = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const userRole = localStorage.getItem('userRole');
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        // If user is not logged in or doesn't need to change password, redirect
        if (!userData || !userData.must_change_password) {
            navigate('/login');
        }
    }, [userData, navigate]);

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

            const endpoint = `${API_URL}/api/auth/change-password`;
            const payload: any = {
                userId: userData.studentId || userData.teacherId || userData.username || userData._id,
                role: userRole,
                newPassword
            };

            await axios.post(endpoint, payload);

            toast({
                title: "Success",
                description: "Password changed successfully. You can now access your dashboard.",
            });

            // Update local storage
            const updatedUser = { ...userData, must_change_password: false };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            // Update role-specific storage
            if (userRole) {
                localStorage.setItem(userRole, JSON.stringify({ [userRole]: updatedUser }));
            }

            navigate(`/${userRole}`);
        } catch (error: any) {
            toast({
                title: "Change Failed",
                description: error?.response?.data?.error || "Failed to update password",
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
            <Card className="w-full max-w-md shadow-lg border-edu-blue/20">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="flex items-center justify-center p-3 bg-edu-blue/10 rounded-full mb-2 text-edu-blue">
                        <Lock className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl text-center">Change Password</CardTitle>
                    <CardDescription className="text-center flex items-center justify-center text-amber-600 font-medium whitespace-pre-wrap">
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                        Security requirement: You must change your temporary password before proceeding.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter a strong password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-edu-blue hover:bg-edu-blue/90" type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Password & Continue"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            </div>
        </div>
    );
};

export default ForceChangePassword;
