/* 원서에는 없지만 코드 3-23 테스트를 위해 HttpError 추가 */
import { add, HttpError, RangeError, sub } from ".";

/**
 * 원서에 있는 원본 저장소는 중간과정은 생략하고 최종 완성본만 기재한 부분들이 있습니다.
 * 독자의 편의를 위해 책에 있는 코드 블럭을 정리한 뒤 주석처리 했습니다.
 * 독서중인 부분의 코드를 실행해보고 싶다면 
 *   1)최종 완성본 코드를 수정하며 실행하거나 
 *   2)코드 블럭별로 주석처리된 부분을 제거하고 실행하면서 읽어주세요.
 * 
 * 주의 : 책에 있는 실행결과는 원서와 동일하게 최종 완성본을 실행했을 때를 기준으로 작성했습니다.
 * 코드 블럭별로 제가 정리해둔 부분의 주석을 제거한 뒤 실행하고 '책에있는 실행결과와 다른데?'라고 오해하는 일이 없도록 주의해주세요.
 * 예를 들어 원서 최종 완성본의 테스트는 총 126개입니다. 제가 코드 블럭별로 정리한 테스트들의 주석을 해제하면 당연히 테스트 갯수가 늘어납니다.
 */

/* 코드 3-13
test("반환값의 상한은 '100'이다", () => {
  expect(add(-10, 110)).toBe(100);
});
*/

/* 코드 3-15
test("올바른 단언문 작성법", () => {
  // 잘못된 작성법
  expect(add(-10, 110)).toThrow();
  // 올바른 작성법
  expect(() => add(-10, 110)).toThrow();
});
*/

/* 코드 3-16
test("예외가 발생하지 않으므로 실패한다", () => {
  expect(() => add(70, 80)).toThrow();
});
*/

/* 코드 3-18
test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
  expect(() => add(110, -10)).toThrow("0〜100 사이의 값을 입력해주세요");
});
*/

/* 코드 3-19
test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
  expect(() => add(110, -10)).toThrow("0〜1000 사이의 값을 입력해주세요");
});
*/

/* 코드 3-23
test("특정 클래스의 인스턴스인지 검증한다", () => {
  // 발생한 예외가 RangeError이므로 실패한다
  expect(() => add(110, -10)).toThrow(HttpError);
  // 발생한 예외가 RangeError이므로 성공한다
  expect(() => add(110, -10)).toThrow(RangeError);
  // 발생한 예외가 Error를 상속받은 클래스이므로 성공한다
  expect(() => add(110, -10)).toThrow(Error);
})
*/

describe("사칙연산", () => {
  describe("add", () => {
    test("반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다", () => {
      expect(add(50, 50)).toBe(100);
    });
    test("반환값의 상한은 '100'이다", () => {
      expect(add(70, 80)).toBe(100);
    });
    test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
      const message = "0〜100 사이의 값을 입력해주세요";
      expect(() => add(-10, 10)).toThrow(message);
      expect(() => add(10, -10)).toThrow(message);
      expect(() => add(-10, 110)).toThrow(message);
    });
  });
  describe("sub", () => {
    test("반환값은 첫 번째 매개변수에서 두 번째 매개변수를 뺀 값이다", () => {
      expect(sub(51, 50)).toBe(1);
    });
    test("반환값의 하한은 '0'이다", () => {
      expect(sub(70, 80)).toBe(0);
    });
    test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
      expect(() => sub(-10, 10)).toThrow(RangeError);
      expect(() => sub(10, -10)).toThrow(RangeError);
      expect(() => sub(-10, 110)).toThrow(Error);
    });
  });
});
