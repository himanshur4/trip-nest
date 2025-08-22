import { Link } from 'react-router-dom';
import DiscoverPage from './DiscoverPage'; 
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-gradient">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-950 to-blue-500">TripNest</h1>
        <div>
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup" >
            <Button className=' text-white'>Sign Up</Button>
          </Link>
        </div>
      </header>
      <main>
        <section className="text-center pt-20 pb-10 md:pb-15 px-4">
          <h2 className=" text-4xl sm:text-5xl  font-bold font-mono text-stone-800 px-3 sm:px-5 ">Your Gateway to <span className='text-gradient bg-clip-text text-transparent bg-gradient-to-tr from-blue-900 to-blue-500'>New Destinations</span></h2>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto font-mono tracking-tighter">
            Organize your travel itineraries, from destinations and activities to photos and notes. Your next adventure starts here.
          </p>
          <Link to="/signup" className="mt-8 flex justify-center">
            <Button size="lg" className="text-white flex items-center justify-center">Get Started for Free
               <ArrowRightIcon size={7}/>
            </Button>
           
          </Link>
        </section>
        
      
        <DiscoverPage isLandingPage={true} />
      </main>
    </div>
  );
}