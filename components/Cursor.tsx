const Cursor = ({match, className}: {match: boolean, className?: string}) => (
    <span className={"text-2xl text-white whitespace-pre-wrap -mt-1 " + (match ? "" : "opacity-75 ") + (className || "")}>&gt;  </span>
);

export default Cursor;