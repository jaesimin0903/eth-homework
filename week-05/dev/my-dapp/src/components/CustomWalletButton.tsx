import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

export default function CustomWalletButton() {
    const { isConnected, address, chainId } = useAccount();
    const { disconnect } = useDisconnect();
    return(
<ConnectButton.Custom>
  {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
    // 서버 사이드 렌더링과 클라이언트 렌더링을 맞추기 위해 mounted 체크 필요
    if (!mounted) return null;

    return (
        <div className="flex gap-2">
            {isConnected ? (
                <div className="flex" style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                    {/* 네트워크/체인 변경 모달 띄우기 */}
                    <button onClick={openChainModal} type="button">
                        {chain?.name || chainId} 변경
                    </button>
                    {/* 계정 정보 모달 띄우기 */}
                    <button onClick={openAccountModal} type="button">
                        {account?.displayName || address}
                    </button>
                    <button onClick={() => disconnect()} type="button">
                        연결 끊기
                    </button>   
                </div>
            ) : (
                <button onClick={openConnectModal} type="button">
                    지갑 연결하기
                </button>
            )}
        </div>
    );
  }}
</ConnectButton.Custom>
);
}
