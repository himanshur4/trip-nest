import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, collection, query, getDocs, orderBy, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, NotebookText, ArrowLeft, Clock, ImageOff, MoreVertical, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import EditItineraryDialog from "@/components/common/EditItineraryDialog";

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: itinerary, isLoading: itineraryLoading, error: itineraryError } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: async () => {
      const docRef = doc(db, "itineraries", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; } 
      else { throw new Error("Itinerary not found"); }
    },
    enabled: !!id,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', id],
    queryFn: async () => {
      const activitiesColRef = collection(db, "itineraries", id, "activities");
      const q = query(activitiesColRef, orderBy("date"), orderBy("time"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (activities) {
        const batch = writeBatch(db);
        activities.forEach(activity => {
          const activityRef = doc(db, "itineraries", id, "activities", activity.id);
          batch.delete(activityRef);
        });
        await batch.commit();
      }
      await deleteDoc(doc(db, "itineraries", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      navigate("/dashboard");
    },
    onError: (error) => { console.error("Error deleting itinerary:", error); }
  });

  const groupedActivities = activities?.reduce((acc, activity) => {
    const date = activity.date;
    if (!acc[date]) { acc[date] = []; }
    acc[date].push(activity);
    return acc;
  }, {});

  if (itineraryLoading) return <div className="container mx-auto p-8">Loading...</div>;
  if (itineraryError) return <div className="container mx-auto p-8 text-red-500">Error: {itineraryError.message}</div>;

  const { title, destination, startDate, endDate, type, notes, imageUrl } = itinerary;
  const formattedStartDate = startDate ? format(new Date(startDate.seconds * 1000), "MMMM dd, yyyy") : "Not set";
  const formattedEndDate = endDate ? format(new Date(endDate.seconds * 1000), "MMMM dd, yyyy") : "Not set";

  return (
    <div className="container mx-auto p-4 md-p-8 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-800 hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {imageUrl ? ( <img src={imageUrl} alt={title} className="w-full h-64 object-cover rounded-lg mb-6" /> ) : (
        <div className="w-full h-64 bg-slate-200 flex items-center justify-center rounded-lg mb-6"><ImageOff className="h-16 w-16 text-slate-400" /></div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-4xl font-bold">{title}</CardTitle>
              <CardDescription className="text-lg flex items-center mt-2"><MapPin className="mr-2 h-5 w-5" /> {destination}</CardDescription>
            </div>
            {type && <Badge className="text-sm">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center text-gray-800"><Calendar className="mr-2 h-5 w-5" /><span>{formattedStartDate} to {formattedEndDate}</span></div>
          {notes && (<div><h3 className="font-semibold text-lg flex items-center mb-2"><NotebookText className="mr-2 h-5 w-5" /> Notes</h3><p className="text-gray-800 whitespace-pre-wrap">{notes}</p></div>)}
        </CardContent>
      </Card>
      
      

      <EditItineraryDialog itinerary={itinerary} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete your itinerary and all of its associated data.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-red-500 hover:bg-red-600">{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
