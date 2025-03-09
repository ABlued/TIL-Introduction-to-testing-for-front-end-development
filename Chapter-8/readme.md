# Chapter 8 UI 컴포넌트 탐색기

<br/><br/>

## 1. 스토리북 기초

프런트엔드 개발의 주요 구현 대상은 UI 컴포넌트다.

`스토리북`의 UI 컴포넌트 테스트는 jsdom을 사용한 단위 테스트 및 통합테스트와 브라우저를 사용한 E2E 테스트에 중간에 위치한 테스트다.
기본적으로 스토리북은 UI 컴포넌트 탐색기이지만 테스트 기능도 추가되었다.

스토리북은 다음 CLI 명령어로 설치가 가능하다

```
npx storybook@latest init
```

그리고 다음 명령어로 실행한다.

```
npm run storybook
```

<br/><br/>

## 2. 스토리북 사용법

<br/>

### 2 - 1 스토리 등록

스토리북이 설치 완료되면 생성된 예제 코드 `Button.jsx`라는 UI 컴포넌트를 구현한 파일이 있다. 해당 UI컴포넌트를 스토리북에 등록하기 위해 필요한 스토리파일이 `Button.stories.jsx`이다.

```typescript
import { Button } from './Button';

const meta = {
  title: 'Example/Button',
  component: Button,
  // ...
} satisfies Meta<typeof Button>;

export default meta;
```

UI 컴포넌트는 `Props`의 조합으로 다른 스타일과 작동을 제공할 수 있다. 스토리북에서는 `Props`에 해당하는 변수명이 `args`이다. `export default`를 지정하는 것과 별개로 CSF3.0에서는 객체를 개별적으로 `export`하여 스토리를 등록할 수도 있다.

```typescript
// 개별 스토리

export const Default = {
  args: {
    onClick: fn(),
  },
};
```

```typescript
// 다른 스토리 등록하기

// 크기가 큰 버튼을 스토리에 등록
export const Large = {
  args: {
    size: 'large',
    label: 'Button',
  },
};

// 크기가 작은 버튼을 스토리에 등록
export const Small = {
  args: {
    size: 'small',
    label: 'Button',
  },
};
```

`Button` 컴포넌트에 `size`라는 `Props`를 지정하면 크기도 변경된다. `args.size`에 다른 값을 지정하고 서로 다른 이름으로 `export`하면 서로 다른 스토리로 등록된다.

<br/>

### 2 - 2 3단계 깊은 병합

모든 스토리에는 `Global`, `Component`, `Story`라는 세 단계의 설정이 깊은 병합 방식으로 적용된다. 공통으로 적용할 항목을 적절한 스코프에 설정하여 중복 작업을 최소화할 수 있다.

- Global 단계: 모든 스토리에 적용할 설정(.stroybook/preview.js)
- Component 단계 : 스토리 파일에 적용할 설정(export default)
- Story 단계: 개별 스토리에 적용할 설정(export const)

<br/>

### 2 - 3 스토리북 필수 애드온

스토리북은 애드온(add-on)으로 필요한 기능을 추가할 수 있다. 스토리북을 설치할 때 기본적으로는 `@storybook/addon-essentials`가 추가가 되는데 이는 필수 애드온이다.

<br/>

### 2 - 4 Controls를 활용한 디버깅

스토리북탐색기에서는 `Props`를 변경해 컴포넌트가 어떻게 표시되는지 실시간으로 디버깅할 수 있다. 이를 `Controls`라고 한다.

```typescript
export const Large: Story = {
  args: { variant: 'large' },
};

export const Small: Story = {
  args: { variant: 'small' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Dark: Story = {
  args: { theme: 'dark' },
};

export const Light: Story = {
  args: { theme: 'light' },
};
```

<br/>

### 2 - 5 반응형 대응을 위한 뷰포트 설정

스마트폰과 같은 다양한 레이아웃으로 스토리를 등록하려면 `parameter.viewport`를 설정해야 한다.

```typescript
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

export const SPStory = {
  parameters: {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'iphone6',
    },
    screenshot: {
      viewport: {
        width: 375,
        height: 667,
        deviceScaleFactor: 1,
      },
      fullPage: false,
    },
  },
};
```

<br/>

```typescript
export const SmartPhoneStory: Story = {
  parameters: {
    ...SPStory.parameters,
  },
  // ...
};
```

<br/><br/>

## 3 Context API 의존하는 컴포넌트 스토리북

리액트 Context API에 의존하는 스토리는 `decorator`를 활용하는 것이 편리하다.
`decorator`는 각 스토리의 렌더링 함수에 적용할 `wrapper`이다.

```typescript
// 예시
import { ChildComponent } from "./";
export default {
  title: "ChildComponent",
  component: "ChildComponent",
  decorators: {
    (Story) => (
      <div style={{ padding: '60px' }}>
        <Story />
      </div>
    )
  }
}
```

컴포넌트 단계에 적용되었으므로 이 파일에 등록된 모든 스토리에 div의 여백이 생긴다.

<br/>

```typescript
export const LoginUserInfoProviderDecorator = (
  Story: PartialStoryFn<ReactFramework, Args>
) => (
  <LoginUserInfoProvider>
    <Story />
  </LoginUserInfoProvider>
);
```

그럼 이런식으로 Context API 컴포넌트나 전역적으로 사용해야할 컴포넌트룰 팡리 내의 모든 스토리에 적용할 수 있다.

<br/>

아니면 이런식으로 공통 함수로 묶어 여러 군데에서 사용할 수 있다.

```typescript
export const BasicLayoutDecorator = (
  Story: PartialStoryFn<ReactFramework, Args>
) => BasicLayout(<Story />);
```

<br/><br/>

## 4 Decorator 고차 함수

```typescript
function createDecorator(defaultState?: Partial<ToastState>) {
  return function Decorator() {
    return (
      <ToastProvider defaultState={{ ...defaultState, isShown: true }}>
        {null}
      </ToastProvider>
    );
  };
}

export const Succeed: Story = {
  decorators: [createDecorator({ message: '성공했습니다', style: 'succeed' })],
};

export const Failed: Story = {
  decorators: [createDecorator({ message: '실패했습니다', style: 'failed' })],
};

export const Busy: Story = {
  decorators: [createDecorator({ message: '통신 중입니다', style: 'busy' })],
};
```

<br/><br/>

## 5 스토리에서 웹 API 사용법

스토리에서 웹 API를 사용하기 위해서는 `msw`, `msw-storybook-addon` 설치가 필요하다.

```
yarn add msx, msw-storybook-addon -d
```

<br/>

그리고 다음과 같이 `preview.js`에서 msx를 설정하면 된ㅏ.

```typescript
//preview.js
import { initialize, mswDecorator } from 'msw-storybook-addon';

export const decorators = [mswDecorator];

initialize();

//main.js
modules.exports = {
  // ...
  staticDirs: ['../public'],
};
```

<br/>

```typescript
// preview.js
// Global에서 로그인 핸들러 설정
export const parameters = {
  // ...
  msw: {
    handlers: [
      rest.get('/api/my/profile', async (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            id: 1,
            name: 'ablue',
            bio: '프런트엔드 엔지니어. 타입스크립트와 UI 컴포넌트 테스트에 관심이 있습니다.',
          })
        );
      }),
    ],
  },
};
```

<br/>

```typescript
// Story에서 개별 핸들러 설정
export const NotLoggedIn: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/my/profile', async (_, res, ctx) => {
          return res(ctx.status(401));
        }),
      ],
    },
  },
};
```

## 6 Next.js Router에 의존하는 스토리 등록

특정 URL에서만 사용할 수 있는 컴포넌트가 있다. 이런 컴포넌트의 스토리는 `Router` 상태가 필요한데 그에 맞는 `storybook-addon-next-router` 애드온을 설치해야한다.

```
yarn add -D storybook-addon-next-router
```

```typescript
// main.js
module.exports = {
  addons: ['storybook-addon-next-router'],
};

//preview.js

export const parameters = {
  nextRouter: {
    Provider: RouterContext.Provider,
  },
};
```

<br/>

```typescript
export const RouteMyPosts: Story = {
  parameters: {
    nextRouter: { pathname: '/my/posts' },
  },
};

export const RouteMyPostsCreate: Story = {
  parameters: {
    nextRouter: { pathname: '/my/posts/create' },
  },
};
```

<br/><br/>

## 7 Play function을 활용한 인터렉션 테스트

상황 : 폼에서 값을 전송하기 전 브라우저에 입력된 내용에 유효성 검사를 실시할 때
인터렉션 : 문자 입력 -> foucsout 이벤트 -> 전송 버튼 클릭

필요한 라이브러리: `@storybook/testing-library`, `@storybook/jest`,
필요한 addon: `@storybook/addon-interactions`

```
yarn add -D @storybook/testing-library @storybook/jest @storybook/addon-interactions
```

```typescript
//main.js
module.exports = {
  // 다른 설정은 생략
  addons: ['@storybook/addon-interactions'],
  features: {
    interactionsDebugger: true,
  },
};
```

<br/>

### 인터렉션 할당 및 단언문 작성

```typescript
export const SavePublish: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(canvas.getByRole('textbox', { name: '제목' }), '나의 기사');
    await user.click(canvas.getByRole('switch', { name: '공개 여부' }));
    await expect(
      canvas.getByRole('button', { name: '공개하기' })
    ).toBeInTheDocument();
  },
};
```
