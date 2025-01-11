## 1-1 테스트를 작성하는 이유

#### 1) 사업의 신뢰성이 좋아진다.

버그가 포함된 채로 서비스를 배포하면 사용자에게 불편함을 안겨줄 뿐만 아니라 서비스의 신뢰성을 낮추게 된다.
또한 이렇게 낮춰진 신뢰성을 회복하려면 많은 시간과 비용이 필요하다. 하지만 테스트 코드가 작성되어 있으면
예상치 못한 버그를 조기에 발견해 서비스의 신뢰성을 지켜준다.

#### 2) 유지보수성이 높아진다.

테스트는 리팩터링을 하는 과정에 있어 비용을 절감하기 때문에 유지보수성을 높여준다.
기존 코드를 수정하거나, 공통으로 사용할 수 있는 기능은 따로 공통 모듈로 빼낼때 테스트 코드가 있다며
수정하는 도중에 어떤 문제가 생겼는지 ,.반복적으로 확인할 수 있다.

#### 3) 코드 품질을 향상시킨다.

테스트 코드는 구현 코드의 되돌아보게 한다. 어떤 모듈이나 함수의 테스트 작성이 어렵다면 해당 모듈, 함수가 너무 많은 역할을 한다고 볼 수 있다.
이 경우 일부 책임을 나눌 수 있는지, 또는 잘못된 책임이 주어지지 않았는지 재검토하는 계기가 될 수 있다.

#### 4) 원활한 협업이 이루어지게 한다.

테스트 코드는 글로 작성된 문서보다 우수한 사양서이자 지침서다. 각 테스트에는 제목이 있어 테스트를 할 구현 코드가 어떤 기능을 어떤 방식으로 제공하는지 파악할 수 있다.

<br/><br/>

## 1-2 테스트를 작성하면 시간이 절약되는 이유

단기점인 관점에서 보면 테스트 작성은 기능 구현과는 별개의 비용이 투입되니 많은 시간을 소모하지만 장기적인 관점에서 보면 오히려 시간이 절약된다.

👤 개인이 걸리는 시간

- 테스트 자동화가 없는 경우 ❌ : `기능 개발`
- 테스트 자동화가 있는 경우 ⭕️ : `기능 개발` + `테스트 자동화`

👥 팀이 걸리는 시간

- 테스트 자동화가 없는 경우 ❌ : `기능 개발` + `반복 테스트 작업`
- 테스트 자동화가 있는 경우 ⭕️ : `기능 개발` + `테스트 자동화`

👥 장기적으로 팀이 걸리는 시간

- 테스트 자동화가 없는 경우 ❌ : `기능 개발` + `반복 테스트 작업` + `회귀 테스트` + `버그 보고(QA팀)`
- 테스트 자동화가 있는 경우 ⭕️ : `기능 개발` + `테스트 자동화`

<br/>
 테스트 자동화를 하지 않은 팀은 일단 QA팀의 수동 테스트 과정에서부터 비용이 든다. 버그에 대한 티켓을 작성하여 보고하며, 개발팀은 이러한 버그를 이해 및 원인파악하는데에 시간이 소요된다. 또한 버그를 수정하면 그 버그에 대한 테스트뿐만 아니라 수정한 코드로 인한 사이드 이펙트가 있는지도 확인해야하므로 넓게는 그 발생한 버그에 관련된 모든 기능을 회귀 테스트할 수 밖에 없다. 또한 이 버그를 수정하기까지 사용자들의 불편함도 감수하면서 말이다.  
하지만 테스트 자동화를 작성한 팀은 테스트 코드 작성 및 자동화에 시간밖에 투자를 안했다. 물론 테스트 코드를 작성한다고 해서 버그가 발생하지 않는 것은 아니다. 하지만 상당히 많은 부분들의 버그를 미리 개발 단계에서 파악해 QA팀 및 사용자까지 영향이 가지 않도록 최소화할 수 있다.

## 1-3 팀원들을 설득하는 방법

팀에 테스트 코드를 작성하는 문화를 정착시킬 수 있는지는 초기 단계에서 결정된다. 왜냐하면 구현 코드가 적을 때는 어떻게 테스트를 작성할지 방침을 정하기가 쉽기 때문이다. 이 때 테스트에 익숙하지 않은 팀원들에게 참고할 수 있는 테스트 코드가 있으면 도움이 된다. 팀 전원이 테스트를 작성할 수 있도록 설득하려면 참고할 수 있는 테스트 코드가 있어야 한다.