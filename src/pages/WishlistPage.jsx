import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Heart } from 'lucide-react';

const WishlistCardSkeleton = () => (
  <Card className="overflow-hidden group">
    <CardContent className="p-0 relative">
      <Skeleton className="w-full h-60" />
      <div className="absolute top-2 right-2">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const user = auth.currentUser;

  const { data: wishlist = [], isLoading, error } = useQuery({
    queryKey: ['wishlist', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const docRef = doc(db, 'wishlists', user.uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().photos : [];
    },
    enabled: !!user,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (photoData) => {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      await updateDoc(wishlistRef, { photos: arrayRemove(photoData) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.uid] });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
   
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-mono tracking-tighter">
          My Wishlist
        </h1>
        <p className="text-gray-800 mt-2">Your saved travel inspirations and dream destinations.</p>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">Could not fetch your wishlist. Please try again later.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:px-0 md:px-5 lg:px-20 xl:px-25">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <WishlistCardSkeleton key={index} />
          ))
        ) : wishlist.length > 0 ? (
          wishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <CardContent className="px-2 sm:px-4 relative">
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                
                <button
                  onClick={() => removeFromWishlistMutation.mutate(item)}
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-red-500/75 transition-colors"
                  disabled={removeFromWishlistMutation.isPending}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="absolute top-2 left-2 bg-black/50 p-2 rounded-full">
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold pr-2">{item.title}</p>
                    {item.category && <Badge variant="secondary">{item.category}</Badge>}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-800 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {!item.description && (
                    <p className="text-sm text-gray-800 mt-1 italic">
                      Added to your travel wishlist
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>

      {!isLoading && wishlist.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 mb-6 bg-gray-100 rounded-full flex items-center justify-center border-black">
            <Heart className="h-12 w-12 text-gray-700" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-700 mb-6 max-w-md mx-auto">
            Start exploring amazing destinations and save your favorites to create your dream travel list!
          </p>
          <Button 
            onClick={() => window.location.href = '/discover'}
            className="bg-black text-white hover:bg-gray-800"
          >
            Discover Destinations
          </Button>
        </div>
      )}
    </div>
  );
}
