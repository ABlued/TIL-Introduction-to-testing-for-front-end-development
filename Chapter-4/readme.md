# Chapter 4 목 객체

## 1. 목 객체를 사용하는 이유

실제 객체를 흉내 내는 가짜 객체를 만들어냄으로써, 테스트 환경에서 실제 객체의 동작을 모방하여 테스트의 독립성을 보장하며 실제 환경과 유사하게 만들어 낸다.

<br/>

## 2. 목 객체 용어

### 2 - 1 스텁(stub)

스텁은 주로 대역으로 사용한다.

- 의존 중인 컴포넌트의 대역
- 정해진 값을 반환하는 용도
- 테스트 대상에 할당하는 입력값

스텁은 정해진 값을 반환하는 객체다. 대체로 이런 값을 반환받았을 때 이렇게 작동해야 하는 경우에 사용한다.

![스텁 개요도](image.png)

### 2 - 2 스파이(spy)

스파이는 주로 기록하는 용도로 사용한다.

- 함수나 메서드의 호출 기록
- 호출된 횟수나 실행 시 사용한 이수 기록
- 테스트 대상의 출력 확인

스파이는 테스트 대상 외부의 출력을 검증할 때 사용한다. 대체로 인수로 받은 콜백 함수를 검증할 때 사용한다.
콜백 함수가 시행된 횟수, 실행 시 사용한 인수 등을 기록을 하여 콜백을 검증할 수 있다.

![스파이 개요도](image-1.png)

## 3. 목 모듈을 활용한 스텁

### 테스트할 함수

```typescript
export function greet(name: string) {
  return `Hello! ${name}.`;
}

export function sayGoodBye(name: string) {
  throw new Error('미구현');
}
```

`jest.mock` 을 사용하면 모듈을 실제 모듈에서 테스트 모듈로 대체할 수 있다.

```typescript
import { greet } from './greet';

jest.mock('./greet');

test('인사말을 반환하지 않는다(원래 구현과 다르게)', () => {
  // 테스트 통과 ✅
  expect(greet('Taro')).toBe(undefined); // jest.mock을 사용해서 greet 함수가 테스트 모듈로 대체되었으니 undefined를 반환한다.
});
```

`jest.mock` 두 번째 인수에는 대체할 함수를 구현할 수 있다.

```typescript
import { greet, sayGoodBye } from './greet';

jest.mock('./greet', () => ({
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

test('인사말이 구현되어 있지 않다(원래 구현과 다르게)', () => {
  // 테스트 통과 ✅
  expect(greet).toBe(undefined);
});

test('작별 인사를 반환한다(원래 구현과 다르게)', () => {
  // 테스트 통과 ✅
  const message = `${sayGoodBye('Taro')} See you.`;
  expect(message).toBe('Good bye, Taro. See you.');
});
```

모듈 일부만 스텁으로 대체하고 싶다면 `jest.requireActual` 을 사용한다.

```typescript
import { greet, sayGoodBye } from './greet';

jest.mock('./greet', () => ({
  ...jest.requireActual('./greet'),
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

test('인사말을 반환한다(원래 구현대로)', () => {
  // 테스트 통과 ✅
  expect(greet('Taro')).toBe('Hello! Taro.');
});

test('작별 인사를 반환한다(원래 구현과 다르게)', () => {
  // 테스트 통과 ✅
  const message = `${sayGoodBye('Taro')} See you.`;
  expect(message).toBe('Good bye, Taro. See you.');
});
```
