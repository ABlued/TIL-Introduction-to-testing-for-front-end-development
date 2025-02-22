# Chapter 7 웹 애플리케이션 통합 테스트

<br/><br/>

## 1. React Context 테스트 (toast component)

context

```typescript
import { createContext } from 'react';

export type ToastStyle = 'succeed' | 'failed' | 'busy';

export type ToastState = {
  isShown: boolean;
  message: string;
  style: ToastStyle;
};

export const initialState: ToastState = {
  isShown: false,
  message: '',
  style: 'succeed',
};

export const ToastStateContext = createContext(initialState);

export type ToastAction = {
  showToast: (state?: Partial<Omit<ToastState, 'isShown'>>) => void;
  hideToast: () => void;
};

export const initialAction: ToastAction = {
  showToast: () => {},
  hideToast: () => {},
};

export const ToastActionContext = createContext(initialAction);
```

<br/>

hooks

```typescript
export function useToastAction() {
  return useContext(ToastActionContext);
}

export function useToastState() {
  return useContext(ToastStateContext);
}
```

<br/>

provider component

```typescript
export const ToastProvider = ({
  children,
  defaultState,
}: {
  children: ReactNode;
  defaultState?: Partial<ToastState>;
}) => {
  const { isShown, message, style, showToast, hideToast } =
    useToastProvider(defaultState);
  return (
    <ToastStateContext.Provider value={{ isShown, message, style }}>
      {' '}
      {/* 하위 컴포넌트에서 isShown, message, style을 참조할 수 있다 */}
      <ToastActionContext.Provider value={{ showToast, hideToast }}>
        {' '}
        {/* 하위 컴포넌트에서 showToast, hideToast를 참조할 수 있다 */}
        {children}
        {isShown && <Toast message={message} style={style} />} {/* isShown이 true가 되면 표시된다 */}
      </ToastActionContext.Provider>
    </ToastStateContext.Provider>
  );
};
```

<br/>

사용 예시

```typescript
const { showToast } = useToastAction();
const onSubmit = handleSubmit(async () => {
  try {
    // ...웹 API에 값을 제출한다.
    showToast({ message: '저장됐습니다', style: 'succeed' });
  } catch (err) {
    showToast({ message: '에러가 발생했습니다', style: 'failed' });
  }
});
```

<br/>

```typescript
// #### 1.테스트용 컴포넌트를 만들어 인터랙션 실행하기

const user = userEvent.setup();

const TestComponent = ({ message }: { message: string }) => {
  const { showToast } = useToastAction(); // <Toast>를 표시하기 위한 훅
  return <button onClick={() => showToast({ message })}>show</button>;
};
// 테스트 통과 ✅
test('showToast를 호출하면 Toast컴포넌트가 표시된다', async () => {
  const message = 'test';
  render(
    <ToastProvider>
      <TestComponent message={message} />
    </ToastProvider>
  );
  // 처음에는 렌더링되지 않는다.
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button'));
  // 렌더링됐는지 확인한다.
  expect(screen.getByRole('alert')).toHaveTextContent(message);
});

// ### 2.초기값을 주입해서 렌더링된 내용 확인하기

// 테스트 통과 ✅
test('Succeed', () => {
  const state: ToastState = {
    isShown: true,
    message: '성공했습니다',
    style: 'succeed',
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole('alert')).toHaveTextContent(state.message);
});

// 테스트 통과 ✅
test('Failed', () => {
  const state: ToastState = {
    isShown: true,
    message: '실패했습니다',
    style: 'failed',
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole('alert')).toHaveTextContent(state.message);
});

test.each([
  { isShown: true, message: '성공했습니다', style: 'succeed' },
  { isShown: true, message: '실패했습니다', style: 'failed' },
  { isShown: true, message: '통신 중입니다', style: 'busy' },
] as ToastState[])('$message', (state) => {
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole('alert')).toHaveTextContent(state.message);
});
```

<br/>

이 테스트는 네 가지 모듈을 통합해서 테스트를 하고 있다.

- `<Toast>` : View를 제공한다
- `<ToastProvider>` : 렌더링 여부를 결정할 상태를 소유한다.
- `useToastProvider` : 렌더링 관련 로직을 관리한다.
- `useToastAction` : 하위 컴포넌트에서 호출한다.

첫 번째 방법은 커스텀 훅인 useToastAction도 포함하므로 두번째 방법보다 더 넓은 범위의 통합 테스트라고 할 수 있다.

<br/><br/>

## 3. Next.js 라우터 랜더링 통합 테스트 (헤더 네비게이션 UI 테스트)

```typescript
function isCurrent(flag: boolean): AnchorHTMLAttributes<HTMLAnchorElement> {
  if (!flag) return {};
  return { 'aria-current': 'page' };
}

type Props = { onCloseMenu: () => void };

export const Nav = ({ onCloseMenu }: Props) => {
  const { pathname } = useRouter();
  return (
    // "내비게이션"을 "메뉴"로 변경하고 테스트 러너를 실행(코드 8-31)
    <nav aria-label='내비게이션' className={styles.nav}>
      <button
        aria-label='메뉴 닫기'
        className={styles.closeMenu}
        onClick={onCloseMenu}
      ></button>
      <ul className={styles.list}>
        <li>
          <Link href={`/my/posts`} legacyBehavior>
            <a
              {...isCurrent(
                pathname.startsWith('/my/posts') &&
                  pathname !== '/my/posts/create'
              )}
            >
              My Posts
            </a>
          </Link>
        </li>
        <li>
          <Link href={`/my/posts/create`} legacyBehavior>
            <a {...isCurrent(pathname === '/my/posts/create')}>Create Post</a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};
```

```typescript
// 테스트 통과 ✅
test("현재 위치는 'My Posts'이다", () => {
  mockRouter.setCurrentUrl('/my/posts');
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole('link', { name: 'My Posts' });
  expect(link).toHaveAttribute('aria-current', 'page');
});

// 테스트 통과 ✅
test("현재 위치는 'Create Post'이다", () => {
  mockRouter.setCurrentUrl('/my/posts/create');
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole('link', { name: 'Create Post' });
  expect(link).toHaveAttribute('aria-current', 'page');
});

// each를 사용해 테스트 순회
// 테스트 통과 ✅
test.each([
  { url: '/my/posts', name: 'My Posts' },
  { url: '/my/posts/123', name: 'My Posts' },
  { url: '/my/posts/create', name: 'Create Post' },
])('$url의 현재 위치는 $name이다', ({ url, name }) => {
  mockRouter.setCurrentUrl(url);
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole('link', { name });
  expect(link).toHaveAttribute('aria-current', 'page');
});
```

<br/><br/>

## 4. Next.js 라우터와 입력 통합 테스트
