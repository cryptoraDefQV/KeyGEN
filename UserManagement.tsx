import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Search, MoreHorizontal, UserPlus, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  // Form state for new user
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Apply search filter
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.discordUsername && user.discordUsername.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);
  
  // Mutation for adding a new user
  const addUserMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/users", {
        username,
        password,
        email,
        discordId,
        discordUsername: discordId,
        isAdmin
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User added successfully",
        description: `User ${username} has been created`,
        variant: "default",
      });
      setIsAddUserDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to add user",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/users/${userId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete user",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Reset form fields
  const resetForm = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setDiscordId("");
    setIsAdmin(false);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }
    
    addUserMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button 
          onClick={() => setIsAddUserDialogOpen(true)}
          className="bg-[#0078D4] hover:bg-[#006CBE]"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#797775]" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[#252525] border-[#333333] text-[#EDEBE9]"
        />
      </div>
      
      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="border rounded-md border-[#333333] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1E1E1E]">
              <TableRow className="hover:bg-[#252525] border-[#333333]">
                <TableHead className="text-[#EDEBE9]">ID</TableHead>
                <TableHead className="text-[#EDEBE9]">Username</TableHead>
                <TableHead className="text-[#EDEBE9]">Discord</TableHead>
                <TableHead className="text-[#EDEBE9]">Email</TableHead>
                <TableHead className="text-[#EDEBE9]">Role</TableHead>
                <TableHead className="text-[#EDEBE9]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-[#252525] border-[#333333]">
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.discordUsername || "—"}</TableCell>
                    <TableCell>{user.email || "—"}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="warning" className="flex items-center w-fit">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[#797775] border-[#333333] bg-[#1E1E1E]">
                          User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#252525] border-[#333333]">
                          <DropdownMenuItem 
                            onClick={() => {
                              // View user licenses functionality
                              toast({
                                description: `Viewing licenses for ${user.username}`
                              });
                            }}
                          >
                            View Licenses
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              // Edit user functionality
                              toast({
                                description: `Editing user ${user.username}`
                              });
                            }}
                          >
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-[#797775]">
                    {searchTerm ? (
                      <>
                        <p>No users found matching "{searchTerm}"</p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchTerm("")}
                          className="text-[#0078D4] mt-2"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <>
                        <p>No users found</p>
                        <Button 
                          variant="link" 
                          onClick={() => setIsAddUserDialogOpen(true)}
                          className="text-[#0078D4] mt-2"
                        >
                          Add your first user
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-[#333333] text-[#EDEBE9]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription className="text-[#797775]">
              Create a new user account for license management
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username <span className="text-destructive">*</span>
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email (optional)"
                className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="discordId" className="text-sm font-medium">
                Discord Username
              </label>
              <Input
                id="discordId"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="Enter Discord username (optional)"
                className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-[#333333] bg-[#252525]"
              />
              <label htmlFor="isAdmin" className="text-sm font-medium">
                Grant administrator privileges
              </label>
            </div>
            
            <DialogFooter className="pt-4 border-t border-[#333333] mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddUserDialogOpen(false);
                  resetForm();
                }}
                className="border-[#333333]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addUserMutation.isPending}
                className="bg-[#0078D4] hover:bg-[#006CBE] text-white"
              >
                {addUserMutation.isPending ? "Adding..." : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
