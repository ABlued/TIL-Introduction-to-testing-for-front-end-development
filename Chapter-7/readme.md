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

<br/>

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

<br/>

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

### 4 - 1 url 테스트

테스트할 입력 컴포넌트

<br/>

```typescript
const options = [
  { value: 'all', label: '모두' },
  { value: 'public', label: '공개' },
  { value: 'private', label: '비공개' },
];

export const Header = () => {
  const { query, push } = useRouter();
  const defaultValue = parseAsNonEmptyString(query.status) || 'all'; // 사용자가 직접 url을 검색해서 들어오는 경우를 위해 defaultValue 설정
  return (
    <header className={styles.header}>
      <h2 className={styles.heading}>기사 목록</h2>
      <SelectFilterOption
        title='공개 여부'
        options={options}
        selectProps={{
          defaultValue,
          onChange: (event) => {
            const status = event.target.value;
            push({ query: { ...query, status } });
          },
        }}
      />
    </header>
  );
};
```

<br/>

공통 함수

```typescript
function setup(url = '/my/posts?page=1') {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole('combobox', { name: '공개 여부' });
  return { combobox };
}
```

<br/>

테스트 코드

```typescript
// 테스트 통과 ✅
test("기본값으로 '모두'가 선택되어 있다", async () => {
  const { combobox } = setup();
  expect(combobox).toHaveDisplayValue('모두');
});

// 테스트 통과 ✅
test("status?=public으로 접속하면 '공개'가 선택되어 있다", async () => {
  const { combobox } = setup('/my/posts?status=public');
  expect(combobox).toHaveDisplayValue('공개');
});

// 테스트 통과 ✅
test("staus?=private으로 접속하면 '비공개'가 선택되어 있다", async () => {
  const { combobox } = setup('/my/posts?status=private');
  expect(combobox).toHaveDisplayValue('비공개');
});
```

### 4 - 2 인터렉션 테스트

사용자가 셀렉트박스를 선택하는 코드도 setup 함수에 추가

<br/>

```typescript
function setup(url = '/my/posts?page=1') {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole('combobox', { name: '공개 여부' });
  async function selectOption(label: string) {
    await user.selectOptions(combobox, label);
  }
  return { combobox, selectOption };
}
```

<br/>

```typescript
// 테스트 통과 ✅
test('공개 여부를 변경하면 status가 변한다', async () => {
  const { selectOption } = setup();
  expect(mockRouter).toMatchObject({ query: { page: '1' } });
  // '공개'를 선택하면 ?status=public이 된다.
  await selectOption('공개');
  // 기존의 page=1이 그대로 있는지도 함께 검증한다.
  expect(mockRouter).toMatchObject({
    query: { page: '1', status: 'public' },
  });
  // '비공개'를 선택하면 ?status=private이 된다.
  await selectOption('비공개');
  expect(mockRouter).toMatchObject({
    query: { page: '1', status: 'private' },
  });
});
```

<br/><br/>

## 5. Form의 제어 컴포넌트와 비제어 컴포넌트

<br/>

### 5 - 1 제어 컴포넌트

`useState`를 통해 상태관리를 하는 컴포넌트를 `제어 컴포넌트`라 불린다.
제어 컴포넌트로 구현된 폼은 관리 중인 상태를 onSubmit할 때 웹 API로 보낸다.
onSubmit할 때 최신 상태를 참조하게 된다.

```typescript
const [value, setValue] = useState("");
return (
  <input
    type-"search"
    value={value}
    onChange={(event) => {
      setValue(event.currentTarget.value)
    }}
  />
)
```

<br/>

### 5 - 2 비제어 컴포넌트

`비제어 컴포넌트`는 폼을 전송할 때 `<input/>` 등의 입력 요소에 브라우저 고유 기능을 사용해 값을 참조하도록 한다.
onSubmit할 때 직접 값을 참조하기 때문에 상태를 관리하지 않으며 ref를 통해 DOM의 값을 참조한다.
여기선 초깃값을 `defaultValue`로 설정해야 한다.

```typescript
const ref = useRef<HTMLInputElement>(null);
return <input type='search' name='search' defaultValue='' ref={ref} />;
```

<br/><br/>

## 6. 폼 유효성 검사 테스트

### 6 - 1 개요

테스트할 코드

```typescript
type Props<T extends FieldValues = PostInput> = {
  title: string;
  children?: React.ReactNode;
  onClickSave: (isPublish: boolean) => void;
  onValid: SubmitHandler<T>; // 유효한 내용이 전송되면 실행하는 이벤트
  onInvalid?: SubmitErrorHandler<T>; // 유효하지 않은 내용이 전송되면 실행하는 이벤트
};

export const PostForm = (props: Props) => {
  const {
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostInput>({
    resolver: zodResolver(createMyPostInputSchema),
  });
  return (
    <form
      aria-label={props.title}
      className={styles.module}
      onSubmit={handleSubmit(props.onValid, props.onInvalid)} // 설계 포인트
    >
      <div className={styles.content}>
        <div className={styles.meta}>
          <PostFormInfo register={register} control={control} errors={errors} />
          <PostFormHeroImage
            register={register}
            setValue={setValue}
            name='imageUrl'
            error={errors.imageUrl?.message}
          />
        </div>
        <TextareaWithInfo
          {...register('body')}
          title='본문'
          rows={20}
          error={errors.body?.message}
        />
      </div>
      <PostFormFooter
        isSubmitting={isSubmitting}
        register={register}
        control={control}
        onClickSave={props.onClickSave}
      />
      {props.children}
    </form>
  );
};
```

<br/>

validation 객체

```typescript
import * as z from 'zod';

export const createMyPostInputSchema = z.object({
  title: z.string().min(1, '한 글자 이상의 문자를 입력해주세요'),
  description: z.string().nullable(),
  body: z.string().nullable(),
  published: z.boolean(),
  imageUrl: z.string({ required_error: '이미지를 선택해주세요' }).nullable(),
});
export type CreateMyPostInput = z.infer<typeof createMyPostInputSchema>;
```

<br/>

해당 UI 컴포넌트의 책임은 다음과 같다.

- 입력폼 제공
- 입력 내용 검증
- 유효한 검사 오류가 없으면 onValid 실행
- 유효성 검사 오류가 있으면 오류 표시
- 유효하지 않은 내용이 전송되면 onInvalid 실행

### 6 - 2 인터랙션 테스트 설정

설정 함수

```typescript
const user = userEvent.setup();

function setup() {
  const onClickSave = jest.fn();
  const onValid = jest.fn();
  const onInvalid = jest.fn();
  render(
    <PostForm
      title='신규 기사'
      onClickSave={onClickSave}
      onValid={onValid}
      onInvalid={onInvalid}
    />
  );
  async function typeTitle(title: string) {
    const textbox = screen.getByRole('textbox', { name: '제목' });
    await user.type(textbox, title);
  }
  async function saveAsPublished() {
    await user.click(screen.getByRole('switch', { name: '공개 여부' }));
    await user.click(screen.getByRole('button', { name: '공개하기' }));
  }
  async function saveAsDraft() {
    await user.click(
      screen.getByRole('button', { name: '비공개 상태로 저장' })
    );
  }
  return {
    typeTitle,
    saveAsDraft,
    saveAsPublished,
    onClickSave,
    onValid,
    onInvalid,
  };
}
```

### 6 - 3 onInvalid가 실행되는 테스트

```typescript
// 테스트 통과 ✅
test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 유효성 검사 에러가 표시된다", async () => {
  const { saveAsDraft } = setup();
  await saveAsDraft();
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: '제목' })).toHaveErrorMessage(
      '한 글자 이상의 문자를 입력해주세요'
    )
  );
});

test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 onInvalid 이벤트 핸들러가 실행된다", async () => {
  const { saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  await saveAsDraft();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).not.toHaveBeenCalled();
  expect(onInvalid).toHaveBeenCalled();
});
```

<br/>

### 6 - 4 invalid가 실행되는 테스트

```typescript
test("유효한 입력 내용으로 '비공개 상태로 저장'을 시도하면 onValid 이벤트 핸들러가 실행된다", async () => {
  mockUploadImage();
  const { typeTitle, saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  const { selectImage } = selectImageFile();
  await typeTitle('나의 기사');
  await selectImage();
  await saveAsDraft();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).toHaveBeenCalled();
  expect(onInvalid).not.toHaveBeenCalled();
});
```

<br/>

### 6 - 5 접근성 관련 매처

```typescript
type Props = ComponentProps<typeof Textbox> & {
  title: string;
  info?: ReactNode;
  description?: string;
  error?: string;
};

export const TextboxWithInfo = forwardRef<HTMLInputElement, Props>(
  function TextboxWithInfo(
    { title, info, description, error, className, ...props },
    ref
  ) {
    const componentId = useId();
    const textboxId = `${componentId}-textbox`;
    const descriptionId = `${componentId}-description`;
    const errorMessageId = `${componentId}-errorMessage`;
    return (
      <section className={clsx(styles.module, className)}>
        <header className={styles.header}>
          <label className={styles.label} htmlFor={textboxId}>
            {title}
          </label>
          {info}
        </header>
        <Textbox
          {...props}
          ref={ref}
          id={textboxId}
          aria-invalid={!!error}
          aria-errormessage={errorMessageId}
          aria-describedby={description ? descriptionId : undefined}
        />
        {(error || description) && (
          <footer className={styles.footer}>
            {description && (
              <DescriptionMessage id={descriptionId}>
                {description}
              </DescriptionMessage>
            )}
            {error && (
              <ErrorMessage id={errorMessageId} className={styles.error}>
                {error}
              </ErrorMessage>
            )}
          </footer>
        )}
      </section>
    );
  }
);
```

<br/>

```typescript
// 테스트 통과 ✅
test('TextboxWithInfo', async () => {
  const args = {
    title: '제목',
    info: '0 / 64',
    description: '영문과 숫자를 조합하여 64자 이내로 입력해주세요',
    error: '유효하지 않은 문자가 포함되어 있습니다',
  };
  render(<TextboxWithInfo {...args} />);
  const textbox = screen.getByRole('textbox');
  // label의 htmlFor와 연관돼 있다.
  expect(textbox).toHaveAccessibleName(args.title);
  // aria-describedby와 연관돼 있다.
  expect(textbox).toHaveAccessibleDescription(args.description);
  // aria-errormessage와 연관돼 있다.
  expect(textbox).toHaveErrorMessage(args.error);
});
```

<br/><br/>

## 7. 웹 API 응답을 목 객체화하는 MSW(Mock Service Worker)

### 7 - 1 네트워크 계층의 목 객체를 만드는 MSW

MSW는 네트워크 계층의 목 객체를 만드는 라이브러리다. MSW를 사용하면 웹 API 요청을 가로채서 임의의 값으로 만든 응답으로 대체할 수 있다.
즉 웹 API 서버를 실행하지 않아도 네트워크 통신을 재현할 수 있기 때문에 통합 테스트에 사용된다.

웹 API 요청을 가로채려면 요청 핸들러(request handler)를 만들어야 한다.

```typescript
import { setupWorker, rest } from 'msw';
const worker = setupWorker(
  rest.post('/login', async (req, res, ctx) => {
    const { username } = await req.json();
    return res(
      ctx.json({
        username,
        firstName: 'John',
      })
    );
  })
);
```

<br/>

MSW는 테스트 시 응답을 대체할 수 있는 것은 몰론 생성된 요청의 headers, query같이 세부 내용도 검증할 수 있다.

제스트에서 사용할 setupServer 함수 구현하기

```typescript
import { setupServer } from 'msw/node';

export function setupMockServer(...handlers: RequestHandler[]) {
  const server = setupServer(...handlers);
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers()); // 각각의 독립환경을 보장하기 위해서 테스트가 끌날때마다 핸들러는 reset
  afterAll(() => server.close());
  return server;
}
```

<br/><br/>

## 8. 웹 API 통합 테스트(신규 기사 등록 테스트)

### 8 - 1 MyPostsCreate 컴포넌트

```typescript
export const MyPostsCreate = () => {
  const router = useRouter();
  const { showToast } = useToastAction();
  const { showAlertDialog, hideAlertDialog } = useAlertDialogAction();
  return (
    <PostForm
      title='신규 기사'
      onClickSave={(isPublish) => {
        if (!isPublish) return;
        // 공개를 시도하면 AlertDialog를 띄운다.
        showAlertDialog({ message: '기사를 공개합니다. 진행하시겠습니까?' });
      }}
      onValid={async (input) => {
        // 유효한 내용으로 제출한 경우
        const status = input.published ? '공개' : '저장';
        if (input.published) {
          hideAlertDialog();
        }
        try {
          // API 통신을 시작하면 '저장 중입니다...'가 표시된다.
          showToast({ message: '저장 중입니다...', style: 'busy' });
          const { id } = await createMyPosts({ input });
          // 공개(혹은 저장)에 성공하면 화면을 이동한다.
          await router.push(`/my/posts/${id}`);
          // 공개(혹은 저장)에 성공하면 '공개(혹은 저장)됐습니다'가 표시된다.
          showToast({ message: `${status}됐습니다`, style: 'succeed' });
        } catch (err) {
          // 공개(혹은 저장)에 실패하면 '공개(혹은 저장)에 실패했습니다'가 표시된다.
          showToast({ message: `${status}에 실패했습니다`, style: 'failed' });
        }
      }}
      onInvalid={() => {
        // 유효하지 않은 내용으로 제출하면 AlertDialog를 닫는다.
        hideAlertDialog();
      }}
    >
      <AlertDialog />
    </PostForm>
  );
};
```

다음 코드는 다음과 같은 기능을 가지고 있다.

- 비공개 상태로 저장하면 비공개한 기사 화면으로 돌아간다.
- 공개를 시도하면 `AlertDialog` 띄워준다.
- `AlertDialog`에서 [아니오]를 선택하면 경고창이 사라진다.
- `AlertDialog`에서 [네]를 선택하면 경고창이 사라진다.

<br/>

### 8 - 2 인터랙션 공통함수 설정

```typescript
function selectImageFile(
  inputTestId = 'file',
  fileName = 'hello.png',
  content = 'hello'
) {
  // userEvent를 초기화한다.
  const user = userEvent.setup();
  // 더미 이미지 파일을 작성한다.
  const filePath = [`C:\\fakepath\\${fileName}`];
  const file = new File([content], fileName, { type: 'image/png' });
  // render한 컴포넌트에서 data-testid="file"인 input을 취득한다.
  const fileInput = screen.getByTestId(inputTestId);
  // 이 함수를 실행하면 이미지 선택이 재현된다.
  const selectImage = () => user.upload(fileInput, file);
  return { fileInput, filePath, selectImage };
}

async function setup() {
  const { container } = render(<Default />);
  const { selectImage } = selectImageFile();
  async function typeTitle(title: string) {
    const textbox = screen.getByRole('textbox', { name: '제목' });
    await user.type(textbox, title);
  }
  async function saveAsPublished() {
    await user.click(screen.getByRole('switch', { name: '공개 여부' }));
    await user.click(screen.getByRole('button', { name: '공개하기' }));
    await screen.findByRole('alertdialog');
  }
  async function saveAsDraft() {
    await user.click(
      screen.getByRole('button', { name: '비공개 상태로 저장' })
    );
  }
  async function clickButton(name: '네' | '아니오') {
    await user.click(screen.getByRole('button', { name }));
  }
  return {
    container,
    typeTitle,
    saveAsPublished,
    saveAsDraft,
    clickButton,
    selectImage,
  };
}
```

<br/>

### 8 - 3 AlertDialog 렌더링 테스트

```typescript
describe('AlertDialog', () => {
  // 테스트 통과 ✅
  test('공개를 시도하면 AlertDialog가 표시된다', async () => {
    const { typeTitle, saveAsPublished, selectImage } = await setup();
    await typeTitle('201');
    await selectImage();
    await saveAsPublished();
    expect(
      screen.getByText('기사를 공개합니다. 진행하시겠습니까?')
    ).toBeInTheDocument();
  });

  // 테스트 통과 ✅
  test('[아니오] 버튼을 누르면 AlertDialog가 사라진다', async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle('201');
    await selectImage();
    await saveAsPublished();
    await clickButton('아니오');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  // 테스트 통과 ✅
  test('유효하지 않은 내용을 포함한 채로 제출하면 AlertDialog가 사라진다', async () => {
    const { saveAsPublished, clickButton, selectImage } = await setup();
    // await typeTitle("201");　제목을 입력하지 않은 상태
    await selectImage();
    await saveAsPublished();
    await clickButton('네');
    // 제목 입력란이 invalid 상태가 된다.
    await waitFor(
      () => expect(screen.getByRole('textbox', { name: '제목' })).toBeInvalid
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
```

<br/>

### 8 - 4 Toast 렌더링 테스트

```typescript
describe('Toast', () => {
  // 테스트 통과 ✅
  test("API 통신을 시도하면 '저장 중입니다...'가 표시된다", async () => {
    const { clickButton, selectImage, typeTitle, saveAsPublished } =
      await setup();
    await typeTitle('201');
    await selectImage();
    await saveAsPublished();
    await clickButton('네');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('저장 중입니다...')
    );
  });

  // 테스트 통과 ✅
  test("API 통신을 시도하면 '저장 중입니다...'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle('201');
    await selectImage();
    await saveAsPublished();
    await clickButton('네');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('저장 중입니다...')
    );
  });

  // 테스트 통과 ✅
  test("공개에 성공하면 '공개됐습니다'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle('hoge');
    await selectImage();
    await saveAsPublished();
    await clickButton('네');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('공개됐습니다')
    );
  });

  // 테스트 통과 ✅
  test("공개에 실패하면 '공개에 실패했습니다'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle('500');
    await selectImage();
    await saveAsPublished();
    await clickButton('네');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('공개에 실패했습니다')
    );
  });
});
```

### 8 - 5 화면 이동 테스트

```typescript

describe("화면이동", () => {
  // 테스트 통과 ✅
  test("비공개 상태로 저장 시 비공개한 기사 페이지로 이동한다", async () => {
    const { typeTitle, saveAsDraft, selectImage } = await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsDraft();
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });

// 테스트 통과 ✅
  test("공개에 성공하면 화면을 이동한다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();
    await clickButton("네");
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });
```

<br/><br/>

## 9. 이미지 업로드 통합 테스트

### 9 - 1 이미지 업로드 컴포넌트 기능 설명

```typescript
type Props<T extends FieldValues = PutInput> = {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  name: Path<T>;
  defaultImageUrl?: string;
};

export const Avatar = (props: Props) => {
  const { showToast } = useToastAction();
  const { onChangeImage, imageUrl } = useUploadImage({
    ...props,
    onRejected: () => {
      showToast({
        message: `이미지 업로드에 실패했습니다`,
        style: 'failed',
      });
    },
  });
  return (
    <div className={styles.module}>
      <p className={styles.avatar}>
        <img src={imageUrl || ''} alt='' />
      </p>
      <InputFileButton
        buttonProps={{
          children: '이미지 변경하기',
          type: 'button',
        }}
        inputProps={{
          'data-testid': 'file',
          accept: 'image/png, image/jpeg',
          onChange: onChangeImage,
        }}
      />
    </div>
  );
};
```

- 컴퓨터에 저장된 이미지를 선택하여 업로드를 시도한다.
- 이미지 업로드에 성공하면 프로필 이미지로 적용한다.
- 이미지 업로드에 실패하며 실패했음을 알린다.

<br/>

### 9 - 2 이미지 업로드 로직

```typescript
export function handleChangeFile(
  onValid: (result: ProgressEvent<FileReader>, file: File) => void,
  onInvalid?: (result: ProgressEvent<FileReader>, file: File) => void
) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      onValid(event, file);
    };
    fileReader.onerror = (event) => {
      onInvalid?.(event, file);
    };
    fileReader.readAsDataURL(file);
  };
}

export function useUploadImage<T extends FieldValues>({
  name,
  defaultImageUrl,
  register,
  setValue,
  onResolved,
  onRejected,
}: {
  name: Path<T>;
  defaultImageUrl?: string | null;
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  onResolved?: (data: UploadImageData) => void;
  onRejected?: (err: unknown) => void;
}) {
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  useEffect(() => {
    register(name);
  }, [register, name]);

  // handleChangeFile 함수는 FileReader 객체를 사용해서 이미지 파일을 취득한다.
  const onChangeImage = handleChangeFile((_, file) => {
    // 취득한 이미지의 내용을 file에 저장한다.
    // uploadImage 함수는 API Route로 구현된 이미지 업로드 API를 호출한다.
    uploadImage({ file })
      .then((data) => {
        const imgPath = `${data.url}/${data.filename}` as PathValue<T, Path<T>>;
        // API 응답에 포함된 이미지 URL을 경로로 지정한다.
        setImageUrl(imgPath);
        setValue(name, imgPath);
        onResolved?.(data);
      })
      .catch(onRejected);
  });
  return { onChangeImage, imageUrl } as const;
}
```

<br/>

### 9 - 2 통합 테스트용 목 객체 만들기

컴퓨터에 저장된 이미지를 데이터화 시키는 것과 Next.js에 구현된 이미지 업로드 API는 jest환경에서 사용할 수 없다.
그러므로 이 두 가지 동작은 목 함수로 구현해야 한다.

#### 이미지를 선택하는 목 함수 selectImageFile

selectImageFile는 더미 이미지 파일을 작성해주며 user.upload를 호출해 이미지 선택 인터랙션을 재현하는 것이다.

```typescript
export function selectImageFile(
  inputTestId = 'file',
  fileName = 'hello.png',
  content = 'hello'
) {
  // userEvent를 초기화한다.
  const user = userEvent.setup();
  // 더미 이미지 파일을 작성한다.
  const filePath = [`C:\\fakepath\\${fileName}`];
  const file = new File([content], fileName, { type: 'image/png' });
  // render한 컴포넌트에서 data-testid="file"인 input을 취득한다.
  const fileInput = screen.getByTestId(inputTestId);
  // 이 함수를 실행하면 이미지 선택이 재현된다.
  const selectImage = () => user.upload(fileInput, file);
  return { fileInput, filePath, selectImage };
}
```

<br/>

#### 이미지 업로드 API를 호출하는 목 함수 mockUploadImage

```typescript
import { ErrorStatus, HttpError } from '@/lib/error';
import * as UploadImage from '../fetcher';
import { uploadImageData } from './fixture';

jest.mock('../fetcher');

export function mockUploadImage(status?: ErrorStatus) {
  if (status && status > 299) {
    return jest
      .spyOn(UploadImage, 'uploadImage')
      .mockRejectedValueOnce(new HttpError(status).serialize());
  }
  return jest
    .spyOn(UploadImage, 'uploadImage')
    .mockResolvedValueOnce(uploadImageData);
}
```

<br/>

### 9 - 3 이미지 업로드 테스트

#### 업로드 성공 테스트

```typescript
// 테스트 통과 ✅
test('이미지 업로드에 성공하면 이미지의 src 속성이 변경된다', async () => {
  // 이미지 업로드가 성공하도록 설정한다.
  mockUploadImage();
  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);
  // 이미지의 src 속성이 비었는지 확인한다.
  expect(screen.getByRole('img').getAttribute('src')).toBeFalsy();
  // 이미지를 선택한다.
  const { selectImage } = selectImageFile();
  await selectImage();
  // 이미지의 src 속성이 채워졌는지 확인한다.
  await waitFor(() =>
    expect(screen.getByRole('img').getAttribute('src')).toBeTruthy()
  );
});
```

<br/>

#### 업로드 실패 테스트

```typescript
// 테스트 통과 ✅
test('이미지 업로드에 실패하면 경고창이 표시된다', async () => {
  // 이미지 업로드가 실패하도록 설정한다.
  mockUploadImage(500);
  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);
  // 이미지를 선택한다.
  const { selectImage } = selectImageFile();
  await selectImage();
  // 지정한 문자열이 포함된 Toast가 나타나는지 검증한다.
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미지 업로드에 실패했습니다'
    )
  );
});
```
