import { useEffect, useState } from "react";
import { useTestProxy } from "..";

function useDeepHook() {
  const [count, setCount] = useState(0);
  const countObj = {
    count,
    inc: () => setCount(count + 1)
  };
  return {
    countObj
  };
}

const [prxDeepHook] = useTestProxy(useDeepHook);

it("will render", () => {
  const { countObj } = prxDeepHook();
  expect(countObj.count).toBe(0);
});

it("will increase", () => {
  {
    const {
      countObj: { inc }
    } = prxDeepHook();
    inc();
  }

  {
    const {
      countObj: { count }
    } = prxDeepHook();
    expect(count).toBe(1);
  }
});

it("will handle double dot", () => {
  {
    const res = prxDeepHook();
    res.countObj.inc();
  }

  {
    const {
      countObj: { count }
    } = prxDeepHook();
    expect(count).toBe(1);
  }
});
