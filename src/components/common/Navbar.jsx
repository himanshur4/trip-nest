import { Button } from "@/components/ui/button";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
    const queryClient = useQueryClient();
    const user = auth.currentUser;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate=useNavigate()
    const handleLogout = async () => { 
        await signOut(auth); 
        queryClient.invalidateQueries({ queryKey: ['user'] }); 
        navigate('/')
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const NavItems = () => (
        <div className="flex flex-col sm:flex-row">
            <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive 
                            ? 'bg-white text-black border border-gray-300 shadow-sm' 
                            : 'text-gray-700 hover:text-black hover:bg-gray-50'
                    }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
            >
                My Trips
            </NavLink>
            <NavLink 
                to="/discover" 
                className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive 
                            ? 'bg-white text-black border border-gray-300 shadow-sm' 
                            : 'text-gray-700 hover:text-black hover:bg-gray-50'
                    }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
            >
                Discover
            </NavLink>
            <NavLink 
                to="/wishlist" 
                className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive 
                            ? 'bg-white text-black border border-gray-300 shadow-sm' 
                            : 'text-gray-700 hover:text-black hover:bg-gray-50'
                    }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
            >
                My Wishlist
            </NavLink>
        </div>
    );

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/dashboard" className="flex-shrink-0"> 
                        <h1 className="text-2xl sm:text-3xl font-bold font-mono bg-gradient-to-r from-green-950 to-blue-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
                            TripNest
                        </h1>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        <NavItems />
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {user && (
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-950 to-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <Button 
                                    onClick={handleLogout} 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-white hover:bg-gray-50 border-gray-300"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center space-x-2">
                        {user && (
                            <div className="w-8 h-8 bg-gradient-to-r from-green-950 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMobileMenu}
                            className="p-2"
                        >
                            {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                        </Button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                            <NavItems />
                            <div className="pt-4 border-t border-gray-200 mt-4">
                                <Button 
                                    onClick={handleLogout} 
                                    variant="outline" 
                                    size="sm"
                                    className="w-full bg-white hover:bg-gray-50 border-gray-300"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
