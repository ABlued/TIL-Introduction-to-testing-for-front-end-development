# Chapter 3 처음 시작하는 단위 테스트

## 1. 예외 처리

#### 예외 발생 검증 테스트

```
expect(예외가 발생하는 함수).toThrow();
```

테스트할 함수

```typescript
export function add(a: number, b: number) {
  if (a < 0 || a > 100) {
    throw new Error('0〜100 사이의 값을 입력해주세요');
  }
  if (b < 0 || b > 100) {
    throw new Error('0〜100 사이의 값을 입력해주세요');
  }
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}
```

테스트

```typescript
test('올바른 단언문 작성법', () => {
  // 잘못된 작성법
  expect(add(-10, 110)).toThrow();
  // 올바른 작성법
  expect(() => add(-10, 110)).toThrow();
});
```

<br/>

#### 오류 메시지를 활용한 세부 사항 검증

toThrow에 인수를 할당하면 예외에 대해 더욱 상세한 내용을 검증할 수 있다.

```typescript
throw new Error('0~100 사이의 값을 입력해주세요');
```

```typescript
test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
  expect(() => add(110, -10)).toThrow('0〜100 사이의 값을 입력해주세요');
});
```

<br/>

#### instanceof 연산자를 활용한 세부 사항 검증

테스트할 클래스와 함수

```typescript
export class HttpError extends Error {}
export class RangeError extends Error {}

function checkRange(value: number) {
  if (value < 0 || value > 100) {
    throw new RangeError('0〜100 사이의 값을 입력해주세요');
  }
}

export function add(a: number, b: number) {
  checkRange(a);
  checkRange(b);
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}
```

```typescript
test('특정 클래스의 인스턴스인지 검증한다', () => {
  // 발생한 예외가 RangeError이므로 실패한다
  expect(() => add(110, -10)).toThrow(HttpError);
  // 발생한 예외가 RangeError이므로 성공한다
  expect(() => add(110, -10)).toThrow(RangeError);
  // 발생한 예외가 Error를 상속받은 클래스이므로 성공한다
  expect(() => add(110, -10)).toThrow(Error);
});
```

<br/><br/>

## 2. 용도별 매처

#### truly/falsy

```typescript
describe('진릿값 검증', () => {
  test('참인 진릿값 검증', () => {
    expect(1).toBeTruthy();
    expect('1').toBeTruthy();
    expect(true).toBeTruthy();
    expect(0).not.toBeTruthy();
    expect('').not.toBeTruthy();
    expect(false).not.toBeTruthy();
  });
  test('거짓인 진릿값 검증', () => {
    expect(0).toBeFalsy();
    expect('').toBeFalsy();
    expect(false).toBeFalsy();
    expect(1).not.toBeFalsy();
    expect('1').not.toBeFalsy();
    expect(true).not.toBeFalsy();
  });
  test('null과 undefined 검증', () => {
    expect(null).toBeFalsy();
    expect(undefined).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect(undefined).not.toBeDefined();
  });
});
```

<br/>

#### 수치 검증

```typescript
describe('수치 검증', () => {
  const value = 2 + 2;
  test('검증값이 기댓값과 일치한다', () => {
    expect(value).toBe(4);
    expect(value).toEqual(4);
  });
  test('검증값이 기댓값보다 크다', () => {
    expect(value).toBeGreaterThan(3); // 4 > 3
    expect(value).toBeGreaterThanOrEqual(4); // 4 >= 4
  });
  test('검증값이 기댓값보다 작다', () => {
    expect(value).toBeLessThan(5); // 4 < 5
    expect(value).toBeLessThanOrEqual(4); // 4 <= 4
  });
  test('소수 계산은 정확하지 않다', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
  });
  test('소수 계산 시 지정한 자릿수까지 비교한다', () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3); // 두 번째 인수의 기본값은 2다.
    expect(0.1 + 0.2).toBeCloseTo(0.3, 15);
    expect(0.1 + 0.2).not.toBeCloseTo(0.3, 16);
  });
});
```

<br/>

#### 문자열 검증

```typescript
describe('문자열 검증', () => {
  const str = 'Hello World';
  const obj = { status: 200, message: str };
  test('검증값이 기댓값과 일치한다', () => {
    expect(str).toBe('Hello World');
    expect(str).toEqual('Hello World');
  });
  test('toContain', () => {
    expect(str).toContain('World');
    expect(str).not.toContain('Bye');
  });
  test('toMatch', () => {
    expect(str).toMatch(/World/);
    expect(str).not.toMatch(/Bye/);
  });
  test('toHaveLength', () => {
    expect(str).toHaveLength(11);
    expect(str).not.toHaveLength(12);
  });
  test('stringContaining', () => {
    expect(obj).toEqual({
      status: 200,
      message: expect.stringContaining('World'),
    });
  });
  test('stringMatching', () => {
    expect(obj).toEqual({
      status: 200,
      message: expect.stringMatching(/World/),
    });
  });
});
```

<br/>

#### 배열 검증

```typescript
describe('배열 검증', () => {
  describe('원시형 값들로 구성된 배열', () => {
    const tags = ['Jest', 'Storybook', 'Playwright', 'React', 'Next.js'];
    test('toContain', () => {
      expect(tags).toContain('Jest');
      expect(tags).toHaveLength(5);
    });
  });
  describe('객체들로 구성된 배열', () => {
    const article1 = { author: 'taro', title: 'Testing Next.js' };
    const article2 = { author: 'jiro', title: 'Storybook play function' };
    const article3 = { author: 'hanako', title: 'Visual Regression Testing' };
    const articles = [article1, article2, article3];
    test('toContainEqual', () => {
      expect(articles).toContainEqual(article1);
    });
    test('arrayContaining', () => {
      expect(articles).toEqual(expect.arrayContaining([article1, article3]));
    });
  });
});
```

<br/>

#### 객체 검증

```typescript
describe('배열 검증', () => {
  describe('원시형 값들로 구성된 배열', () => {
    const tags = ['Jest', 'Storybook', 'Playwright', 'React', 'Next.js'];
    test('toContain', () => {
      expect(tags).toContain('Jest');
      expect(tags).toHaveLength(5);
    });
  });
  describe('객체들로 구성된 배열', () => {
    const article1 = { author: 'taro', title: 'Testing Next.js' };
    const article2 = { author: 'jiro', title: 'Storybook play function' };
    const article3 = { author: 'hanako', title: 'Visual Regression Testing' };
    const articles = [article1, article2, article3];
    test('toContainEqual', () => {
      expect(articles).toContainEqual(article1);
    });
    test('arrayContaining', () => {
      expect(articles).toEqual(expect.arrayContaining([article1, article3]));
    });
  });
});
```

<br/><br/>

## 3. 비동기 처리 테스트

#### 테스트할 함수

```typescript
export function wait(duration: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(duration);
    }, duration);
  });
}

export function timeout(duration: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(duration);
    }, duration);
  });
}
```

<br/>

#### Promise를 반환하는 작성법

```typescript
test('지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다', () => {
  return wait(50).then((duration) => {
    expect(duration).toBe(50);
  });
});
```

resolve를 사용할 수도 있다.

```typescript
test('지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다', () => {
  return expect(wait(50)).resolves.toBe(50);
});
```

<br/>

#### async/await 활용한 작성법

```typescript
test('지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다', async () => {
  await expect(wait(50)).resolves.toBe(50);
});
```

<br/>

#### Reject 검증 테스트

```typescript
// 앞의 resolve와 흡사하다
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', () => {
  return timeout(50).catch((duration) => {
    expect(duration).toBe(50);
  });
});
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', () => {
  return expect(timeout(50)).rejects.toBe(50);
});
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', async () => {
  await expect(timeout(50)).rejects.toBe(50);
});
```

<br/>

#### try-catch 문으로 Reject 검증 테스트

여기서 눈여겨보야할 점은 `expect.assertions(1);`이다. 만약 함수가 정상적으로 동작해 catch문이 정상적으로 실행되지 않아
단언문이 스킵되면 이 테스트는 Fail이 아닌 Success로 넘어가게 된다. 그런 경우를 방지하기 위해 단언문이 한 번은 실행되어야하는
`expect.assertions(1)` 을 넣어놓은 것이다.

```typescript
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', async () => {
  expect.assertions(1);
  try {
    await timeout(50);
  } catch (err) {
    expect(err).toBe(50);
  }
});
```

#### 비동기 처리 테스트 주의점

1. 비동기 처리가 포함된 테스트는 async 함수로 만들기
2. .resolve나 .rejects가 포함된 단언문은 await
3. try-catch문이 들어가있을 경우 catch문 스킵을 방지하기 위해 `expect.assertions` 사용하기
