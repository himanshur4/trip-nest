import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import CreateItineraryDialog from "@/components/common/CreateItineraryDialog";
import ItineraryCard from "@/components/common/ItineraryCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar } from "lucide-react";

const ItineraryCardSkeleton = () => (
  <Card className="overflow-hidden group">
    <CardContent className="p-0 relative">
      <Skeleton className="w-full h-48" />
      <div className="absolute top-2 right-2">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const user = auth.currentUser;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: itineraries, isLoading, error } = useQuery({
    queryKey: ['itineraries', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, "itineraries"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!user,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }) => {
      const itineraryRef = doc(db, "itineraries", id);
      await updateDoc(itineraryRef, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', user?.uid] });
    },
    onError: (error) => {
      console.error("Error updating favorite status:", error);
    }
  });

  const filteredItineraries = useMemo(() => {
    if (!itineraries) return [];
    
    return itineraries.filter(itinerary => {
      const matchesSearch = itinerary.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesType = true;
      if (filterType === 'favorites') {
        matchesType = itinerary.isFavorite;
      } else if (filterType !== 'all') {
        matchesType = itinerary.type === filterType;
      }

      return matchesSearch && matchesType;
    });
  }, [itineraries, searchTerm, filterType]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-mono tracking-tighter">
          Your Itineraries
        </h1>
        <p className="text-gray-800 mt-2">Manage and explore your travel plans and adventures.</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 max-w-4xl mx-auto">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input 
            type="search" 
            placeholder="Search destinations..."
            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Select onValueChange={setFilterType} defaultValue="all">
            <SelectTrigger className="w-full lg:w-[180px] h-12 bg-gray-50 border-gray-200">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="leisure">Leisure</SelectItem>
              <SelectItem value="work">Work</SelectItem>
            </SelectContent>
          </Select>
          <CreateItineraryDialog />
        </div>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">Could not fetch your itineraries. Please try again later.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:px-0 md:px-5 lg:px-20 xl:px-25">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ItineraryCardSkeleton key={index} />
          ))
        ) : filteredItineraries && filteredItineraries.length > 0 ? (
          filteredItineraries.map(itinerary => (
            <ItineraryCard 
              key={itinerary.id} 
              itinerary={itinerary} 
              onToggleFavorite={toggleFavoriteMutation.mutate}
            />
          ))
        ) : null}
      </div>

      {!isLoading && (!filteredItineraries || filteredItineraries.length === 0) && (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin className="h-12 w-12 text-gray-800" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            {searchTerm || filterType !== 'all' ? 'No Itineraries Found' : 'No Itineraries Yet'}
          </h2>
          <p className="text-gray-800 mb-6 max-w-md mx-auto">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria to find your itineraries.' 
              : 'Start planning your next adventure by creating your first travel itinerary!'
            }
          </p>
          {searchTerm || filterType !== 'all' ? (
            <div className="flex justify-center gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
              >
                Clear Filters
              </Button>
              <CreateItineraryDialog />
            </div>
          ) : (
            <CreateItineraryDialog />
          )}
        </div>
      )}
    </div>
  );
}
