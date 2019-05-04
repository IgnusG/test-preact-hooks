import { useEffect, useState } from "react";
import { useTestProxy } from "../useTestProxy";

function useAsync(fn: () => Promise<any>) {
  const [value, setValue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    fn()
      .then(v => {
        setValue(v);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fn]);
  return {
    value,
    isLoading
  };
}

const [prxAsync, control] = useTestProxy(useAsync);
const prxySpy = jest.fn(() => Promise.resolve("foo"));

it("will wait for update", async () => {
  {
    const { value, isLoading } = prxAsync(prxySpy);
    expect(value).toBeNull();
    expect(isLoading).toBe(true);
  }

  await control.waitForNextUpdate();

  {
    const { value, isLoading } = prxAsync(prxySpy);
    expect(value).toBe("foo");
    expect(isLoading).toBe(false);
  }
});
