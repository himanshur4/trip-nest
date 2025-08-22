import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ImageOff, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function ItineraryCard({ itinerary, onToggleFavorite }) {
  const navigate = useNavigate();
  const { id, title, destination, startDate, type, isFavorite, imageUrl } = itinerary;

  const formattedStartDate = startDate ? format(new Date(startDate.seconds * 1000), "MMM dd, yyyy") : "Date TBD";

  const handleCardClick = () => navigate(`/itinerary/${id}`);
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite({ id, isFavorite: !isFavorite });
  };

  const getTypeColor = (type) => {
    const colors = {
      adventure: "bg-orange-100 text-orange-800 border-orange-200",
      leisure: "bg-blue-100 text-blue-800 border-blue-200",
      work: "bg-gray-100 text-gray-800 border-gray-200",
      family: "bg-green-100 text-green-800 border-green-200",
      romance: "bg-pink-100 text-pink-800 border-pink-200"
    };
    return colors[type?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Card 
      className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-gray-100"
      onClick={handleCardClick}
    >
      <CardContent className="p-0 relative">
        {imageUrl ? (
          <div className="relative overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            <div className="text-center">
              <ImageOff className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No image available</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
          </div>
        )}

        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
        >
          <Star className={`h-5 w-5 transition-colors ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`} />
        </button>

        {type && (
          <div className="absolute top-3 left-3">
            <Badge className={`${getTypeColor(type)} font-medium shadow-sm`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
        )}

        <div className="p-5">
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-black transition-colors">
              {title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{destination}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">{formattedStartDate}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-50 px-3 py-1.5 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              View Details →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
