import { wrapProxy, WrapFn } from "../proxy";

const wrapFn: WrapFn = jest.fn((_target, cb) => {
  cb();
});

it("will ignore strings", () => {
  const value = "foo";
  const proxy = wrapProxy(value, wrapFn);
  expect(proxy).toBe(value);
  expect(wrapFn).not.toBeCalled();
});

it("will ignore booleans", () => {
  const value = true;
  const proxy = wrapProxy(value, wrapFn);
  expect(proxy).toBe(value);
  expect(wrapFn).not.toBeCalled();
});

it("will ignore dates", () => {
  const value = new Date("2019-01-12 22:12:12");
  const proxy = wrapProxy(value, wrapFn);
  expect(proxy).toBe(value);
  expect(wrapFn).not.toBeCalled();
});

it("will ignore promises", async () => {
  const value = Promise.resolve(12);
  const proxy = wrapProxy(value, wrapFn);
  expect(proxy).toBe(value);
  expect(wrapFn).not.toBeCalled();
});

it("will wrap functions", () => {
  const value = () => true;
  const proxy = wrapProxy(value, wrapFn);
  expect(proxy).not.toBe(value);
  expect(wrapFn).not.toBeCalled();

  expect(proxy()).toEqual(value());
  expect(wrapFn).toBeCalledTimes(1);
});

it("will wrap function results", () => {
  const value = () => () => {};
  const proxy = wrapProxy(value, wrapFn);
  expect(proxy).not.toBe(value);
  expect(wrapFn).not.toBeCalled();

  proxy()();
  expect(wrapFn).toBeCalledTimes(2);
});

it("can go deep", () => {
  const value = {
    a() {
      return {
        b() {
          return "c";
        }
      };
    }
  };

  const proxy = wrapProxy(value, wrapFn);
  expect(proxy.a().b()).toBe("c");
  expect(wrapFn).toHaveBeenCalledTimes(2);
});

it("deep can be disabled", () => {
  const value = {
    a() {
      return {
        b() {
          return "c";
        }
      };
    }
  };

  const proxy = wrapProxy(value, wrapFn, { shallow: true });
  expect(proxy.a().b()).toBe("c");
  expect(wrapFn).toHaveBeenCalledTimes(1);
});

it("function result wrapping can be disabled", () => {
  const value = () => () => {};
  const proxy = wrapProxy(value, wrapFn, { shallow: true });
  expect(proxy).not.toBe(value);
  expect(wrapFn).not.toBeCalled();

  proxy()();
  expect(wrapFn).toBeCalledTimes(1);
});
