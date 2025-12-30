import { useState, useMemo, useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { GlobeIcon, MapPin, Loader2 } from "lucide-react";

const MapPage = () => {
  const globeEl = useRef();
  const navigate = useNavigate();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [hoveredUser, setHoveredUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // New state for click interaction

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Also use ResizeObserver for more robust handling
    const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
    });
    
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    return () => {
        window.removeEventListener('resize', updateDimensions);
        resizeObserver.disconnect();
    };
  }, []);
  
  // Fetch recommended users to populate the map
  const { data: users, isLoading } = useQuery({
    queryKey: ["mapUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/map-users");
      return res.data;
    },
  });

  const pointsData = useMemo(() => {
    if (!users) return [];
    return users.map(user => ({
      lat: user.coordinates.lat,
      lng: user.coordinates.lng,
      size: 0.1,
      color: "orange", // dynamic based on learning language?
      ...user
    }));
  }, [users]);
  
  useEffect(() => {
    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div ref={containerRef} className="h-[calc(100vh-6rem)] relative rounded-3xl overflow-hidden glass-panel border border-base-300 shadow-xl bg-[#000010]">
        
      {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
              <Loader2 className="size-10 animate-spin text-primary" />
          </div>
      )}

      {/* Map Header Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="glass-panel p-4 rounded-2xl border-l-4 border-primary">
              <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <GlobeIcon className="size-6 text-primary" /> 
                  Global Community
              </h1>
              <p className="text-white/60 text-sm">Discover learners around the world</p>
          </div>
      </div>
      
      {dimensions.width > 0 && (
          <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            pointsData={pointsData}
            pointAltitude={0.2} // Increased altitude
            pointRadius={0.8} // Increased radius for easier clicking
            pointsMerge={false} // Disable merge to ensure individual interaction works
            onPointHover={setHoveredUser}
            onPointClick={(user) => {
                console.log("Clicked user:", user); // Debug log
                setSelectedUser(user);
                setHoveredUser(null); 
            }}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="#00000000"
          />
      )}
      
      {/* Tooltip Card */}
      <AnimatePresence>
        {hoveredUser && (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-10 right-10 z-20 glass-panel p-4 rounded-2xl w-64 pointer-events-none"
            >
                <div className="flex items-center gap-3 mb-2">
                    <img src={hoveredUser.profilePic || "/avatar.png"} className="size-10 rounded-full border border-base-content/20" />
                    <div>
                        <h3 className="font-bold text-white shadow-black drop-shadow-md">{hoveredUser.fullName}</h3>
                        <p className="text-xs text-secondary font-medium">{hoveredUser.location}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1">
                    <span className="badge badge-xs badge-primary">{hoveredUser.nativeLanguage}</span>
                    <span>→</span>
                    <span className="badge badge-xs badge-secondary">{hoveredUser.learningLanguage}</span>
                </div>
            </motion.div>
        )}
           
      </AnimatePresence>

      {/* Selected User Modal/Card */}
      <AnimatePresence>
        {selectedUser && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-panel p-6 rounded-3xl max-w-sm w-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card
                >
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative">
                            <img 
                                src={selectedUser.profilePic || "/avatar.png"} 
                                className="size-24 rounded-full border-4 border-primary/20 shadow-xl object-cover" 
                            />
                            <div className="absolute bottom-1 right-1 bg-green-500 size-4 rounded-full border-2 border-black" />
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-bold text-white">{selectedUser.fullName}</h2>
                            <p className="text-white/60 flex items-center justify-center gap-1">
                                <MapPin className="size-3" /> {selectedUser.location}
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                             <div className="badge badge-primary badge-lg">{selectedUser.nativeLanguage}</div>
                             <div className="badge badge-secondary badge-lg">{selectedUser.learningLanguage}</div>
                        </div>

                        <p className="text-white/80 italic">"{selectedUser.bio || "No bio yet..."}"</p>

                        <div className="flex gap-3 w-full mt-2">
                            <button 
                                onClick={() => navigate(`/profile/${selectedUser._id}`)}
                                className="btn btn-primary flex-1"
                            >
                                View Profile
                            </button>
                            <button 
                                onClick={() => navigate(`/profile/${selectedUser._id}`)} // Or chat directly
                                className="btn btn-outline btn-secondary flex-1"
                            >
                                Message
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
        
      {/* Hint */}
      <div className="absolute bottom-6 left-6 text-white/30 text-xs pointer-events-none">
          Click and drag to rotate • Scroll to zoom • Click pins to view profile
      </div>
    </div>
  );
};

export default MapPage;
