import { WalletConnector } from "./components/WalletConnector";
import { AccountInfo } from "./components/AccountInfo";
import { ChainSwitcher } from "./components/ChainSwitcher";
import { NativeBalance } from "./components/NativeBalance";
import { Eip7702Form } from "./components/Eip7702Form";
import { Permit2BatchForm } from "./components/Permit2BatchForm";

const sectionStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "1rem",
  marginBottom: "1rem",
};

const headingStyle: React.CSSProperties = {
  marginTop: 0,
  fontSize: "1rem",
  fontWeight: 600,
  borderBottom: "1px solid #eee",
  paddingBottom: "0.5rem",
  marginBottom: "0.75rem",
};

export default function App() {
  return (
    <div style={{ maxWidth: "720px", margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>
        SaaS Wallet Integration Dashboard
      </h1>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Wallet Connection</h2>
        <WalletConnector />
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Account</h2>
        <AccountInfo />
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Native Balance</h2>
        <NativeBalance />
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Chain Switcher</h2>
        <ChainSwitcher />
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>EIP-7702 Transaction</h2>
        <Eip7702Form />
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Permit2 Gasless Batch</h2>
        <Permit2BatchForm />
      </div>
    </div>
  );
}
