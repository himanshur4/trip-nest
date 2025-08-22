export default function AppBackground({ children }) {
    return (
      <div className="min-h-screen w-full bg-[#fafafa] relative text-gray-900">
        {/* Aurora Dream Diagonal Flow */}
        <div
    className="absolute inset-0 z-0"
    style={{
      background: "#ffffff",
      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
      backgroundSize: "20px 20px",
    }}
  />
        {/* Your content goes here, layered on top */}
        <div className="relative z-10">
          {children}
        </div>
       </div>
    );
  }


