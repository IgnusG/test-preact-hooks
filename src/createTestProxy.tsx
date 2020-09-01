import {
  h,
  render as preactRender,
  Fragment,
  ComponentType,
  FunctionComponent as FC,
} from "preact";
import { act } from "preact/test-utils";
import { WrapFn, wrapProxy } from "./proxy";
import { getContainer, unmount } from "./utils";

type TestHookProps = {
  callback: Function;
  children: Function;
};

function TestHook({ callback, children }: TestHookProps) {
  callback();
  children();
  return null;
}

const DefaultWrapper: FC = ({ children }) => <Fragment>{children}</Fragment>;

/**
 * Options for createTestProxy
 *
 * @export
 * @interface UseProxyOptions
 * @template TProps
 */
export interface UseProxyOptions<TProps> {
  /**
   * Component to wrap the test component in
   *
   * @type {Component<TProps>}
   */
  wrapper?: ComponentType<TProps>;

  /**
   * Initial  props to render the wrapper component with
   */
  props?: TProps;

  /**
   * Toggle if result of hook should be wrapped in a proxy - set to true to check for strict equality
   */
  shallow?: boolean;
}

/**
 * Control object for the proxy hook
 *
 * @export
 * @interface HookControl
 * @template TProps
 */
export interface HookControl<TProps> {
  /**
   * Unmounts the test component
   * useful when testing the cleanup of useEffect or useLayoutEffect
   *
   * @memberof HookControl
   */
  unmount: () => void;
  /**
   * Updates the props to be used in the wrapper component
   * Does not cause a rerender, call the proxy hook to force that
   */
  props: TProps;
  /**
   * The container of the test component
   */
  readonly container: HTMLElement;
  /**
   * A promise that will resolve on update
   * Use when waiting for async effects to run
   */
  waitForNextUpdate: () => Promise<void>;
}

/**
 * Creates a proxy hook and a control object for that hook
 * Proxy hook will rerender when called and wrap
 * Calls in act when appropriate
 *
 * @export
 * @template THook
 * @template TProps
 * @param {THook} hook
 * @param {UseProxyOptions<TProps>} [options={}]
 * @returns {[THook, HookControl<TProps>]}
 */
export function createTestProxy<THook, TProps = any>(
  hook: THook,
  options: UseProxyOptions<TProps> = {}
): [THook, HookControl<TProps>] {
  const { wrapper: Wrapper = DefaultWrapper, shallow } = options;
  let { props } = options;

  const resolvers: Function[] = [];
  function runResolvers() {
    resolvers.splice(0, resolvers.length).forEach(resolve => {
      resolve();
    });
  }

  function render(applyFn: () => void) {
    preactRender(
      <Wrapper {...(props as any)}>
        <TestHook callback={applyFn}>{runResolvers}</TestHook>
      </Wrapper>,
      getContainer()
    );
  }

  const wrapFn: WrapFn = (target, applyFn) => {
    act(() => {
      if (target === hook) {
        render(applyFn);
      } else {
        applyFn();
      }
    });
  };

  const control: HookControl<TProps> = {
    unmount,
    set props(newValue: TProps) {
      props = newValue;
    },
    get container() {
      return getContainer();
    },
    waitForNextUpdate: () =>
      new Promise<void>(resolve => resolvers.push(resolve))
  };

  return [wrapProxy(hook, wrapFn, { shallow }), control];
}

/**
 * @deprecated use createTestProxy
 */
export const useTestProxy: typeof createTestProxy = (...args: any[]) => {
  console.warn("useTestProxy is deperacted, use createTestProxy instead");
  //@ts-ignore
  return createTestProxy(...args);
};
