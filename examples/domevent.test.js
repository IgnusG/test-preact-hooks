import { useEffect } from "preact/hooks";
import { createTestProxy, cleanUp, act } from "test-preact-hooks";
import { createSandboxClickEvent } from "./util";

afterEach(() => cleanUp());

//Taken from https://usehooks.com/useOnClickOutside/
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      handler();
    };

    document.addEventListener("click", listener);
    return () => {
      document.removeEventListener("click", listener);
    };
  }, [ref, handler]);
}

const [prxClickOutside, control] = createTestProxy(useOnClickOutside);
const spy = jest.fn();

afterEach(() => jest.clearAllMocks());

it("will detect if clicked outside", () => {
  const ref = { current: control.container };

  prxClickOutside(ref, spy);
  expect(spy).not.toHaveBeenCalled();

  //hook proxy doesn't wrap anything but the hook and it's members
  act(() => {
    document.dispatchEvent(createSandboxClickEvent());
  });

  prxClickOutside(ref, spy);
  expect(spy).toHaveBeenCalled();
});

it("wont call if clicked internally", () => {
  const ref = { current: control.container };

  prxClickOutside(ref, spy);
  expect(spy).not.toHaveBeenCalled();

  act(() => {
    control.container.dispatchEvent(createSandboxClickEvent());
  });

  prxClickOutside(ref, spy);
  expect(spy).not.toHaveBeenCalled();
});
