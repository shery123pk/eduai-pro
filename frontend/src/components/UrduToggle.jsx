const UrduToggle = ({ isUrdu, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-full gradient-primary text-white font-semibold hover:opacity-90 transition-all"
    >
      {isUrdu ? (
        <>
          <span>🇵🇰</span>
          <span className="font-urdu">اردو</span>
        </>
      ) : (
        <>
          <span>🇬🇧</span>
          <span>English</span>
        </>
      )}
    </button>
  );
};

export default UrduToggle;
