export default function WaterMark() {
  const year = new Date().getFullYear();
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(3,3,3,0.8)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Massive Background Text - Adjusted for better visibility */}
        <div className="flex justify-center mb-5">
          <h2 className="text-[12vw] font-black tracking-tighter leading-none select-none pointer-events-none bg-linear-to-b from-slate-400/40 via-slate-700/20 to-transparent bg-clip-text text-transparent uppercase">
            AIYIKES
          </h2>
        </div>

        {/* Divider Line */}
        <div className="max-w-4xl mx-auto h-px bg-white/10 mb-8 w-full"></div>

        {/* Copyright Info */}
        <div className="text-center">
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            AIYIKES &copy; {year} &mdash; All rights reserved
          </p>
        </div>
      </div>

      {/* Decorative Bottom Shadow */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-black to-transparent pointer-events-none"></div>
    </>
  );
}
