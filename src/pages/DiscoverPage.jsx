import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Loader2, RefreshCw } from 'lucide-react';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const fetchTravelPhotos = async () => {
  const response = await fetch(`https://api.unsplash.com/photos/random?query=travel-destination&count=8&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`);
  if (!response.ok) throw new Error('Failed to fetch images from Unsplash');
  return response.json();
};

const enrichPhotoDataWithGemini = async (photo) => {
  const prompt = `For the travel location "${photo.location?.name || photo.alt_description}", generate a short, engaging description (around 15 words) and a single category from this list: Adventure, Romance, Relaxation, Cultural, Family, Luxury. Ensure the description mentions the location if it's not in the title.`;
  const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { description: { type: "STRING" }, category: { type: "STRING" } }, required: ["description", "category"] } } };
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) return { ...photo, description: photo.alt_description, category: 'General' };
    const result = await response.json();
    const generatedData = JSON.parse(result.candidates[0].content.parts.text);
    return { ...photo, ...generatedData };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { ...photo, description: photo.alt_description, category: 'General' };
  }
};

const DiscoverCardSkeleton = () => (
  <Card className="overflow-hidden group">
    <CardContent className="px-2 sm:px-4 relative">

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

export default function DiscoverPage({ isLandingPage = false }) {
  const [enrichedPhotos, setEnrichedPhotos] = useState([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const { data: initialPhotos, isLoading: isInitialLoading, error } = useQuery({ 
    queryKey: ['discoverPhotos'], 
    queryFn: fetchTravelPhotos, 
    staleTime: 1000 * 60 * 60 
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist', user?.uid],
    queryFn: async () => {
      const docRef = doc(db, 'wishlists', user.uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().photos : [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (initialPhotos && initialPhotos.length > 0) {
      const enrichData = async () => {
        setIsEnriching(true);
        try {
          const enriched = await Promise.all(initialPhotos.map(enrichPhotoDataWithGemini));
          setEnrichedPhotos(enriched);
        } finally {
          setIsEnriching(false);
        }
      };
      enrichData();
    }
  }, [initialPhotos]);

  const { mutate: fetchMore, isPending: isFetchingMore } = useMutation({
    mutationFn: async () => {
      const newPhotos = await fetchTravelPhotos();
      return await Promise.all(newPhotos.map(enrichPhotoDataWithGemini));
    },
    onSuccess: (newEnrichedPhotos) => setEnrichedPhotos(prevPhotos => [...prevPhotos, ...newEnrichedPhotos]),
    onError: (err) => console.error("Failed to fetch more ideas:", err),
  });


const toggleWishlistMutation = useMutation({
  mutationFn: async ({ photo, isWishlisted }) => {
    const wishlistRef = doc(db, 'wishlists', user.uid);
    const photoData = { 
      id: photo.id, 
      url: photo.urls.regular, 
      title: photo.location?.name || 'A beautiful destination',
      description: photo.description || photo.alt_description || '',
      category: photo.category || 'General'
    };
    if (isWishlisted) { 
      await updateDoc(wishlistRef, { photos: arrayRemove(photoData) }); 
    } else { 
      await setDoc(wishlistRef, { photos: arrayUnion(photoData) }, { merge: true }); 
    }
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist', user.uid] }),
});


  const handleWishlistToggle = (photo) => {
    if (!user) { navigate('/login'); return; }
    const isWishlisted = wishlist.some(item => item.id === photo.id);
    toggleWishlistMutation.mutate({ photo, isWishlisted });
  };

 
  const isLoading = isInitialLoading || isEnriching;

  return (
    <section className={`container mx-auto px-4 ${isLandingPage ? 'py-12' : 'py-8'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-mono tracking-tighter">
          {isLandingPage ? 'Get Inspired for Your Next Trip' : 'Discover New Destinations'}
        </h2>
        <p className="text-gray-800 mt-2">Explore beautiful travel destinations from around the world.</p>
      </div>

      {error && <p className="text-center text-red-500">Could not load images. Please check your Unsplash API key.</p>}

      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:px-0 md:px-5 lg:px-20 xl:px-25">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <DiscoverCardSkeleton key={index} />
          ))
        ) : (
          enrichedPhotos.map((photo) => {
            const isWishlisted = wishlist.some(item => item.id === photo.id);
            return (
              <Card key={photo.id} className="overflow-hidden group">
                <CardContent className="px-2 sm:px-4 relative">
                  <img 
                    src={photo.urls.regular} 
                    alt={photo.alt_description || 'Travel destination'} 
                    className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <button 
                    onClick={() => handleWishlistToggle(photo)} 
                    className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold pr-2">{photo.location?.name || 'A beautiful destination'}</p>
                      {photo.category && <Badge>{photo.category}</Badge>}
                    </div>
                    <p className="text-sm text-gray-800 mt-1">{photo.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
       
      {!isLoading && enrichedPhotos.length > 0 && (
        <div className="text-center mt-12">
          <Button onClick={() => fetchMore()} disabled={isFetchingMore}>
            {isFetchingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading More...
              </>
            ) : (
              'Show More Ideas'
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
