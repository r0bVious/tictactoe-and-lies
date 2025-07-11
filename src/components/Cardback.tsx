const Cardback: React.FC = () => {
  const RPSstyles =
    "absolute rounded-full text-3xl font-ribeye font-extrabold transform";
  return (
    <div className="w-20 h-25 border-1 border-black rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105 flex flex-col justify-center items-center overflow-hidden p-1">
      <div
        className={`relative w-full h-full rounded-lg flex justify-center items-center bg-black`}
      >
        <div
          className={`absolute bg-white transform flex justify-center items-center rounded-3xl skew-x-16 size-[105%]`}
        />
        <div className="z-10 h-full w-full p-2 flex justify-center items-center bg-transparent">
          <span
            className={`${RPSstyles} text-green-600 left-0.5 top-0 rotate-30`}
          >
            R
          </span>
          <span
            className={`${RPSstyles} text-blue-400 top-3.5 left-6 -rotate-5 z-10`}
          >
            P
          </span>
          <span
            className={`${RPSstyles} text-red-400 top-0 right-0.5 -rotate-30`}
          >
            S
          </span>
          <span className="absolute text-black bottom-6 text-2xl font-ribeye font-extrabold z-10">
            &
          </span>
          <span className="absolute -bottom-1 text-red-800 text-3xl font-butcherman">
            LIES
          </span>
        </div>
      </div>
    </div>
  );
};

export default Cardback;
