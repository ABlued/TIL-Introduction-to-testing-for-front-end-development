# Chapter 5 UI 컴포넌트 테스트

## 1. UI 컴포넌트 테스트 개념

### 1 - 1 UI 컴포넌트 테스트

```
최소 단위의 UI -> 중간 크기의 UI -> 화면 단위의 UI -> 애플리케이션으로 조합된 UI
```

UI 컴포넌트의 최소 단위는 버튼과 같은 개별 UI다. 작은 UI 컴포넌틑를 조합하여 중간 크기의 컴포넌트를 만들고,
작은 단위부터 하나씩 조합해 화면 단위의 UI를 완성한다. 그리고 화면 단위의 UI가 모여 비로소 애플리케이션이 완성된다.<br/>
만약 여기서 중간 크기의 UI 컴포넌트에 문제가 생기게 된다면, 크리티컬한 경우 애플리케이션을 사용하지 못하게 될 수도 있다.
그러므로 UI 컴포넌트 테스트를 작성해야 하는 이유다.

### 1 - 2 웹 접근성 테스트

신체적, 정신적 특성에 따른 차이 없이 정보에 접근할 수 있는 정도를 웹 정근성이라고 한다. 웹 접근성은 화면에 보이는 문제가 아니기 때문에
의식적으로 신경 써야만 알 수 있다. 디자인대로 화면이 구현됐고, 마우스 입력에 따라 정상적으로 작동한다면 품질에 문제가 없다고 생각하기 때문이다.
개발자는 반드시 모든 사용자가 사용할 수 있다는 것을 염두해 두어야한다.

이런 웹 접근성을 향상시키기에는 UI 컴포넌트 테스트를 활용하는 것이 좋다. 왜냐하면 모든 사용자를 동일하게 요소들을 인식할 수 있는 쿼리로
테스트를 작성해야 하기 때문이다.
<br/>

## 2. UI 테스팅 라이브러리

리액트 UI 테스팅 라이브러리에 쓰이는 기본적으로 4가지가 있다.

1. jest-environment-jsdom : jest는 기본적으로 node.js 환경에서 실행되기 때문에 dom API가 존재하지 않는다. 이 문제를 해결하려면 설치해야되는 모듈
2. testing-library/react : 리액트 컴포넌트 테스팅 라이브러리
3. testing-library/jest-dom : UI 컴포넌틑 테스트용 매처 확장
4. testing-library/user-event : 실제 사용자의 입력에 가깝게 시뮬레이션이 가능한 테스팅 라이브러리

❗️ fireEvent API는 dom 이벤트를 발생시킬 뿐이다. 실제 사용자의 불가능한 입력 패턴을 만들기는 어렵다.

### UI 테스팅 코드 예시

테스트할 Form 컴포넌트

```typescript
type Props = {
  name: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};
export const Form = ({ name, onSubmit }: Props) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
    >
      <h2>계정 정보</h2>
      <p>{name}</p>
      <div>
        <button>수정</button>
      </div>
    </form>
  );
};
```

테스트 코드

```typescript
// 테스트 통과 ✅
test('이름을 표시한다', () => {
  render(<Form name='taro' />);
  expect(screen.getByText('taro')).toBeInTheDocument();
});

// 테스트 통과 ✅
test('버튼을 표시한다', () => {
  render(<Form name='taro' />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

// 테스트 통과 ✅
test('heading을 표시한다', () => {
  render(<Form name='taro' />);
  expect(screen.getByRole('heading')).toHaveTextContent('계정 정보');
});

// 목 함수를 Form에 전달해 button이 클릭되었는지 테스트한다
// 테스트 통과 ✅
test('버튼을 클릭하면 이벤트 핸들러가 실행된다', () => {
  const mockFn = jest.fn();
  render(<Form name='taro' onSubmit={mockFn} />);
  fireEvent.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalled();
});
```
