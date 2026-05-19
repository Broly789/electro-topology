import { increment, decrement, incrementByAmount } from "@/store/counter";
import { useAppDispatch, useAppSelector } from "@/store";

const RxCounter = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.counter.value);

  return (
    <div>
      <h3>{count}</h3>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>
        Increment by Amount
      </button>
    </div>
  );
};

export default RxCounter;
