import { useStore } from "../store/useStore";
const Counter = () => {
  const { count, increment, decrement } = useStore();

  return (
    <div className="flex gap-4 items-center">
      <div className="w-10 h-8 text-center  bg-pink-200" onClick={increment}>
        +
      </div>
      <span>{count}</span>
      <button
        className="w-10 h-8 text-center line-height-8 bg-pink-200"
        onClick={decrement}
      >
        -
      </button>
    </div>
  );
};

export default Counter;
