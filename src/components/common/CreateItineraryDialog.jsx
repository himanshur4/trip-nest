import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { format } from "date-fns";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ;

export default function CreateItineraryDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState({ from: null, to: null });
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const resetForm = () => {
    setTitle(""); setDestination(""); setDates({ from: null, to: null }); setType(""); setNotes(""); setImageFile(null);
  };

  const mutation = useMutation({
    mutationFn: async (newItineraryData) => {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in.");

      let imageUrl = "";
      if (newItineraryData.image) {
        const formData = new FormData();
        formData.append("file", newItineraryData.image);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Image upload failed");
        const data = await response.json();
        imageUrl = data.secure_url;
      }

      await addDoc(collection(db, "itineraries"), {
        ...newItineraryData.itinerary,
        userId: user.uid,
        createdAt: serverTimestamp(),
        isFavorite: false,
        imageUrl: imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      setOpen(false);
      resetForm();
    },
    onError: (error) => { console.error("Error creating itinerary:", error); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const itineraryData = { title, destination, startDate: dates.from, endDate: dates.to, type, notes };
    mutation.mutate({ itinerary: itineraryData, image: imageFile });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Create Itinerary</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Create New Itinerary</DialogTitle><DialogDescription>Fill in the details below to plan your next trip.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" placeholder="e.g., Summer in Paris" required /></div>
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="destination" className="text-right">Destination</Label><Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} className="col-span-3" placeholder="e.g., Paris, France" required /></div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Dates</Label>
            <Popover>
              <PopoverTrigger asChild><Button variant={"outline"} className="col-span-3 justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{dates?.from ? (dates.to ? `${format(dates.from, "LLL dd, y")} - ${format(dates.to, "LLL dd, y")}` : format(dates.from, "LLL dd, y")) : <span>Pick a date range</span>}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start"><Calendar mode="range" selected={dates} onSelect={setDates} initialFocus /></PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select onValueChange={setType} value={type}><SelectTrigger className="col-span-3"><SelectValue placeholder="Select trip type" /></SelectTrigger><SelectContent><SelectItem value="adventure">Adventure</SelectItem><SelectItem value="leisure">Leisure</SelectItem><SelectItem value="work">Work</SelectItem></SelectContent></Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="notes" className="text-right">Notes</Label><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" placeholder="e.g., Book flight tickets..." /></div>
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="image" className="text-right">Cover Photo</Label><Input id="image" type="file" onChange={(e) => setImageFile(e.target.files[0])} className="col-span-3" accept="image/*" /></div>
          <DialogFooter><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Itinerary'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}