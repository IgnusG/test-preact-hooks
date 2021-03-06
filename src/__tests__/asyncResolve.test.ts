import { useEffect, useRef, useCallback } from "preact/hooks";
import { createTestProxy } from "../";

function useResolveOnChange(deps: any[] = []) {
  const resolveRefs = useRef<Function[]>([]);

  useEffect(() => {
    resolveRefs.current.splice(0).forEach(r => r(...deps));
  }, deps);

  const addResolve = useCallback(() => {
    return new Promise(resolve => {
      resolveRefs.current.push(resolve);
    });
  }, []);

  return addResolve;
}

const [prxResolveOnChange, control] = createTestProxy(useResolveOnChange);

it("should not resolve if the same value is passed in", async () => {
  const spy = jest.fn();
  {
    const addResolve = prxResolveOnChange([1]);
    addResolve().then(spy);
  }
  expect(spy).not.toHaveBeenCalled();
  {
    const updatePromise = control.waitForNextUpdate();
    prxResolveOnChange([2]);
    await updatePromise;
  }
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(2);
});
