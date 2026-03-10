# Week 4 Quiz: Network/Block + wagmi

> **제출 방법:** 이 파일을 복사하여 답변을 작성한 후, PR로 제출하세요.
> **평가 기준:** 개념 이해도 중심 - 문법 오류보다 논리적 설명을 중시합니다.

---

## 문제 1: 블록 헤더 필드 (객관식)

다음 상황을 고려하세요:

```
블록 100의 해시: 0xabc123...
블록 101의 해시: 0xdef456...
```

블록 101의 `parentHash` 필드에는 어떤 값이 저장되어 있나요? 그리고 **왜** 이런 방식으로 연결하나요?

**보기:**
A) 0xdef456... - 자기 자신의 해시를 저장하여 무결성을 보장한다
B) 0xabc123... - 이전 블록의 해시를 저장하여 체인 연결과 불변성을 보장한다
C) 블록 번호 100 - 숫자로 순서를 추적한다
D) 빈 값 - 헤더에는 해시가 저장되지 않는다

**답변:**
<!--
정답 알파벳과 왜 이 답을 선택했는지 설명하세요.
다른 보기가 왜 틀린지도 간략히 설명해 주세요.
-->
B, 다음 블록은 부모 블록의 해시를 가지고 있어야한다. 말그대로 체인이기때문이다. A 값이 바뀌면 B 값도 바뀌어야한다. 

A, 역설이다. 해시는 블록이 생성된 이후에 계산된다. 생성되기도 전에 해시를 알 수 없다.
C, 해시는 완전 무결한 값이기에 블록 번호로 하면 안된다. 뭐가 바뀌었는지 모른다. 
D, 헤더에 아무것도 안하면 블록체인이 아니다.

---

## 문제 2: MPT 목적 (객관식)

이더리움에서 Merkle Patricia Trie(MPT)를 사용하는 **가장 중요한 이유**는 무엇인가요?

**보기:**
A) 데이터를 암호화하여 외부에서 읽을 수 없게 한다
B) 트랜잭션 처리 속도를 10배 이상 높인다
C) 전체 데이터 없이도 특정 데이터의 존재와 정확성을 효율적으로 증명한다
D) 블록 크기를 줄여서 저장 공간을 절약한다

**답변:**
<!--
정답 알파벳과 왜 이 기능이 중요한지 설명하세요.
Light Node와 연결지어 설명하면 더 좋습니다.
-->
C, 머클 증명을 통해 데이터 처리에 한계가 있는 디바이스가 쉽게 데이터 확인을 할 수 있다.

---

## 문제 3: 체인 연결과 보안 (객관식)

공격자가 블록 50의 트랜잭션을 수정하려고 합니다. 현재 체인의 최신 블록은 100입니다. 이 공격이 **왜** 어려운가요?

**보기:**
A) 블록 50은 너무 오래되어서 시스템에서 접근할 수 없다
B) 블록 50을 수정하면 해시가 바뀌고, 블록 51부터 100까지 모든 블록의 parentHash가 불일치하게 된다
C) 블록 50은 이미 암호화되어 있어서 복호화 키가 필요하다
D) 네트워크 관리자만 과거 블록을 수정할 수 있다

**답변:**
<!--
정답 알파벳과 블록체인의 불변성이 어떻게 작동하는지 설명하세요.
-->
블록 100 부터 50까지 전부 바꿔야하므로 매우 어려운 작업이다. 근데 101, 102 도 계속 생성되니 바꾸기가 비현실적인것.

---

## 문제 4: MPT 진화 과정 (단답형)

MPT(Merkle Patricia Trie)는 세 가지 자료구조의 장점을 결합한 것입니다:
1. **Trie** -> 2. **Patricia Trie** -> 3. **Merkle Patricia Trie**

**왜** 각 단계의 발전이 필요했나요? 각 단계가 해결하는 문제를 간단히 설명하세요.

**답변:**

1. Trie가 해결하는 문제:
- 사전구조와 비슷하므로 데이터 길이만 길어질뿐 찾는 속도는 빠르다. 하지만 데이터가 길어지면 메모리 낭비가 심하다.
2. Patricia Trie가 해결하는 문제 (Trie의 한계):
- 자식 노드가 하나뿐인 노드를 합쳐버렸다. 저장공간을 줄였다. 하지만 수정이 되었는지 증명하는 방법이 부족했다.
3. Merkle Patricia Trie가 해결하는 문제 (Patricia Trie의 한계):
- 머클 증명을 통해 트리 전체를 대표하는 머클 해시를 만들어 굳이 전체 탐색을 안해도 증명할 수 있게 되었다. 



---

## 문제 5: Eclipse Attack 방어 (단답형)

Eclipse Attack은 공격자가 피해자 노드의 **모든 피어 연결**을 자신이 통제하는 노드로 바꾸는 공격입니다.

1) 이 공격이 성공하면 피해자에게 **어떤 피해**가 발생할 수 있나요?
2) 개인 노드 운영자가 이 공격을 **방어**하기 위해 할 수 있는 행동은 무엇인가요?

**답변:**
1) 가능한 피해 (2가지 이상):
- 이중지불
- 채굴 낭비
- 담합

2) 방어 방법 (2가지 이상):
- 신뢰할만한 노드 추가
- 피어 교체
- ip 다양성 확보


---

## 문제 6: 노드 종류 선택 (단답형)

친구가 이더리움 개발을 시작하려고 합니다. 다음 세 가지 상황에서 각각 어떤 노드 타입(Full, Light, Archive)을 추천하시겠습니까? **왜** 그 노드를 추천하는지도 설명하세요.

1) 모바일 지갑 앱 개발
2) 블록체인 데이터 분석 서비스 개발
3) 일반적인 dApp 백엔드 개발

**답변:**
1) 모바일 지갑 앱:
   추천 노드: Light Node
   이유: 모바일 환경은 제한된 저장공간을 가지고있다. Light Node는 모든 블록 데이터를 받지 않고 블록 헤더 구조만 다운로드하여 용량을 획기적으로 줄이면서도, 머클 증명을 통해 트랜잭션의 유효성을 검증할 수 있기 때문에 모바일 환경에 적합하다.

2) 블록체인 데이터 분석:
   추천 노드: Archive Node
   이유: Archive Node는 블록체인의 모든 기록과 과거의 상태(State)를 빠짐없이 가지고 있어 데이터 조회 요구사항을 충족할 수 있다.

3) dApp 백엔드:
   추천 노드: Full Node
   이유: 일반적인 dApp 운영에서는 새 트랜잭션을 검증 및 전파하고, 최신 블록체인 상태 데이터를 읽어오는 것이 가장 중요하다. Full Node는 이러한 독자적인 데이터 검증 및 상태 관리 등을 자체적으로 처리할 수 있으면서도, Archive Node에 비해 스토리지 용량 유지 및 운영 비용 면에서 훨씬 합리적이다.

---

## 문제 7: useAccount Hook (빈칸 채우기)

다음 코드의 빈칸을 채워서 지갑 연결 상태를 표시하는 컴포넌트를 완성하세요:

```typescript
import { _________________ } from 'wagmi';

function WalletStatus() {
  // TODO: useAccount hook에서 필요한 값들을 가져오세요
  const { _________________, _________________ } = useAccount();

  if (!isConnected) {
    return <div>지갑이 연결되지 않았습니다</div>;
  }

  return (
    <div>
      <p>연결된 주소: {address}</p>
    </div>
  );
}
```

**답변:**
```typescript
import { useAccount } from 'wagmi';

function WalletStatus() {
  // TODO: useAccount hook에서 필요한 값들을 가져오세요
  const { isConnected, address } = useAccount();

  if (!isConnected) {
    return <div>지갑이 연결되지 않았습니다</div>;
  }

  return (
    <div>
      <p>연결된 주소: {address}</p>
    </div>
  );
}
```

**왜 이렇게 작성했나요:**
<!--
useAccount hook이 제공하는 값들과 각각의 역할을 설명하세요.
-->

useAccount 훅은 현재 지갑 프로바이더에 연결이 되어있는지 여부를 판단하는 isConnected와 연결된 지갑의 주소를 반환하는 address를 제공한다.

**3버전 부터는 useAccount -> useConnection 으로 변경되었습니다~ 참고하시길 바랍니다.**
---

## 문제 8: useReadContract Hook (빈칸 채우기)

다음 코드의 빈칸을 채워서 컨트랙트의 `getCount` 함수 결과를 화면에 표시하세요:

```typescript
import { useReadContract } from 'wagmi';

const counterABI = [
  {
    name: 'getCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'count', type: 'uint256' }],
  },
] as const;

function CountDisplay() {
  const { data, isLoading, error } = useReadContract({
    // TODO: 필요한 설정을 채우세요
    address: '0x1234...5678',
    _________________,
    _________________,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return <div>현재 카운트: {_________________}</div>;
}
```

**답변:**
```typescript
// 완성된 코드를 여기에 작성하세요
function CountDisplay() {
  const { data, isLoading, error } = useReadContract({
    // TODO: 필요한 설정을 채우세요
    address: '0x1234...5678',
    abi: counterABI,
    functionName: 'getCount',
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return <div>현재 카운트: {data}</div>;
}
```

**왜 이렇게 작성했나요:**
<!--
useReadContract의 필수 설정 항목과 data를 화면에 표시할 때 주의할 점을 설명하세요.
-->
useReadContract 함수는 컨트랙트 주소, abi, 함수 이름이 필요합니다. data 는 함수 로딩이 끝난후에만 확인가능합니다. 에러를 안받으려면 위에서 조건처리를 해야합니다.

---

## 문제 9: useWriteContract 버그 (취약점 찾기)

다음 코드에서 **문제점**을 찾고 수정하세요:

```typescript
// BAD CODE - 문제점 찾기
import { useWriteContract } from 'wagmi';

function IncrementButton() {
  const { writeContract, isPending } = useWriteContract();

  const handleClick = () => {
    // 문제가 있는 코드
    writeContract({
      address: '0x1234...5678',
      functionName: 'increment',
      // abi가 없음!
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      증가하기
    </button>
  );
}
```

**1) 발견한 문제점:**
<!--
무엇이 빠졌거나 잘못되었는지 설명하세요.
-->
abi 가 없습니다.

**2) 왜 이것이 문제인가:**
<!--
이 문제가 어떤 오류나 동작 이상을 일으키는지 설명하세요.
-->
abi 를 통해 타입검증을 해야하는데 못해서 에러를 뿜습니다.

**3) 올바른 수정 방법:**
```typescript
// GOOD CODE - 수정된 버전을 작성하세요
import { useWriteContract } from 'wagmi';

function IncrementButton() {
  const { writeContract, isPending } = useWriteContract();

  const handleClick = () => {
    // 문제가 있는 코드
    writeContract({
      address: '0x1234...5678',
      functionName: 'increment',
      abi: counterABI,
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      증가하기
    </button>
  );
}
```

**3버전 부터는 약간 개발자 편의성이 증대했습니다. 이제 못생기게 writeTransaction, isLoading .. 하지말고 하나의 객체로 받아오면 됩니다.**

---

## 문제 10: 블록 연결 구조 (다이어그램 해석)

다음 다이어그램은 블록체인의 연결 구조를 보여줍니다:

```mermaid
graph LR
    subgraph B0["제네시스 블록"]
        H0["hash: 0xabc..."]
    end
    subgraph B1["블록 1"]
        PH1["parent: 0xabc..."]
        H1["hash: 0xdef..."]
    end
    subgraph B2["블록 2"]
        PH2["parent: 0xdef..."]
        H2["hash: 0x123..."]
    end
    subgraph B3["블록 3"]
        PH3["parent: ???"]
        H3["hash: 0x789..."]
    end

    B0 --> B1 --> B2 --> B3
```

**질문:**

1) 블록 3의 `parent: ???` 에 들어갈 값은 무엇인가요?
- 0x123...

2) 만약 블록 1의 내용이 수정되면, 블록 2와 블록 3에 **어떤 영향**이 있나요? 왜 그런가요?
- 해시값이 수정된다. 부모 해시의 값이 해시 생성에 포함되기 때문이다.

3) 제네시스 블록(블록 0)의 parentHash는 어떤 특별한 값을 가지나요? 왜 그런가요?
- 0x000... 최초 블록이기에 0 이다. 비트코인은 여기에 유명한 글을 쓰기도 했다. 

---

## 문제 11: MPT 트리 구조 (다이어그램 해석)

다음 다이어그램은 MPT의 노드 구조를 보여줍니다:

```mermaid
graph TD
    ROOT["Root Hash: 0xfff..."] --> EXT1["Extension Node<br/>path: 0a"]
    ROOT --> EXT2["Extension Node<br/>path: 0b"]

    EXT1 --> BRANCH["Branch Node<br/>(16개 슬롯)"]
    BRANCH --> LEAF1["Leaf: 계정 A<br/>주소: 0a1234..."]
    BRANCH --> LEAF2["Leaf: 계정 B<br/>주소: 0a5678..."]

    EXT2 --> LEAF3["Leaf: 계정 C<br/>주소: 0b9999..."]
```

**질문:**

1) 계정 A와 계정 B가 같은 Branch Node 아래에 있는 이유는 무엇인가요? (주소 패턴을 힌트로 사용하세요)
- 공통 접두어로 시작하기 때문에 (0a)

2) Extension Node가 하는 역할은 무엇인가요? 없다면 어떤 문제가 생기나요?
- 자식이 하나뿐인 연속된 경로를 하나로 합침. 글자마다 노드를 생성하기 떄문에 용량이 커진다.

3) Root Hash만 알면 어떻게 특정 계정의 데이터 존재를 **증명**할 수 있나요? (Light Client 관점에서)
- 머클 증명을 사용하기 떄문에 데이터 변경시 머클 해시가 변경된다. 라이트 클라이언트는 전체 노드를 다 몰라도 되니까 머클 해시만 알면 된다. 

---

## 제출 전 체크리스트

- [ ] 모든 문제에 답변을 작성했는가?
- [ ] 객관식 문제: 정답 선택 **이유**를 설명했는가?
- [ ] 단답형 문제: 2-3문장 이상으로 충분히 설명했는가?
- [ ] 코드 문제: 완성된 코드와 **왜 그렇게 작성했는지** 설명했는가?
- [ ] 다이어그램 문제: 각 질문에 논리적으로 답변했는가?
